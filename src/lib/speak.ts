const SAMPLE_RATE = 24000;

let sharedAudioContext: AudioContext | null = null;
let sinkElement: HTMLAudioElement | null = null;
let sinkNode: MediaStreamAudioDestinationNode | null = null;
let keepAlive: { gain: GainNode; osc: OscillatorNode } | null = null;
let keepAliveHolders = 0;

function getAudioContext() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
  }
  return sharedAudioContext;
}

/**
 * Zvuk vede přes skrytý přehrávač stránky (media element), takže ho na iPhonu
 * neztiší vypínač zvonění a přehrávání funguje i v nainstalované aplikaci.
 */
function getSink(ctx: AudioContext): AudioNode {
  if (typeof document === "undefined" || typeof ctx.createMediaStreamDestination !== "function") {
    return ctx.destination;
  }
  if (!sinkNode) {
    try {
      sinkNode = ctx.createMediaStreamDestination();
    } catch {
      return ctx.destination;
    }
  }
  if (!sinkElement) {
    const el = document.createElement("audio");
    el.autoplay = true;
    el.setAttribute("playsinline", "");
    el.style.display = "none";
    el.srcObject = sinkNode.stream;
    document.body.appendChild(el);
    sinkElement = el;
  }
  return sinkNode;
}

/** Drží zvukový kontext bdělý, dokud se čeká na hlas a než dozní čtení. */
function holdAudioAwake(ctx: AudioContext) {
  keepAliveHolders += 1;
  if (!keepAlive) {
    try {
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      gain.connect(getSink(ctx));
      const osc = ctx.createOscillator();
      osc.frequency.value = 30;
      osc.connect(gain);
      osc.start();
      keepAlive = { gain, osc };
    } catch {
      keepAlive = null;
    }
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    keepAliveHolders = Math.max(0, keepAliveHolders - 1);
    if (keepAliveHolders === 0 && keepAlive) {
      try {
        keepAlive.osc.stop();
      } catch {
        // už zastaveno
      }
      keepAlive.gain.disconnect();
      keepAlive = null;
    }
  };
}

/** Aktivuje zvuk přímo v obsluze dotyku, což vyžaduje hlavně iOS/PWA. */
export function primeAudioPlayback() {
  const ctx = getAudioContext();
  if (!ctx) return Promise.resolve(false);
  const sink = getSink(ctx);
  const resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
  const release = holdAudioAwake(ctx);
  // Kdyby čtení nikdy nezačalo, po chvíli se tichý tón sám ukončí.
  setTimeout(release, 90_000);
  return resume
    .then(() => {
      void sinkElement?.play().catch(() => {});
      const source = ctx.createBufferSource();
      source.buffer = ctx.createBuffer(1, 1, SAMPLE_RATE);
      source.connect(sink);
      source.start();
      return ctx.state === "running";
    })
    .catch(() => false);
}

/** Po návratu aplikace z pozadí znovu aktivuje již povolený zvuk. */
export function resumeAudioPlayback() {
  const ctx = sharedAudioContext;
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  void sinkElement?.play().catch(() => {});
}

/** Znovu probudí zvuk těsně před čtením; vrací, jestli může hrát. */
async function ensurePlayable(ctx: AudioContext) {
  if (ctx.state !== "running") {
    await ctx.resume().catch(() => {});
  }
  await sinkElement?.play().catch(() => {});
  return ctx.state === "running";
}

/**
 * Záložní čtení vestavěným hlasem zařízení, když prohlížeč nepustí
 * streamovaný zvuk (typicky iOS bez dalšího klepnutí).
 */
