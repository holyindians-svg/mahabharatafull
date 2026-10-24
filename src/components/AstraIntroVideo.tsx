import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation } from "@tanstack/react-router";
import { Volume2, X } from "lucide-react";

type Phase = "intro" | "shrinking" | "done";

/** Celoobrazovkový úvod se zvukem, který se po dohrání smrští do layoutu a pokračuje tichou smyčkou. */
export function AstraIntroVideo({ src, onSettle }: { src: string; onSettle?: () => void }) {
  const location = useLocation();
  const key = (location.state as { __TSR_key?: string } | undefined)?.__TSR_key ?? location.href;
  const storageKey = `intro-seen:${src}`;
  const holder = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [box, setBox] = useState<CSSProperties | null>(null);
  const [needsSound, setNeedsSound] = useState(false);

  const finish = (instant = false) => {
    try { sessionStorage.setItem(storageKey, key); } catch { /* ignore */ }
    const v = video.current;
    if (v) { v.muted = true; v.loop = true; void v.play().catch(() => {}); }
    setNeedsSound(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = holder.current?.getBoundingClientRect();
    if (instant || reduce || !r) { setPhase("done"); onSettle?.(); return; }
    setPhase("shrinking");
    requestAnimationFrame(() => setBox({ top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: 16 }));
    onSettle?.();
    window.setTimeout(() => setPhase("done"), 800);
  };

  useEffect(() => {
    let seen: string | null = null;
    try { seen = sessionStorage.getItem(storageKey); } catch { /* ignore */ }
    if (seen === key || new URLSearchParams(location.searchStr).has("zpet")) { finish(true); return; }
    const v = video.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => { v.muted = true; setNeedsSound(true); void v.play().catch(() => {}); });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") finish(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (phase !== "intro") document.body.style.overflow = ""; }, [phase]);

  const fixed = phase !== "done";
  const style: CSSProperties = fixed
    ? { position: "fixed", zIndex: 60, transition: "all 0.75s cubic-bezier(0.22,1,0.36,1)", ...(box ?? { top: 0, left: 0, width: "100vw", height: "100dvh", borderRadius: 0 }) }
    : {};

  return (
    <div ref={holder} className="relative aspect-video w-full">
      {phase === "intro" ? <div className="fixed inset-0 z-[59] bg-background" /> : null}
      <video
        ref={video}
        src={src}
        playsInline
        preload="auto"
        autoPlay
        muted={phase !== "intro"}
        loop={phase !== "intro"}
        onEnded={() => phase === "intro" && finish()}
        onClick={() => phase === "intro" && finish()}
        aria-hidden="true"
        style={style}
        className={`${fixed ? "bg-background object-contain" : "video-fade absolute inset-0 size-full object-cover"} ${phase === "shrinking" ? "object-cover" : ""}`}
      />
      {phase === "intro" ? (
        <div className="fixed bottom-6 right-6 z-[61] flex gap-2">
          {needsSound ? (
            <button type="button" onClick={() => { const v = video.current; if (v) { v.muted = false; void v.play(); } setNeedsSound(false); }}
              className="flex min-h-11 items-center gap-2 rounded-full border border-primary/40 bg-surface/70 px-4 text-sm text-foreground backdrop-blur-md">
              <Volume2 className="size-4 text-primary" /> Zapnout zvuk
            </button>
          ) : null}
          <button type="button" onClick={() => finish()}
            className="flex min-h-11 items-center gap-2 rounded-full border border-primary/40 bg-surface/70 px-4 text-sm text-foreground backdrop-blur-md">
            <X className="size-4 text-primary" /> Přeskočit
          </button>
        </div>
      ) : null}
    </div>
  );
}
