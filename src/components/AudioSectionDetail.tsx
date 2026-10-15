import { Maximize2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KaraokeText } from "@/components/KaraokeText";

interface Props {
  title: string;
  number: number;
  cuesUrl: string;
  time: number;
  onPlaySection: () => void;
  onSeek: (t: number) => void;
  onExpand: () => void;
}

export function AudioSectionDetail({ title, number, cuesUrl, time, onPlaySection, onSeek, onExpand }: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 font-display text-base text-foreground">{title}</p>
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
      <KaraokeText cuesUrl={cuesUrl} number={number} time={time} onSeek={onSeek} />
    </div>
  );
}
