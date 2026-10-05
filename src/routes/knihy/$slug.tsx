import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Scroll } from "lucide-react";
import { getParva, parvas } from "@/data/parvas";
import { getCharacter } from "@/data/characters";
import { EntityCard } from "@/components/EntityCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { narrationFor } from "@/data/narrations";
import { onBookUpdated } from "@/lib/text-store";
import {
  bookFallback,
  forgetBook,
  hasFullTextFor,
  loadBookSegments,
  sectionsOf,
  type BookSection,
  type BookText,
} from "@/data/book-text";
import { cn } from "@/lib/utils";

import { BackLink, Chip, Page, Section } from "@/components/Bits";

/** Knihy s klikatelným menu oddílů. */
const SECTION_NAV_BOOKS = ["adi-parva", "sabha-parva", "vana-parva"];

/** Krátký popisek tlačítka oddílu v tematicky seskupeném seznamu. */
function shortLabel(title: string): string {
  const n = /(\d+)/.exec(title);
  return n ? `od. ${n[1]}` : title;
}



export const Route = createFileRoute("/knihy/$slug")({
  loader: ({ params }) => {
    const parva = getParva(params.slug);
    if (!parva) throw notFound();
    return { parva };
  },
  head: ({ loaderData }) => {
    const parva = loaderData?.parva;
    return {
      meta: parva
        ? [
            { title: `${parva.name} (${parva.sanskrit}) – Mahábhárata` },
            { name: "description", content: parva.summary.slice(0, 155) },
            { property: "og:title", content: `${parva.name} – ${parva.sanskrit}` },
            { property: "og:description", content: parva.subtitle },
            { property: "og:type", content: "article" },
            { name: "twitter:card", content: "summary_large_image" },
          ]
        : [{ title: "Kniha Mahábháraty" }],
    };
  },
  component: BookDetail,
});

