import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { audiobookFor } from "@/data/audiobooks";
import { onSnippet, playSnippet, stopSnippet } from "@/lib/snippet-audio";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { findOccurrences } from "@/lib/occurrences";
import { Button } from "@/components/ui/button";

export function Occurrences({ name }: { name: string }) {
  const [shown, setShown] = useState(20);
  const back = useLocation().pathname;
  const [playingId, setPlayingId] = useState<string | null>(null);
  useEffect(() => { const off = onSnippet(setPlayingId); return () => { off(); stopSnippet(); }; }, []);
  const { data, isPending, isError } = useQuery({
    queryKey: ["occurrences", name],
    queryFn: () => findOccurrences(name),
    staleTime: Infinity,
  });

  return (
    <section className="mt-9" aria-labelledby="occ-title">
      <h2 id="occ-title" className="font-display text-lg">
        Výskyty v textu{data?.length ? <span className="ml-2 text-sm text-muted-foreground">({data.length})</span> : null}
      </h2>
      {isPending ? <p role="status" className="mt-3 text-sm text-muted-foreground">Hledám výskyty…</p>
        : isError ? <p className="mt-3 text-sm text-muted-foreground">Výskyty se nepodařilo načíst.</p>
        : !data.length ? <p className="mt-3 text-sm text-muted-foreground">V dostupných textech se jméno zatím nevyskytuje.</p>
        : <>
          <ul className="mt-4 space-y-2.5">
            {data.slice(0, shown).map((o, i) => (
              <li key={i} className="flex items-stretch gap-2">
                <Link to="/knihy-ke-cteni"
                  search={{ kniha: o.bookSlug, oddil: o.sectionNumber, vyskyt: o.ordinal, hledat: name, zpet: back, ...(o.time !== undefined ? { cas: o.time } : {}) }}
                  className="press block flex-1 rounded-lg border border-border bg-surface/70 px-4 py-3 transition-colors hover:border-primary/50">
                  <span className="text-xs uppercase tracking-wider text-primary">{o.bookName} › od. {o.sectionNumber}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {o.sentence.slice(0, o.matchStart)}
                    <strong className="text-foreground">{o.sentence.slice(o.matchStart, o.matchEnd)}</strong>
                    {o.sentence.slice(o.matchEnd)}
                  </span>
                </Link>
                {o.time !== undefined && o.endTime !== undefined && audiobookFor(o.bookSlug) ? (() => {
                  const id = `${o.bookSlug}:${o.time}`;
                  const on = playingId === id;
                  return (
                    <button type="button" aria-label={on ? "Zastavit úryvek" : "Přehrát úryvek"}
                      onClick={() => on ? stopSnippet() : playSnippet(id, audiobookFor(o.bookSlug)!.audioUrl, o.time!, o.endTime!)}
                      className="press grid min-h-11 min-w-11 shrink-0 place-items-center self-center rounded-full border border-primary/50 text-primary hover:bg-primary/10">
                      {on ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </button>
                  );
                })() : null}
              </li>
            ))}
          </ul>
          {shown < data.length ? (
            <Button type="button" variant="outline" className="mt-4 min-h-11" onClick={() => setShown((s) => s + 20)}>
              Zobrazit další
            </Button>
          ) : null}
        </>}
    </section>
  );
}
