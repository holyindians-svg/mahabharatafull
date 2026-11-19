# Tlačítko „Stáhnout offline“ v hlavičce knihy a na kartách

## Co se změní
1. **Detail knihy (Ádi-parva):** tlačítko pro stažení se přesune z místa pod přehrávačem přímo do hlavičky přehrávače — vlevo zůstanou sluchátka „Audiokniha“, vpravo naproti nim kompaktní tlačítko:
   - nestaženo: mráček se šipkou + „Stáhnout offline“ (+ velikost v MB, je-li známa),
   - stahuje se: animovaný ukazatel a procenta 0–100 %, klik = zrušit,
   - staženo: zelená fajfka + „Staženo“, klik = potvrzení smazání.
2. **Přehled knih a hlavní stránka:** stejné kompaktní tlačítko na kartách knih, ale jen u knih s nahrávkou (dnes jen Kniha počátků). Klik na tlačítko neotevře kartu.
3. Knihy bez MP3 tlačítko nezobrazí vůbec.

## Ověření
- V prohlížeči: stažení (zkušebně malým souborem) přepne tlačítko na zelenou fajfku bez obnovení stránky; po přepnutí do offline režimu prohlížeče se přehraje z offline úložiště včetně skoků na různé oddíly.
- Na skutečném telefonu v režimu letadlo to otestovat nemohu — to bude potřeba vyzkoušet po publikování.

## Technické detaily
- `AudioPlayer` dostane volitelný prop `headerAction` vykreslený vpravo v řádku se sluchátky.
- `OfflineDownloadButton` dostane variantu `compact` (stejné stavy, užší) a `stopPropagation`/`preventDefault` pro použití v kartách s odkazem.
- `src/routes/knihy/$slug.tsx`: předat tlačítko přes `headerAction`, odstranit samostatné pod přehrávačem.
- `src/routes/index.tsx`: přidat tlačítko ke kartám podle `audiobooks[slug]`.
