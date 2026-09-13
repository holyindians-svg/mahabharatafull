# Plynulý poslech celé Ádi Parvy se sledováním textu

Cíl: první kniha se přehraje jako audiokniha od začátku do konce, bez vyhledávání a bez dotazů přes klíč, a v textovém okně se právě čtená věta zvýrazní a sama posune do zorného pole.

## Co potřebuji od vás

Zatím není nahraný žádný text knihy — v aplikaci je pouze původní zadání. Nahrajte prosím český text Ádi Parvy (soubor .md, .txt nebo .docx). Text uložím do aplikace přesně tak, jak jste ho dodali. Do té doby zůstane přehrávání u této knihy jako dnes.

## Co se udělá

### 1. Uložení celé knihy do aplikace
- Nahraný text se rozdělí na kapitoly a odstavce a uloží se trvale dovnitř aplikace.
- Pro poslech se z něj skládá jedno plynulé předčítání: běží od začátku do konce, další úsek se připravuje, zatímco předchozí ještě zní, takže mezi kapitolami není pauza ani čekání.
- Žádné vyhledávání, žádný dotaz přes klíč — text je vždy stejný a dostupný okamžitě.

### 2. Sledování textu při čtení
- V textovém okně, které se otevře při přehrávání, se právě čtená věta zvýrazní.
- Okno se k této větě samo plynule posune; posunete-li text ručně, automatické posouvání se na chvíli zastaví a pak se vrátí.
- Kliknutí na větu začne čtení od ní.

### 3. Ovládání zůstává
- Tlačítko přehrát/pauza, ukazatel průběhu, rychlosti 1× / 1,25× / 1,5×, tlačítko na začátek a ztlumení fungují jako dnes, jen nad celou knihou.
- Ukazatel průběhu ukazuje pozici v celé knize a přetažením lze skočit na jiné místo.

## Co se nemění
- Vzhled, barvy, rozvržení, ilustrace, ikony.
- Postavy, knihy, zbraně, popisy, navigace, žádná nová tlačítka ani okna.
- Ostatní knihy, postavy a zbraně zůstanou přesně jak jsou.

## Technické detaily
- `src/data/adi-parva-text.ts` — nový statický modul: pole kapitol (`{ title, paragraphs }`) z nahraného souboru; bez databáze a bez síťového volání.
- `src/lib/speak.ts` — `speak()` dostane volitelný `onSegment(index)`: úseky z `chunkText` se dále dělí na věty, u každé se podle naplánovaného času zvuku ohlásí začátek čtení; přidá se `seekTo(index)` pro start od zvolené věty a průběžné doplňování dalších úseků, aby dlouhý text nezahltil paměť.
- `src/components/AudioPlayer.tsx` — nový volitelný prop `segments?: string[]` (věty celé knihy). Když je předán, `togglePlay` čte tuto řadu; stav `activeSegment` řídí zvýraznění (`bg-primary/10 text-foreground`) a `scrollIntoView({ block: "center" })` v existující ploše s textem; ruční posun zjištěn z `scroll` eventu. Bez `segments` se komponenta chová přesně jako dnes.
- `src/routes/knihy/$slug.tsx` — pro `adi-parva` předá `segments` z nového modulu, jinak dosavadní `presetText`.
- Bez nových závislostí; `/api/chat` se pro tuto knihu nevolá, `/api/speech` beze změny.
