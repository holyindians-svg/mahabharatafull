/** Křížové odkazy: výskyty jména entity v kanonických textech knih (titulky nebo plný text). */
import { FULL_TEXT_BOOKS, loadBookSegments, sectionsOf } from "@/data/book-text";
import { audiobookFor, loadCues } from "@/data/audiobooks";
import { parvas } from "@/data/parvas";

export interface Occurrence {
  bookSlug: string;
  bookName: string;
  sectionNumber: number;
  sentence: string;
  matchStart: number;
  matchEnd: number;
  /** Pořadí výskytu v rámci oddílu (0 = první). */
  ordinal: number;
}

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Kmen jména: hlavní slovo bez koncové samohlásky; krátká jména jen s pádovou koncovkou. */
export function nameMatcher(name: string): RegExp {
  const main = name.split(/[\s(–-]+/).filter(Boolean)[0] ?? name;
  const base = fold(main).replace(/[^a-z]/g, "");
  const stem = base.length > 4 ? base.replace(/[aeiouy]$/, "") : base.replace(/[aeiouy]$/, "");
  const suffix = base.length > 4 ? "[a-z]{0,6}" : "(?:a|y|e|u|ou|ovi|o|i|ov[a-z]{0,3})?";
  return new RegExp(`(?<![a-z])${stem}${suffix}(?![a-z])`, "g");
}

/** Najde shody v textu; vrací rozsahy v původním (nefoldovaném) řetězci. */
export function matchesIn(text: string, re: RegExp): [number, number][] {
  // NFD fold mění délky; mapujeme index po znacích.
  const map: number[] = [];
  let folded = "";
  [...text].forEach((ch, i) => {
    const f = fold(ch);
    for (let k = 0; k < f.length; k++) map.push(i);
    folded += f;
  });
  const chars = [...text];
  const offsets: number[] = [];
  let acc = 0;
  for (const c of chars) { offsets.push(acc); acc += c.length; }
  offsets.push(acc);
  const out: [number, number][] = [];
  re.lastIndex = 0;
  for (const m of folded.matchAll(re)) {
    const a = map[m.index] ?? 0;
    const b = (map[m.index + m[0].length - 1] ?? a) + 1;
    out.push([offsets[a] ?? 0, offsets[b] ?? acc]);
  }
  return out;
}

const sectionNumber = (title: string) => Number(/(\d+)/.exec(title)?.[1] ?? 0);

export async function findOccurrences(name: string): Promise<Occurrence[]> {
  const re = nameMatcher(name);
  const result: Occurrence[] = [];
  for (const slug of FULL_TEXT_BOOKS) {
    const bookName = parvas.find((p) => p.slug === slug)?.name ?? slug;
    const push = (n: number, sentences: string[]) => {
      let ordinal = 0;
      for (const sentence of sentences) {
        for (const [matchStart, matchEnd] of matchesIn(sentence, re)) {
          result.push({ bookSlug: slug, bookName, sectionNumber: n, sentence, matchStart, matchEnd, ordinal });
          ordinal += 1;
          break; // jedna položka na větu
        }
      }
    };
    try {
      const cuesUrl = audiobookFor(slug)?.cuesUrl;
      if (cuesUrl) {
        const cues = await loadCues(cuesUrl);
        for (const [n, list] of [...cues.entries()].sort((a, b) => a[0] - b[0])) push(n, list.map((c) => c[2]));
      } else {
        const book = await loadBookSegments(slug);
        for (const s of sectionsOf(book, slug)) {
          push(sectionNumber(s.title), book.segments.slice(s.fromSegment + 1, s.toSegment + 1));
        }
      }
    } catch {
      /* kniha nedostupná – přeskočit */
    }
  }
  return result;
}
