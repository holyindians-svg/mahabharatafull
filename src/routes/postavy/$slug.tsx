import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { characterGroups, characters, getCharacter } from "@/data/characters";
import { parvas } from "@/data/parvas";
import { astras } from "@/data/astras";
import { AudioPlayer } from "@/components/AudioPlayer";
import { EntityCard } from "@/components/EntityCard";
import { BackLink, Chip, Page, Section } from "@/components/Bits";

export const Route = createFileRoute("/postavy/$slug")({
  loader: ({ params }) => {
    const character = getCharacter(params.slug);
    if (!character) throw notFound();
    return { character };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.character;
    return {
      meta: c
        ? [
            { title: `${c.name} (${c.sanskrit}) – Mahábhárata` },
            { name: "description", content: c.description.slice(0, 155) },
            { property: "og:title", content: `${c.name} – ${c.epithet}` },
            { property: "og:description", content: c.description.slice(0, 155) },
            { property: "og:image", content: c.image },
            { name: "twitter:image", content: c.image },
          ]
        : [{ title: "Postava Mahábháraty" }],
    };
  },
  component: CharacterDetail,
});

function CharacterDetail() {
  const { character } = Route.useLoaderData();
  const group = characterGroups.find((g) => g.id === character.group)!;
  const relatedParvas = parvas.filter((p) => p.characterSlugs.includes(character.slug));
  const relatedAstras = astras.filter((a) => a.owners.includes(character.name));
  const siblings = characters
    .filter((c) => c.group === character.group && c.slug !== character.slug)
    .slice(0, 4);

  return (
    <Page>
      <BackLink to="/postavy">Zpět na postavy</BackLink>

      <div className="mt-6 grid gap-8 lg:grid-cols-[420px_1fr]">
        <div>
          <div className="grain overflow-hidden rounded-xl border border-border">
            <img
              src={character.image}
              alt={`Portrét – ${character.name}`}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="mt-5">
            <AudioPlayer
              title={character.name}
              subtitle="Životopis – předčítání"
              minutes={character.audioMinutes}
            />
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary">{group.title}</p>
          <h1 className="mt-3 text-3xl sm:text-5xl">
            <span className="text-gilded">{character.name}</span>
          </h1>
          <p className="mt-1 font-display text-lg text-muted-foreground">
            {character.sanskrit} · {character.epithet}
          </p>

          <div className="rule-gold my-7" />

          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {character.description}
          </p>

          <h2 className="mt-9 font-display text-lg">Vazby a role</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {character.relations.map((r) => (
              <li
                key={r}
                className="rounded-lg border border-border bg-surface/70 px-4 py-3 text-sm text-foreground/90"
              >
                {r}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-2">
            <Chip>{relatedParvas.length} knih</Chip>
            {relatedAstras.length ? <Chip>{relatedAstras.length} zbraní</Chip> : null}
            <Link to="/postavy" search={{ group: group.id }}>
              <Chip className="hover:border-primary/50 hover:text-primary">{group.title}</Chip>
            </Link>
          </div>
        </div>
      </div>

      {relatedAstras.length ? (
        <Section title="Zbraně této postavy">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedAstras.map((a) => (
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
      ) : null}

      {relatedParvas.length ? (
        <Section title="Vystupuje v knihách">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedParvas.map((p) => (
              <EntityCard
                key={p.slug}
                to="/knihy/$slug"
                params={{ slug: p.slug }}
                image={p.image}
                overline={`${p.order}. kniha`}
                title={p.name}
                sanskrit={p.sanskrit}
                text={p.subtitle}
                minutes={p.audioMinutes}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {siblings.length ? (
        <Section title={`Další ze skupiny: ${group.title}`}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {siblings.map((c) => (
              <EntityCard
                key={c.slug}
                to="/postavy/$slug"
                params={{ slug: c.slug }}
                image={c.image}
                overline={c.epithet}
                title={c.name}
                sanskrit={c.sanskrit}
                text={c.description}
                tall
              />
            ))}
          </div>
        </Section>
      ) : null}
    </Page>
  );
}
