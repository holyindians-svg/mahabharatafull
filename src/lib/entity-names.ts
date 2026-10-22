/** Jména z encyklopedie (postavy, mudrci, zbraně) pro zářící zvýraznění v textu čteček. */
import { characters } from "@/data/characters";
import { astras } from "@/data/astras";
import { matchesIn, namePattern } from "@/lib/occurrences";

export interface TextPart { text: string; entity: boolean }

const ALL_NAMES = [...characters.map((c) => c.name), ...astras.map((a) => a.name)];
const cache = new Map<string, RegExp>();

function matcher(extra?: string): RegExp {
  const key = extra ?? "";
  let re = cache.get(key);
  if (!re) {
    const patterns = [...new Set([...ALL_NAMES, ...(extra ? [extra] : [])].map(namePattern).filter(Boolean))]
      .sort((a, b) => b.length - a.length);
    re = new RegExp(patterns.join("|") || "(?!)", "g");
    cache.set(key, re);
  }
  return re;
}

export function highlightSegments(text: string, extra?: string, names?: string[]): TextPart[] {
  const re = names ? new RegExp(names.map(namePattern).filter(Boolean).join("|") || "(?!)", "g") : matcher(extra);
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
