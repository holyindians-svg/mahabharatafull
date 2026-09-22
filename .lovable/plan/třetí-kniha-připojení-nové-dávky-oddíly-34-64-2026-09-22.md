# Třetí kniha — připojení nové dávky (oddíly 34–64)

## Co udělám

- Připojím novou dávku textů za už vložené oddíly 3. knihy: dodané oddíly 34–64 (bez oddílu 43, který v dávce není).
- Oddíly se zařadí pod jejich tematické nadpisy, které jsou v dodaném textu: Kairáta Parva, Indralókágamana Parva a Nalópákhjána Parva (navazují na Áranjaka, Kirmíravadha a Ardžunábhigamana z předchozí dávky).
- Menu zůstává přesně jako u 1. a 2. knihy: tematické nadpisy, prostorná tlačítka „od. X“, hlavní přehrávač celé knihy i vlastní přehrávač u vybraného oddílu.
- Žádné hlášení o chybějících nebo nekompletních oddílech se nikde neobjeví; čísla tlačítek jdou plynule za sebou podle skutečného pořadí textu.

## Co zůstává beze změny

Vzhled, barvy, rozložení, ilustrace, 1. a 2. kniha, postavy, zbraně, vyhledávání lupou i bezplatné předčítání hlasem zařízení.

## Technická část

- Nové soubory přidám do `src/data/texty-zdroje/vana-parva/` a znovu spustím `node scripts/build-book-text.mjs vana-parva`, který dávky poskládá podle čísla prvního oddílu a přepíše `public/texty/vana-parva.json`.
- Do slovníku názvů podkapitol ve skriptu doplním `indralokagamana` → „Indralókágamana Parva“ (kairata a nalopakhyana už tam jsou), aby se nadpisy zobrazily v české podobě.
- Kontrola: build, typecheck a průchod náhledem na `/knihy/vana-parva` (počet tlačítek, skupiny nadpisů, filtrování vybraného oddílu, oba přehrávače) plus rychlá kontrola `/knihy/adi-parva` a `/knihy/sabha-parva`, že jsou beze změny.
