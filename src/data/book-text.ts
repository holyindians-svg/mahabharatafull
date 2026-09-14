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


/** Náhradní text, dokud se úplné znění nenačte. */
export function adiParvaFallbackSegments(): string[] {
  const fallback = narrationFor("parva", "adi-parva") ?? "";
  return fallback.split(/\n{2,}/).flatMap(toSentences);
}

/** Ke každé větě index odstavce, do kterého patří. */
export function paragraphIndexFor(paragraphs: string[]): number[] {
  const map: number[] = [];
  paragraphs.forEach((p, pi) => {
    for (const _ of toSentences(p)) map.push(pi);
  });
  return map;
}

export interface AdiParvaText {
  segments: string[];
  /** paragraphIndex[i] = index odstavce pro větu i */
  paragraphIndex: number[];
}

/** Náhradní obsah, dokud se úplné znění nenačte. */
export function adiParvaFallback(): AdiParvaText {
  const paragraphs = toReadableParagraphs(
    (narrationFor("parva", "adi-parva") ?? "").split(/\n{2,}/),
  );
  return {
    segments: paragraphs.flatMap(toSentences),
    paragraphIndex: paragraphIndexFor(paragraphs),
  };
}

let cache: AdiParvaText | null = null;

/** Věty celé knihy v pořadí čtení, včetně rozdělení na odstavce. */
export async function loadAdiParvaSegments(): Promise<AdiParvaText> {
  if (cache) return cache;
  try {
    const res = await fetch("/texty/adi-parva.json");
    if (!res.ok) throw new Error("nedostupné");
    const data = (await res.json()) as { paragraphs?: string[] };
    const sourceParagraphs = data.paragraphs ?? [];
    if (!sourceParagraphs.length) throw new Error("prázdné");
    const paragraphs = toReadableParagraphs(sourceParagraphs);
    cache = {
      segments: paragraphs.flatMap(toSentences),
      paragraphIndex: paragraphIndexFor(paragraphs),
    };
    return cache;
  } catch {
    cache = adiParvaFallback();
    return cache;
  }
}
