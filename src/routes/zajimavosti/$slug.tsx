import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/components/Bits";
import { KaraokeText } from "@/components/KaraokeText";
import { AudioPlayer, type AudioPlayerHandle } from "@/components/AudioPlayer";
import { insightsQuery } from "@/lib/insights";

export const Route = createFileRoute("/zajimavosti/$slug")({
  head: () => ({
    meta: [
      { title: "Článek – Zajímavosti a pochopení" },
      { name: "description", content: "Vysvětlující článek k Mahábháratě z cyklu Zajímavosti a pochopení." },
      { property: "og:title", content: "Zajímavosti a pochopení – článek" },
      { property: "og:description", content: "Filozofické souvislosti Mahábháraty a pohled áčárjů." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InsightDetail,
});

function InsightDetail() {
  const { slug } = Route.useParams();
  const { data, isPending } = useQuery(insightsQuery());
  const insight = data?.find((i) => i.slug === slug);
  const player = useRef<AudioPlayerHandle | null>(null);
  const [time, setTime] = useState(0);
  return (
    <Page>
      <Link to="/zajimavosti" className="press inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Zajímavosti a pochopení
      </Link>
      {isPending ? <p role="status" className="mt-6 text-muted-foreground">Načítám článek…</p>
        : !insight ? <p className="mt-6 text-muted-foreground">Článek nebyl nalezen.</p>
        : (
          <article className="mx-auto mt-4 max-w-3xl rounded-2xl border border-amber-400/40 bg-surface/40 p-6 backdrop-blur-md sm:p-10">
            <h1 className="font-display text-3xl leading-tight sm:text-4xl"><span className="text-gilded">{insight.title}</span></h1>
            <p className="mt-3 text-muted-foreground">{insight.short_summary}</p>
            <div className="rule-gold mt-6 mb-6" />
            {insight.audio_url ? (
              <div className="mb-8">
                <AudioPlayer title={insight.title} subtitle="Zajímavosti a pochopení" audioUrl={insight.audio_url}
                  progressKey={`insight:${insight.slug}`} controlRef={player} onTime={setTime} />
                {insight.cues_url ? (
                  <div className="text-sand">
                    <KaraokeText cuesUrl={insight.cues_url} number={0} time={time} onSeek={(t) => player.current?.seek(t)} />
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="insight-prose text-[1.0625rem] leading-8"><ReactMarkdown>{insight.content}</ReactMarkdown></div>
          </article>
        )}
    </Page>
  );
}