function speakWithDeviceVoice(text: string, options: { rate?: number; muted?: boolean } = {}): SpeakHandle {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  let stopped = false;
  let finish: () => void = () => {};
  const done = new Promise<void>((resolve) => {
    finish = resolve;
  });
  if (!synth) {
    return {
      stop: () => {},
      setRate: () => {},
      setMuted: () => {},
      scheduledSeconds: () => 0,
      elapsedSeconds: () => 0,
      done: Promise.reject(new Error("Tento prohlížeč nepodporuje předčítání.")),
    };
  }
  const startedAt = Date.now();
  const chunks = chunkText(sanitizeForSpeech(text), 60);
  let rate = options.rate ?? 1;
  let index = 0;
  const speakNext = () => {
    if (stopped || index >= chunks.length) {
      finish();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunks[index] ?? "");
    index += 1;
    utterance.lang = "cs-CZ";
    utterance.rate = rate;
    utterance.volume = options.muted ? 0 : 1;
    const czech = synth.getVoices().find((voice) => voice.lang?.toLowerCase().startsWith("cs"));
    if (czech) utterance.voice = czech;
    utterance.onend = speakNext;
    utterance.onerror = speakNext;
    synth.speak(utterance);
  };
  synth.cancel();
  speakNext();
  return {
    stop: () => {
      stopped = true;
      synth.cancel();
      finish();
    },
    setRate: (next) => {
      rate = next;
    },
    setMuted: (muted) => {
      if (muted) synth.pause();
      else synth.resume();
    },
    scheduledSeconds: () => 0,
    elapsedSeconds: () => (Date.now() - startedAt) / 1000,
    done,
  };
}

async function readSpeechAudio(response: Response, onAudio: (bytes: Uint8Array) => void) {
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message.trim() || "Hlas se nepodařilo získat.");
  }

  const parseLine = (line: string) => {
    if (!line.startsWith("data:")) return;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") return;
    let event: { type?: string; audio?: string };
    try {
      event = JSON.parse(payload) as { type?: string; audio?: string };
    } catch {
      return;
    }
    if (event.type !== "speech.audio.delta" || !event.audio) return;
    const binary = atob(event.audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    onAudio(bytes);
  };

  if (response.body && typeof TextDecoderStream !== "undefined") {
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let pending = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      pending += value;
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      for (const line of lines) parseLine(line);
    }
    if (pending) parseLine(pending);
    return;
  }

  const body = await response.text();
  for (const line of body.split("\n")) parseLine(line);
}

export interface SpeakHandle {
  /** Okamžitě ukončí čtení. */
  stop: () => void;
  setRate: (rate: number) => void;
  setMuted: (muted: boolean) => void;
  /** Odhad celkové délky naplánovaného zvuku v sekundách. */
  scheduledSeconds: () => number;
  /** Kolik sekund už bylo přehráno. */
  elapsedSeconds: () => number;
  /** Skončí, až dozní poslední část (nebo při chybě). */
  done: Promise<void>;
}

export interface WordBoundary {
  segmentIndex: number;
  charIndex: number;
}

interface PreciseBookOptions {
  rate?: number;
  muted?: boolean;
  startSegment?: number;
  startChar?: number;
  onWord?: (boundary: WordBoundary) => void;
  onSegment?: (index: number) => void;
}

/**
 * Čte knihu hlasem zařízení. Prohlížeč oznamuje skutečný začátek každého
 * vysloveného slova, takže zvýraznění není odhadované z délky textu.
 */
