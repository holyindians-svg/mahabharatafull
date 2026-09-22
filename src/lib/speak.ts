/**
 * Předčítání běží vestavěným hlasem zařízení (Web Speech API).
 * Nepotřebuje internet ani placenou službu — čtení je zdarma a okamžité.
 */

/** Přibližné tempo českého vypravěče, slouží jen pro odhad průběhu. */
const WORDS_PER_SEC = 2.4;

const MALE_HINTS = [
  "male",
  "muz",
  "muž",
  "jakub",
  "petr",
  "jan ",
  "tomas",
  "tomáš",
  "vojtech",
  "matej",
  "daniel",
  "filip",
  "adam",
  "cse",
];

const FEMALE_HINTS = ["female", "zuzana", "iveta", "eliska", "eliška", "kristyna", "zena", "žena"];

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

/** Vybere český hlas; pokud jich je víc, dá přednost mužskému. */
function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices?.() ?? [];
  const czech = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("cs"));
  if (!czech.length) return null;
  const name = (voice: SpeechSynthesisVoice) => voice.name.toLowerCase();
  const male = czech.find((voice) => MALE_HINTS.some((hint) => name(voice).includes(hint)));
  const neutral = czech.find((voice) => !FEMALE_HINTS.some((hint) => name(voice).includes(hint)));
  return male ?? neutral ?? czech[0] ?? null;
}

/**
 * Aktivuje hlas přímo v obsluze dotyku (vyžaduje hlavně iOS a nainstalovaná
 * aplikace). Název i chování zůstávají, aby volající kód nemusel měnit.
 */
