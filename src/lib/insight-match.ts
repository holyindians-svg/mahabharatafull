/** Pure keyword matching for contextual insight links (no React, testable). */
export interface InsightKeywords { slug: string; keywords: string[] }
export type InsightPart = { text: string; slug?: string };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Builds one matcher; keyword = word-start prefix, the rest of the word is included (Czech declension). */
export function buildInsightMatcher(insights: InsightKeywords[]) {
  const entries = insights.flatMap((i) => i.keywords.filter(Boolean).map((k) => ({ k: k.normalize("NFC"), slug: i.slug })))
    .sort((a, b) => b.k.length - a.k.length);
  if (!entries.length) return null;
  const re = new RegExp(`(?<![\\p{L}\\p{M}])(?:${entries.map((e) => esc(e.k)).join("|")})[\\p{L}\\p{M}]*`, "giu");
  const slugFor = (word: string) => {
    const w = word.toLocaleLowerCase("cs");
    return entries.find((e) => w.startsWith(e.k.toLocaleLowerCase("cs")))?.slug;
  };
  return { re, slugFor };
}

export type InsightMatcher = NonNullable<ReturnType<typeof buildInsightMatcher>>;

/** Splits text; each slug is linked at most once per `used` set (one per paragraph). */
export function splitInsights(text: string, matcher: InsightMatcher | null, used: Set<string>): InsightPart[] {
  if (!matcher) return [{ text }];
  const parts: InsightPart[] = [];
  let last = 0;
  for (const m of text.normalize("NFC").matchAll(matcher.re)) {
    const slug = matcher.slugFor(m[0]);
    if (!slug || used.has(slug)) continue;
    used.add(slug);
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: m[0], slug });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
