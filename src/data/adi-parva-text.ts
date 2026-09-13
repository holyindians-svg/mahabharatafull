import { narrationFor } from "./narrations";

/**
 * Úplné české znění první knihy (Ádi Parva).
 *
 * Text je uložený přímo v aplikaci jako statický soubor
 * `public/texty/adi-parva.json` (pole odstavců v češtině). Načte se jednou
 * při otevření knihy a dál se nikam nedotazuje — žádný klíč, žádné čekání.
 */

/** Rozdělí odstavec na věty, které se při čtení zvýrazňují. */
function toSentences(paragraph: string): string[] {
  const parts = paragraph.match(/[^.!?…]+[.!?…]*/g) ?? [paragraph];
  return parts
    .map((s) => s.trim())
    .filter((s) => /\p{L}/u.test(s));
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
  const paragraphs = (narrationFor("parva", "adi-parva") ?? "").split(/\n{2,}/);
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
    const paragraphs = data.paragraphs ?? [];
    if (!paragraphs.length) throw new Error("prázdné");
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
