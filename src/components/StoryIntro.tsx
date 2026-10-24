import { useRef, useState } from "react";
import { AstraIntroVideo } from "@/components/AstraIntroVideo";
import { KaraokeText } from "@/components/KaraokeText";
import { AudioPlayer, type AudioPlayerHandle } from "@/components/AudioPlayer";

type Props = {
  id: string;
  name: string;
  video: string;
  storyTitle?: string | undefined;
  story?: string[] | undefined;
  audioUrl?: string | undefined;
  cuesUrl?: string | undefined;
  minutes: number;
};

/** Sdílený video úvod + vyprávění s karaoke (zbraně i postavy). */
export function StoryIntro({ id, name, video, storyTitle, story, audioUrl, cuesUrl, minutes }: Props) {
  const [settled, setSettledState] = useState(false);
  const player = useRef<AudioPlayerHandle | null>(null);
  const [time, setTime] = useState(0);
  const narrated = useRef(false);
  const startNarration = () => {
    if (!audioUrl || narrated.current) return;
    narrated.current = true;
    setSettledState(true);
    player.current?.playRange(0);
  };
  const onSettle = (autoplay: boolean) => {
    setSettledState(true);
    if (autoplay) startNarration();
  };

  return (
    <section className="mb-10 grid items-center gap-6 lg:grid-cols-2" aria-labelledby={`story-${id}`}>
      <AstraIntroVideo src={video} onCrossfade={startNarration} onSettle={onSettle} />
      <div aria-hidden={!settled} className={`rounded-2xl border border-primary/30 bg-surface/40 p-6 shadow-lg backdrop-blur-md transition-opacity duration-700 ${settled ? "opacity-100" : "opacity-0"}`}>
        <h2 id={`story-${id}`} className="font-display text-2xl"><span className="text-gilded">{storyTitle}</span></h2>
        <div className="rule-gold mt-3 mb-4" />
        {audioUrl && cuesUrl ? (
          <>
            <div className="text-sand">
              <KaraokeText cuesUrl={cuesUrl} number={1} time={time} onSeek={(t) => player.current?.seek(t)} />
            </div>
            <AudioPlayer
              className="mt-4"
              title={storyTitle ?? name}
              subtitle="Vyprávění"
              minutes={minutes}
              audioUrl={audioUrl}
              progressKey={`story:${id}`}
              controlRef={player}
              onTime={setTime}
            />
          </>
        ) : (
          <div className="space-y-4 text-[15px] leading-relaxed text-sand">
            {story?.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
      </div>
    </section>
  );
}
