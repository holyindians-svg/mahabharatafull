/** Zvýraznění cílového jména entity (kořenový regex kvůli skloňování). */
import { matchesIn, namePattern } from "@/lib/occurrences";

export interface TextPart { text: string; entity: boolean }

export function highlightSegments(text: string, names: string[]): TextPart[] {
  const source = names.map(namePattern).filter(Boolean).join("|");
  if (!source) return [{ text, entity: false }];
  const re = new RegExp(source, "g");
  const parts: TextPart[] = [];
  let at = 0;
  for (const [a, b] of matchesIn(text, re)) {
    if (a > at) parts.push({ text: text.slice(at, a), entity: false });
    parts.push({ text: text.slice(a, b), entity: true });
    at = b;
  }
  if (at < text.length || !parts.length) parts.push({ text: text.slice(at), entity: false });
  return parts;
}