function BookDetail() {
  const { parva } = Route.useLoaderData();
  const people = parva.characterSlugs.map(getCharacter).filter(Boolean);
  const next = parvas[parva.order % parvas.length]!;
  const hasFullText = hasFullTextFor(parva.slug);
  const [book, setBook] = useState<BookText | undefined>(
    hasFullText ? bookFallback(parva.slug) : undefined,
  );

  const [textVersion, setTextVersion] = useState(0);
  useEffect(
    () =>
      onBookUpdated((slug) => {
        if (slug !== parva.slug) return;
        forgetBook(slug);
        setTextVersion((v) => v + 1);
      }),
    [parva.slug],
  );

  useEffect(() => {
    if (!hasFullText) return;
    let alive = true;
    void loadBookSegments(parva.slug).then((s) => {
      if (alive) setBook(s);
    });
    return () => {
      alive = false;
    };
  }, [hasFullText, parva.slug, textVersion]);

  const showSections = SECTION_NAV_BOOKS.includes(parva.slug);
  const sections = useMemo(
    () => (showSections && book ? sectionsOf(book, parva.slug) : []),
    [showSections, book, parva.slug],
  );
  const hasGroups = sections.length > 0 && sections.some((s) => s.group);
  const sectionGroups = useMemo(() => {
    const groups: { name: string; items: { s: BookSection; i: number }[] }[] = [];
    sections.forEach((s, i) => {
      const name = s.group ?? "";
      const last = groups[groups.length - 1];
      if (last && last.name === name) last.items.push({ s, i });
      else groups.push({ name, items: [{ s, i }] });
    });
    return groups;
  }, [sections]);
  const [selected, setSelectedState] = useState<number | null>(null);
  const [autoNext, setAutoNext] = useState(false);
  const [playingSection, setPlayingSection] = useState<number | null>(null);
  const setSelected = (i: number | null) => {
    setAutoNext(false);
    setSelectedState(i);
  };
  const selectedRef = useRef<number | null>(null);
  selectedRef.current = selected;
  const goToSection = (i: number) => {
    console.log("[tts] přechod na oddíl", i + 1, "z", sections.length);
    if (i < 0 || i >= sections.length) return;
    setAutoNext(true);
    setSelectedState(i);
  };
  const sectionAt = (segment: number) => {
    let found: number | null = null;
    for (let k = 0; k < sections.length; k++) {
      const s = sections[k];
      if (s && s.fromSegment <= segment) found = k;
      else break;
    }
    return found;
  };
  const highlighted = selected ?? playingSection;
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (highlighted === null) return;
    const box = listRef.current;
    const btn = box?.querySelector<HTMLElement>(`[data-section="${highlighted}"]`);
    if (!box || !btn) return;
    const b = box.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    if (r.top < b.top + 8 || r.bottom > b.bottom - 8) {
      box.scrollTo({
        top: box.scrollTop + (r.top - b.top) - b.height / 2 + r.height / 2,
        behavior: "smooth",
      });
    }
  }, [highlighted]);
  const section = selected !== null ? sections[selected] : undefined;
  const sectionBook = useMemo(() => {
    if (!book || !section) return undefined;
    const from = section.fromSegment;
    const to = section.toSegment;
    const base = book.paragraphIndex[from] ?? 0;
    return {
      segments: book.segments.slice(from, to + 1),
      paragraphIndex: book.paragraphIndex.slice(from, to + 1).map((p) => p - base),
    };
  }, [book, section]);
  const sectionMinutes = sectionBook
    ? Math.max(
        1,
        Math.round(
          sectionBook.segments.reduce((sum, s) => sum + (s.match(/\S+/g)?.length ?? 0), 0) / 140,
        ),
      )
    : 1;





  return (
    <div>
      <section className="grain relative h-[46vh] min-h-72 overflow-hidden border-b border-border">
        <img src={parva.image} alt={`Malovaná scéna: ${parva.name}`} width={302} height={304} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/20" />
        <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-end px-5 pb-8 sm:px-8">
          <BackLink to="/knihy">Zpět na knihy</BackLink>
          <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-primary">
            {parva.order}. kniha z 18
          </p>
          <h1 className="mt-2 text-3xl sm:text-5xl">
            <span className="text-gilded">{parva.name}</span>
          </h1>
          <p className="mt-1 font-display text-lg text-muted-foreground">
            {parva.sanskrit} · {parva.subtitle}
          </p>
        </div>
      </section>

      <Page>
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="order-2 lg:order-1">
            <h2 className="text-xl">Obsah knihy</h2>
            <div className="rule-gold mt-3 mb-5" />
            <p className="text-[15px] leading-relaxed text-muted-foreground">{parva.summary}</p>

            <h3 className="mt-9 flex items-center gap-2 font-display text-lg">
              <Scroll className="size-4 text-primary" /> Klíčové události
            </h3>
            {showSections ? (
              <ul className="mt-4 space-y-4">
                {parva.events.map((e, i) => (
                  <li key={e} className="flex gap-4 py-1 text-sm text-foreground/90">
                    <span className="font-display font-semibold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-relaxed">{e}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ol className="mt-4 space-y-3">
                {parva.events.map((e, i) => (
                  <li
                    key={e}
                    className="flex gap-4 rounded-lg border border-border bg-surface/70 p-4 text-sm text-foreground/90"
                  >
                    <span className="font-display text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-relaxed">{e}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="order-1 space-y-6 lg:order-2">
            <AudioPlayer
              title={parva.name}
              subtitle={`${parva.sanskrit} · předčítání`}
              minutes={parva.audioMinutes}
              context={`Kniha: ${parva.order}. ${parva.name} (${parva.sanskrit}) — ${parva.subtitle}`}
              presetText={narrationFor("parva", parva.slug)}
              segments={book?.segments}
              paragraphIndex={book?.paragraphIndex}
              progressKey={hasFullText ? `book:${parva.slug}` : undefined}
              onSegment={sections.length ? (seg) => setPlayingSection(sectionAt(seg)) : undefined}


            />

            {sections.length ? (
              <div className="rounded-xl border border-border bg-surface/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Oddíly</p>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs transition-colors",
                      selected === null
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Celá kniha
                  </button>
                </div>
                {hasGroups ? (
                  <div ref={listRef} className="mt-3 max-h-[26rem] space-y-5 overflow-y-auto pr-1">
                    {sectionGroups.map((g) => (
                      <div key={g.name}>
                        <p className="mb-2.5 font-display text-sm font-semibold text-foreground">
                          {g.name}
                        </p>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                          {g.items.map(({ s, i }) => (
                            <button
                              key={s.fromSegment}
                              type="button"
                              data-section={i}
                              onClick={() => setSelected(i)}
                              className={cn(
                                "truncate rounded-md border px-3.5 py-2.5 text-left text-sm transition-colors",
                                highlighted === i
                                  ? "border-primary/60 bg-primary/15 text-primary"
                                : "border-border text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {shortLabel(s.title)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div ref={listRef} className="mt-3 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                    {sections.map((s, i) => (
                      <button
                        key={s.fromSegment}
                        type="button"
                        data-section={i}
                        onClick={() => setSelected(i)}
                        className={cn(
                          "truncate rounded-md border px-2.5 py-1 text-left text-xs transition-colors",
                          highlighted === i
                            ? "border-primary/60 bg-primary/15 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {section && sectionBook ? (
              <AudioPlayer
                key={`${parva.slug}-${section.fromSegment}`}
                title={section.title}
                subtitle={`${parva.name} · oddíl`}
                minutes={sectionMinutes}
                segments={sectionBook.segments}
                paragraphIndex={sectionBook.paragraphIndex}
                progressKey={`book:${parva.slug}:section:${section.fromSegment}`}
                autoStart={autoNext}
                onFinished={() => selectedRef.current !== null && goToSection(selectedRef.current + 1)}
                onPrev={() => selectedRef.current !== null && goToSection(selectedRef.current - 1)}
                onNext={() => selectedRef.current !== null && goToSection(selectedRef.current + 1)}
              />
            ) : null}



            <div className="rounded-xl border border-border bg-surface/70 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Zařazení</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip>{parva.order}. Parva</Chip>
                <Chip>{parva.sanskrit}</Chip>
                <Chip>{people.length} postav</Chip>
              </div>
            </div>
          </div>
        </div>

        {people.length ? (
          <Section title="Postavy této knihy">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((c) => (
                <EntityCard
                  key={c!.slug}
                  to="/postavy/$slug"
                  params={{ slug: c!.slug }}
                  image={c!.image}
                  overline={c!.epithet}
                  title={c!.name}
                  sanskrit={c!.sanskrit}
                  text={c!.description}
                  minutes={c!.audioMinutes}
                />
              ))}
            </div>
          </Section>
        ) : null}

        <Section title="Pokračovat">
          <div className="max-w-md">
            <EntityCard
              to="/knihy/$slug"
              params={{ slug: next.slug }}
              image={next.image}
              overline={`${next.order}. kniha`}
              title={next.name}
              sanskrit={next.sanskrit}
              text={next.subtitle}
              minutes={next.audioMinutes}
            />
          </div>
        </Section>
      </Page>
    </div>
  );
}
