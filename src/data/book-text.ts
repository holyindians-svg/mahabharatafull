import { narrationFor } from "./narrations";

/**
 * Úplné české znění knih, které jsou v aplikaci uložené celé
 * (`public/texty/<slug>.json` — pole odstavců v češtině). Text se načte
 * jednou při otevření knihy a dál se nikam nedotazuje — žádný klíč,
 * žádné čekání.
 */

/** Knihy, u kterých je v aplikaci uložené úplné české znění. */
export const FULL_TEXT_BOOKS = ["adi-parva", "sabha-parva", "vana-parva"] as const;

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
  /** Název podkapitoly u knih s tematicky členěným menu. */
  group?: string;
}

const SECTION_HEADING =
  /^[#*\s]*(oddíl|sekce)\s+([ivxlcdm]+|\d+)\.?[*\s]*$/iu;

/**
 * Přepíše nadpisy oddílů na arabské číslice podle skutečného pořadí v textu
 * („Oddíl 1“, „Oddíl 2“, …). Římská čísla ve zdroji nejsou spolehlivá, proto
 * se čísluje průběžně — pořadí odstavců se nijak nemění.
 */
function renumberSections(paragraphs: string[]): string[] {
  let n = 0;
  return paragraphs.map((p) => {
    if (SECTION_HEADING.test(p.trim())) {
      n += 1;
      return `Oddíl ${n}`;
    }
    return p;
  });
}

/** Knihy, u kterých se v seznamu oddílů seskupují podle podkapitol. */
const SECTION_GROUP_BOOKS = ["adi-parva", "sabha-parva", "vana-parva"];

/** Výchozí nadpis před prvním podnázvem každé tematicky členěné knihy. */
const SUBPARVA_DEFAULT: Record<string, string> = {
  "adi-parva": "Parvasamgraha",
  "sabha-parva": "Sabhá Parva",
  "vana-parva": "Vana Parva",
};

/** Kanonické názvy podkapitol pro zobrazení. */
const SUBPARVA_CANON: Record<string, string> = {
  pausja: "Paušja",
  pauloma: "Paulóma",
  astika: "Ástika",
  adivansavatarana: "Ádivanšávatárana",
  sambhava: "Sambhava",
  dzatugriha: "Džatugriha",
  hidimbavadha: "Hidimbavadha",
  vakavadha: "Vákavadha",
  caitraratha: "Čaitraratha",
  svajamvara: "Svajamvara",
  vaivahika: "Vaiváhika",
  viduragamana: "Vidurágamana",
  radzjalabha: "Rádžja-lábha",
  ardzunavanavasa: "Ardžunavanavása",
  ardzununvanavasa: "Ardžunavanavása",
  subhadraharana: "Subhádraharana",
  haranaharana: "Haranaharana",
  khandavadaha: "Khandavadaha",
  jatugriha: "Džatugriha",
  hidimvavadha: "Hidimbavadha",
  hidimbavadha2: "Hidimbavadha",
  vakavadha2: "Vákavadha",
  svajamvary: "Svajamvara",
  ardzunuvvanavasa: "Ardžunavanavása",
  subhadraharana2: "Subhádraharana",
  digvidzaja: "Digvidžaja Parva",
  arghjaharana: "Arghjaharana Parva",
};

/** Sjednocený klíč názvu: bez diakritiky, mezer, pomlček a interpunkce. */
function normalizeNameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-\s]+/g, "");
}

/** Podnázev podkapitoly z odstavce tvaru „(Paušja Parva)“ — bez „pokračování“. */
function subparvaNameFrom(text: string): string | undefined {
  const match = /^\(([^()]{2,60})\)$/.exec(text.trim());
  if (!match) return undefined;
  const inner = match[1];
  if (!inner) return undefined;
  if (!/\bparva\b/i.test(inner)) return undefined;
  const name = inner
    .replace(/pokra[čc]\p{L}*/giu, "")
    .replace(/[.,;:!?*]+/g, " ")
    .replace(/parv\p{L}*/giu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!name) return undefined;
  return name;
}

/** Rozdělí knihu na oddíly podle nadpisů, které už v textu jsou. */
export function sectionsOf(book: BookText, slug?: string): BookSection[] {
  const withGroups = !!slug && SECTION_GROUP_BOOKS.includes(slug);
  const sections: BookSection[] = [];
  let currentGroup = (slug && SUBPARVA_DEFAULT[slug]) || "";
  book.segments.forEach((segment, index) => {
    if (withGroups) {
      const name = subparvaNameFrom(segment);
      if (name) {
        currentGroup =
          SUBPARVA_CANON[normalizeNameKey(name)] ?? `${name} Parva`;
      }
    }
    if (SECTION_HEADING.test(segment.trim())) {
      sections.push({
        title: segment.trim(),
        fromSegment: index,
        toSegment: index,
        ...(withGroups ? { group: currentGroup } : {}),
      });
    } else {
      const last = sections[sections.length - 1];
      if (last) {
        last.toSegment = index;
        if (withGroups) last.group = currentGroup;
      }
    }
  });
  return sections;
}


/** Náhradní obsah, dokud se úplné znění nenačte. */
export function bookFallback(slug: string): BookText {
  const paragraphs = renumberSections(
    toReadableParagraphs((narrationFor("parva", slug) ?? "").split(/\n{2,}/)),
  );
  return {
    segments: paragraphs.flatMap(toSentences),
    paragraphIndex: paragraphIndexFor(paragraphs),
  };
}

const cache = new Map<string, BookText>();

function toBookText(sourceParagraphs: string[]): BookText {
  const paragraphs = renumberSections(toReadableParagraphs(sourceParagraphs));
  return {
    segments: paragraphs.flatMap(toSentences),
    paragraphIndex: paragraphIndexFor(paragraphs),
  };
}

/** Zapomene zpracovanou knihu (po stažení nové verze). */
export function forgetBook(slug: string) {
  cache.delete(slug);
}

/** Věty celé knihy v pořadí čtení — nejdřív z paměti telefonu, jinak ze sítě. */
export async function loadBookSegments(slug: string): Promise<BookText> {
  const cached = cache.get(slug);
  if (cached) return cached;
  const { getStoredBook, downloadBook, currentVersions } = await import("@/lib/text-store");
  let stored = await getStoredBook(slug);
  if (!stored) {
    const versions = await currentVersions();
    stored = await downloadBook(slug, versions?.[slug]?.hash);
  }
  const value = stored?.paragraphs.length ? toBookText(stored.paragraphs) : bookFallback(slug);
  if (stored) cache.set(slug, value);
  return value;
}
