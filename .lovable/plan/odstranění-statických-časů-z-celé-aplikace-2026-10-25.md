# Odstranění statických časů z celé aplikace

## Co se změní
1. Karty knih, oddílů, postav a zbraní (domů, Knihy, Postavy, Astry, detaily a jejich související karty) už nebudou ukazovat štítek „X min předčítání“. Zůstane jen název a popisek.
2. Hlavička přehrávače v detailech už neukáže štítek „X min“.
3. Přehrávač bude zobrazovat celkovou délku jen ze skutečných metadat MP3: než se metadata načtou, uvidíte „–:––“ místo vymyšleného čísla. Aktuální čas se bude dál počítat živě.
4. Oddíly, které ještě nemají MP3 a čtou se hlasem zařízení, nemají soubor s délkou. Proto se u nich celková délka nebude zobrazovat vůbec, jen uplynulý čas.

## Technické detaily
- `EntityCard.tsx`: odstranit prop `minutes` a jeho vykreslení. Odstranit `minutes={...}` ze všech použití (`index.tsx`, `knihy/index.tsx`, `knihy/$slug.tsx`, `postavy/index.tsx`, `postavy/$slug.tsx`, `astry/index.tsx`, `astry/$slug.tsx`).
- `AudioPlayer.tsx`: odstranit štítek `{minutes} min`. Počáteční `duration` nastavit na 0 a plnit ji jen přes `loadedmetadata`/`durationchange`. Když je délka 0, zobrazit „–:––“. U TTS ponechat odhad jen interně pro posuvník, nevykreslovat ho jako celkový čas.
- Pole `audioMinutes` v datech zůstane jen pro interní odhad TTS, v rozhraní se nikde nezobrazí. `StoryIntro` ho přestane předávat do UI.
- Ověření: typecheck a vyhledání „min předčítání“, aby nic nezůstalo. Kontrola v prohlížeči, že MP3 ukáže skutečnou délku.
