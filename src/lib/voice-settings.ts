/** Uživatelské nastavení hlasu uložené trvale v zařízení. */
export interface VoiceSettings {
  voiceURI: string | null;
  rate: number;
  pitch: number;
}

const KEY = "mahabharata:voice-settings";

/** Je hlas český? (lang cs, cs-CZ, cs_CZ nebo „Czech“/„čeština“ v názvu) */
export function isCzechVoice(voice: { lang?: string; name?: string }): boolean {
  const lang = (voice.lang ?? "").replace(/_/g, "-").toLowerCase();
  if (lang === "cs" || lang.startsWith("cs-")) return true;
  const name = (voice.name ?? "").toLowerCase();
  return name.includes("czech") || name.includes("čeština") || name.includes("cestina");
}
export const DEFAULT_VOICE_SETTINGS: VoiceSettings = { voiceURI: null, rate: 1, pitch: 1 };

const clamp = (v: unknown, fallback: number) => {
  const n = typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return Math.min(1.5, Math.max(0.5, n));
};

export function loadVoiceSettings(): VoiceSettings {
  if (typeof window === "undefined") return { ...DEFAULT_VOICE_SETTINGS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_VOICE_SETTINGS };
    const data = JSON.parse(raw) as Partial<VoiceSettings>;
    return {
      voiceURI: typeof data.voiceURI === "string" && data.voiceURI ? data.voiceURI : null,
      rate: clamp(data.rate, 1),
      pitch: clamp(data.pitch, 1),
    };
  } catch {
    return { ...DEFAULT_VOICE_SETTINGS };
  }
}

export function saveVoiceSettings(settings: VoiceSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        voiceURI: settings.voiceURI,
        rate: clamp(settings.rate, 1),
        pitch: clamp(settings.pitch, 1),
      }),
    );
  } catch {
    // paměť nedostupná
  }
}
