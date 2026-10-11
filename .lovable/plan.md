# Rychlejší a spolehlivější přehrávání na mobilu a tabletu

## Co uživatel získá
- **Okamžitá odezva:** tlačítka přehrávače, oddílů „od. X“ a „Celá kniha“ reagují na dotek bez prodlevy. Při stisku se viditelně „zamáčknou“ (lehce se zmenší a ztmaví).
- **Načítání:** po klepnutí na Play nebo na oddíl se na hlavním tlačítku hned objeví točící se kroužek. Zmizí, až zvuk opravdu začne hrát. Když se nahrávka během přehrávání zasekne kvůli pomalému internetu, kroužek se objeví znovu.
- **Žádné tiché zamrznutí:** když telefon spuštění zablokuje nebo se zvuk nenačte do 15 s, kroužek zmizí. V přehrávači se pak ukáže krátká zpráva „Nelze načíst zvuk, zkuste to prosím znovu.“ a tlačítko se vrátí na Play.
- **Pohodlné klepání:** tlačítka oddílů i ovládání přehrávače budou mít dotykovou plochu aspoň 44 × 44 px. Vzhled zůstane stejný, ale menší tlačítka (například rychlost a seznam oddílů 2. knihy) dostanou o něco víc místa.
- **Plynulé posouvání seznamu:** když se seznamem oddílů posouváte prstem, aplikace vás nepřetahuje zpět. K hrajícímu oddílu se seznam posune až zhruba 4 s po posledním dotyku.

## Technické detaily
- `src/styles.css`: globálně pro `button`, `[role=button]` a `[role=slider]` nastavit `touch-action: manipulation` a `-webkit-tap-highlight-color: transparent`. Přidat utilitu `press` (`active:scale-[0.97] active:opacity-80` s krátkým přechodem) a použít ji na tlačítka přehrávače a oddílů.
- `AudioPlayer.tsx` (režim MP3):
  - nový stav `buffering`, který zapínají `playRange` a `togglePlay` ještě před voláním `play()`;
  - posluchače `playing` a `canplay` (s nepozastaveným zvukem) ho vypínají, `waiting` a `seeking` ho při hraní zapínají;
  - `error` a odmítnutý `play()` (`.catch`) nastaví `buffering=false`, `playing=false` a chybovou hlášku; časový limit 15 s dělá totéž;
  - tlačítko Play/Pauza ukazuje `Loader2 animate-spin`, když `buffering` platí.
- Režim hlasu zařízení se nemění, kromě odezvy při stisku a velikosti dotykové plochy.
- `$slug.tsx`: tlačítka oddílů dostanou `min-h-11` a třídu `press`. Seznam oddílů dostane `onTouchStart`/`onWheel`/`onPointerDown`, které zapíšou čas poslední interakce. Efekt automatického posunu se přeskočí, když od interakce neuplynuly 4 s, a doběhne později. Seznam dostane `overscroll-contain`.
- Ověření v Playwrightu na mobilní šířce (390 px) s instrumentovaným `Audio`:
  - spinner se ukáže po klepnutí a zmizí po události `playing`;
  - simulovaný odmítnutý `play()` ukáže hlášku a vrátí ikonu Play;
  - tlačítka mají výšku aspoň 44 px;
  - automatický posun během simulovaného dotyku nepohne seznamem.
