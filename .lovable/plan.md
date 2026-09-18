# Oddíly první knihy: klikatelné menu a vlastní přehrávač

## Co uživatel získá

- Hlavní přehrávač celé Ádi Parvy zůstává přesně tak, jak je.
- Vedle textu vznikne posuvný seznam všech oddílů knihy (Oddíl I – CCXXXVI). Položky budou klikatelné.
- Po kliknutí na oddíl se pod seznamem zobrazí pouze text tohoto jednoho oddílu a k němu vlastní přehrávač, který přečte jen tento oddíl. Jedním kliknutím („Celá kniha") se výběr zruší.
- Stávající blok „Klíčové události" i sekce s postavami zůstávají nezměněné.
- Změna platí pouze pro první knihu; ostatní knihy vypadají a fungují stejně jako dnes.

## Vzhled

Žádné nové barvy ani nové rozložení stránky. Seznam oddílů a přehrávač oddílu používají stejné karty, rámečky, zlaté akcenty a typografii jako zbytek stránky knihy.

## Technické provedení

- `src/data/book-text.ts`: k načtenému textu se dopočítá rozdělení na oddíly. Nová funkce `sectionsOf(book: BookText)` vrátí `{ title, fromSegment, toSegment, paragraphFrom }[]` — hranice se poznají podle odstavců tvaru „Oddíl X" / „ODDÍL X" (regulární výraz na římské číslice), které už v textu jsou. Existující `loadBookSegments`, `toReadableParagraphs`, `paragraphIndexFor` a cache se nemění.
- `src/routes/knihy/$slug.tsx`: nový lokální stav `selected: number | null`. Seznam oddílů se vykreslí jen když `parva.slug === "adi-parva"` (konstanta `SECTION_NAV_BOOKS`), jinak stránka zůstává bit-shodná se současnou.
  - Seznam: `button` prvky v posuvném kontejneru (`max-h`, `overflow-y-auto`), aktivní položka zvýrazněná stejným stylem jako aktivní tlačítko rychlosti v přehrávači.
  - Při vybraném oddílu se vykreslí druhá instance `AudioPlayer` s `segments = book.segments.slice(from, to+1)` a odpovídajícím výřezem `paragraphIndex` (přeindexovaným od nuly), `title` = název oddílu, `subtitle` = `Ádi Parva · oddíl`, `minutes` = odhad z počtu slov, `progressKey` = `book:adi-parva:section:<n>`.
- `src/components/AudioPlayer.tsx` se nemění — už umí přehrát libovolné `segments` s vlastní pamětí pozice, zvýrazňováním slov a rychlostmi.
- Hlavní přehrávač celé knihy zůstává na svém místě s nezměněnými props.

## Kontrola

- Kliknutí na oddíl zobrazí právě jeho text; spuštění jeho přehrávače čte pouze tento oddíl a na konci oddílu skončí.
- Hlavní přehrávač celé knihy dál čte od začátku a pamatuje si pozici jako dosud.
- Stránky ostatních knih (např. Sabhá Parva) vypadají a fungují bez jakékoli změny.