export function speakBookPrecisely(
  segments: string[],
  options: PreciseBookOptions = {},
): SpeakHandle | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  const gain = ctx.createGain();
  gain.gain.value = options.muted ? 0 : 1;
  gain.connect(getSink(ctx));
  const releaseAwake = holdAudioAwake(ctx);
  const controller = new AbortController();
  const startSegment = Math.max(0, Math.min(options.startSegment ?? 0, segments.length - 1));
  const startChar = Math.max(0, options.startChar ?? 0);
  let rate = options.rate ?? 1;
  let stopped = false;
  let playhead = 0;
  let startedAt = 0;
  let scheduledDuration = 0;
  const sources: AudioBufferSourceNode[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];

  type BookGroup = { text: string; from: number; to: number };
  const groups: BookGroup[] = [];
  let group: BookGroup | null = null;
  const wordCount = (value: string) => value.match(/\S+/g)?.length ?? 0;
  segments.forEach((segment, index) => {
    if (index < startSegment) return;
    const value = index === startSegment ? segment.slice(startChar).trimStart() : segment;
    if (!value) return;
    const groupLimit = groups.length === 0 ? 55 : 110;
    if (group && wordCount(group.text) + wordCount(value) > groupLimit) {
      groups.push(group);
      group = null;
    }
    if (!group) group = { text: value, from: index, to: index };
    else {
      group.text += ` ${value}`;
      group.to = index;
    }
  });
  if (group) groups.push(group);

  const fetchPcm = async (text: string) => {
    const res = await fetch("/api/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sanitizeForSpeech(text) }),
      signal: controller.signal,
    });
    const chunks: Uint8Array[] = [];
    let total = 0;
    await readSpeechAudio(res, (bytes) => {
        chunks.push(bytes);
        total += bytes.length;
    });
    const pcm = new Uint8Array(total - (total % 2));
    let offset = 0;
    for (const chunk of chunks) {
      const available = Math.min(chunk.length, pcm.length - offset);
      pcm.set(chunk.subarray(0, available), offset);
      offset += available;
      if (offset >= pcm.length) break;
    }
    return pcm;
  };

  const scheduleWords = (current: BookGroup, at: number, duration: number) => {
    const entries: { segmentIndex: number; charIndex: number; weight: number }[] = [];
    for (let index = current.from; index <= current.to; index++) {
      const sentence = segments[index] ?? "";
      const fromChar = index === startSegment ? startChar : 0;
      const pattern = /\S+/gu;
      pattern.lastIndex = fromChar;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(sentence)) !== null) {
        const punctuation = match[0].match(/[.!?…,:;]$/u)?.[0];
        const pause = punctuation && ".!?…".includes(punctuation) ? 7 : punctuation ? 3 : 0;
        entries.push({
          segmentIndex: index,
          charIndex: match.index,
          weight: Math.max(2, match[0].replace(/[^\p{L}\p{N}]/gu, "").length) + pause,
        });
      }
    }
    const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0) || 1;
    let weightBefore = 0;
    for (const entry of entries) {
      const when = at + (weightBefore / totalWeight) * duration;
      weightBefore += entry.weight;
      const delay = Math.max(0, (when - ctx.currentTime) * 1000);
      timers.push(setTimeout(() => {
        if (stopped) return;
        options.onSegment?.(entry.segmentIndex);
        options.onWord?.({ segmentIndex: entry.segmentIndex, charIndex: entry.charIndex });
      }, delay));
    }
  };

  const done = (async () => {
    await ensurePlayable(ctx);
    let nextAudio = groups[0] ? fetchPcm(groups[0].text) : null;
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const current = groups[groupIndex];
      if (!current || !nextAudio) break;
      if (stopped) return;
      while (!stopped && playhead - ctx.currentTime > 18) {
        await new Promise<void>((resolve) => setTimeout(resolve, 350));
      }
      const pcm = await nextAudio;
      const following = groups[groupIndex + 1];
      nextAudio = following ? fetchPcm(following.text) : null;
      if (stopped || pcm.length === 0) return;
      const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.byteLength / 2);
      const floats = Float32Array.from(samples, (sample) => sample / 32768);
      const buffer = ctx.createBuffer(1, floats.length, SAMPLE_RATE);
      buffer.copyToChannel(floats, 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = rate;
      source.connect(gain);
      if (playhead === 0) {
        playhead = ctx.currentTime + 0.08;
        startedAt = playhead;
      } else {
        playhead = Math.max(playhead, ctx.currentTime + 0.02);
      }
      const duration = buffer.duration / rate;
      scheduleWords(current, playhead, duration);
      source.start(playhead);
      sources.push(source);
      playhead += duration;
      scheduledDuration = playhead - startedAt;
    }
    const remaining = Math.max(0, playhead - ctx.currentTime);
    await new Promise<void>((resolve) => setTimeout(resolve, remaining * 1000 + 100));
  })();

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      controller.abort();
      for (const timer of timers) clearTimeout(timer);
      for (const source of sources) {
        try {
          source.stop();
        } catch {
          // zdroj už dohrál
        }
      }
      gain.disconnect();
    },
    setRate: (next) => {
      rate = next;
      // Právě znějící a již naplánovaný úsek se nechá přirozeně dohrát.
      // Nová rychlost se použije od následující části, takže se nerozbije
      // časování slov ani nevznikne mezera či opakování věty.
    },
    setMuted: (next) => {
      gain.gain.value = next ? 0 : 1;
    },
    scheduledSeconds: () => scheduledDuration,
    elapsedSeconds: () => (startedAt ? Math.max(0, ctx.currentTime - startedAt) : 0),
    done,
  };
}

