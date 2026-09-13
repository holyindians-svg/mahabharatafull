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
  return parts.map((s) => s.trim()).filter(Boolean);
}

/** Náhradní text, dokud se úplné znění nenačte. */
export function adiParvaFallbackSegments(): string[] {
  const fallback = narrationFor("parva", "adi-parva") ?? "";
  return fallback.split(/\n{2,}/).flatMap(toSentences);
}

let cache: string[] | null = null;

/** Věty celé knihy v pořadí čtení. */
export async function loadAdiParvaSegments(): Promise<string[]> {
  if (cache) return cache;
  try {
    const res = await fetch("/texty/adi-parva.json");
    if (!res.ok) throw new Error("nedostupné");
    const data = (await res.json()) as { paragraphs?: string[] };
    const paragraphs = data.paragraphs ?? [];
    if (!paragraphs.length) throw new Error("prázdné");
    cache = paragraphs.flatMap(toSentences);
    return cache;
  } catch {
    cache = adiParvaFallbackSegments();
    return cache;
  }
}
