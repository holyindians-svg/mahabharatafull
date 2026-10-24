import { createFileRoute, notFound } from "@tanstack/react-router";
import { StoryIntro } from "@/components/StoryIntro";
import { Sparkles } from "lucide-react";
import { astras, getAstra } from "@/data/astras";
import { characters } from "@/data/characters";
import { AudioPlayer } from "@/components/AudioPlayer";
import { narrationFor } from "@/data/narrations";

import { EntityCard } from "@/components/EntityCard";
import { BackLink, Chip, Page, Section } from "@/components/Bits";
import { Occurrences } from "@/components/Occurrences";

export const Route = createFileRoute("/astry/$slug")({
  loader: ({ params }) => {
    const astra = getAstra(params.slug);
    if (!astra) throw notFound();
    return { astra };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.astra;
    return {
      meta: a
        ? [
            { title: `${a.name} (${a.sanskrit}) – zbraň Mahábháraty` },
            { name: "description", content: a.effect.slice(0, 155) },
            { property: "og:title", content: `${a.name} – ${a.kind}` },
            { property: "og:description", content: a.effect.slice(0, 155) },
            { property: "og:type", content: "article" },
            { name: "twitter:card", content: "summary_large_image" },
          ]
        : [{ title: "Zbraň Mahábháraty" }],
    };
  },
  component: AstraDetail,
});

function AstraDetail() {
  const { astra } = Route.useLoaderData();
  const owners = astra.owners
    .map((name) => characters.find((c) => c.name === name))
    .filter(Boolean);
  const others = astras.filter((a) => a.slug !== astra.slug).slice(0, 3);

  return (
    <div>
      <section className="grain relative h-[42vh] min-h-64 overflow-hidden border-b border-border">
        <img src={astra.image} alt={`Fantasy ilustrace artefaktu ${astra.name}`} width={362} height={363} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/20" />
        <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-end px-5 pb-8 sm:px-8">
          <BackLink to="/astry">Zpět na zbraně</BackLink>
          <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-primary">{astra.kind}</p>
          <h1 className="mt-2 text-3xl sm:text-5xl">
            <span className="text-gilded">{astra.name}</span>
          </h1>
          <p className="mt-1 font-display text-lg text-muted-foreground">
            {astra.sanskrit} · božstvo {astra.deity}
          </p>
        </div>
      </section>

      <Page>
        {astra.video ? (
          <StoryIntro key={astra.slug} id={astra.slug} name={astra.name} video={astra.video} storyTitle={astra.storyTitle} story={astra.story} audioUrl={astra.audioUrl} cuesUrl={astra.cuesUrl} minutes={astra.audioMinutes} />
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="flex items-center gap-2 text-xl">
              <Sparkles className="size-4 text-primary" /> Účinek
            </h2>
            <div className="rule-gold mt-3 mb-5" />
            <p className="text-[15px] leading-relaxed text-muted-foreground">{astra.effect}</p>

            <h3 className="mt-9 font-display text-lg">V eposu</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{astra.lore}</p>
            <Occurrences name={astra.name} names={astra.keywords} />

            <div className="mt-8 rounded-xl border border-border bg-surface/70 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ničivá moc</span>
                <span className="font-display text-primary">{astra.power} / 100</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${astra.power}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <AudioPlayer
              title={astra.name}
              subtitle="Popis zbraně – předčítání"
              minutes={astra.audioMinutes}
              context={`Zbraň: ${astra.name} (${astra.sanskrit}) — ${astra.kind}`}
              presetText={narrationFor("astra", astra.slug)}
            />

            <div className="rounded-xl border border-border bg-surface/70 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Nositelé</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {astra.owners.map((o) => (
                  <Chip key={o}>{o}</Chip>
                ))}
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-primary">Božstvo</p>
              <div className="mt-3">
                <Chip>{astra.deity}</Chip>
              </div>
            </div>
          </div>
        </div>

        {owners.length ? (
          <Section title="Postavy, které zbraň ovládaly">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {owners.map((c) => (
                <EntityCard
                  key={c!.slug}
                  to="/postavy/$slug"
                  params={{ slug: c!.slug }}
                  image={c!.image}
                  overline={c!.epithet}
                  title={c!.name}
                  sanskrit={c!.sanskrit}
                  text={c!.description}
                  tall
                />
              ))}
            </div>
          </Section>
        ) : null}

        <Section title="Další astry">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((a) => (
              <EntityCard
                key={a.slug}
                to="/astry/$slug"
                params={{ slug: a.slug }}
                image={a.image}
                overline={a.kind}
                title={a.name}
                sanskrit={a.sanskrit}
                text={a.effect}
                minutes={a.audioMinutes}
              />
            ))}
          </div>
        </Section>
      </Page>
    </div>
  );
}
