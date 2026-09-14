/**
 * Vyhledávání v plném textu Mahábháraty (public/texty/mahabharata/cast-1..4.json).
 * Epos je rozdělený na čtyři části; podle tématu dotazu se vyberou nejvhodnější
 * části, v nich se najdou nejlépe odpovídající pasáže a ty se předají jako
 * kontext pro AI. Každý blok nese název knihy (Parvy), odkud pochází.
 */

type Book = { book: number; name: string; paragraphs: string[] };
type Part = { part: number; books: Book[] };

/** V paměti serveru držíme nejvýše dvě části, aby nerostla spotřeba paměti. */
const cache = new Map<number, Part>();
const MAX_CACHED_PARTS = 2;

const HEADING = /^(Oddíl|Section)\s/i;

const STOPWORDS = new Set([
  "a","aby","ale","ani","ano","asi","az","bez","bude","budes","budeme","by","byl","byla","bylo","byt",
  "co","coz","cim","dalsi","do","ho","i","jak","jake","jaky","jaka","jako","je","jeho","jej","jeji",
  "jen","jenz","jestli","ji","jim","jsem","jses","jsi","jsme","jsou","jste","k","kam","kde","kdo",
  "kdy","kdyz","ke","ktera","ktere","kteri","ktery","kterych","ku","ma","mate","me","mezi","mi","mit",
  "mne","mnou","muj","muze","my","na","nad","nam","nas","ne","nebo","nez","ni","nic","o","od","on",
  "ona","oni","ono","po","pod","pouze","pro","proc","proto","protoze","pred","pri","prosim","s","se",
  "si","sve","svuj","svych","ta","tak","take","takze","tam","te","tedy","ten","tento","teto","tim",
  "to","toho","tom","tomu","tu","ty","u","uz","v","vam","vas","ve","vice","vsak","vsechno","vsichni",
  "vy","z","za","ze","zda","ci","cili","jehoz","nebyl","mel","mela","meli","stalo","stal",
]);

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

/**
 * Tematická vodítka pro směrování dotazu do části eposu.
 * Uvádíme české i anglické podoby jmen, aby se chytily oba přepisy.
 */
const PART_HINTS: Record<number, string[]> = {
  1: [
    "adi","sabha","sabhá","vana","virata","udjoga","udyoga","kostky","hra v kostky","sazka",
    "santanu","bhisma mladi","satjavati","kunti","pandu","dhritarastra","vidura","drona ucitel",
    "ekalavja","drupada","draupadi svatba","svajamvara","hidimbi","ghatotkaca","laksagriha",
    "vyhnanstvi","exil","les","poustevna","virataovo","utajeni","poselstvo","krisna posel",
    "sanjaya","mir","jarasandha","dzarasandha","rajasuja","obet","sakuni","sakuniho","zrozeni",
    "narozeni","astika","parikshit","janamedzaja","sarpa","hadi","bhrigu","cjavana","jajati",
  ],
  2: [
    "bhisma","bhishma","drona","karna","salja","shalya","kurukshetra","kurukšétra","kuruksetra",
    "bitva","valka","boj","bojiste","bhagavadgita","gita","gíta","bhagavad","vozataj",
    "sikhandi","abhimanju","dzajadratha","jayadratha","kolo vozu","abhimanjuova","desateho dne",
    "sipy","luk","gandiva","astra","brahmastra","narajanastra","vasavi","sakti","souboj",
    "duel","duryodhana boj","durjodhana boj","kricovna","gada","palice","stret","armada",
  ],
  3: [
    "sauptika","asvatthama","aswatthama","stri","zeny","plac","gandhari klet","santi","shanti",
    "anusasana","aswamedha","asvamedhika","judhisthira vlada","kral","povinnost","dharma",
    "moudrost","poučeni","pouceni","filozofie","osvobozeni","moksa","yoga","joga","asketa",
    "obet kone","asvamedha","danadharma","rajadharma","mokshadharma","bhisma poucuje",
    "nocni prepad","spici","pohreb","kremace","kletba","utrpeni","vysvobozeni",
  ],
  4: [
    "asramavasika","ašramavásika","mausala","mahaprasthanika","svargarohanika","swargarohanika",
    "odchod","posledni cesta","himalaje","pes","nebe","raj","svarga","smrt dhritarastry",
    "zkaza jaduovcu","jaduovci","potopa dvaraky","dvaraka","konec eposu","konec","zaver",
    "kunti smrt","gandhari smrt","lesni","poustevnicky zivot","vystup do nebe",
  ],
};

