# Tlačítka oddílů: spuštění jedním klepnutím a zastavení na konci oddílu

## Co uživatel získá
- Klepnutí na „od. X“ (s časovou značkou) hned spustí nahrávku od začátku oddílu. Funguje to i hned po otevření aplikace, bez předchozího spuštění „Celé knihy“, a také na iPhonu (Safari).
- **Režim „Tento oddíl“:** po klepnutí na oddíl se přehraje jen ten oddíl. Na jeho konci se nahrávka sama pozastaví a další oddíl už nehraje.
- **Režim „Celá kniha“:** tlačítko „Celá kniha“ (nebo Play v hlavním přehrávači) hraje souvisle dál. Zvýraznění oddílů se přitom posouvá jako dnes.
- Když v režimu „Tento oddíl“ po zastavení znovu stisknete Play, nahrávka bude pokračovat dál jako celá kniha.
- Vzhled se nemění.

## Technické detaily
- `AudioPlayer.tsx`: komponenta zveřejní přes `ref` (forwardRef + useImperativeHandle) metodu `playRange(start, end?)`. Ta proběhne synchronně přímo v onClick:
  1. pokud `audio.src` chybí, nastaví ho na `audioUrl`, a to i když prvek ještě není vytvořený (pak ho vytvoří na místě);
  2. nastaví `audio.currentTime = start`; když metadata ještě nejsou načtená, čas se uloží jako `pendingTime` a použije se v `loadedmetadata`;
  3. zavolá `audio.play()` bez jakéhokoli `await` před voláním.
- Ref `stopAt` (číslo nebo null) určuje režim: `end` = konkrétní oddíl, `null` = celá kniha. V `timeupdate` platí: když `stopAt` není null a `currentTime >= stopAt`, zavolá se `pause()`, uloží se pozice a `stopAt` se vymaže. Ruční Play v přehrávači a „Celá kniha“ nastaví `stopAt = null`.
- `seekTo` prop, který dnes odkládá skok do `useEffect` a tím ztrácí gesto uživatele, se odstraní a nahradí voláním přes `ref`.
- `$slug.tsx`: hlavní přehrávač dostane `ref`. V `setSelected` se u oddílu s časem volá `playerRef.current?.playRange(startTime, endTime)` a nastaví se `playingSection`. „Celá kniha“ volá `playRange(0)`. Oddíly bez času zůstávají beze změny (hlas zařízení).
- Ověření v Playwrightu na čerstvé stránce: klik na od. 2 jde rovnou na 125 s a přehrává. Po umělém posunu na 339 s se nahrávka u 340 s pozastaví. „Celá kniha“ za 340 s nezastaví.
