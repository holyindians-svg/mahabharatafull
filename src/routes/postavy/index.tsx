import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { characterGroups, characters } from "@/data/characters";
import { EntityCard } from "@/components/EntityCard";
import { Page, PageHeader } from "@/components/Bits";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  group: z
    .enum(["vse", "predci", "ucitele", "panduovci", "kauravove", "bozske"])
    .default("vse")
    .catch("vse"),
});

export const Route = createFileRoute("/postavy/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Postavy Mahábháraty – genealogie rodu Kuruovců" },
      {
        name: "description",
        content:
          "Předci, učitelé, Pánduovci, Kauravové i Jádavové: přehled postav Mahábháraty s portréty, popisem a rodinnými vazbami.",
      },
      { property: "og:title", content: "Postavy Mahábháraty – genealogie" },
      {
        property: "og:description",
        content: "Desítky postav eposu rozdělených do pěti rodových a spojeneckých skupin.",
      },
    ],
  }),
  component: People,
});

function People() {
  const { group } = Route.useSearch();
  const active = characterGroups.find((g) => g.id === group);
  const list = group === "vse" ? characters : characters.filter((c) => c.group === group);

  return (
    <Page>
      <PageHeader
        eyebrow="Pātra"
        title="Genealogie a postavy"
        sanskrit={active ? active.title : "Všechny rody"}
        description={
          active
            ? active.description
            : "Rod Bháratů, jeho učitelé, spojenci i božské postavy. Vyberte skupinu a otevřete detail kterékoli postavy."
        }
      >
        <div className="mt-7 flex flex-wrap gap-2">
          <Link
            to="/postavy"
            search={{ group: "vse" }}
            className={cn(
              "rounded-full border px-4 py-2 text-xs transition-colors",
              group === "vse"
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            Vše ({characters.length})
          </Link>
          {characterGroups.map((g) => (
            <Link
              key={g.id}
              to="/postavy"
              search={{ group: g.id }}
              className={cn(
                "rounded-full border px-4 py-2 text-xs transition-colors",
                group === g.id
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {g.title} ({characters.filter((c) => c.group === g.id).length})
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((c) => (
          <EntityCard
            key={c.slug}
            to="/postavy/$slug"
            params={{ slug: c.slug }}
            image={c.image}
            overline={c.epithet}
            title={c.name}
            sanskrit={c.sanskrit}
            text={c.description}
            minutes={c.audioMinutes}
            tall
          />
        ))}
      </div>
    </Page>
  );
}
