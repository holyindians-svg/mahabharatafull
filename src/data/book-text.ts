import { narrationFor } from "./narrations";

/**
 * Úplné české znění knih, které jsou v aplikaci uložené celé
 * (`public/texty/<slug>.json` — pole odstavců v češtině). Text se načte
 * jednou při otevření knihy a dál se nikam nedotazuje — žádný klíč,
 * žádné čekání.
 */

/** Knihy, u kterých je v aplikaci uložené úplné české znění. */
export const FULL_TEXT_BOOKS = ["adi-parva", "sabha-parva"] as const;

export function hasFullTextFor(slug: string): boolean {
  return (FULL_TEXT_BOOKS as readonly string[]).includes(slug);
}

/** Rozdělí odstavec na věty, které se při čtení zvýrazňují. */
function toSentences(paragraph: string): string[] {
  const parts = paragraph.match(/[^.!?…]+[.!?…]*/g) ?? [paragraph];
  return parts
    .map((s) => s.trim())
    .filter((s) => /\p{L}/u.test(s));
}

/**
 * Zachová nadpisy a dlouhé zdrojové bloky rozdělí pouze mezi větami.
 * Výsledné odstavce mají přibližně do 120 slov, aby se při čtení
 * posouvaly klidně a zůstaly přehledné i na telefonu.
 */
function toReadableParagraphs(paragraphs: string[], maxWords = 120): string[] {
  const result: string[] = [];
  for (const paragraph of paragraphs) {
    const clean = paragraph.trim();
    if (!clean) continue;
    if (/^(oddíl|section)\s+[ivxlcdm0-9]+$/iu.test(clean)) {
      result.push(clean);
      continue;
    }
    const sentences = toSentences(clean);
    let current: string[] = [];
    let count = 0;
    for (const sentence of sentences) {
      const sentenceWords = sentence.match(/\S+/g)?.length ?? 0;
      if (current.length && count + sentenceWords > maxWords) {
        result.push(current.join(" "));
        current = [];
        count = 0;
      }
      current.push(sentence);
      count += sentenceWords;
    }
    if (current.length) result.push(current.join(" "));
  }
  return result;
}


/** Ke každé větě index odstavce, do kterého patří. */
export function paragraphIndexFor(paragraphs: string[]): number[] {
  const map: number[] = [];
  paragraphs.forEach((p, pi) => {
    for (const _ of toSentences(p)) map.push(pi);
  });
  return map;
}

export interface BookText {
  segments: string[];
  /** paragraphIndex[i] = index odstavce pro větu i */
  paragraphIndex: number[];
}

export interface BookSection {
  /** Nadpis oddílu, např. „Oddíl I“. */
  title: string;
  /** První a poslední věta oddílu v `segments`. */
  fromSegment: number;
  toSegment: number;
}

const SECTION_HEADING = /^(oddíl|sekce)\s+[ivxlcdm]+\.?$/iu;

/** Rozdělí knihu na oddíly podle nadpisů, které už v textu jsou. */
export function sectionsOf(book: BookText): BookSection[] {
  const sections: BookSection[] = [];
  book.segments.forEach((segment, index) => {
    if (SECTION_HEADING.test(segment.trim())) {
      sections.push({ title: segment.trim(), fromSegment: index, toSegment: index });
    } else {
      const last = sections[sections.length - 1];
      if (last) last.toSegment = index;
    }
  });
  return sections;
}


/** Náhradní obsah, dokud se úplné znění nenačte. */
export function bookFallback(slug: string): BookText {
  const paragraphs = toReadableParagraphs(
    (narrationFor("parva", slug) ?? "").split(/\n{2,}/),
  );
  return {
    segments: paragraphs.flatMap(toSentences),
    paragraphIndex: paragraphIndexFor(paragraphs),
  };
}

const cache = new Map<string, BookText>();

/** Věty celé knihy v pořadí čtení, včetně rozdělení na odstavce. */
export async function loadBookSegments(slug: string): Promise<BookText> {
  const cached = cache.get(slug);
  if (cached) return cached;
  try {
    const res = await fetch(`/texty/${slug}.json`);
    if (!res.ok) throw new Error("nedostupné");
    const data = (await res.json()) as { paragraphs?: string[] };
    const sourceParagraphs = data.paragraphs ?? [];
    if (!sourceParagraphs.length) throw new Error("prázdné");
    const paragraphs = toReadableParagraphs(sourceParagraphs);
    const value: BookText = {
      segments: paragraphs.flatMap(toSentences),
      paragraphIndex: paragraphIndexFor(paragraphs),
    };
    cache.set(slug, value);
    return value;
  } catch {
    const value = bookFallback(slug);
    cache.set(slug, value);
    return value;
  }
}
