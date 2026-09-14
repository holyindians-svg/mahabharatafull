/**
 * Vyhledávání v plném českém textu Ádi Parvy (public/texty/adi-parva.json).
 * Vybere pasáže nejlépe odpovídající dotazu a předá je jako kontext pro AI.
 */

let cache: string[] | null = null;

const HEADING = /^Oddíl\s/i;

const STOPWORDS = new Set(
  [
    "a","aby","ale","ani","ano","asi","az","bez","bude","budes","budeme","by","byl","byla","bylo","byt",
    "co","coz","cim","dalsi","do","ho","i","jak","jake","jaky","jaka","jako","je","jeho","jej","jeji",
    "jen","jenz","jestli","ji","jim","jsem","jses","jsi","jsme","jsou","jste","k","kam","kde","kdo",
    "kdy","kdyz","ke","ktera","ktere","kteri","ktery","kterych","ku","ma","mate","me","mezi","mi","mit",
    "mne","mnou","muj","muze","my","na","nad","nam","nas","ne","nebo","nez","ni","nic","o","od","on",
    "ona","oni","ono","po","pod","pouze","pro","proc","proto","protoze","pred","pri","prosim","s","se",
    "si","sve","svuj","svych","ta","tak","take","takze","tam","te","tedy","ten","tento","teto","tim",
    "to","toho","tom","tomu","tu","ty","u","uz","v","vam","vas","ve","vice","vsak","vsechno","vsichni",
    "vy","z","za","ze","zda","ci","cili","jehoz","nebyl","mel","mela","meli","stalo","stal",
  ],
);

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

/** Načte odstavce textu; drží je v paměti serveru pro další dotazy. */
async function loadParagraphs(origin: string): Promise<string[]> {
  if (cache) return cache;
  try {
    const res = await fetch(`${origin}/texty/adi-parva.json`);
    if (!res.ok) return [];
    const json = (await res.json()) as { paragraphs?: unknown };
    const list = Array.isArray(json.paragraphs)
      ? json.paragraphs.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      : [];
    cache = list;
    return list;
  } catch {
    return [];
  }
}

function keywords(question: string): string[] {
  const seen = new Set<string>();
  for (const word of normalize(question).split(/\s+/)) {
    if (word.length < 3 || STOPWORDS.has(word)) continue;
    // Krátký kmen, aby se chytily i jiné pádové tvary.
    seen.add(word.length > 5 ? word.slice(0, word.length - 2) : word);
  }
  return [...seen];
}

const MAX_CHARS = 18000;
const MAX_SPOTS = 10;

/**
 * Vrátí nalezené pasáže z Ádi Parvy jako text pro model,
 * nebo prázdný řetězec, když se nic vhodného nenajde.
 */
export async function findAdiParvaPassages(
  question: string,
  origin: string,
): Promise<string> {
  const paragraphs = await loadParagraphs(origin);
  if (paragraphs.length === 0) return "";

  const keys = keywords(question);
  if (keys.length === 0) return "";

  const scored: { index: number; score: number }[] = [];
  paragraphs.forEach((paragraph, index) => {
    if (HEADING.test(paragraph)) return;
    const text = normalize(paragraph);
    let score = 0;
    for (const key of keys) {
      let from = 0;
      let hits = 0;
      while (hits < 3) {
        const at = text.indexOf(key, from);
        if (at === -1) break;
        hits += 1;
        from = at + key.length;
      }
      if (hits > 0) score += 1 + (hits - 1) * 0.3;
    }
    if (score > 0) scored.push({ index, score });
  });

  if (scored.length === 0) return "";

  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  // Nejlepší místa + sousední odstavce, aby pasáž měla souvislost.
  const chosen = new Set<number>();
  const spots: number[] = [];
  for (const { index } of scored) {
    if (spots.length >= MAX_SPOTS) break;
    if (spots.some((s) => Math.abs(s - index) <= 2)) continue;
    spots.push(index);
    for (let i = index - 1; i <= index + 1; i += 1) {
      if (i >= 0 && i < paragraphs.length) chosen.add(i);
    }
  }

  const nearestHeading = (index: number) => {
    for (let i = index; i >= 0 && i > index - 60; i -= 1) {
      const paragraph = paragraphs[i];
      if (paragraph && HEADING.test(paragraph)) return paragraph;
    }
    return null;
  };

  const blocks: string[] = [];
  let length = 0;
  for (const index of spots.sort((a, b) => a - b)) {
    const heading = nearestHeading(index);
    const lines: string[] = [];
    for (let i = index - 1; i <= index + 1; i += 1) {
      const paragraph = paragraphs[i];
      if (i >= 0 && paragraph && chosen.has(i) && !HEADING.test(paragraph)) lines.push(paragraph);
    }
    const block = `${heading ? `[${heading}]\n` : ""}${lines.join("\n")}`;
    if (length + block.length > MAX_CHARS) break;
    blocks.push(block);
    length += block.length;
  }

  return blocks.join("\n\n---\n\n");
}
