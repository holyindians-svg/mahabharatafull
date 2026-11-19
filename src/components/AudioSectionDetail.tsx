import { Maximize2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KaraokeText } from "@/components/KaraokeText";
import { OfflineDownloadButton } from "@/components/OfflineDownloadButton";
import { formatTime, sectionProgress, type SectionRange } from "@/lib/reader-time";

interface Props {
  bookId?: string;
  title: string;
  number: number;
  cuesUrl: string;
  time: number;
  range: SectionRange;
  onPlaySection: () => void;
  onSeek: (t: number) => void;
  onExpand: () => void;
}

export function AudioSectionDetail({ bookId, title, number, cuesUrl, time, range, onPlaySection, onSeek, onExpand }: Props) {
  const { elapsed, duration } = sectionProgress(time, range);
  return (
    <div className="rounded-xl border border-border bg-surface/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-base text-foreground">{title}</p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {formatTime(elapsed)} / {formatTime(duration)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onPlaySection} className="press min-h-11">
            <Play /> Přehrát oddíl
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onExpand}
            aria-label="Rozbalit čtečku" title="Rozbalit čtečku" className="press size-11">
            <Maximize2 />
          </Button>
        </div>
      </div>
      {bookId ? <OfflineDownloadButton bookId={bookId} className="mt-4" /> : null}
      <KaraokeText cuesUrl={cuesUrl} number={number} time={time} onSeek={onSeek} />
    </div>
  );
}
