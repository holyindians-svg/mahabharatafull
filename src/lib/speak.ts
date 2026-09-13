const SAMPLE_RATE = 24000;

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
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const synth = window.speechSynthesis;
  let segmentIndex = Math.max(0, Math.min(options.startSegment ?? 0, segments.length - 1));
  let charIndex = Math.max(0, options.startChar ?? 0);
  let rate = options.rate ?? 1;
  let muted = options.muted ?? false;
  let stopped = false;
  let generation = 0;
  let startedAt = performance.now();
  let elapsedBeforeRestart = 0;
  let resolveDone: () => void = () => {};
  const done = new Promise<void>((resolve) => {
    resolveDone = resolve;
  });

  const chooseCzechVoice = () =>
    synth.getVoices().find((voice) => /^cs(?:-|_)/i.test(voice.lang));

  const finish = () => {
    if (stopped) return;
    stopped = true;
    resolveDone();
  };

  const speakCurrent = () => {
    if (stopped || segmentIndex >= segments.length) {
      finish();
      return;
    }
    const whole = segments[segmentIndex] ?? "";
    const from = Math.max(0, Math.min(charIndex, whole.length));
    const spoken = whole.slice(from).trimStart();
    const trimOffset = whole.slice(from).length - spoken.length;
    charIndex = from + trimOffset;
    if (!spoken) {
      segmentIndex += 1;
      charIndex = 0;
      speakCurrent();
      return;
    }

    const ownGeneration = ++generation;
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.lang = "cs-CZ";
    utterance.rate = rate;
    utterance.volume = muted ? 0 : 1;
    const voice = chooseCzechVoice();
    if (voice) utterance.voice = voice;
    options.onSegment?.(segmentIndex);
    utterance.onboundary = (event) => {
      if (stopped || ownGeneration !== generation) return;
      if (event.name && event.name !== "word") return;
      charIndex = from + trimOffset + event.charIndex;
      options.onWord?.({ segmentIndex, charIndex });
    };
    utterance.onend = () => {
      if (stopped || ownGeneration !== generation) return;
      segmentIndex += 1;
      charIndex = 0;
      speakCurrent();
    };
    utterance.onerror = (event) => {
      if (stopped || ownGeneration !== generation || event.error === "canceled") return;
      finish();
    };
    synth.speak(utterance);
  };

  const restart = () => {
    if (stopped) return;
    elapsedBeforeRestart += (performance.now() - startedAt) / 1000;
    startedAt = performance.now();
    generation += 1;
    synth.cancel();
    speakCurrent();
  };

  synth.cancel();
  speakCurrent();

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      generation += 1;
      synth.cancel();
      resolveDone();
    },
    setRate: (next) => {
      if (rate === next) return;
      rate = next;
      restart();
    },
    setMuted: (next) => {
      if (muted === next) return;
      muted = next;
      restart();
    },
    scheduledSeconds: () => {
      const remainingWords = segments
        .slice(segmentIndex)
        .join(" ")
        .match(/\S+/g)?.length ?? 0;
      return elapsedBeforeRestart + remainingWords / (2.4 * rate);
    },
    elapsedSeconds: () => elapsedBeforeRestart + (performance.now() - startedAt) / 1000,
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
  const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
  const gain = ctx.createGain();
  gain.gain.value = options.muted ? 0 : 1;
  gain.connect(ctx.destination);

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
    if (!res.ok || !res.body) {
      const message = await res.text().catch(() => "");
      throw new Error(message.trim() || "Hlas se nepodařilo získat.");
    }
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let event: { type?: string; audio?: string };
        try {
          event = JSON.parse(payload) as { type?: string; audio?: string };
        } catch {
          continue;
        }
        if (event.type !== "speech.audio.delta" || !event.audio) continue;
        const binary = atob(event.audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        enqueue(bytes);
      }
    }
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
  })().finally(() => {
    if (!stopped) void ctx.close().catch(() => {});
  });

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
      void ctx.close().catch(() => {});
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
