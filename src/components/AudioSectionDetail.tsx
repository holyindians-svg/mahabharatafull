import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { loadCues, type Cue } from "@/data/audiobooks";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  number: number;
  cuesUrl: string;
  time: number;
  onPlaySection: () => void;
  onSeek: (t: number) => void;
}

/** Text oddílu po titulcích se zvýrazněním podle času nahrávky (karaoke). */
export function AudioSectionDetail({ title, number, cuesUrl, time, onPlaySection, onSeek }: Props) {
  const [cues, setCues] = useState<Cue[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setCues(null);
    loadCues(cuesUrl)
      .then((m) => alive && setCues(m.get(number) ?? []))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [cuesUrl, number]);

  let active = -1;
  if (cues?.length) {
    let lo = 0;
    let hi = cues.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (cues[mid]![0] <= time) {
        active = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    if (active >= 0 && time > cues[active]![1] + 2 && active === cues.length - 1) active = -1;
  }

  const box = useRef<HTMLDivElement | null>(null);
  const lastTouch = useRef(0);
  const touch = () => {
    lastTouch.current = Date.now();
  };
  useEffect(() => {
    if (active < 0 || Date.now() - lastTouch.current < 4000) return;
    const b = box.current;
    const el = b?.querySelector<HTMLElement>(`[data-cue="${active}"]`);
    if (!b || !el) return;
    const br = b.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.top < br.top + 24 || r.bottom > br.bottom - 24) {
      b.scrollTo({ top: b.scrollTop + (r.top - br.top) - br.height / 3, behavior: "smooth" });
    }
  }, [active]);

  const paras: { cue: Cue; i: number }[][] = [];
  cues?.forEach((cue, i) => {
    if (cue[3] || !paras.length) paras.push([]);
    paras[paras.length - 1]!.push({ cue, i });
  });

  return (
    <div className="rounded-xl border border-border bg-surface/70 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-base text-foreground">{title}</p>
        <button
          type="button"
          onClick={onPlaySection}
          className="press inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/60 bg-primary/15 px-3 text-sm text-primary"
        >
          <Play className="size-4" /> Přehrát oddíl
        </button>
      </div>
      <div
        ref={box}
        onTouchStart={touch}
        onTouchMove={touch}
        onWheel={touch}
        onPointerDown={touch}
        className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto overscroll-contain pr-1 text-[15px] leading-relaxed"
      >
        {failed ? (
          <p className="text-sm text-muted-foreground">Text oddílu se nepodařilo načíst.</p>
        ) : !cues ? (
          <p className="text-sm text-muted-foreground">Načítám text…</p>
        ) : (
          paras.map((p, k) => (
            <p key={k}>
              {p.map(({ cue, i }) => (
                <span
                  key={i}
                  data-cue={i}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSeek(cue[0])}
                  onKeyDown={(e) => e.key === "Enter" && onSeek(cue[0])}
                  className={cn(
                    "cursor-pointer rounded px-0.5 transition-colors",
                    i === active
                      ? "bg-primary/20 font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cue[2]}{" "}
                </span>
              ))}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
