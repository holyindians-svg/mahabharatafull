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
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;

  const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
  const gain = ctx.createGain();
  gain.gain.value = options.muted ? 0 : 1;
  gain.connect(ctx.destination);
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
    if (group && wordCount(group.text) + wordCount(value) > 150) {
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
    if (!res.ok || !res.body) {
      const message = await res.text().catch(() => "");
      throw new Error(message.trim() || "Hlas se nepodařilo získat.");
    }
    const chunks: Uint8Array[] = [];
    let total = 0;
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let pending = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      pending += value;
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
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
        chunks.push(bytes);
        total += bytes.length;
      }
    }
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
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});
    for (const current of groups) {
      if (stopped) return;
      while (!stopped && playhead - ctx.currentTime > 60) {
        await new Promise<void>((resolve) => setTimeout(resolve, 350));
      }
      const pcm = await fetchPcm(current.text);
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
  })().finally(() => {
    if (!stopped) void ctx.close().catch(() => {});
  });

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
      void ctx.close().catch(() => {});
    },
    setRate: (next) => {
      rate = next;
      for (const source of sources) source.playbackRate.value = next;
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
