/**
 * Sestaví `public/texty/<slug>.json` z dávek zdrojových textů uložených
 * v `src/data/texty-zdroje/<slug>/*.txt`.
 *
 * Každá dávka je obyčejný text: nadpisy oddílů ve tvaru „Sekce N“ / „Oddíl N“,
 * odstavce oddělené prázdným řádkem, volitelný řádek s názvem podkapitoly
 * (např. „Aranyaka Parva (Sekce 1-10)“). Soubory se řadí podle čísla prvního
 * oddílu, takže novou dávku stačí přidat a skript spustit znovu.
 *
 * Použití: node scripts/build-book-text.mjs vana-parva
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const slug = process.argv[2];
if (!slug) {
  console.error("Použití: node scripts/build-book-text.mjs <slug>");
  process.exit(1);
}

const srcDir = join("src/data/texty-zdroje", slug);
const HEADING = /^[#*\s]*(oddíl|sekce)\s+([ivxlcdm]+|\d+)\.?[*\s]*$/iu;

/** Názvy podkapitol v kanonické české podobě. */
const SUBPARVA_LABEL = {
  aranyaka: "Áranjaka Parva",
  aranjaka: "Áranjaka Parva",
  kairata: "Kairáta Parva",
  kirata: "Kairáta Parva",
  tirthayatra: "Tírthajátrá Parva",
  jatasuravadha: "Džatásuravadha Parva",
  yakshayuddha: "Jakšajuddha Parva",
  ajagara: "Adžagara Parva",
  markandeyasamasya: "Márkandéjasamásjá Parva",
  draupadisatyabhamasamvada: "Draupadí-Satjabhámá Parva",
  ghoshayatra: "Ghóšajátrá Parva",
  mrgasvapnabhaya: "Mrgasvapna Parva",
  vrihidraunika: "Vrihidraunika Parva",
  draupadiharana: "Draupadíharana Parva",
  kundalaharana: "Kundalaharana Parva",
  araneya: "Áranéja Parva",
  kirmirabadha: "Kirmíravadha Parva",
  kirmiravadha: "Kirmíravadha Parva",
  arjunabhigamana: "Ardžunábhigamana Parva",
  indralokabhigamana: "Indralókábhigamana Parva",
  nalopakhyana: "Nalópákhjána Parva",
  indralokagamana: "Indralókágamana Parva",
  tirthayatraparva: "Tírthajátrá Parva",
  nivatakavachayuddha: "Nivátakavača Parva",
  brihadaranyaka: "Brhadáranjaka Parva",
};

function key(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function firstSectionNumber(text) {
  for (const line of text.split(/\r?\n/)) {
    const m = HEADING.exec(line.trim());
    if (m) {
      const raw = m[2];
      if (/^\d+$/.test(raw)) return Number(raw);
      const roman = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
      const chars = raw.toLowerCase().split("");
      let n = 0;
      chars.forEach((ch, i) => {
        const v = roman[ch] ?? 0;
        const next = roman[chars[i + 1]] ?? 0;
        n += v < next ? -v : v;
      });
      return n;
    }
  }
  return Number.MAX_SAFE_INTEGER;
}

const files = readdirSync(srcDir)
  .filter((f) => f.toLowerCase().endsWith(".txt"))
  .map((f) => {
    const text = readFileSync(join(srcDir, f), "utf8");
    return { f, text, n: firstSectionNumber(text) };
  })
  .sort((a, b) => a.n - b.n || a.f.localeCompare(b.f));

const paragraphs = [];
let lastGroup = null;

const SUBPARVA_LINE = /^([^()]{2,60}?)\s*parva\b[^()]*(\((?:sekce|oddíl)[^()]*\))?\s*$/i;

for (const { text } of files) {
  // Nadpisy oddílů a názvy podkapitol osamostatníme na vlastní blok.
  const prepared = text
    .split(/\r?\n/)
    .map((line) => {
      const t = line.trim();
      if (HEADING.test(t) || (SUBPARVA_LINE.test(t) && t.length < 80)) {
        return `\n${t}\n`;
      }
      return line;
    })
    .join("\n");

  const blocks = prepared
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.replace(/\s+/g, " ").trim())
    .filter(Boolean);


  for (const block of blocks) {
    // Titul celé knihy přeskočíme.
    if (/^kniha\s+\d+\s*:/i.test(block)) continue;

    // Řádek s názvem podkapitoly, např. „Aranyaka Parva (Sekce 1-10)“.
    const sub = /^([^()]{2,60}?)\s*parva\b[^()]*(\((?:sekce|oddíl)[^()]*\))?\s*$/i.exec(
      block,
    );
    if (sub && !HEADING.test(block)) {
      const label = SUBPARVA_LABEL[key(sub[1])] ?? `${sub[1].trim()} Parva`;
      if (label !== lastGroup) {
        paragraphs.push(`(${label})`);
        lastGroup = label;
      }
      continue;
    }

    if (HEADING.test(block)) {
      paragraphs.push(block.replace(HEADING, (_, __, num) => `Sekce ${num}`));
      continue;
    }

    paragraphs.push(block);
  }
}

mkdirSync("public/texty", { recursive: true });
writeFileSync(
  join("public/texty", `${slug}.json`),
  `${JSON.stringify({ paragraphs }, null, 0)}\n`,
);

const sections = paragraphs.filter((p) => HEADING.test(p)).length;
console.log(
  `${slug}: ${files.length} dávek, ${paragraphs.length} odstavců, ${sections} oddílů`,
);
