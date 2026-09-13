import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Search, Swords, Users } from "lucide-react";
import { parvas } from "@/data/parvas";
import { characters } from "@/data/characters";
import { astras } from "@/data/astras";
import { Page, PageHeader } from "@/components/Bits";

export const Route = createFileRoute("/hledat")({
  head: () => ({
    meta: [
      { title: "Hledat v Mahábháratě – knihy, postavy a zbraně" },
      {
        name: "description",
        content:
          "Prohledejte osmnáct knih Mahábháraty, desítky postav a božské zbraně jediným dotazem.",
      },
      { property: "og:title", content: "Hledat v Mahábháratě" },
      {
        property: "og:description",
        content: "Vyhledávání napříč knihami, postavami a zbraněmi eposu.",
      },
    ],
  }),
  component: SearchPage,
});

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function SearchPage() {
  const [query, setQuery] = useState("");
  const q = norm(query.trim());

  const results = useMemo(() => {
    if (q.length < 2) return { parvas: [], characters: [], astras: [] };
    return {
      parvas: parvas.filter((p) =>
        norm(`${p.name} ${p.sanskrit} ${p.subtitle} ${p.summary} ${p.events.join(" ")}`).includes(q),
      ),
      characters: characters.filter((c) =>
        norm(`${c.name} ${c.sanskrit} ${c.epithet} ${c.description} ${c.relations.join(" ")}`).includes(
          q,
        ),
      ),
      astras: astras.filter((a) =>
        norm(`${a.name} ${a.sanskrit} ${a.deity} ${a.effect} ${a.lore} ${a.owners.join(" ")}`).includes(
          q,
        ),
      ),
    };
  }, [q]);

  const total = results.parvas.length + results.characters.length + results.astras.length;

  return (
    <Page>
      <PageHeader
        eyebrow="Anveṣaṇa"
        title="Hledat v textech"
        sanskrit="Knihy · Postavy · Zbraně"
        description="Zadejte jméno, název knihy nebo zbraně. Hledání pracuje nad celou encyklopedií – bez ohledu na diakritiku."
      >
        <div className="mt-7 flex items-center gap-3 rounded-xl border border-input bg-surface/70 px-4 py-3 focus-within:border-primary/60">
          <Search className="size-5 text-primary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Např. Ardžuna, Brahmástra, hra v kostky…"
            aria-label="Hledaný výraz"
            className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Ardžuna", "Bhagavadgíta", "Brahmástra", "Draupadí", "kostky"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </PageHeader>

      {q.length < 2 ? (
        <p className="text-sm text-muted-foreground">Zadejte alespoň dva znaky.</p>
      ) : total === 0 ? (
        <p className="text-sm text-muted-foreground">
          Pro „{query}“ jsme nic nenašli. Zkuste jiné jméno nebo název.
        </p>
      ) : (
        <div className="space-y-10">
          <p className="text-sm text-muted-foreground">
            Nalezeno {total} záznamů pro „{query}“.
          </p>

          <ResultGroup icon={BookOpen} title="Knihy" count={results.parvas.length}>
            {results.parvas.map((p) => (
              <Link
                key={p.slug}
                to="/knihy/$slug"
                params={{ slug: p.slug }}
                className="card-relief flex items-center gap-4 rounded-xl p-4"
              >
                <img src={p.image} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0">
                  <span className="block font-display text-foreground">{p.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {p.sanskrit} · {p.subtitle}
                  </span>
                </span>
              </Link>
            ))}
          </ResultGroup>

          <ResultGroup icon={Users} title="Postavy" count={results.characters.length}>
            {results.characters.map((c) => (
              <Link
                key={c.slug}
                to="/postavy/$slug"
                params={{ slug: c.slug }}
                className="card-relief flex items-center gap-4 rounded-xl p-4"
              >
                <img src={c.image} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0">
                  <span className="block font-display text-foreground">{c.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">{c.epithet}</span>
                </span>
              </Link>
            ))}
          </ResultGroup>

          <ResultGroup icon={Swords} title="Zbraně a artefakty" count={results.astras.length}>
            {results.astras.map((a) => (
              <Link
                key={a.slug}
                to="/astry/$slug"
                params={{ slug: a.slug }}
                className="card-relief flex items-center gap-4 rounded-xl p-4"
              >
                <img src={a.image} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0">
                  <span className="block font-display text-foreground">{a.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">{a.kind}</span>
                </span>
              </Link>
            ))}
          </ResultGroup>
        </div>
      )}
    </Page>
  );
}

function ResultGroup({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: typeof BookOpen;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg">
        <Icon className="size-4 text-primary" />
        {title}
        <span className="text-sm text-muted-foreground">({count})</span>
      </h2>
      <div className="rule-gold mt-3 mb-5" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}
