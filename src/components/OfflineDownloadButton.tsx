import { Check, CloudDownload, Loader2, AlertTriangle } from "lucide-react";
import { useOfflineAudio } from "@/hooks/use-offline-audio";
import { cancelOfflineDownload, downloadOfflineAudio, entryFor, hasOfflineSource, removeOfflineAudio } from "@/lib/offline-audio-store";
import { cn } from "@/lib/utils";
import type React from "react";

const fmtMb = (mb: number) => `${mb.toLocaleString("cs-CZ", { maximumFractionDigits: 0 })} MB`;

export function OfflineDownloadButton({ bookId, className, compact }: { bookId: string; className?: string; compact?: boolean }) {
  const state = useOfflineAudio();
  if (!hasOfflineSource(bookId)) return null;
  const e = state[bookId] ?? entryFor(bookId);

  const onClick = (ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (e.status === "downloading") {
      if (window.confirm("Zrušit stahování audioknihy?")) cancelOfflineDownload(bookId);
    } else if (e.status === "downloaded") {
      if (window.confirm(`Smazat staženou audioknihu a uvolnit ${fmtMb(e.sizeMb)}?`)) void removeOfflineAudio(bookId);
    } else {
      void downloadOfflineAudio(bookId);
    }
  };

  return (
    <div className={cn("space-y-1.5", compact && "shrink-0", className)}>
      <button
        type="button"
        onClick={onClick}
        aria-label={e.status === "downloaded" ? "Smazat staženou audioknihu" : "Stáhnout audioknihu offline"}
        className={cn(
          "press flex min-h-11 items-center justify-center gap-2 rounded-full border bg-background/40 px-4 text-sm backdrop-blur-md transition-colors",
          compact ? "px-3 text-xs" : "w-full",
          e.status === "downloaded"
            ? "border-success/50 text-success"
            : "border-primary/40 text-foreground hover:border-primary hover:text-primary",
        )}
      >
        {e.status === "downloading" ? (
          <>
            <Loader2 className="size-4 animate-spin text-primary" />
            {compact ? `${e.progress} %` : `Stahuji ${e.progress} %${e.sizeMb ? ` · ${fmtMb(e.sizeMb)}` : ""}`}
          </>
        ) : e.status === "downloaded" ? (
          <>
            <Check className="size-4" strokeWidth={3} /> {compact ? "Staženo" : `Staženo offline · ${fmtMb(e.sizeMb)}`}
          </>
        ) : (
          <>
            <CloudDownload className="size-4 text-primary" /> Stáhnout offline{e.sizeMb ? ` · ${fmtMb(e.sizeMb)}` : ""}
          </>
        )}
      </button>
      {e.status === "downloading" ? (
        <div className="h-1 overflow-hidden rounded-full bg-border">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${e.progress}%` }} />
        </div>
      ) : null}
      {e.status === "error" && e.error && !compact ? (
        <p role="alert" className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {e.error}
        </p>
      ) : null}
    </div>
  );
}
