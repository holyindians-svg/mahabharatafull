import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { formatTime, sectionProgress, type SectionRange } from "@/lib/reader-time";

interface Props {
  audioUrl: string;
  range: SectionRange;
  /** Čas, od kterého má přehrávání po otevření rovnou začít. */
  startAt: number;
}

/** Úzký přehrávač oddílu ve čtečce; jeden audio prvek, zastaví se při odpojení. */
export function ReaderAudioBar({ audioUrl, range, startAt }: Props) {
  const ref = useRef<HTMLAudioElement>(null);
  const [time, setTime] = useState(startAt);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    window.speechSynthesis?.cancel();
    a.currentTime = startAt;
    setTime(startAt);
    a.play().catch(() => setWaiting(false)); // zablokováno → připraveno na Play
    return () => a.pause();
  }, [startAt]);

  const { duration, elapsed } = sectionProgress(time, range);
  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) { window.speechSynthesis?.cancel(); a.play().catch(() => setWaiting(false)); }
    else a.pause();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[105] border-t border-primary/30 bg-background/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
      <audio ref={ref} src={audioUrl} preload="auto"
        onTimeUpdate={(e) => { const t = e.currentTarget.currentTime; setTime(t); if (t >= range.endTime) e.currentTarget.pause(); }}
        onPlay={() => setPlaying(true)} onPause={() => { setPlaying(false); setWaiting(false); }}
        onWaiting={() => setWaiting(true)} onPlaying={() => setWaiting(false)} onCanPlay={() => setWaiting(false)} />
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <button type="button" onClick={toggle} aria-label={playing ? "Pozastavit" : "Přehrát"}
          className="press grid size-11 shrink-0 place-items-center rounded-full border border-primary/60 bg-primary/15 text-primary">
          {waiting && playing ? <Loader2 className="size-5 animate-spin" /> : playing ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>
        <input type="range" min={0} max={duration || 1} step={1} value={elapsed} aria-label="Pozice v oddílu"
          onChange={(e) => { const a = ref.current; if (a) a.currentTime = range.startTime + Number(e.target.value); }}
          className="h-11 min-w-0 flex-1 accent-primary" />
        <span className="shrink-0 font-display text-xs tabular-nums text-muted-foreground">
          {formatTime(elapsed)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
