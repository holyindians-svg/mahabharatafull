import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Headphones, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { askAi } from "@/lib/ask-ai";
import { setMediaSession } from "@/lib/background-audio";
import {
  primeAudioPlayback,
  resumeAudioPlayback,
  speak,
  speakBookPrecisely,
  type SpeakHandle,
} from "@/lib/speak";

interface AudioPlayerProps {
  title: string;
  subtitle?: string;
  /** Odhadovaná délka nahrávky v minutách. */
  minutes: number;
  className?: string;
  /** Kontext položky (postava / kniha / zbraň) pro dotaz do textu. */
  context?: string | undefined;
  /** Dotaz odeslaný do textu po kliknutí na již existující položku na stránce. */
  question?: string | null | undefined;
  /** Trvale uložený text předčítání – zobrazí se okamžitě, bez dotazu. */
  presetText?: string | null | undefined;
  /** Trvale uložené odpovědi na klikací položky (klíč = text položky). */
  presetAnswers?: Record<string, string> | undefined;
  /** Věty celé knihy: čtou se plynule za sebou a sledují se v textu. */
  segments?: string[] | undefined;
  /** Ke každé větě index odstavce (pro zvýraznění celého odstavce). */
  paragraphIndex?: number[] | undefined;
  /** Klíč pro uložení pozice přehrávání do paměti zařízení. */
  progressKey?: string | undefined;
  /** Nahrané MP3 — přehraje se přes HTML5 Audio místo hlasu zařízení. */
  audioUrl?: string | undefined;
  /** Po připojení rovnou začne číst od začátku (navázání dalšího oddílu). */
  autoStart?: boolean | undefined;
  /** Zavolá se po přirozeném dočtení celého textu (ne po zastavení). */
  onFinished?: (() => void) | undefined;
  /** Ohlásí právě čtenou větu (index v `segments`). */
  onSegment?: ((index: number) => void) | undefined;
  /** Přepnutí na předchozí / další část z zamčené obrazovky. */
  onPrev?: (() => void) | undefined;
  onNext?: (() => void) | undefined;
  /** Ovládání zvenčí: skok a přehrání úseku přímo v kliknutí. */
  controlRef?: { current: AudioPlayerHandle | null } | undefined;
  /** Časové úseky oddílů ve sdílené nahrávce. */
  chapters?: { index: number; title: string; startTime: number; endTime: number }[] | undefined;
  /** Ohlásí oddíl, ve kterém je právě čas nahrávky. */
  onTimeSection?: ((index: number) => void) | undefined;
}



const SPEEDS = [1, 1.25, 1.5] as const;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TextToken {
  text: string;
  from: number;
  to: number;
  isWord: boolean;
}

function tokenize(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  const pattern = /\s+|[^\s]+/gu;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const value = match[0];
    tokens.push({
      text: value,
      from: match.index,
      to: match.index + value.length,
      isWord: /[\p{L}\p{N}]/u.test(value),
    });
  }
  return tokens;
}

/**
 * Přehrávač předčítání: po spuštění načte skutečný text k dané položce
 * z textu Mahábháraty a přečte ho nahlas.
 */
