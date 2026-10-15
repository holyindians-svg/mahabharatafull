import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Maximize2, Scroll } from "lucide-react";
import { getParva, parvas } from "@/data/parvas";
import { getCharacter } from "@/data/characters";
import { EntityCard } from "@/components/EntityCard";
import { AudioPlayer, type AudioPlayerHandle, type AudioPlaybackState } from "@/components/AudioPlayer";
import { ImmersiveReader } from "@/components/ImmersiveReader";
import { Button } from "@/components/ui/button";
import { narrationFor } from "@/data/narrations";
import { audiobookFor } from "@/data/audiobooks";
import { AudioSectionDetail } from "@/components/AudioSectionDetail";
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
  const audioBook = audiobookFor(parva.slug);
  const playerRef = useRef<AudioPlayerHandle | null>(null);
  const [missingTime, setMissingTime] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [audioTime, setAudioTime] = useState(0);
  const [readerOpen, setReaderOpen] = useState(false);
  const [playback, setPlayback] = useState<AudioPlaybackState>({ playing: false, buffering: false, error: null });
  const expandRef = useRef<HTMLButtonElement | null>(null);
  const timeOf = (i: number) => {
    const n = /(\d+)/.exec(sections[i]?.title ?? "");
    return n && audioBook ? audioBook.sections[Number(n[1])] : undefined;
  };
  const chapters = useMemo(
    () =>
      audioBook
        ? sections.flatMap((s, i) => {
            const n = /(\d+)/.exec(s.title);
            const t = n ? audioBook.sections[Number(n[1])] : undefined;
            return t ? [{ index: i, title: s.title, ...t }] : [];
          })
        : undefined,
    [audioBook, sections],
  );
  const readerIndex = playingSection ?? openSection ?? chapters?.[0]?.index;
  const readerChapter = chapters?.find((chapter) => chapter.index === readerIndex);
  const detailSection = openSection === null ? undefined : sections[openSection];
  const expandReader = () => {
    const focused = document.activeElement;
    expandRef.current = focused instanceof HTMLButtonElement ? focused : null;
    setReaderOpen(true);
  };
  const changeReaderOpen = (open: boolean) => {
    setReaderOpen(open);
    if (!open) requestAnimationFrame(() => expandRef.current?.focus());
  };
  const setSelected = (i: number | null) => {
    setAutoNext(false);
    if (audioBook && i !== null) {
      // Kniha má MP3: oddíl je jen časový úsek v ní, hlas zařízení se nespouští.
      setSelectedState(null);
      setPlayingSection(i);
      setOpenSection(i);
      const timed = timeOf(i);
      setMissingTime(!timed);
      if (timed) playerRef.current?.playRange(timed.startTime);
      return;
    }
    setMissingTime(false);
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
  const lastTouch = useRef(0);
  const [scrollRetry, setScrollRetry] = useState(0);
  const markTouch = () => {
    lastTouch.current = Date.now();
  };
  const touchGuard = { onTouchStart: markTouch, onTouchMove: markTouch, onWheel: markTouch, onPointerDown: markTouch };
  useEffect(() => {
    if (highlighted === null) return undefined;
    const idle = Date.now() - lastTouch.current;
    if (idle < 4000) {
      // Uživatel právě posouvá prstem — posun počká.
      const t = window.setTimeout(() => setScrollRetry((n) => n + 1), 4000 - idle + 50);
      return () => window.clearTimeout(t);
    }
    const box = listRef.current;
    const btn = box?.querySelector<HTMLElement>(`[data-section="${highlighted}"]`);
    if (!box || !btn) return undefined;
    const b = box.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    if (r.top < b.top + 8 || r.bottom > b.bottom - 8) {
      box.scrollTo({
        top: box.scrollTop + (r.top - b.top) - b.height / 2 + r.height / 2,
        behavior: "smooth",
      });
    }
    return undefined;
  }, [highlighted, scrollRetry]);
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
              progressKey={
                audioBook ? `book:${parva.slug}:mp3` : hasFullText ? `book:${parva.slug}` : undefined
              }
              onSegment={sections.length ? (seg) => setPlayingSection(sectionAt(seg)) : undefined}
              audioUrl={audioBook?.audioUrl}
              chapters={chapters}
              controlRef={playerRef}
              onTimeSection={audioBook ? (i) => setPlayingSection(i) : undefined}
              onTime={audioBook?.cuesUrl ? setAudioTime : undefined}
              onPlaybackState={audioBook ? setPlayback : undefined}
            />
            {audioBook?.cuesUrl && readerChapter ? (
              <>
                <Button variant="outline" className="press min-h-11 w-full" onClick={expandReader}>
                  <Maximize2 /> Zvětšit čtečku
                </Button>
                <ImmersiveReader open={readerOpen} onOpenChange={changeReaderOpen}
                  bookName={parva.name} title={readerChapter.title}
                  number={Number(/(\d+)/.exec(readerChapter.title)?.[1])}
                  cuesUrl={audioBook.cuesUrl} range={readerChapter} time={audioTime} playback={playback}
                  onToggle={() => playerRef.current?.togglePlay()}
                  onSeek={(time) => playerRef.current?.seekPreservingPlayback(time)} />
              </>
            ) : null}

            {sections.length ? (
              <div className="rounded-xl border border-border bg-surface/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Oddíly</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setOpenSection(null);
                      if (audioBook) playerRef.current?.playRange(0);
                    }}
                    className={cn(
                      "press min-h-11 rounded-md border px-3 py-1 text-xs transition-colors",
                      selected === null
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Celá kniha
                  </button>
                </div>
                {hasGroups ? (
                  <div ref={listRef} {...touchGuard} className="mt-3 max-h-[26rem] space-y-5 overflow-y-auto overscroll-contain pr-1">
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
                                "press min-h-11 truncate rounded-md border px-3.5 py-2.5 text-left text-sm transition-colors",
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
                  <div ref={listRef} {...touchGuard} className="mt-3 grid max-h-56 overscroll-contain grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                    {sections.map((s, i) => (
                      <button
                        key={s.fromSegment}
                        type="button"
                        data-section={i}
                        onClick={() => setSelected(i)}
                        className={cn(
                          "press min-h-11 truncate rounded-md border px-2.5 py-1 text-left text-xs transition-colors",
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
                {missingTime ? (
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                    Pro tento oddíl zatím chybí časová značka v nahrávce.
                  </p>
                ) : null}
              </div>
            ) : null}

            {audioBook?.cuesUrl && openSection !== null && detailSection && timeOf(openSection) ? (
              <AudioSectionDetail
                key={openSection}
                title={detailSection.title}
                number={Number(/(\d+)/.exec(detailSection.title)?.[1])}
                cuesUrl={audioBook.cuesUrl}
                time={audioTime}
                onPlaySection={() => {
                  const t = timeOf(openSection);
                  if (t) playerRef.current?.playRange(t.startTime);
                }}
                onSeek={(t) => playerRef.current?.seek(t)}
                onExpand={expandReader}
              />
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
