import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Pause, Play, RotateCcw, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { KaraokeText } from "@/components/KaraokeText";
import type { AudioPlaybackState } from "@/components/AudioPlayer";
import { clampSectionTime, readerClock, sectionProgress, skipSectionTime, type SectionRange } from "@/lib/reader-time";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookName: string;
  title: string;
  number: number;
  cuesUrl: string;
  range: SectionRange;
  time: number;
  playback: AudioPlaybackState;
  onToggle: () => void;
  onSeek: (time: number) => void;
  onAfterClose: () => void;
}

export function ImmersiveReader({ open, onOpenChange, bookName, title, number, cuesUrl, range, time, playback, onToggle, onSeek, onAfterClose }: Props) {
  const { elapsed, duration } = sectionProgress(time, range);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:animate-none" />
        <Dialog.Content aria-describedby={undefined} onCloseAutoFocus={(event) => { event.preventDefault(); onAfterClose(); }}
          className="fixed inset-0 z-[101] flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2 motion-reduce:animate-none">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{bookName}</p>
              <Dialog.Title className="mt-1 break-words font-display text-base leading-snug sm:text-xl">{title}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" className="press min-h-11 shrink-0" aria-label="Zavřít čtečku"><X /> Zavřít</Button>
            </Dialog.Close>
          </header>

          <KaraokeText immersive cuesUrl={cuesUrl} number={number} time={time} onSeek={onSeek} />

          <footer className="shrink-0 border-t border-border bg-background px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-10">
            <div className="mx-auto max-w-3xl">
              {playback.error ? <p role="alert" className="mb-2 text-center text-sm text-destructive">{playback.error}</p> : null}
              <Slider aria-label="Průběh oddílu" min={0} max={Math.max(duration, 0.01)} step={0.1}
                value={[elapsed]} onValueChange={(values) => onSeek(clampSectionTime(range.startTime + (values[0] ?? 0), range))}
                className="min-h-11" />
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-14 text-xs tabular-nums text-muted-foreground sm:text-sm">{readerClock(elapsed)}</span>
                <div className="flex items-center gap-4 sm:gap-6">
                  <Button variant="ghost" size="icon" className="press size-11" title="Zpět o 15 sekund" aria-label="Zpět o 15 sekund"
                    onClick={() => onSeek(skipSectionTime(time, -15, range))}><span className="flex flex-col items-center"><RotateCcw /><span className="text-[10px] leading-3">15</span></span></Button>
                  <Button size="icon" className="press size-14 rounded-full [&_svg]:size-6" aria-label={playback.playing ? "Pozastavit audio" : "Přehrát audio"}
                    aria-busy={playback.buffering || undefined} onClick={onToggle}>
                    {playback.buffering ? <Loader2 className="animate-spin motion-reduce:animate-none" /> : playback.playing ? <Pause /> : <Play />}
                  </Button>
                  <Button variant="ghost" size="icon" className="press size-11" title="Vpřed o 15 sekund" aria-label="Vpřed o 15 sekund"
                    onClick={() => onSeek(skipSectionTime(time, 15, range))}><span className="flex flex-col items-center"><RotateCw /><span className="text-[10px] leading-3">15</span></span></Button>
                </div>
                <span className="min-w-14 text-right text-xs tabular-nums text-muted-foreground sm:text-sm">{readerClock(duration)}</span>
              </div>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}