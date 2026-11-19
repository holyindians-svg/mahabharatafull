import { HardDrive, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOfflineAudio } from "@/hooks/use-offline-audio";
import { clearAllOfflineAudio, removeOfflineAudio, totalOfflineMb } from "@/lib/offline-audio-store";
import { parvas } from "@/data/parvas";
import { cn } from "@/lib/utils";

const fmtMb = (mb: number) => `${mb.toLocaleString("cs-CZ", { maximumFractionDigits: 1 })} MB`;

export function OfflineStorageDialog({ className }: { className?: string }) {
  const state = useOfflineAudio();
  const items = Object.entries(state).filter(([, e]) => e.status === "downloaded" || e.status === "downloading");
  const total = totalOfflineMb(state);
  const nameOf = (id: string) => parvas.find((p) => p.slug === id)?.name ?? id;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Offline úložiště"
          title="Offline úložiště"
          className={cn(
            "press relative grid min-h-11 min-w-11 place-items-center rounded-full border border-border bg-background/40 text-muted-foreground backdrop-blur-md hover:border-primary/40 hover:text-primary",
            className,
          )}
        >
          <HardDrive className="size-5" />
          {items.length ? <span className="absolute right-2 top-2 size-2 rounded-full bg-success" /> : null}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Offline úložiště</DialogTitle>
          <DialogDescription>Stažené audioknihy zabírají celkem {fmtMb(total)}.</DialogDescription>
        </DialogHeader>
        {items.length ? (
          <ul className="space-y-2">
            {items.map(([id, e]) => (
              <li key={id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-foreground">{nameOf(id)}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.status === "downloading" ? `Stahuji ${e.progress} %` : fmtMb(e.sizeMb)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="press size-11" aria-label={`Smazat ${nameOf(id)}`}
                  onClick={() => void removeOfflineAudio(id)}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Zatím nemáte staženou žádnou audioknihu.</p>
        )}
        {items.length > 1 ? (
          <Button variant="outline" className="press min-h-11" onClick={() => void clearAllOfflineAudio()}>
            <Trash2 /> Smazat vše
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
