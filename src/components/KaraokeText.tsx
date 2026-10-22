import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { clockGet, clockSubscribe } from "@/lib/playback-clock";
import { activeCueIndex } from "@/lib/reader-time";
import { loadCues, type Cue } from "@/data/audiobooks";
import { cn } from "@/lib/utils";

interface Props {
  cuesUrl: string;
  number: number;
  time: number;
  immersive?: boolean;
  onSeek: (time: number) => void;
}

/** Both readers share the same timed source; only typography and framing differ. */
export function KaraokeText({ cuesUrl, number, time, immersive = false, onSeek }: Props) {
  const [cues, setCues] = useState<Cue[] | null>(null);
  const [failed, setFailed] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const manualUntil = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrollRetry, setScrollRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    setCues(null);
    setFailed(false);
    manualUntil.current = 0;
    if (box.current) box.current.scrollTop = 0;
    loadCues(cuesUrl).then((data) => {
      if (alive) setCues(data.get(number) ?? []);
    }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [cuesUrl, number]);

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const touch = () => {
    manualUntil.current = Date.now() + 4000;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setScrollRetry((value) => value + 1), 4050);
  };

  // Čas z každého snímku (rAF), pokud MP3 hraje; jinak čas z rodiče. Překreslí se jen při změně věty.
  const pick = useCallback(() => {
    if (!cues) return -1;
    const live = clockGet();
    const first = cues[0];
    const last = cues[cues.length - 1];
    const inSection = first && last && live >= first[0] - 30 && live <= last[1] + 30;
    return activeCueIndex(cues, live >= 0 && inSection ? live : time);
  }, [cues, time]);
  const active = useSyncExternalStore(clockSubscribe, pick, () => -1);

  useEffect(() => {
    if (active < 0 || Date.now() < manualUntil.current) return;
    const container = box.current;
    const sentence = container?.querySelector<HTMLElement>(`[data-cue="${active}"]`);
    if (!container || !sentence) return;
    const bounds = container.getBoundingClientRect();
    const rect = sentence.getBoundingClientRect();
    {
      container.scrollTo({
        top: container.scrollTop + rect.top - bounds.top - bounds.height / 2 + rect.height / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }
  }, [active, immersive, scrollRetry, cues]);

  const paragraphs: { cue: Cue; index: number }[][] = [];
  cues?.forEach((cue, index) => {
    if (cue[3] || !paragraphs.length) paragraphs.push([]);
    paragraphs[paragraphs.length - 1]?.push({ cue, index });
  });

  return (
    <div ref={box} onTouchStart={touch} onTouchMove={touch} onWheel={touch} onPointerDown={touch}
      onKeyDown={(event) => { if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(event.key)) touch(); }}
      tabIndex={0} aria-label="Text oddílu" data-karaoke-reader={immersive ? "fullscreen" : "inline"}
      className={cn("min-h-0 overflow-y-auto overscroll-contain focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        immersive ? "flex-1 px-6 sm:px-10" : "mt-4 max-h-[28rem] pr-1 text-[15px] leading-relaxed")}
    >
      <div className={cn(immersive ? "mx-auto max-w-3xl space-y-7 py-[40dvh] text-xl leading-9 sm:text-2xl sm:leading-10" : "space-y-3")}>
        {failed ? <p role="alert" className="text-muted-foreground">Text oddílu se nepodařilo načíst.</p>
          : !cues ? <p role="status" className="text-muted-foreground">Načítám text…</p>
          : !cues.length ? <p className="text-muted-foreground">Text oddílu není dostupný.</p>
          : paragraphs.map((paragraph, index) => <p key={index}>
            {paragraph.map(({ cue, index: cueIndex }) => (
              <span key={cueIndex} role="button" tabIndex={0} data-cue={cueIndex}
                aria-current={cueIndex === active ? "true" : undefined}
                onClick={() => onSeek(cue[0])}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSeek(cue[0]); } }}
                className={cn("cursor-pointer rounded px-0.5 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  cueIndex === active ? "bg-primary/20 font-semibold text-foreground" : "text-muted-foreground hover:text-foreground")}
              >{cue[2]}{" "}</span>
            ))}
          </p>)}
      </div>
    </div>
  );
}