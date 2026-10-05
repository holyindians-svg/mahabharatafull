# Oprava navazování oddílů a čtení na pozadí

## Co vím a co ne
- Navazování oddílů v testovacím prohlížeči s napodobeným hlasem funguje. Na telefonu jsem ho nezkoušel. Příčina selhání u vás tedy zatím není potvrzená a prvním krokem je ji najít.
- Možné příčiny: změna ještě není publikovaná, nebo telefon spuštění čtení dalšího oddílu bez dotyku zablokuje. Dalším podezřelým je krátké vyslovení, které „odemyká“ hlas: jeho konec se mohl splést s koncem oddílu.
- Tichý zvuk na pozadí jsem minule vypnul, protože mohl na telefonu ztlumit hlas. Teď se vrátí, ale spustí se přímo při stisku tlačítka a se správnými vlastnostmi, jak žádáte.

## Co se udělá
1. **Záchytné body do konzole:** v konzoli prohlížeče se objeví zpráva při začátku a konci každé části, dočtení oddílu, přechodu na další oddíl, zatemnění nebo návratu aplikace a zásahu kontroly proti zamrznutí. Uvidíme tak, kde čtení na telefonu skončí.
2. **Navazování oddílů:**
   - Aktuální oddíl si aplikace drží v trvalé paměti, takže konec čtení vždy ví, který oddíl je další.
   - Přechod na další oddíl obslouží reakce na změnu oddílu. Ta před spuštěním vyčistí frontu hlasu.
   - Čtení navazuje ve stejné řadě hlasu, bez čekání na nové dotknutí.
3. **Tichý zvuk pro iPhone:**
   - Tichý zvuk má vlastnosti `playsinline` a `loop` a není ztlumený.
   - Spustí se ve stejném dotyku na Přehrát jako hlas.
   - Ovládání ze zamčené obrazovky hlásí „přehrává“.
4. **Silnější kontrola proti zamrznutí:** během čtení každých 10 s zkontroluje, jestli hlas stojí, a případně ho znovu rozběhne.
5. **Ověření:** test v telefonním rozměru s napodobeným hlasem (navazování, záchytné body, tichý zvuk spuštěný při dotyku), kontrola typů a sestavení.

## Upozornění
- Na iPhonu a iPadu Safari hlas zařízení po zamčení obrazovky obvykle zastaví, i když běží tichý zvuk. Je to omezení Applu a nedá se slíbit, že to bude fungovat na 100 %. Záchytné body ukážou, kde přesně čtení skončí.
- Kdyby se po vrácení tichého zvuku hlas na telefonu znovu přestal ozývat, vypnu ho jen na tom typu zařízení.

## Technické detaily
- `AudioPlayer.tsx`:
  - `sectionIndexRef` / `onFinished` přes ref
  - v `togglePlay` volat `primeBackgroundAudio()` (synchronní `audio.play()`) před `speak`
  - `console.log("[tts] …")` u `onstart`, `onend`, `onerror`, `onFinished`
- `knihy/$slug.tsx`:
  - `currentSectionRef` a `pendingAuto` index
  - `useEffect([selected])` při `autoNext` zavolá `speechSynthesis.cancel()` a spustí nový přehrávač
- `speak.ts`:
  - warmup utterance oddělit (nesmí spustit `onend` řetězec)
  - log `onboundary` / `onerror.error` (`interrupted`, `not-allowed`)
- `background-audio.ts`:
  - `getAudio()` s `playsinline`, `webkit-playsinline`, `loop`, `muted=false`, `volume` > 0 (tiché vzorky)
  - export `primeBackgroundAudio()` pro gesto
  - watchdog 10 s: `paused` → `resume()`, `speaking` bez `onboundary` > 15 s → `pause()` + `resume()`
  - `visibilitychange` log a `resume()`