/** Části, které se prohledají, když téma dotazu nelze rozpoznat. */
const FALLBACK_PARTS = [2, 3];

/** Vybere jednu až dvě části eposu, kam dotaz tematicky patří. */
export function pickParts(question: string): number[] {
  const text = ` ${normalize(question)} `;
  const scores = new Map<number, number>();
  for (const [part, hints] of Object.entries(PART_HINTS)) {
    let score = 0;
    for (const hint of hints) {
      const key = normalize(hint).trim();
      if (key.length >= 3 && text.includes(` ${key}`)) score += 1;
    }
    if (score > 0) scores.set(Number(part), score);
  }
  if (scores.size === 0) return FALLBACK_PARTS;
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, 2)
    .map(([part]) => part);
}

async function loadPart(part: number, origin: string): Promise<Part | null> {
  const cached = cache.get(part);
  if (cached) return cached;
  try {
    const res = await fetch(`${origin}/texty/mahabharata/cast-${part}.json`);
    if (!res.ok) return null;
    const json = (await res.json()) as Partial<Part>;
    if (!Array.isArray(json.books)) return null;
    const value: Part = {
      part,
      books: json.books
        .filter((b): b is Book => !!b && Array.isArray(b.paragraphs))
        .map((b) => ({
          book: b.book,
          name: b.name,
          paragraphs: b.paragraphs.filter(
            (p): p is string => typeof p === "string" && p.trim().length > 0,
          ),
        })),
    };
    if (cache.size >= MAX_CACHED_PARTS) {
      const oldest = cache.keys().next().value;
      if (typeof oldest === "number") cache.delete(oldest);
    }
    cache.set(part, value);
    return value;
  } catch {
    return null;
  }
}

/**
 * Most mezi českým dotazem a anglickým Ganguliho překladem: k českému kmeni
 * se přidají anglické podoby jmen a klíčových pojmů, aby se pasáže našly
 * i v knihách 2–18.
 */
const BRIDGE: Record<string, string[]> = {
  ardzun: ["arjun"], krisn: ["krishn", "vasudev"], judhisthir: ["yudhishthir"],
  bhism: ["bhishm"], drona: ["drona"], dron: ["drona"], karn: ["karna"],
  salj: ["shalya"], sakun: ["shakuni"], durjodhan: ["duryodhan"],
  dusasan: ["dushasan", "duhshasan"], draupad: ["draupadi", "krishnaa"],
  bhim: ["bhima", "bhimasena"], nakul: ["nakula"], sahadev: ["sahadeva"],
  abhimanj: ["abhimanyu"], asvatthama: ["ashvatthama", "aswatthaman"],
  satjak: ["satyaki"], dzajadrath: ["jayadratha"], vjas: ["vyasa"],
  dhritarastr: ["dhritarashtra"], gandhar: ["gandhari"], vidur: ["vidura"],
  kunt: ["kunti", "pritha"], pandu: ["pandu", "pandava"], panduovc: ["pandava"],
  kaurav: ["kaurava", "kuru"], sikhand: ["shikhandi"], virat: ["virata"],
  drupad: ["drupada"], ghatotkac: ["ghatotkacha"], hidimb: ["hidimba"],
  kurukshetr: ["kurukshetra"], kuruksetr: ["kurukshetra"],
  kostk: ["dice", "gambling"], hra: ["game", "dice"], sazk: ["stake", "wager"],
  valk: ["war", "battle"], bitv: ["battle"], boj: ["battle", "fight"],
  smrt: ["death", "slain"], zemrel: ["slain", "death"], zabil: ["slew", "slain"],
  luk: ["bow"], sip: ["arrow"], zbran: ["weapon"], mec: ["sword"],
  palic: ["mace"], vuz: ["chariot"], slon: ["elephant"], kun: ["horse", "steed"],
  kral: ["king"], kralovn: ["queen"], syn: ["son"], bratr: ["brother"],
  matk: ["mother"], otec: ["father"], zena: ["wife", "woman"],
  kletb: ["curse"], obet: ["sacrifice"], nebe: ["heaven"], peklo: ["hell"],
  bohov: ["gods", "celestials"], mudrc: ["sage", "rishi"], asket: ["ascetic"],
  vyhnanstv: ["exile"], les: ["forest", "woods"], poust: ["hermitage"],
  poucen: ["instruction", "duties"], moudrost: ["wisdom"], dharm: ["dharma", "duty"],
  bhagavadgit: ["bhagavad", "krishna said"], git: ["bhagavad"],
  osvobozen: ["emancipation"], joga: ["yoga"], mok: ["emancipation"],
  odchod: ["departure", "journey"], pes: ["dog"], meru: ["meru", "himavat"],
  dvarak: ["dvaraka", "dwaraka"], jaduovc: ["yadava", "vrishni"],
};

