import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Headphones, Sparkles } from "lucide-react";
import { Page, PageHeader } from "@/components/Bits";
import { insightsQuery } from "@/lib/insights";

export const Route = createFileRoute("/zajimavosti/")({
  head: () => ({
    meta: [
      { title: "Zajímavosti a pochopení – Mahábhárata" },
      { name: "description", content: "Vysvětlující články k Mahábháratě: filozofické souvislosti, rozdíly mezi spisy a pohled áčárjů." },
      { property: "og:title", content: "Zajímavosti a pochopení" },
      { property: "og:description", content: "Filozofické souvislosti a rozdíly mezi spisy pro hlubší čtení Mahábháraty." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InsightsList,
});

function InsightsList() {
  const { data, isPending, isError } = useQuery(insightsQuery());
  return (
    <Page>
      <PageHeader eyebrow="Vyākhyā" title="Zajímavosti a pochopení" sanskrit="Souvislosti"
        description="Krátké články, které vysvětlují filozofické souvislosti a zdánlivé rozpory mezi spisy." />
      {isPending ? <p role="status" className="text-muted-foreground">Načítám články…</p>
        : isError ? <p role="alert" className="text-muted-foreground">Články se teď nepodařilo načíst. Zkuste to po připojení k internetu.</p>
        : (
          <div className="grid gap-5 md:grid-cols-2">
            {data.map((i) => (
              <Link key={i.slug} to="/zajimavosti/$slug" params={{ slug: i.slug }}
                className="press group rounded-2xl border border-amber-400/40 bg-surface/40 p-6 backdrop-blur-md transition-colors hover:border-amber-400">
                <div className="flex items-center justify-between">
                  <Sparkles className="size-5 text-primary" />
                  {i.audio_url ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 px-2 py-0.5 text-xs text-primary">
                      <Headphones className="size-3.5" aria-hidden /> Audio
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 font-display text-xl leading-snug text-foreground group-hover:text-primary">{i.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.short_summary}</p>
              </Link>
            ))}
          </div>
        )}
    </Page>
  );
}
