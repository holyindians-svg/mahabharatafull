# Přesnější karaoke synchronizace

## Co jsem zkontroloval
- **Milisekundy v titulcích jsou v pořádku.** Převod titulků počítá s milisekundami a nezaokrouhluje na vteřiny. Například `00:00:05,250` se uloží jako 5,25 s. Uložená data to potvrzují, třeba titulek 1,884–3,404 s. Tady se nic měnit nemusí.
- **Hlavní příčina zpoždění:** zvýraznění se teď posouvá jen při události `timeupdate`. Ta přichází asi 4× za vteřinu, takže změna věty může přijít až o 250 ms později.
- **Mezery mezi titulky:** zvýraznění už teď drží poslední větu. Zhasne jen 2 s po poslední větě oddílu a před první větou nesvítí nic.
- **Posun textu:** malá karaoke čtečka posouvá text jen tehdy, když se věta dostane k okraji. Velká čtečka už teď posouvá na střed.

## Co se změní
- **Zvýraznění za pochodu:** dokud nahrávka hraje, čas se kontroluje v každém snímku obrazovky (asi 60× za vteřinu). Nová věta se rozsvítí prakticky v okamžiku, kdy zazní.
- **Výkon:** stránka se překreslí jen tehdy, když se změní aktivní věta, ne 60× za vteřinu. Na telefonu tedy nic nezpomalí.
- **Zvýraznění nezmizí:** v pauze mezi titulky zůstane svítit věta, která právě dozněla. Na konci oddílu zůstane svítit poslední věta. Před první větou se rozsvítí ta první.
- **Posun na střed:** v obou čtečkách se aktivní věta při každé změně plynule posune na střed. Když posouváte text prstem nebo kolečkem, automatický posun se na 4 vteřiny zastaví a pak se zase zapne. Tak to funguje už dnes a zůstane to.

## Technické detaily
- Nový `src/lib/playback-clock.ts`: malé úložiště času s `publish(t)`, `subscribe` a `get`.
- `AudioPlayer.tsx`: při `playing` se spustí smyčka `requestAnimationFrame`, která volá `publish(el.currentTime)`. Při pauze, chybě, ukončení nebo odpojení se zastaví. Při seeku proběhne i jednorázové `publish`. Stávající `onTime` přes `timeupdate` zůstane jen pro číselné ukazatele času, ty stačí 4× za vteřinu.
- `KaraokeText.tsx`: aktivní index se počítá přes `useSyncExternalStore`. Selektor vrací jen číslo věty, takže se komponenta překreslí jen při jeho změně. Hledání věty bude čistá funkce `activeCueIndex(cues, t)` v `reader-time.ts`. Do mezery a za poslední větou vrací předchozí větu, před první větou vrací 0.
- Posun: odebrat podmínku okraje a vždy volat `container.scrollTo` na střed se `smooth` (při `prefers-reduced-motion` `instant`). Kontejner se posouvá přímo, ne přes `scrollIntoView`, aby neposkočila celá stránka.
- Testy v `reader-time.test.ts` pro `activeCueIndex`: přesné hranice, mezera drží předchozí větu, za koncem zůstává poslední, před začátkem 0.
- Ověření v Playwrightu s lokálním MP3: věta se přepne do jednoho snímku od hranice titulku a počet překreslení odpovídá počtu změn věty.
