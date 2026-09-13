import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { askAi } from "@/lib/ask-ai";
import { speak, type SpeakHandle } from "@/lib/speak";

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
}



const SPEEDS = [1, 1.25, 1.5] as const;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
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
}: AudioPlayerProps) {
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
  const abort = useRef<AbortController | null>(null);
  const speaker = useRef<SpeakHandle | null>(null);
  const scrollBox = useRef<HTMLDivElement | null>(null);
  const activeLine = useRef<HTMLElement | null>(null);
  const manualScrollUntil = useRef(0);
  const autoScrolling = useRef(0);
  const savedAt = useRef(0);
  const storageKey = progressKey ? `mahabharata:progress:${progressKey}` : null;

  /** Uloží pozici v knize do paměti zařízení. */
  const saveProgress = (index: number | null, rate = speed, force = false) => {
    if (!storageKey || index === null) return;
    const now = Date.now();
    if (!force && now - savedAt.current < 2000) return;
    savedAt.current = now;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ index, rate }));
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
      const saved = JSON.parse(raw) as { index?: number; rate?: number };
      if (typeof saved.index === "number" && saved.index >= 0) setActive(saved.index);
      if (typeof saved.rate === "number" && SPEEDS.includes(saved.rate as 1)) {
        setSpeed(saved.rate);
      }
    } catch {
      // uložená pozice je poškozená
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const stopSpeech = () => {
    if (speaker.current) saveProgress(active, speed, true);
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
  const startBook = (from: number) => {
    if (!segments?.length) return;
    stopSpeech();
    const startIndex = Math.max(0, Math.min(from, segments.length - 1));
    setError(null);
    setActive(startIndex);
    setPosition(0);
    setPlaying(true);
    const handle = speak("", {
      rate: speed,
      muted,
      segments,
      startIndex,
      onSegment: (i) => {
        // Zvýraznění jde vždy jen dopředu, nikdy neskočí zpět.
        setActive((prev) => (prev === null || i > prev ? i : prev));
        saveProgress(i);
      },
    });
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

  // Čtená pasáž se posune jen tehdy, když se blíží k okraji viditelné plochy.
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
      relative > box.clientHeight * 0.25 && relative < box.clientHeight * 0.75;
    if (inComfortZone) return;
    autoScrolling.current = Date.now() + 900;
    box.scrollTo({
      top: Math.max(0, Math.min(center, box.scrollHeight - box.clientHeight)),
      behavior: "smooth",
    });
  }, [active]);


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
    if (playing || speaker.current) {
      stopSpeech();
      setPlaying(false);
      return;
    }
    if (segments?.length && !question) {
      startBook(active ?? 0);
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
    speaker.current?.setRate(speed);
    saveProgress(active, speed, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  useEffect(() => {
    speaker.current?.setMuted(muted);
  }, [muted]);

  const percent = (position / Math.max(duration, 1)) * 100;

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
            onValueChange={(v) => setPosition(v[0] ?? 0)}
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
              speaker.current?.stop();
              speaker.current = null;
              setPlaying(false);
              setPosition(0);
              if (segments?.length) setActive(0);
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
          <span className="h-1 w-20 overflow-hidden rounded-full bg-muted">
            <span
              className={cn("block h-full bg-primary/70", muted ? "w-0" : "w-2/3")}
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
          className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1 text-[13px] leading-relaxed text-muted-foreground"
        >
          {paragraphs.map((group) => {
            const isActive =
              active !== null && active >= group.from && active <= group.to;
            return (
              <p
                key={group.from}
                ref={isActive ? activeLine : undefined}
                className={cn(
                  "rounded-md px-1.5 py-0.5 transition-colors",
                  isActive ? "bg-primary/10" : "",
                )}
              >
                {group.items.map(({ index, text: sentence }) => (
                  <span
                    key={index}
                    onClick={() => startBook(index)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      index === active ? "text-foreground" : "hover:text-foreground",
                    )}
                  >
                    {sentence}{" "}
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
