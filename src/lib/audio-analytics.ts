import type {} from "./analytics";

type AudioEvent = "audio_play" | "audio_progress" | "audio_complete";
type AudioParameters = { audio_title: string; minutes_played?: number };
type Emit = (event: AudioEvent, parameters: AudioParameters) => void;

function emitToGoogle(event: AudioEvent, parameters: AudioParameters) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, parameters);
  }
}

/** One tracker per mounted recording; seeks never count as listening time. */
export function createAudioAnalytics(title: () => string, emit: Emit = emitToGoogle) {
  let seconds = 0;
  let baseline: { position: number; now: number } | null = null;
  const sentMinutes = new Set<number>();

  return {
    play() {
      seconds = 0;
      baseline = null;
      emit("audio_play", { audio_title: title() });
    },
    resume(position: number, now: number) {
      baseline = { position, now };
    },
    suspend() {
      baseline = null;
    },
    update(position: number, now: number, rate: number) {
      if (!baseline) return;
      const wallSeconds = Math.max(0, (now - baseline.now) / 1000);
      const mediaSeconds = Math.max(0, position - baseline.position);
      baseline = { position, now };
      if (!Number.isFinite(rate) || rate <= 0) return;
      seconds += Math.min(wallSeconds, mediaSeconds / rate);
      const reached = Math.floor(seconds / 300) * 5;
      for (let minute = 5; minute <= reached; minute += 5) {
        if (sentMinutes.has(minute)) continue;
        sentMinutes.add(minute);
        emit("audio_progress", { audio_title: title(), minutes_played: minute });
      }
    },
    complete() {
      baseline = null;
      emit("audio_complete", { audio_title: title() });
    },
  };
}