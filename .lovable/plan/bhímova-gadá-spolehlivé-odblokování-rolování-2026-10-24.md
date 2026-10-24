# Bhímova Gadá – spolehlivé odblokování rolování

## Co uživatel získá
Po úvodu (dohrání i přeskočení) jde stránka vždy hned rolovat prstem i kolečkem, na iPhonu, Androidu i počítači. Když se video na telefonu nespustí, stránka se sama odemkne nejpozději po pár sekundách.

## Oprava
- Odstraním blokování dotyků a kolečka na celém okně. Během úvodu stačí, že video překrývá celou obrazovku; rolování pozadí se zamezí jen dočasným skrytím posuvníku stránky.
- Zámek se uvolní hned na začátku smršťování videa, ne až po jeho konci.
- Pojistka: pokud video neskončí ani nepošle signál konce (zablokované přehrávání, výpadek sítě), úvod se po uplynutí délky videa + rezervě sám ukončí a stránku odemkne.
- Úklid při odchodu ze stránky během úvodu vrátí stránku do normálního stavu.

## Technické detaily
- `AstraIntroVideo.tsx`: smazat `wheel`/`touchmove` `preventDefault` listenery; během `phase === "intro"` nastavit `overflow: hidden` na `html`/`body` s obnovou v cleanup efektu (spustí se při přechodu do `shrinking`).
- Záložní `setTimeout` (podle `duration`, jinak 12 s), který zavolá `finish()`; zrušit v cleanup.
- Ověření v Playwrightu (390 px i 1280 px): přeskočení i přirozené dohrání → `scrollY > 0` po kolečku a dotykovém gestu, `overflow` na `body`/`html` prázdný.
