import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Download, FileText, Printer } from "lucide-react";
import { Page, PageHeader } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  FULL_TEXT_BOOKS,
  forgetBook,
  loadBookSegments,
  sectionsOf,
  type BookSection,
  type BookText,
} from "@/data/book-text";
import { parvas } from "@/data/parvas";
import { onBookUpdated } from "@/lib/text-store";
import { downloadTxt, paragraphsOf, printText } from "@/lib/export-text";

export const Route = createFileRoute("/stahnout-texty")({
  head: () => ({
    meta: [
      { title: "Stáhnout texty – Mahábhárata" },
      { name: "description", content: "Stáhněte české texty knih Mahábháraty jako TXT nebo PDF (A4)." },
      { property: "og:title", content: "Stáhnout texty – Mahábhárata" },
      { property: "og:description", content: "Knihy a oddíly eposu ke stažení jako TXT nebo PDF A4." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DownloadPage,
});

interface Item {
  slug: string;
  name: string;
  book: BookText;
  sections: BookSection[];
}

function ExportButtons({ title, paragraphs }: { title: string; paragraphs: () => string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        className="h-11 px-4"
        onClick={() => downloadTxt(title, `${title}\n\n${paragraphs().join("\n\n")}\n`)}
      >
        <FileText className="size-4" /> Stáhnout TXT
      </Button>
      <Button variant="outline" className="h-11 px-4" onClick={() => printText(title, paragraphs())}>
        <Printer className="size-4" /> Uložit do PDF (A4)
      </Button>
    </div>
  );
}

function DownloadPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [ver, setVer] = useState(0);

  useEffect(
    () =>
      onBookUpdated((slug) => {
        forgetBook(slug);
        setVer((v) => v + 1);
      }),
    [],
  );

  useEffect(() => {
    let alive = true;
    void Promise.all(
      FULL_TEXT_BOOKS.map(async (slug) => {
        const parva = parvas.find((p) => p.slug === slug);
        const book = await loadBookSegments(slug);
        return { slug, name: parva?.name ?? slug, book, sections: sectionsOf(book, slug) };
      }),
    ).then((list) => alive && setItems(list));
    return () => {
      alive = false;
    };
  }, [ver]);

  return (
    <Page>
      <PageHeader
        eyebrow="Download"
        title="Stáhnout texty"
        description="Celé knihy i jednotlivé oddíly jako čistý text (TXT) nebo k uložení do PDF ve formátu A4."
      />
      <div className="space-y-6">
        {items.map((it) => {
          const groups: { name: string; list: { s: BookSection; i: number }[] }[] = [];
          it.sections.forEach((s, i) => {
            const g = s.group ?? "";
            const last = groups[groups.length - 1];
            if (last && last.name === g) last.list.push({ s, i });
            else groups.push({ name: g, list: [{ s, i }] });
          });
          return (
            <div key={it.slug} className="rounded-xl border border-border bg-card/40 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Download className="size-5 text-primary" />
                <h2 className="font-display text-xl text-foreground">{it.name}</h2>
              </div>
              <ExportButtons title={it.name} paragraphs={() => paragraphsOf(it.book)} />
              {it.sections.length > 0 && (
                <Collapsible className="mt-4">
                  <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground">
                    Jednotlivé oddíly ({it.sections.length})
                    <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-5">
                    {groups.map((g) => (
                      <div key={g.name + g.list[0]?.i} className="space-y-2">
                        {g.name && <h3 className="font-semibold text-foreground">{g.name}</h3>}
                        {g.list.map(({ s, i }) => {
                          const title = `${it.name} – od. ${i + 1}`;
                          return (
                            <div
                              key={i}
                              className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <span className="text-sm font-medium text-foreground">od. {i + 1}</span>
                              <ExportButtons
                                title={title}
                                paragraphs={() => paragraphsOf(it.book, s.fromSegment, s.toSegment)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}
