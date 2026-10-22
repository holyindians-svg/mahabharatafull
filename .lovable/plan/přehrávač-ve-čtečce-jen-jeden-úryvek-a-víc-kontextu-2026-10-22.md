# Přehrávač ve čtečce: jen jeden úryvek a víc kontextu

## Co uživatel uvidí
- **Jen ten jeden úryvek:** když přijdete z výskytu u postavy, přehraje se jen věta, na kterou jste klikli. Na jejím konci se zvuk sám zastaví a dál do děje nepokračuje. Když pak sami stisknete Play, nahrávka normálně pokračuje dál.
- **Kde jste:** nad posuvníkem bude drobným zlatavě šedým písmem napsáno například „Kniha počátků (Ádi Parva) • Oddíl 129 · Sambhava“. Oddíly v textu nemají vlastní názvy, proto se místo nich ukáže název podkapitoly, pod kterou oddíl patří.
- **Čas od začátku knihy:** vedle posuvníku bude čas od začátku celé nahrávky a její celková délka, například „15:06:36 / 26:03:56“. Posuvník dál přetáčí jen v rámci oddílu.
- Tlačítko Play/Pauza zůstane hlavním prvkem a nové texty budou menší a ztlumené.

## Technické detaily
- `Occurrences.tsx`: odkaz předá vedle `cas` i `konec` (`endTime` věty). `validateSearch` v `knihy-ke-cteni.tsx` přijme `konec` jako konečné číslo větší než `cas`.
- `ReaderAudioBar`: nový prop `stopAt`. V `requestAnimationFrame` smyčce, která běží jen při přehrávání, se při `currentTime >= stopAt` zavolá `pause()` a `stopAt` se zruší (ref), takže další Play pokračuje volně. Stávající zastavení na konci oddílu zůstane.
- `ReaderAudioBar` dostane navíc `context` (text) a čas zobrazí jako `formatTime(currentTime) / formatTime(audio.duration)`. Délka se načte z `loadedmetadata`, do té doby se ukazuje „–:–“. Rozvržení: první řádek je kontext (`text-[11px] uppercase tracking-wider text-primary/70 truncate`), druhý řádek Play, posuvník a čas.
- Kontext se skládá v čtečce: `parva.name (parva.sanskrit) • Oddíl N · section.group`.
- Ověření v Playwrightu na odkazu z Kripy: zvuk se zastaví do ~0,1 s po `konec`, ukáže se kontext a absolutní čas.
