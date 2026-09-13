import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { askAi } from "@/lib/ask-ai";

interface AudioPlayerProps {
  title: string;
  subtitle?: string;
  /** Délka nahrávky v minutách (mock). */
  minutes: number;
  className?: string;
  /** Kontext položky (postava / kniha / zbraň) pro dotaz do textu. */
  context?: string;
  /** Dotaz odeslaný do textu po kliknutí na již existující položku na stránce. */
  question?: string | null;
}

const SPEEDS = [1, 1.25, 1.5] as const;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Přehrávač předčítání: po spuštění načte skutečný text k dané položce
 * z textu Mahábháraty a průběh se řídí podle jeho délky.
 */
export function AudioPlayer({
  title,
  subtitle,
  minutes,
  className,
  context,
  question,
}: AudioPlayerProps) {
  const duration = Math.max(60, Math.round(minutes * 60));
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  const run = (q: string, mode: "ask" | "narrate") => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setLoading(true);
    setError(null);
    setText("");
    askAi({
      question: q,
      context,
      mode,
      signal: controller.signal,
      onText: setText,
    })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Odpověď se nepodařilo získat.");
        setPlaying(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  };

  // Dotaz z již existujících klikacích položek na stránce.
  useEffect(() => {
    if (!question) return;
    setPosition(0);
    setPlaying(false);
    run(question, "ask");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const togglePlay = () => {
    const next = !playing;
    setPlaying(next);
    if (next && !text && !loading) run(title, "narrate");
  };

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setPosition((prev) => {
        const next = prev + speed;
        if (next >= duration) {
          setPlaying(false);
          return duration;
        }
        return next;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, speed, duration]);

  const percent = (position / duration) * 100;

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
            max={duration}
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
              setPosition(0);
              setPlaying(false);
            }}
            aria-label="Zpět na začátek"
            className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Volume2 className="size-4" />
          <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 bg-primary/70" />
          </div>
        </div>
      </div>

      <div
        className="mt-4 h-px w-full bg-primary/25"
        style={{ backgroundImage: `linear-gradient(to right, var(--gold) ${percent}%, transparent ${percent}%)` }}
      />
      {error ? (
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{error}</p>
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
