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
  let pending = new Uint8Array(0);

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
    source.start(playhead);
    playhead += buffer.duration / rate;
    sources.push(source);
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
    for (const chunk of chunkText(text)) {
      if (stopped) return;
      await streamChunk(chunk);
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