export function primeAudioPlayback() {
  const synth = getSynth();
  if (!synth) return Promise.resolve(false);
  try {
    synth.resume();
    // Krátké tiché vyslovení odemkne hlas pro pozdější automatické čtení.
    const warmup = new SpeechSynthesisUtterance(" ");
    warmup.volume = 0;
    warmup.lang = "cs-CZ";
    synth.speak(warmup);
  } catch {
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
}

/** Po návratu aplikace z pozadí obnoví pozastavené čtení. */
export function resumeAudioPlayback() {
  const synth = getSynth();
  if (!synth) return;
  try {
    if (synth.paused) synth.resume();
  } catch {
    // nic
  }
}

export interface SpeakHandle {
  /** Okamžitě ukončí čtení. */
  stop: () => void;
  setRate: (rate: number) => void;
  setMuted: (muted: boolean) => void;
  /** Odhad celkové délky čtení v sekundách. */
  scheduledSeconds: () => number;
  /** Kolik sekund už bylo přečteno. */
  elapsedSeconds: () => number;
  /** Skončí, až dozní poslední část (nebo při chybě). */
  done: Promise<void>;
}

export interface WordBoundary {
  segmentIndex: number;
  charIndex: number;
}

interface WordMark {
  /** Pozice slova v textu jedné vyslovované části. */
  offset: number;
  segmentIndex: number;
  charIndex: number;
}

interface SpeechItem {
  text: string;
  words: WordMark[];
}

function failedHandle(message: string): SpeakHandle {
  const done = Promise.reject(new Error(message));
  // Bez zachycení by prohlížeč hlásil nezpracované odmítnutí.
  void done.catch(() => {});
  return {
    stop: () => {},
    setRate: () => {},
    setMuted: () => {},
    scheduledSeconds: () => 0,
    elapsedSeconds: () => 0,
    done,
  };
}

interface RunOptions {
  rate?: number | undefined;
  muted?: boolean | undefined;
  signal?: AbortSignal | undefined;
  onWord?: ((boundary: WordBoundary) => void) | undefined;
  onSegment?: ((index: number) => void) | undefined;
}

/**
 * Upraví text tak, aby ho hlas přečetl přirozeně: dlouhé „ó“ některé hlasy
 * vyslovují jako „o s čárkou“. Záměna je znak za znak, takže pozice slov
 * pro zvýrazňování textu na stránce zůstávají stejné. Zobrazený text se nemění.
 */
function forVoice(text: string): string {
  return text.replace(/ó/g, "o").replace(/Ó/g, "O");
}

/** Přečte připravené části za sebou a hlásí právě vyslovované slovo. */
function runUtterances(items: SpeechItem[], options: RunOptions): SpeakHandle {
  const synth = getSynth();
  if (!synth) return failedHandle("Tento prohlížeč nepodporuje předčítání.");
  const usable = items.filter((item) => item.text.trim().length > 0);
  let rate = options.rate ?? 1;
  let muted = options.muted ?? false;
  let stopped = false;
  let index = 0;
  let startedAt = 0;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const totalWords = usable.reduce((sum, item) => sum + Math.max(1, item.words.length), 0) || 1;
  let finish: () => void = () => {};
  const done = new Promise<void>((resolve) => {
    finish = resolve;
  });

  const clearTimers = () => {
    for (const timer of timers) clearTimeout(timer);
    timers.length = 0;
  };

  const speakItem = () => {
    if (stopped) return;
    const item = usable[index];
    if (!item) {
      finish();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(forVoice(item.text));
    utterance.lang = "cs-CZ";
    utterance.rate = rate;
    utterance.pitch = 0.95;
    utterance.volume = muted ? 0 : 1;
    try {
      const voice = pickVoice(synth);
      if (voice) utterance.voice = voice;
    } catch {
      // Když se hlas nedá nastavit, čte se výchozím hlasem zařízení.
    }

    let pointer = -1;
    let usedBoundary = false;
    const advanceTo = (position: number) => {
      if (position <= pointer || position >= item.words.length) return;
      pointer = position;
      const mark = item.words[position];
      if (!mark) return;
      options.onSegment?.(mark.segmentIndex);
      options.onWord?.({ segmentIndex: mark.segmentIndex, charIndex: mark.charIndex });
    };

    utterance.onstart = () => {
      if (!startedAt) startedAt = Date.now();
      advanceTo(0);
      // Odhadovaný posun pro prohlížeče, které vyslovená slova nehlásí.
      const perWord = 1000 / (WORDS_PER_SEC * Math.max(0.5, rate));
      for (let i = 1; i < item.words.length; i++) {
        timers.push(
          setTimeout(() => {
            if (!usedBoundary && !stopped) advanceTo(i);
          }, i * perWord),
        );
      }
    };

    utterance.onboundary = (event) => {
      if (event.name && event.name !== "word") return;
      usedBoundary = true;
      const charIndex = event.charIndex ?? 0;
      let candidate = 0;
      for (let i = 0; i < item.words.length; i++) {
        const mark = item.words[i];
        if (mark && mark.offset <= charIndex) candidate = i;
        else break;
      }
      advanceTo(candidate);
    };

    const next = () => {
      if (stopped) return;
      clearTimers();
      index += 1;
      speakItem();
    };
    utterance.onend = next;
    utterance.onerror = next;
    synth.speak(utterance);
  };

  try {
    synth.cancel();
    synth.resume();
  } catch {
    // nic
  }
  speakItem();

  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearTimers();
    try {
      synth.cancel();
    } catch {
      // nic
    }
    finish();
  };
  options.signal?.addEventListener("abort", stop);

  return {
    stop,
    setRate: (next) => {
      // Nová rychlost se použije od následující části, aby se nepřerušilo
      // právě znějící čtení ani sledování textu.
      rate = next;
    },
    setMuted: (next) => {
      muted = next;
      try {
        if (next) synth.pause();
        else synth.resume();
      } catch {
        // nic
      }
    },
    scheduledSeconds: () => totalWords / (WORDS_PER_SEC * Math.max(0.5, rate)),
    elapsedSeconds: () => (startedAt ? (Date.now() - startedAt) / 1000 : 0),
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

/** Rozdělí text na části, které se plynule přečtou za sebou. */
export function chunkText(text: string, maxWords = 60): string[] {
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

const wordCount = (value: string) => value.match(/\S+/g)?.length ?? 0;

/** Označí slova jedné části tak, aby se dala napojit na věty na stránce. */
function markWords(text: string, segmentIndex: number, baseOffset: number, charShift = 0) {
  const marks: WordMark[] = [];
  const pattern = /\S+/gu;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    marks.push({
      offset: baseOffset + match.index,
      segmentIndex,
      charIndex: match.index + charShift,
    });
  }
  return marks;
}

interface GroupedSegments {
  items: SpeechItem[];
}

/**
 * Spojí věty do částí, které hlas přečte v jednom celku, a zapamatuje si,
 * kde v původním textu každé slovo leží.
 */
function buildSegmentItems(
  segments: string[],
  startSegment: number,
  startChar: number,
  maxWords: number,
): GroupedSegments {
  const items: SpeechItem[] = [];
  let text = "";
  let words: WordMark[] = [];
  const flush = () => {
    if (text.trim()) items.push({ text, words });
    text = "";
    words = [];
  };
  segments.forEach((segment, index) => {
    if (index < startSegment) return;
    const shift = index === startSegment ? startChar : 0;
    const value = index === startSegment ? segment.slice(startChar).trimStart() : segment;
    if (!value.trim()) return;
    const limit = items.length === 0 ? Math.min(maxWords, 40) : maxWords;
    if (text && wordCount(text) + wordCount(value) > limit) flush();
    const base = text ? text.length + 1 : 0;
    const extraShift = index === startSegment ? shift + (segment.slice(startChar).length - value.length) : 0;
    words = words.concat(markWords(value, index, base, extraShift));
    text = text ? `${text} ${value}` : value;
  });
  flush();
  return { items };
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
 * Čte knihu hlasem zařízení. Prohlížeč hlásí začátek každého vysloveného
 * slova, takže zvýraznění textu jde ruku v ruce s hlasem.
 */
export function speakBookPrecisely(
  segments: string[],
  options: PreciseBookOptions = {},
): SpeakHandle | null {
  if (!getSynth()) return null;
  const startSegment = Math.max(0, Math.min(options.startSegment ?? 0, Math.max(0, segments.length - 1)));
  const { items } = buildSegmentItems(segments, startSegment, Math.max(0, options.startChar ?? 0), 60);
  if (!items.length) return null;
  return runUtterances(items, {
    rate: options.rate,
    muted: options.muted,
    onWord: options.onWord,
    onSegment: options.onSegment,
  });
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

/** Přečte text nahlas vestavěným hlasem zařízení. */
export function speak(text: string, options: SpeakOptions = {}): SpeakHandle {
  if (!getSynth()) return failedHandle("Tento prohlížeč nepodporuje předčítání.");
  const segments = options.segments;
  if (segments?.length) {
    const startIndex = Math.max(0, Math.min(options.startIndex ?? 0, segments.length - 1));
    const { items } = buildSegmentItems(segments, startIndex, 0, 60);
    if (items.length) {
      return runUtterances(items, {
        rate: options.rate,
        muted: options.muted,
        signal: options.signal,
        onSegment: options.onSegment,
      });
    }
  }
  const items: SpeechItem[] = chunkText(sanitizeForSpeech(text)).map((chunk) => ({
    text: chunk,
    words: markWords(chunk, 0, 0),
  }));
  if (!items.length) return failedHandle("Není co číst.");
  return runUtterances(items, {
    rate: options.rate,
    muted: options.muted,
    signal: options.signal,
  });
}