/**
 * Připraví text pro předčítání: vypustí sanskrtské glosy v závorkách,
 * značky formátování a uvozovky, které hlas jinak vyslovuje jako šum.
 * Psaný text na stránce se tím nemění.
 */
export function sanitizeForSpeech(text: string): string {
  return text
    .replace(/\([^()]{0,80}\)/g, " ")
    .replace(/[*_#>`"„“”«»]/g, " ")
    .replace(/\s*[–—-]\s*/g, " – ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Rozdělí text na části, které bezpečně projdou jedním požadavkem. */
export function chunkText(text: string, maxWords = 220): string[] {
  const words = (s: string) => (s.match(/\S+/g) ?? []).length;
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };
  for (const sentence of sentences) {
    if (words(sentence) > maxWords) {
      flush();
      const w = sentence.match(/\S+/g) ?? [];
      for (let i = 0; i < w.length; i += maxWords) {
        chunks.push(w.slice(i, i + maxWords).join(" "));
      }
      continue;
    }
    if (current && words(current) + words(sentence) > maxWords) flush();
    current += sentence;
  }
  flush();
  return chunks;
}

interface SpeakOptions {
  rate?: number;
  muted?: boolean;
  signal?: AbortSignal;
  /** Věty k přečtení; má přednost před textem a umožňuje sledování čtení. */
  segments?: string[];
  /** Od které věty se má začít. */
  startIndex?: number;
  /** Ohlásí začátek čtení dané věty (index v `segments`). */
  onSegment?: (index: number) => void;
}

/** Seskupí věty do úseků, které bezpečně projdou jedním požadavkem. */
function groupSegments(segments: string[], maxWords = 220) {
  const words = (s: string) => (s.match(/\S+/g) ?? []).length;
  const groups: { text: string; from: number; to: number }[] = [];
  let current: { text: string; from: number; to: number } | null = null;
  segments.forEach((segment, index) => {
    if (!segment.trim()) return;
    if (current && words(current.text) + words(segment) > maxWords) {
      groups.push(current);
      current = null;
    }
    if (!current) current = { text: segment, from: index, to: index };
    else {
      current.text += ` ${segment}`;
      current.to = index;
    }
  });
  if (current) groups.push(current);
  return groups;
}


/**
 * Přečte text nahlas: text se po částech posílá na server a přijaté PCM
 * úseky se plánují na jedné zvukové ose, takže čtení běží plynule.
 */
export function speak(text: string, options: SpeakOptions = {}): SpeakHandle {
  const ctx = getAudioContext();
  if (!ctx) {
    const done = Promise.reject(new Error("Tento prohlížeč nepodporuje přehrávání zvuku."));
    return {
      stop: () => {},
      setRate: () => {},
      setMuted: () => {},
      scheduledSeconds: () => 0,
      elapsedSeconds: () => 0,
      done,
    };
  }
  const gain = ctx.createGain();
  gain.gain.value = options.muted ? 0 : 1;
  gain.connect(getSink(ctx));
  const releaseAwake = holdAudioAwake(ctx);
  let fallback: SpeakHandle | null = null;

  const controller = new AbortController();
  options.signal?.addEventListener("abort", () => controller.abort());

  let rate = options.rate ?? 1;
  let playhead = 0;
  let startedAt = 0;
  let stopped = false;
  const sources: AudioBufferSourceNode[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let pending = new Uint8Array(0);
  let groupStart: number | null = null;

  const enqueue = (incoming: Uint8Array) => {
    if (stopped) return;
    const bytes = new Uint8Array(pending.length + incoming.length);
    bytes.set(pending);
    bytes.set(incoming, pending.length);
    const usable = bytes.length - (bytes.length % 2);
    pending = bytes.slice(usable);
    if (usable === 0) return;
    const samples = new Int16Array(bytes.buffer, 0, usable / 2);
    const floats = Float32Array.from(samples, (s) => s / 32768);
    const buffer = ctx.createBuffer(1, floats.length, SAMPLE_RATE);
    buffer.copyToChannel(floats, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    source.connect(gain);
    if (playhead === 0) {
      playhead = ctx.currentTime + 0.08;
      startedAt = playhead;
    } else {
      playhead = Math.max(playhead, ctx.currentTime);
    }
    if (groupStart === null) groupStart = playhead;
    source.start(playhead);
    playhead += buffer.duration / rate;
    sources.push(source);
  };

  /** Naplánuje zvýraznění vět uvnitř právě naplánovaného úseku. */
  const scheduleSegments = (
    segments: string[],
    from: number,
    to: number,
    start: number,
    end: number,
  ) => {
    const onSegment = options.onSegment;
    if (!onSegment) return;
    const lengths: number[] = [];
    for (let i = from; i <= to; i++) lengths.push(Math.max(1, (segments[i] ?? "").length));
    const total = lengths.reduce((a, b) => a + b, 0);
    const span = Math.max(0, end - start);
    let offset = 0;
    lengths.forEach((len, i) => {
      const at = start + (offset / total) * span;
      offset += len;
      const delay = Math.max(0, (at - ctx.currentTime) * 1000);
      timers.push(
        setTimeout(() => {
          if (!stopped) onSegment(from + i);
        }, delay),
      );
    });
  };


  const streamChunk = async (chunk: string) => {
    const res = await fetch("/api/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: chunk }),
      signal: controller.signal,
    });
    await readSpeechAudio(res, enqueue);
  };

  const done = (async () => {
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});
    const segments = options.segments;
    if (segments?.length) {
      const startIndex = Math.max(0, Math.min(options.startIndex ?? 0, segments.length - 1));
      const groups = groupSegments(segments).filter((g) => g.to >= startIndex);
      for (const group of groups) {
        if (stopped) return;
        // Nechceme mít naplánováno příliš mnoho zvuku dopředu.
        while (!stopped && playhead - ctx.currentTime > 90) {
          await new Promise<void>((resolve) => setTimeout(resolve, 500));
        }
        if (stopped) return;
        groupStart = null;
        await streamChunk(sanitizeForSpeech(group.text));
        const start = groupStart ?? ctx.currentTime;
        scheduleSegments(segments, Math.max(group.from, startIndex), group.to, start, playhead);
      }
    } else {
      for (const chunk of chunkText(sanitizeForSpeech(text))) {
        if (stopped) return;
        await streamChunk(chunk);
      }
    }
    // dočkáme dohrání
    const remaining = Math.max(0, playhead - ctx.currentTime);
    await new Promise<void>((resolve) => setTimeout(resolve, remaining * 1000 + 120));
  })();

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      controller.abort();
      for (const t of timers) clearTimeout(t);
      for (const s of sources) {
        try {
          s.stop();
        } catch {
          // už dohrálo
        }
      }
      gain.disconnect();
    },

    setRate: (next) => {
      rate = next;
      for (const s of sources) {
        try {
          s.playbackRate.value = next;
        } catch {
          // ignorujeme
        }
      }
    },
    setMuted: (muted) => {
      gain.gain.value = muted ? 0 : 1;
    },
    scheduledSeconds: () => Math.max(0, playhead - startedAt),
    elapsedSeconds: () => (startedAt ? Math.max(0, ctx.currentTime - startedAt) : 0),
    done,
  };
}
