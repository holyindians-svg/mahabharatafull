import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, X } from "lucide-react";
import { Page, PageHeader } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import {
  FULL_TEXT_BOOKS,
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
  bookName: string;
  section: BookSection;
  paragraphs: string[];
};

export const Route = createFileRoute("/knihy-ke-cteni")({
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
  const [openSection, setOpenSection] = useState<OpenSection | null>(null);

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
  }, []);

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
          className="fixed inset-0 z-[100] overflow-y-auto bg-background"
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

          <article className="mx-auto w-full max-w-3xl px-6 pb-20 pt-28 sm:px-10 sm:pt-32">
            <p className="text-sm text-muted-foreground">{openSection.bookName}</p>
            <h1 id="reading-title" className="mt-2 text-3xl leading-tight text-foreground sm:text-4xl">
              {openSection.section.title}
            </h1>
            <div className="rule-gold mt-6 mb-8" />
            <div className="space-y-6 text-[1.125rem] leading-8 text-foreground sm:text-xl sm:leading-9">
              {openSection.paragraphs.map((paragraph, index) => (
                <p key={`${openSection.section.fromSegment}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}