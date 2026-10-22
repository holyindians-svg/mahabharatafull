import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { matchesIn, nameMatcher } from "@/lib/occurrences";
import { cn } from "@/lib/utils";
import { audiobookFor } from "@/data/audiobooks";
import { EntityText } from "@/components/EntityText";
import { ReaderAudioBar } from "@/components/ReaderAudioBar";
import { BookOpenText, X } from "lucide-react";
import { Page, PageHeader } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { onBookUpdated } from "@/lib/text-store";
import {
  FULL_TEXT_BOOKS,
  forgetBook,
  loadBookSegments,
  sectionsOf,
  type BookSection,
  type BookText,
} from "@/data/book-text";
import { parvas } from "@/data/parvas";

type ReadingBook = {
  slug: (typeof FULL_TEXT_BOOKS)[number];
  name: string;
  sanskrit: string;
  book: BookText;
  sections: BookSection[];
};

type OpenSection = {
  slug?: string;
  number?: number;
  bookName: string;
  section: BookSection;
  paragraphs: string[];
};

type ReaderSearch = { kniha?: string; oddil?: number; vyskyt?: number; hledat?: string; zpet?: string; cas?: number };

export const Route = createFileRoute("/knihy-ke-cteni")({
  validateSearch: (raw: Record<string, unknown>): ReaderSearch => {
    const out: ReaderSearch = {};
    if (typeof raw["kniha"] === "string") out.kniha = raw["kniha"];
    const n = Number(raw["oddil"]);
    if (Number.isFinite(n) && n > 0) out.oddil = n;
    const v = Number(raw["vyskyt"]);
    if (Number.isFinite(v) && v >= 0) out.vyskyt = v;
    if (typeof raw["hledat"] === "string") out.hledat = raw["hledat"].slice(0, 80);
    const c = Number(raw["cas"]);
    if (raw["cas"] !== undefined && Number.isFinite(c) && c >= 0) out.cas = c;
    const z = raw["zpet"];
    if (typeof z === "string" && z.startsWith("/") && !z.startsWith("//") && z.length <= 200) out.zpet = z;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Knihy ke čtení – Mahábhárata" },
      {
        name: "description",
        content: "České texty Mahábháraty v čistém režimu pro pohodlné čtení po jednotlivých oddílech.",
      },
      { property: "og:title", content: "Knihy ke čtení – Mahábhárata" },
      {
        property: "og:description",
        content: "Čistý čtecí režim českých textů Mahábháraty, přehledně rozdělených do knih a oddílů.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReadingBooksPage,
});

function shortLabel(title: string): string {
  const number = /(\d+)/.exec(title)?.[1];
  return number ? `od. ${number}` : title;
}

function paragraphsForSection(book: BookText, section: BookSection): string[] {
  const paragraphs = new Map<number, string[]>();
  for (let index = section.fromSegment; index <= section.toSegment; index += 1) {
    const segment = book.segments[index];
    if (!segment || (index === section.fromSegment && segment.trim() === section.title)) continue;
    const paragraph = book.paragraphIndex[index] ?? index;
    const current = paragraphs.get(paragraph) ?? [];
    current.push(segment);
    paragraphs.set(paragraph, current);
  }
  return [...paragraphs.values()].map((segments) => segments.join(" "));
}

function ReadingBooksPage() {
  const [books, setBooks] = useState<ReadingBook[]>([]);
  const [openSection, setOpenSectionState] = useState<OpenSection | null>(null);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/knihy-ke-cteni" });
  const [flash, setFlash] = useState<number | null>(null);
  const handled = useRef("");
  const setOpenSection = (value: OpenSection | null) => {
    setOpenSectionState(value);
    if (!value) setFlash(null);
    if (!value && search.zpet) void navigate({ to: search.zpet, replace: true });
    else if (!value && search.kniha) void navigate({ search: {}, replace: true });
  };

  const [textVersion, setTextVersion] = useState(0);
  useEffect(
    () =>
      onBookUpdated((slug) => {
        forgetBook(slug);
        setTextVersion((v) => v + 1);
      }),
    [],
  );

  useEffect(() => {
    let alive = true;
    void Promise.all(
      FULL_TEXT_BOOKS.map(async (slug): Promise<ReadingBook | undefined> => {
        const parva = parvas.find((item) => item.slug === slug);
        if (!parva) return undefined;
        const book = await loadBookSegments(slug);
        return {
          slug,
          name: parva.name,
          sanskrit: parva.sanskrit,
          book,
          sections: sectionsOf(book, slug),
        };
      }),
    ).then((loaded) => {
      if (alive) setBooks(loaded.filter((book): book is ReadingBook => book !== undefined));
    });
    return () => {
      alive = false;
    };
  }, [textVersion]);

  useEffect(() => {
    if (!openSection) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenSection(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [openSection]);

  // Deep link z „Výskytů v textu“: otevřít oddíl, doskrolovat a dočasně zvýraznit.
  useEffect(() => {
    const key = JSON.stringify(search);
    if (!search.kniha || !search.oddil || handled.current === key) return;
    const book = books.find((b) => b.slug === search.kniha);
    if (!book) return;
    const section = book.sections.find((s) => Number(/(\d+)/.exec(s.title)?.[1]) === search.oddil);
    if (!section) return;
    handled.current = key;
    const paragraphs = paragraphsForSection(book.book, section);
    let target = 0;
    if (search.hledat) {
      const re = nameMatcher(search.hledat);
      const want = search.vyskyt ?? 0;
      let seen = 0;
      let first = -1;
      for (let i = 0; i < paragraphs.length; i += 1) {
        const hits = matchesIn(paragraphs[i] ?? "", re).length;
        if (hits && first < 0) first = i;
        if (hits && seen + hits > want) { target = i; first = -2; break; }
        seen += hits;
      }
      if (first >= 0) target = first;
    }
    setOpenSectionState({ slug: book.slug, number: search.oddil, bookName: book.name, section, paragraphs });
    setFlash(target);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelector(`[data-reading-paragraph="${target}"]`)?.scrollIntoView({ block: "center" });
    }));
  }, [books, search]);

  const groupedBooks = useMemo(
    () =>
      books.map((book) => {
        const groups: { name: string; sections: BookSection[] }[] = [];
        book.sections.forEach((section) => {
          const name = section.group ?? book.sanskrit;
          const last = groups[groups.length - 1];
          if (last?.name === name) last.sections.push(section);
          else groups.push({ name, sections: [section] });
        });
        return { ...book, groups };
      }),
    [books],
  );

  return (
    <>
      <Page>
        <PageHeader
          eyebrow="České překlady"
          title="Knihy ke čtení"
          sanskrit="Čistý čtecí režim"
          description="Vyberte knihu a oddíl, který chcete otevřít pro nerušené čtení přes celý displej."
        />

        <div className="space-y-10">
          {groupedBooks.map((book) => (
            <section key={book.slug}>
              <div className="flex items-center gap-3">
                <BookOpenText className="size-5 text-primary" />
                <div>
                  <h2 className="text-xl text-foreground">{book.name}</h2>
                  <p className="text-sm text-muted-foreground">{book.sanskrit}</p>
                </div>
              </div>
              <div className="rule-gold mt-4 mb-5" />

              <div className="space-y-6">
                {book.groups.map((group, groupIndex) => (
                  <div key={`${book.slug}-${group.name}-${groupIndex}`}>
                    <h3 className="mb-3 text-base font-semibold text-foreground">{group.name}</h3>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {group.sections.map((section) => (
                        <Button
                          key={section.fromSegment}
                          type="button"
                          variant="outline"
                          className="h-auto min-h-11 justify-start px-4 py-3 text-left"
                          onClick={() =>
                            setOpenSection({
                              bookName: book.name,
                              section,
                              paragraphs: paragraphsForSection(book.book, section),
                            })
                          }
                        >
                          {shortLabel(section.title)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Page>

      {openSection ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reading-title"
          className="mandala-watermark fixed inset-0 z-[100] overflow-y-auto bg-background"
        >
          <Button
            type="button"
            variant="destructive"
            onClick={() => setOpenSection(null)}
            autoFocus
            aria-label="Zavřít čtecí režim"
            className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-[110] h-14 rounded-full border-2 border-destructive-foreground/60 px-5 text-base shadow-lg sm:right-6"
          >
            <X className="size-6" />
            Zavřít
          </Button>

          <article className="mx-auto w-full max-w-3xl px-6 pb-32 pt-28 sm:px-10 sm:pt-32">
            <p className="text-sm text-muted-foreground">{openSection.bookName}</p>
            <h1 id="reading-title" className="mt-2 text-3xl leading-tight text-foreground sm:text-4xl">
              {openSection.section.title}
            </h1>
            <div className="rule-gold mt-6 mb-8" />
            <div className="space-y-6 text-[1.125rem] leading-8 text-foreground sm:text-xl sm:leading-9">
              {openSection.paragraphs.map((paragraph, index) => (
                <p key={`${openSection.section.fromSegment}-${index}`} data-reading-paragraph={index}
                  className={cn("relative -mx-3 rounded-md px-3 transition-colors duration-700 motion-reduce:transition-none", flash === index && "lotus-frame")}>
                  <EntityText text={paragraph} extra={search.hledat} />
                </p>
              ))}
            </div>
          </article>
          {(() => {
            const book = openSection.slug ? audiobookFor(openSection.slug) : undefined;
            const range = book && openSection.number ? book.sections[openSection.number] : undefined;
            return book && range && search.cas !== undefined ? (
              <ReaderAudioBar audioUrl={book.audioUrl} range={range} startAt={search.cas} />
            ) : null;
          })()}
        </div>
      ) : null}
    </>
  );
}