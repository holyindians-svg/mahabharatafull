import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation } from "@tanstack/react-router";
import { Volume2, X } from "lucide-react";

type Phase = "intro" | "shrinking" | "done";
const FADE = 2.8;

type Props = {
  src: string;
  /** Voláno jednou na začátku doznívání zvuku videa (nebo při přeskočení). */
  onCrossfade?: () => void;
  onSettle?: (autoplay: boolean) => void;
};

/** Celoobrazovkový úvod: zvuk doznívá do vyprávění, video se pak GPU transformací smrští do layoutu. */
export function AstraIntroVideo({ src, onCrossfade, onSettle }: Props) {
  const location = useLocation();
  const key = (location.state as { __TSR_key?: string } | undefined)?.__TSR_key ?? location.href;
  const storageKey = `intro-seen:${src}`;
  const holder = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const crossed = useRef(false);
  const finished = useRef(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [needsSound, setNeedsSound] = useState(false);

  const measure = () => {
    const r = holder.current?.getBoundingClientRect();
    if (r && r.width) setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  };

  const crossfade = () => {
    if (crossed.current) return;
    crossed.current = true;
    onCrossfade?.();
  };

  const finish = (instant = false) => {
    if (finished.current) return;
    finished.current = true;
    try { sessionStorage.setItem(storageKey, key); } catch { /* ignore */ }
    const v = video.current;
    if (!instant) crossfade();
    const settleVideo = () => { if (v) { v.muted = true; v.volume = 1; v.loop = true; void v.play().catch(() => {}); } };
    if (v && !v.ended && !v.muted && !instant) {
      // rychlé ztlumení při přeskočení
      const from = v.volume; const t0 = performance.now();
      const step = () => { const k = Math.min(1, (performance.now() - t0) / 400); v.volume = from * (1 - k); if (k < 1) requestAnimationFrame(step); else settleVideo(); };
      requestAnimationFrame(step);
    } else settleVideo();
    setNeedsSound(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (instant || reduce) { setPhase("done"); onSettle?.(!instant); return; }
    measure();
    setPhase("shrinking");
    onSettle?.(true);
    window.setTimeout(() => setPhase("done"), 850);
  };

  useLayoutEffect(() => { measure(); }, []);

  useEffect(() => {
    let seen: string | null = null;
    try { seen = sessionStorage.getItem(storageKey); } catch { /* ignore */ }
    if (seen === key || new URLSearchParams(location.searchStr).has("zpet")) { crossed.current = true; finish(true); return; }
    const v = video.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => { v.muted = true; setNeedsSound(true); void v.play().catch(() => {}); });
    let raf = 0;
    const tick = () => {
      if (!finished.current && v.duration && v.currentTime >= v.duration - FADE) {
        crossfade();
        v.volume = Math.max(0, Math.min(1, (v.duration - v.currentTime) / FADE));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") finish(); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Zámek rolování jen během fáze úvodu (bez blokování gest); cleanup ho uvolní při smrštění i odchodu.
  useEffect(() => {
    if (phase !== "intro") return;
    const b = document.body.style, h = document.documentElement.style;
    const prevB = b.overflow, prevH = h.overflow;
    b.overflow = "hidden"; h.overflow = "hidden";
    const v = video.current;
    const ms = v && v.duration && isFinite(v.duration) ? (v.duration + 2) * 1000 : 12000;
    const t = window.setTimeout(() => finish(), ms);
    const onMeta = () => { window.clearTimeout(t); };
    v?.addEventListener("loadedmetadata", onMeta, { once: true });
    const t2 = window.setTimeout(() => { const d = video.current?.duration; if (!finished.current && d && isFinite(d) && (video.current?.currentTime ?? 0) < 0.1) finish(); }, 8000);
    return () => {
      window.clearTimeout(t); window.clearTimeout(t2);
      v?.removeEventListener("loadedmetadata", onMeta);
      b.overflow = prevB === "hidden" ? "" : prevB;
      h.overflow = prevH === "hidden" ? "" : prevH;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Záložní ukončení podle skutečné délky videa.
  useEffect(() => {
    const v = video.current;
    if (!v || phase !== "intro") return;
    let t = 0;
    const arm = () => { window.clearTimeout(t); t = window.setTimeout(() => finish(), (v.duration + 2) * 1000); };
    if (v.duration && isFinite(v.duration)) arm(); else v.addEventListener("loadedmetadata", arm, { once: true });
    return () => { window.clearTimeout(t); v.removeEventListener("loadedmetadata", arm); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const fixed = phase !== "done" && rect;
  let style: CSSProperties = {};
  if (fixed) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const s = Math.min(vw / rect.width, vh / rect.height);
    const tx = (vw - rect.width * s) / 2 - rect.left;
    const ty = (vh - rect.height * s) / 2 - rect.top;
    const full = phase === "intro";
    style = {
      position: "fixed", zIndex: 60, top: rect.top, left: rect.left, width: rect.width, height: rect.height,
      transformOrigin: "0 0", willChange: "transform",
      transform: full ? `translate3d(${tx}px,${ty}px,0) scale(${s})` : "translate3d(0,0,0) scale(1)",
      clipPath: full ? "inset(0 round 0px)" : "inset(0 round 16px)",
      transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1), clip-path 0.8s cubic-bezier(0.22,1,0.36,1)",
    };
  }

  return (
    <div ref={holder} className="relative aspect-video w-full">
      {phase !== "done" ? (
        <div className={`fixed inset-0 z-[59] bg-background transition-opacity duration-700 ${phase === "intro" ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      ) : null}
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
        className={fixed ? "object-cover" : "video-fade absolute inset-0 size-full object-cover"}
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
