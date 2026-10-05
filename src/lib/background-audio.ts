/**
 * Udržení předčítání při zhasnuté obrazovce / na pozadí:
 * tichá smyčka audia, Media Session, watchdog proti zamrznutí a Wake Lock.
 * Vše s detekcí podpory — nepodporovaná API se tiše přeskočí.
 */

let audio: HTMLAudioElement | null = null;
let active = false;
let watchdog: ReturnType<typeof setInterval> | null = null;
let wakeLock: { release: () => Promise<void> } | null = null;
let listening = false;

/** Vytvoří 1 s ticha jako WAV (8 kHz, 8 bit mono). */
function silentWavUrl(): string {
  const samples = 8000;
  const buffer = new ArrayBuffer(44 + samples);
  const v = new DataView(buffer);
  const str = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  v.setUint32(4, 36 + samples, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true);
  v.setUint32(28, 8000, true);
  v.setUint16(32, 1, true);
  v.setUint16(34, 8, true);
  str(36, "data");
  v.setUint32(40, samples, true);
  for (let i = 0; i < samples; i++) v.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

function getAudio(): HTMLAudioElement | null {
  if (typeof document === "undefined") return null;
  if (audio) return audio;
  try {
    const el = document.createElement("audio");
    el.loop = true;
    el.preload = "auto";
    el.setAttribute("playsinline", "");
    el.setAttribute("aria-hidden", "true");
    el.style.display = "none";
    el.src = silentWavUrl();
    document.body.appendChild(el);
    audio = el;
  } catch {
    audio = null;
  }
  return audio;
}

async function requestWakeLock() {
  try {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    if (!nav.wakeLock || document.visibilityState !== "visible" || wakeLock) return;
    wakeLock = await nav.wakeLock.request("screen");
    if (!active) void releaseWakeLock();
  } catch {
    wakeLock = null;
  }
}

async function releaseWakeLock() {
  const lock = wakeLock;
  wakeLock = null;
  try {
    await lock?.release();
  } catch {
    // nic
  }
}

function nudgeSpeech() {
  if (!active || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  try {
    if (synth.paused || (synth.pending && !synth.speaking)) synth.resume();
  } catch {
    // nic
  }
}

function onVisibility() {
  if (!active) return;
  nudgeSpeech();
  if (document.visibilityState === "visible") {
    wakeLock = null;
    void requestWakeLock();
    void audio?.play().catch(() => {});
  }
}

/** Spustí udržování čtení na pozadí. Volat při startu čtení. */
export function startBackground() {
  if (typeof window === "undefined") return;
  active = true;
  const el = getAudio();
  if (el) void el.play().catch(() => {});
  if (!watchdog) watchdog = setInterval(nudgeSpeech, 3000);
  if (!listening) {
    document.addEventListener("visibilitychange", onVisibility);
    listening = true;
  }
  void requestWakeLock();
  setPlaybackState("playing");
}

/** Ukončí udržování čtení na pozadí. */
export function stopBackground() {
  active = false;
  try {
    audio?.pause();
  } catch {
    // nic
  }
  if (watchdog) clearInterval(watchdog);
  watchdog = null;
  void releaseWakeLock();
  setPlaybackState("paused");
}

function setPlaybackState(state: "playing" | "paused" | "none") {
  try {
    if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  } catch {
    // nic
  }
}

export interface MediaHandlers {
  play?: () => void;
  pause?: () => void;
  stop?: () => void;
  previoustrack?: () => void;
  nexttrack?: () => void;
}

/** Nastaví ovládání ze zamčené obrazovky. */
export function setMediaSession(title: string, album: string, handlers: MediaHandlers) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  const ms = navigator.mediaSession;
  try {
    if (typeof MediaMetadata !== "undefined") {
      ms.metadata = new MediaMetadata({
        title,
        artist: "Mahábhárata",
        album,
        artwork: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      });
    }
  } catch {
    // nic
  }
  const actions: (keyof MediaHandlers)[] = ["play", "pause", "stop", "previoustrack", "nexttrack"];
  for (const action of actions) {
    try {
      ms.setActionHandler(action, handlers[action] ?? null);
    } catch {
      // akce není podporována
    }
  }
}