export function AudioPlayer({
  title,
  subtitle,
  minutes,
  className,
  context,
  question,
  presetText,
  presetAnswers,
  segments,
  paragraphIndex,
  progressKey,
  audioUrl,
  autoStart,
  onFinished,
  onSegment,
  onPrev,
  onNext,
  controlRef,
  chapters,
  onTimeSection,
}: AudioPlayerProps) {
  const callbacks = useRef({ onFinished, onSegment, onTimeSection, chapters, title });
  callbacks.current = { onFinished, onSegment, onTimeSection, chapters, title };
  const timeSection = useRef<number | null>(null);
  const fallbackDuration = Math.max(60, Math.round(minutes * 60));
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [muted, setMuted] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [activeChar, setActiveChar] = useState(0);
  const abort = useRef<AbortController | null>(null);
  const speaker = useRef<SpeakHandle | null>(null);
  const scrollBox = useRef<HTMLDivElement | null>(null);
  const activeLine = useRef<HTMLSpanElement | null>(null);
  const manualScrollUntil = useRef(0);
  const autoScrolling = useRef(0);
  const savedAt = useRef(0);
  const storageKey = progressKey ? `mahabharata:progress:${progressKey}` : null;

  /** Nahraná nahrávka (HTML5 Audio) místo hlasu zařízení. */
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const audioMode = !!audioUrl;
  const [volume, setVolume] = useState(1);
  const volumeBox = useRef<HTMLSpanElement | null>(null);
  const pendingTime = useRef<number | null>(null);
  const approxActive = useRef(-1);

  /** Uloží pozici v nahrávce do paměti zařízení. */
  const saveAudioTime = (time: number, force = false) => {
    if (!storageKey) return;
    const now = Date.now();
    if (!force && now - savedAt.current < 2000) return;
    savedAt.current = now;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ time }));
    } catch {
      // paměť není dostupná
    }
  };

  // Nahraná nahrávka: jeden skrytý prvek HTML5 Audio.
  useEffect(() => {
    if (!audioUrl || typeof window === "undefined") return;
    const el = new Audio();
    el.src = audioUrl;
    el.preload = "metadata";
    audioEl.current = el;
    try {
      const raw = storageKey ? localStorage.getItem(storageKey) : null;
      if (raw) {
        const saved = JSON.parse(raw) as { time?: number };
        if (typeof saved.time === "number" && saved.time > 0) pendingTime.current = saved.time;
      }
    } catch {
      // uložená pozice je poškozená
    }
    const onMeta = () => {
      if (isFinite(el.duration) && el.duration > 0) setDuration(el.duration);
      if (pendingTime.current !== null) {
        el.currentTime = Math.min(pendingTime.current, Math.max(0, el.duration - 1));
        pendingTime.current = null;
      }
    };
    const onTime = () => {
      setPosition(el.currentTime);
      saveAudioTime(el.currentTime);
      if (stopAt.current !== null && el.currentTime >= stopAt.current) {
        stopAt.current = null;
        el.pause();
        setPlaying(false);
        saveAudioTime(el.currentTime, true);
      }
      const list = callbacks.current.chapters;
      if (list?.length) {
        const t = el.currentTime;
        let found: (typeof list)[number] | undefined = list.find(
          (c) => t >= c.startTime && t < c.endTime,
        );
        if (!found) found = [...list].reverse().find((c) => t >= c.startTime);
        if (found && found.index !== timeSection.current) {
          timeSection.current = found.index;
          callbacks.current.onTimeSection?.(found.index);
          try {
            const ms = navigator.mediaSession;
            if (ms && typeof MediaMetadata !== "undefined") {
              ms.metadata = new MediaMetadata({
                title: found.title,
                album: callbacks.current.title,
                artist: "Mahábhárata",
                artwork: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
              });
            }
          } catch {
            // Media Session nedostupná
          }
        }
      }
    };
    const onEnded = () => {
      setPlaying(false);
      if (storageKey) saveAudioTime(el.duration, true);
      callbacks.current.onFinished?.();
    };
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
      try {
        el.pause();
      } catch {
        // nic
      }
      audioEl.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  /**
   * Skok a přehrání úseku — volá se synchronně přímo z kliknutí (gesto pro iOS).
   * `end` = režim „tento oddíl“ (pauza na konci), bez něj hraje celá kniha.
   */
  const playRange = (start: number, end?: number) => {
    if (!audioUrl) return;
    let el = audioEl.current;
    if (!el) {
      el = new Audio();
      el.preload = "metadata";
      audioEl.current = el;
    }
    if (!el.getAttribute("src")) el.src = audioUrl;
    stopAt.current = end ?? null;
    timeSection.current = null;
    if (el.readyState >= 1) {
      pendingTime.current = null;
      el.currentTime = start;
    } else {
      pendingTime.current = start;
      try {
        el.currentTime = start;
      } catch {
        // použije se po načtení metadat
      }
    }
    setPosition(start);
    el.playbackRate = speed;
    el.muted = muted;
    el.volume = volume;
    setPlaying(true);
    void el.play().catch(() => setPlaying(false));
  };
  if (controlRef) controlRef.current = { playRange };


  /** Uloží pozici v knize do paměti zařízení. */
  const currentProgress = useRef({ index: null as number | null, charIndex: 0 });
  const saveProgress = (
    index: number | null,
    charIndex = currentProgress.current.charIndex,
    rate = speed,
    force = false,
  ) => {
    if (!storageKey || index === null) return;
    const now = Date.now();
    if (!force && now - savedAt.current < 2000) return;
    savedAt.current = now;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ index, charIndex, rate }));
    } catch {
      // paměť není dostupná
    }
  };

  // Obnovení uložené pozice a rychlosti (až po hydrataci).
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as { index?: number; charIndex?: number; rate?: number };
      if (typeof saved.index === "number" && saved.index >= 0) {
        const charIndex =
          typeof saved.charIndex === "number" && saved.charIndex >= 0 ? saved.charIndex : 0;
        setActive(saved.index);
        setActiveChar(charIndex);
        currentProgress.current = { index: saved.index, charIndex };
      }
      if (typeof saved.rate === "number" && SPEEDS.includes(saved.rate as 1)) {
        setSpeed(saved.rate);
      }
    } catch {
      // uložená pozice je poškozená
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const stopSpeech = () => {
    if (speaker.current) {
      saveProgress(
        currentProgress.current.index,
        currentProgress.current.charIndex,
        speed,
        true,
      );
    }
    speaker.current?.stop();
    speaker.current = null;
  };


  useEffect(
    () => () => {
      abort.current?.abort();
      stopSpeech();
    },
    [],
  );

  const startSpeech = (value: string) => {
    stopSpeech();
    if (!value.trim()) return;
    setPosition(0);
    setPlaying(true);
    const handle = speak(value, { rate: speed, muted });
    speaker.current = handle;
    handle.done
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Hlas se nepodařilo získat.");
      })
      .finally(() => {
        if (speaker.current === handle) {
          speaker.current = null;
          setPlaying(false);
        }
      });
  };

  /** Plynulé čtení celé knihy od zvolené věty, se sledováním textu. */
  const startBook = (from: number, fromChar = 0) => {
    if (!segments?.length) return;
    stopSpeech();
    const startIndex = Math.max(0, Math.min(from, segments.length - 1));
    setError(null);
    setActive(startIndex);
    setActiveChar(fromChar);
    currentProgress.current = { index: startIndex, charIndex: fromChar };
    setPosition(0);
    setPlaying(true);
    const handle = speakBookPrecisely(segments, {
      rate: speed,
      muted,
      startSegment: startIndex,
      startChar: fromChar,
      onSegment: (i) => {
        setActive(i);
        setActiveChar(0);
        currentProgress.current = { index: i, charIndex: 0 };
        callbacks.current.onSegment?.(i);
      },
      onWord: ({ segmentIndex, charIndex }) => {
        setActive(segmentIndex);
        setActiveChar(charIndex);
        currentProgress.current = { index: segmentIndex, charIndex };
        saveProgress(segmentIndex, charIndex);
      },
    });
    if (!handle) {
      const fallback = speak("", {
        rate: speed,
        muted,
        segments,
        startIndex,
        onSegment: (i) => {
          setActive(i);
          setActiveChar(0);
          currentProgress.current = { index: i, charIndex: 0 };
          saveProgress(i, 0);
        },
      });
      speaker.current = fallback;
      fallback.done.finally(() => {
        if (speaker.current === fallback) {
          speaker.current = null;
          setPlaying(false);
        }
      });
      return;
    }
    speaker.current = handle;
    handle.done
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Hlas se nepodařilo získat.");
      })
      .finally(() => {
        if (speaker.current === handle) {
          speaker.current = null;
          setPlaying(false);
          // Přirozený konec — uživatel nezastavil.
          console.log("[tts] oddíl dočten, navazuji:", Boolean(callbacks.current.onFinished));
          callbacks.current.onFinished?.();
        }
      });
  };

  // Navázání dalšího oddílu: čtení začne hned po zobrazení.
  useEffect(() => {
    if (autoStart && audioMode) {
      const el = audioEl.current;
      if (el) {
        el.playbackRate = speed;
        el.muted = muted;
        el.volume = volume;
        void el.play().catch(() => {
          setError("Zvuk se nepodařilo spustit. Zkuste to znovu.");
          setPlaying(false);
        });
      }
      return;
    }
    if (autoStart && segments?.length) {
      console.log("[tts] automatický start dalšího oddílu");
      try {
        window.speechSynthesis?.cancel();
      } catch {
        // nic
      }
      startBook(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Text pouze klidně následuje hlas a posune se až blízko okraje.
  useEffect(() => {
    if (active === null) return;
    if (Date.now() < manualScrollUntil.current) return;
    const box = scrollBox.current;
    const line = activeLine.current;
    if (!box || !line) return;
    const top = line.offsetTop - box.offsetTop;
    const center = top + line.offsetHeight / 2 - box.clientHeight / 2;
    const relative = top + line.offsetHeight / 2 - box.scrollTop;
    const inComfortZone =
      relative > box.clientHeight * 0.16 && relative < box.clientHeight * 0.84;
    if (inComfortZone) return;
    autoScrolling.current = Date.now() + 1200;
    box.scrollTo({
      top: Math.max(0, Math.min(center, box.scrollHeight - box.clientHeight)),
      behavior: "smooth",
    });
  }, [active, activeChar]);


  const run = (q: string, mode: "ask" | "narrate") => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setLoading(true);
    setError(null);
    setText("");
    return askAi({
      question: q,
      context,
      mode,
      signal: controller.signal,
      onText: setText,
    })
      .then((full) => {
        if (!controller.signal.aborted) startSpeech(full);
        return full;
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return "";
        setError(e instanceof Error ? e.message : "Odpověď se nepodařilo získat.");
        setPlaying(false);
        return "";
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  };

  // Dotaz z již existujících klikacích položek na stránce.
  useEffect(() => {
    if (!question) return;
    setPosition(0);
    stopSpeech();
    setPlaying(false);
    const stored = presetAnswers?.[question];
    if (stored) {
      // Okamžitá odpověď z uložených dat, bez dotazu přes API.
      abort.current?.abort();
      setLoading(false);
      setError(null);
      setText(stored);
      startSpeech(stored);
      return;
    }
    void run(`${question} — vysvětli tuto vazbu postavy ${title} v eposu.`, "ask");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const togglePlay = () => {
    void primeAudioPlayback();
    if (audioMode) {
      const el = audioEl.current;
      if (!el) return;
      if (playing) {
        el.pause();
        saveAudioTime(el.currentTime, true);
        setPlaying(false);
      } else {
        stopAt.current = null;
        el.playbackRate = speed;
        el.muted = muted;
        el.volume = volume;
        setPlaying(true);
        void el.play().catch(() => {
          setError("Zvuk se nepodařilo spustit. Zkuste to znovu.");
          setPlaying(false);
        });
      }
      return;
    }
    if (playing || speaker.current) {
      stopSpeech();
      setPlaying(false);
      return;
    }
    if (segments?.length && !question) {
      startBook(active ?? 0, activeChar);
      return;
    }
    if (text) {
      startSpeech(text);
      return;
    }

    if (presetText?.trim()) {
      // Uložené předčítání se přehraje okamžitě.
      setError(null);
      setText(presetText);
      startSpeech(presetText);
      return;
    }
    if (loading) return;
    setPlaying(true);
    void run(title, "narrate");
  };

  // Ovládání ze zamčené obrazovky (Media Session).
  const navRef = useRef({ onPrev, onNext });
  navRef.current = { onPrev, onNext };
  const mediaRef = useRef({ togglePlay, startBook, stopSpeech, playing, active });
  mediaRef.current = { togglePlay, startBook, stopSpeech, playing, active };
  useEffect(() => {
    if (!playing) return;
    const m = () => mediaRef.current;
    const jump = (delta: number) => {
      if (!segments?.length) return;
      m().startBook(Math.max(0, (m().active ?? 0) + delta), 0);
    };
    setMediaSession(title, subtitle ?? "Mahábhárata", {
      play: () => {
        if (!m().playing) m().togglePlay();
      },
      pause: () => {
        if (m().playing) m().togglePlay();
      },
      stop: () => {
        m().stopSpeech();
        setPlaying(false);
      },
      ...(segments?.length
        ? {
            previoustrack: () => (navRef.current.onPrev ? navRef.current.onPrev() : jump(-1)),
            nexttrack: () => (navRef.current.onNext ? navRef.current.onNext() : jump(1)),
          }
        : {}),
    });
  }, [playing, title, subtitle, segments]);



  // Průběh se řídí skutečným přehráváním.
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      const handle = speaker.current;
      if (!handle) return;
      const elapsed = handle.elapsedSeconds();
      const scheduled = handle.scheduledSeconds();
      setDuration(Math.max(scheduled, elapsed, 1));
      setPosition(Math.min(elapsed, Math.max(scheduled, 1)));
    }, 250);
    return () => clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (audioEl.current) audioEl.current.playbackRate = speed;
    speaker.current?.setRate(speed);
    if (!audioMode) saveProgress(active, activeChar, speed, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  // U nahrávky se text sleduje odhadem podle času (MP3 nemá značky slov).
  useEffect(() => {
    if (!audioMode || !playing) return;
    const total = segments?.length ?? 0;
    if (!total) return;
    const ratio = duration > 0 ? Math.min(1, position / duration) : 0;
    const idx = Math.min(total - 1, Math.floor(ratio * total));
    if (idx !== approxActive.current) {
      approxActive.current = idx;
      setActive(idx);
    }
  }, [audioMode, playing, position, duration, segments]);

  useEffect(() => {
    if (audioEl.current) {
      audioEl.current.muted = muted;
      audioEl.current.volume = volume;
    }
    speaker.current?.setMuted(muted);
  }, [muted, volume]);

  useEffect(() => {
    const resumeWhenVisible = () => {
      if (document.visibilityState === "visible" && speaker.current) resumeAudioPlayback();
    };
    document.addEventListener("visibilitychange", resumeWhenVisible);
    return () => document.removeEventListener("visibilitychange", resumeWhenVisible);
  }, []);

  /** Hlasitost nahrané nahrávky se nastavuje tažením proužku. */
  const applyVolumeFromPointer = (e: ReactPointerEvent) => {
    const box = volumeBox.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(ratio);
    if (muted) setMuted(false);
  };

  const percent = (position / Math.max(duration, 1)) * 100;

  /** Ruční posun textu na chvíli zastaví automatické sledování. */
  const pauseAutoScroll = () => {
    if (Date.now() < autoScrolling.current) return;
    manualScrollUntil.current = Date.now() + 6000;
  };

  // Věty seskupené do odstavců, aby se zvýrazňoval celý čtený odstavec.
  const paragraphs = useMemo(() => {
    const list = segments ?? [];
    const groups: {
      from: number;
      to: number;
      items: { index: number; text: string; tokens: TextToken[] }[];
    }[] = [];
    list.forEach((sentence, index) => {
      const para = paragraphIndex?.[index] ?? index;
      const last = groups[groups.length - 1];
      if (last && (paragraphIndex?.[last.from] ?? last.from) === para) {
        last.to = index;
        last.items.push({ index, text: sentence, tokens: tokenize(sentence) });
      } else {
        groups.push({
          from: index,
          to: index,
          items: [{ index, text: sentence, tokens: tokenize(sentence) }],
        });
      }
    });
    return groups;
  }, [segments, paragraphIndex]);

  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border border-border bg-surface-2/70 p-5 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary">
        <Headphones className="size-4" />
        Audiokniha
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-display text-lg text-foreground">{title}</p>
          {subtitle ? (
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          {minutes} min
        </span>
      </div>

      <div className="mt-5 flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pozastavit předčítání" : "Spustit předčítání"}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-[1px]" />}
        </button>

        <div className="min-w-0 flex-1">
          <Slider
            value={[position]}
            max={Math.max(duration, 1)}
            step={1}
            {...(audioMode
              ? {
                  onValueChange: (values: number[]) => {
                    const time = values[0] ?? 0;
                    if (audioEl.current) audioEl.current.currentTime = time;
                    setPosition(time);
                  },
                }
              : {})}
            aria-disabled={audioMode ? undefined : "true"}
            tabIndex={audioMode ? 0 : -1}
            className={audioMode ? undefined : "pointer-events-none"}
            aria-label="Průběh nahrávky"
          />
          <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-muted-foreground">
            <span>{formatTime(position)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-2">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs transition-colors",
                speed === s
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s}×
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const audio = audioEl.current;
              if (audio) {
                audio.pause();
                audio.currentTime = 0;
                pendingTime.current = null;
              }
              speaker.current?.stop();
              speaker.current = null;
              setPlaying(false);
              setPosition(0);
              if (segments?.length) setActive(0);
              setActiveChar(0);
              currentProgress.current = { index: segments?.length ? 0 : null, charIndex: 0 };
              if (storageKey) {
                savedAt.current = 0;
                try {
                  localStorage.removeItem(storageKey);
                } catch {
                  // paměť není dostupná
                }
              }
            }}
            aria-label="Zpět na začátek"
            className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Zapnout zvuk" : "Ztlumit zvuk"}
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          <span
            ref={volumeBox}
            onPointerDown={
              audioMode
                ? (e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    applyVolumeFromPointer(e);
                  }
                : undefined
            }
            onPointerMove={
              audioMode ? (e) => e.buttons === 1 && applyVolumeFromPointer(e) : undefined
            }
            className={cn(
              "h-1 w-20 overflow-hidden rounded-full bg-muted",
              audioMode && "cursor-pointer",
            )}
          >
            <span
              className={cn("block h-full bg-primary/70", muted ? "w-0" : audioMode ? "" : "w-2/3")}
              style={audioMode && !muted ? { width: `${Math.round(volume * 100)}%` } : undefined}
            />
          </span>
        </button>
      </div>

      <div
        className="mt-4 h-px w-full bg-primary/25"
        style={{ backgroundImage: `linear-gradient(to right, var(--gold) ${percent}%, transparent ${percent}%)` }}
      />
      {error ? (
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{error}</p>
      ) : segments?.length && !question ? (
        <div
          ref={scrollBox}
          onWheel={pauseAutoScroll}
          onTouchStart={pauseAutoScroll}
          onPointerDown={pauseAutoScroll}
          className="mt-3 h-64 space-y-2 overscroll-contain overflow-y-auto pr-1 text-[13px] leading-relaxed text-muted-foreground"
        >
          {paragraphs.map((group) => {
            const isActive =
              active !== null && active >= group.from && active <= group.to;
            return (
              <p
                key={group.from}
                className={cn(
                  "rounded-md px-1.5 py-0.5 transition-colors",
                  isActive ? "bg-primary/10" : "",
                )}
              >
                {group.items.map(({ index, tokens }) => (
                  <span
                    key={index}
                    className={cn(
                      "transition-colors",
                      index === active ? "text-foreground" : "hover:text-foreground",
                    )}
                  >
                    {tokens.map((token) => {
                      const isCurrentWord =
                        !audioMode &&
                        index === active &&
                        token.isWord &&
                        activeChar >= token.from &&
                        activeChar < token.to;
                      return (
                        <span
                          key={`${token.from}-${token.to}`}
                          ref={isCurrentWord ? activeLine : undefined}
                          onClick={token.isWord && !audioMode ? () => startBook(index, token.from) : undefined}
                          className={cn(
                            token.isWord && !audioMode ? "cursor-pointer" : "",
                            isCurrentWord
                              ? "rounded-sm bg-primary px-0.5 font-bold text-primary-foreground"
                              : "",
                          )}
                        >
                          {token.text}
                        </span>
                      );
                    })}{" "}
                  </span>
                ))}
              </p>
            );
          })}
        </div>
      ) : text ? (
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 text-[13px] leading-relaxed text-muted-foreground">
          {text
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
      ) : (
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          {loading ? "Načítám text…" : "Spusťte předčítání a text se doplní z eposu."}
        </p>
      )}

    </div>
  );
}
