# Třetí kniha — připojení dávky (oddíly 65–80)

## Co udělám

- Připojím novou dávku za už vložené oddíly 3. knihy: dodané oddíly 65–80.
- Nový tematický nadpis z textu — Tírthajátrá Parva (od oddílu 80) — se zařadí za Nalópákhjánu; předchozí nadpisy zůstanou beze změny.
- Menu zůstává přesně jako u 1. a 2. knihy: tematické nadpisy, prostorná tlačítka „od. X“, hlavní přehrávač celé knihy i vlastní přehrávač u vybraného oddílu.
- Nikde se neobjeví hlášení o chybějících nebo nekompletních oddílech; čísla tlačítek jdou plynule podle skutečného pořadí textu.

## Co zůstává beze změny

Vzhled, barvy, rozložení, ilustrace, 1. a 2. kniha, postavy, zbraně, vyhledávání lupou i bezplatné předčítání hlasem zařízení.

## Technická část

- Nové soubory přidám do `src/data/texty-zdroje/vana-parva/` a znovu spustím `node scripts/build-book-text.mjs vana-parva`, který dávky poskládá podle čísla prvního oddílu a přepíše `public/texty/vana-parva.json`.
- Ve slovníku názvů podkapitol ve skriptu zkontroluji klíč `tirthayatra`, aby se nadpis zobrazil jako „Tírthajátrá Parva“.
- Kontrola: build, typecheck a průchod náhledem na `/knihy/vana-parva` (počet tlačítek, skupiny nadpisů, filtrování vybraného oddílu, oba přehrávače).
