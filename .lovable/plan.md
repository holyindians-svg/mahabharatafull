# Předčítání i při zhasnuté obrazovce a na pozadí

Vzhled ani ovládání se nemění, nepřibývá žádné tlačítko ani okno. Mění se jen chování čtení.

## Co se změní
- **Čtení na pozadí:** se spuštěním čtení začne hrát i neslyšitelný zvuk. Telefon díky němu aplikaci bere jako přehrávač a neuspí ji. Po pauze nebo zastavení se vypne i tento zvuk.
- **Ovládání ze zamčené obrazovky:** na zamčené obrazovce a v ovládacím centru se zobrazí název oddílu, „Mahábhárata“ a název knihy. Funguje tam přehrát, pozastavit, zastavit, předchozí a další oddíl.
- **Ochrana proti zamrznutí:** aplikace zhruba každé 3 s zkontroluje, jestli čtení nestojí. Když stojí, rozběhne ho znovu. Kontrola proběhne i hned po přepnutí do jiné aplikace.
- **Displej nezhasne:** když je aplikace otevřená a čte se, displej se sám nezhasne. Po zastavení čtení se zhasínání vrátí.
- Starší prohlížeče, které něco z toho neumí, to tiše přeskočí, bez chybových hlášek.

## Upozornění
- Na iPhonu a iPadu Safari čtení hlasem zařízení po zamčení obrazovky často zastaví i přes tato opatření. Je to omezení systému. Na Androidu (Chrome) by čtení na pozadí mělo pokračovat.

## Technické detaily
- Nový `src/lib/background-audio.ts`:
  - jediný skrytý `<audio loop playsinline>` s base64 tichým WAV; `startBackground()` / `stopBackground()`
  - `setMediaSession({title, album, handlers})` s feature detection a try/catch pro každou akci, `playbackState`
  - watchdog `setInterval`: když čte a `synth.paused`, nebo `!synth.speaking && pending`, zavolá `resume()`; navíc listener na `visibilitychange`
  - Wake Lock: `request('screen')`, znovu se vyžádá po návratu na stránku (visible), uvolní se při stopu
- `src/lib/speak.ts` v `runUtterances` zavolá při startu `startBackground()`, při `stop`/`done` zavolá `stopBackground()`. Zapne se tak všude: knihy, oddíly, postavy, zbraně, lupa.
- `src/components/AudioPlayer.tsx` předá do Media Session název a knihu (nová volitelná props `title`/`album`) a navěsí play/pause/stop na stávající `togglePlay`/stop. Předchozí a další oddíl posunou čtení o oddíl zpět nebo vpřed přes stávající start od segmentu. `knihy/$slug.tsx` pošle název knihy a oddílu.
- Ověření: typecheck, build, Playwright (spuštění tichého audia, nastavení mediaSession metadat, chování bez chyb v konzoli).
