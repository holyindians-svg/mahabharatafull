# Výskyty se zvukem a zdobná čtečka

## Co uživatel uvidí

**1. Zvuk u výskytů**
- U každého výskytu z Knihy počátků (ta jediná má nahrávku) bude malé tlačítko Play. Pustí jen tu jednu větu přímo na stránce postavy a na jejím konci se samo zastaví. Druhé klepnutí přehrávání zastaví. Výskyty ze Sabhá a Vana Parvy zatím Play mít nebudou, protože k nim chybí nahrávka. Jakmile ji dostanou, Play se u nich objeví samo.
- Klepnutí na výskyt otevře čtečku jako dnes: sjede na správné místo a podrží zvýraznění. Nově se ve čtečce dole objeví úzký zlatý přehrávač, který začne hrát přesně od té věty. Má Play/Pauzu, posuvník a čas v rámci oddílu.
- Pokud telefon samotné spuštění zablokuje (hlavně iPhone), přehrávač zůstane připravený na té větě a stačí jedno klepnutí na Play.
- „Zavřít“ dál vrací na postavu, ze které jste přišli. Zvuk se při zavření zastaví.

**2. Lotosový rámeček místo podbarvení**
- Růžové podbarvení zmizí. Zvýrazněný odstavec dostane jen velmi lehký tmavý skleněný podklad, tenký rámeček ze starého zlata a ve čtyřech rozích malé zakroucené lotosové ornamenty.

**3. Epická nálada čtečky**
- Na pozadí čtečky bude sotva viditelný vodoznak mandaly s lotosem (průhlednost asi 4 %).
- Text čtečky už je v patkovém písmu Lora, nadpisy v Cinzelu, to zůstane. Přehrávač, posuvník a rámeček budou ve zlatých a bronzových odstínech aplikace.

## Technické detaily
- `occurrences.ts`: z titulků doplnit `time` a `endTime` (cue[0], cue[1]). Odkaz předá `cas` (start) vedle `zpet`. `validateSearch` přijme `cas` jako konečné číslo ≥ 0.
- Úryvek na stránce postavy: jeden sdílený `HTMLAudioElement` v modulu (`src/lib/snippet-audio.ts`) s `play(url, start, end)` a `stop()`. `timeupdate` pauzuje na `end`. Spouští se synchronně v onClick, chyby `play()` se zachytí. Ikona Play/Pause, `aria-label` a `press min-h-11 min-w-11`.
- Čtečka: nová `ReaderAudioBar` připojená jen při otevřeném oddílu knihy s `audiobookFor(slug)`. Využije existující `AudioPlayer` přes `ref.playRange(cas)`, pokud se vejde do kompaktního zobrazení. Jinak vznikne malý vlastní přehrávač s jedním audio prvkem pro overlay a sdílenými `formatTime`/`sectionProgress` z `reader-time`. Při zavření overlaye se odpojí a zastaví.
- Autoplay po navigaci: volat `play()` v efektu po připojení zdroje. Při zamítnutí zobrazit připravený stav bez chybové hlášky.
- `styles.css`: `--highlight` změnit na tmavý průsvitný podklad. Přidat `@utility lotus-frame`: rámeček `var(--gold)`/60, rohové ornamenty přes `::before`/`::after` a dvojí `background-image` s inline SVG lotosu (data URI, zlatá výplň), aby pokryly všechny 4 rohy. Přidat `@utility mandala-watermark` s fixním SVG vodoznakem na `::before` s opacity 0.04 a `pointer-events-none`. Žádné pevně zadané barvy Tailwindu, vše přes tokeny.
- Testy: rozšířit `occurrences.test.ts` o kontrolu, že výskyt z titulků nese čas. Ověřit v Playwrightu: proklik → audio `currentTime` ≈ `cas`, Play úryvku → pauza na konci, vzhled rámečku na snímku obrazovky.
