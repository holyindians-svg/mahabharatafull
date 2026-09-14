import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Search, Swords, Users } from "lucide-react";
import { parvas } from "@/data/parvas";
import { characters } from "@/data/characters";
import { astras } from "@/data/astras";
import { Page, PageHeader } from "@/components/Bits";
import { askAi } from "@/lib/ask-ai";
import { speak, type SpeakHandle } from "@/lib/speak";




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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

  // Stejný dotaz se navíc odešle do textu eposu a odpověď se vypíše níže.
  const [answer, setAnswer] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const speaker = useRef<SpeakHandle | null>(null);

  const stopSpeech = () => {
    speaker.current?.stop();
    speaker.current = null;
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      abort.current?.abort();
      stopSpeech();
      setAnswer("");
      setAnswerError(null);
      setAnswerLoading(false);
      return;
    }
    // Každý dotaz se vždy hledá přes AI.
    const timeout = setTimeout(() => {
      abort.current?.abort();
      stopSpeech();
      const controller = new AbortController();
      abort.current = controller;
      setAnswer("");
      setAnswerError(null);
      setAnswerLoading(true);
      askAi({ question: trimmed, signal: controller.signal, onText: setAnswer })

        .then((full) => {
          // Hotová odpověď se hned přečte nahlas.
          if (controller.signal.aborted || !full.trim()) return;
          const handle = speak(full);
          speaker.current = handle;
          handle.done.catch(() => {}).finally(() => {
            if (speaker.current === handle) speaker.current = null;
          });
        })
        .catch((e: unknown) => {
          if (controller.signal.aborted) return;
          setAnswerError(e instanceof Error ? e.message : "Odpověď se nepodařilo získat.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setAnswerLoading(false);
        });
    }, 800);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(
    () => () => {
      abort.current?.abort();
      stopSpeech();
    },
    [],
  );


  const answerBlock =
    query.trim().length < 2 ? null : answerError ? (
      <p className="text-sm text-muted-foreground">{answerError}</p>
    ) : answerLoading && !answer ? (
      <p className="text-sm text-muted-foreground">Hledám v textu eposu…</p>
    ) : answer ? (
      <div className="space-y-3 text-[15px] leading-relaxed text-muted-foreground">
        {answer
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((p, i) => (
            <p key={i}>{p}</p>
          ))}
      </div>
    ) : null;

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
        answerBlock ?? (
          <p className="text-sm text-muted-foreground">
            Pro „{query}“ jsme nic nenašli. Zkuste jiné jméno nebo název.
          </p>
        )
      ) : (
        <div className="space-y-10">
          <p className="text-sm text-muted-foreground">
            Nalezeno {total} záznamů pro „{query}“.
          </p>
          {answerBlock}

          <ResultGroup icon={BookOpen} title="Knihy" count={results.parvas.length}>
            {results.parvas.map((p) => (
              <Link
                key={p.slug}
                to="/knihy/$slug"
                params={{ slug: p.slug }}
                className="card-relief flex items-center gap-4 rounded-xl p-4"
              >
                <img src={p.image} alt={`Malovaná scéna: ${p.name}`} loading="lazy" width={64} height={64} className="size-16 shrink-0 rounded-sm object-cover" />
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
                <img src={c.image} alt={`Malovaný portrét: ${c.name}`} loading="lazy" width={64} height={64} className="size-16 shrink-0 rounded-t-full rounded-b-sm object-cover" />
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
                <img src={a.image} alt={`Fantasy ilustrace: ${a.name}`} loading="lazy" width={64} height={64} className="size-16 shrink-0 rounded-sm object-cover" />
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