function keywords(question: string): string[] {
  const seen = new Set<string>();
  const add = (word: string) => {
    seen.add(word);
    for (const [czech, english] of Object.entries(BRIDGE)) {
      if (word.startsWith(czech) || czech.startsWith(word)) {
        for (const value of english) seen.add(value);
      }
    }
  };
  for (const word of normalize(question).split(/\s+/)) {
    if (word.length < 3 || STOPWORDS.has(word)) continue;
    // Krátký kmen, aby se chytily i jiné pádové tvary.
    add(word.length > 5 ? word.slice(0, word.length - 2) : word);
  }
  return [...seen];
}

const MAX_CHARS = 18000;
const MAX_SPOTS = 10;

type Spot = { bookName: string; index: number; score: number; paragraphs: string[] };

function searchBook(book: Book, keys: string[]): Spot[] {
  const spots: Spot[] = [];
  book.paragraphs.forEach((paragraph, index) => {
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
    if (score > 0) spots.push({ bookName: book.name, index, score, paragraphs: book.paragraphs });
  });
  return spots;
}

/**
 * Vrátí nalezené pasáže z eposu jako text pro model,
 * nebo prázdný řetězec, když se nic vhodného nenajde.
 */
export async function findEposPassages(
  question: string,
  origin: string,
): Promise<string> {
  const keys = keywords(question);
  if (keys.length === 0) return "";

  const parts = pickParts(question);
  const all: Spot[] = [];
  for (const part of parts) {
    const loaded = await loadPart(part, origin);
    if (!loaded) continue;
    for (const book of loaded.books) all.push(...searchBook(book, keys));
  }
  if (all.length === 0) return "";

  all.sort((a, b) => b.score - a.score || a.index - b.index);

  const picked: Spot[] = [];
  for (const spot of all) {
    if (picked.length >= MAX_SPOTS) break;
    if (
      picked.some((p) => p.bookName === spot.bookName && Math.abs(p.index - spot.index) <= 2)
    ) {
      continue;
    }
    picked.push(spot);
  }

  const blocks: string[] = [];
  let length = 0;
  for (const spot of picked) {
    const lines: string[] = [];
    for (let i = spot.index - 1; i <= spot.index + 1; i += 1) {
      const paragraph = spot.paragraphs[i];
      if (i >= 0 && paragraph && !HEADING.test(paragraph)) lines.push(paragraph);
    }
    const block = `[Kniha: ${spot.bookName}]\n${lines.join("\n")}`;
    if (length + block.length > MAX_CHARS) break;
    blocks.push(block);
    length += block.length;
  }

  return blocks.join("\n\n---\n\n");
}
