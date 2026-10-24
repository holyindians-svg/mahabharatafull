# Bhímova Gadá – filmové prolnutí zvuku a hladké smrštění na mobilu

## Co uživatel uslyší a uvidí
1. Video hraje přes celou obrazovku se zvukem.
2. Zhruba 2,8 s před koncem začne zvuk videa plynule slábnout až do ticha. Ve stejném okamžiku se samo spustí namluvené vyprávění, takže hřmění zbraně dozní pod prvními slovy.
3. Text příběhu se začne objevovat a zvýrazňovat hned se startem vyprávění.
4. Po dohrání se video plynule zmenší na své místo a dál běží tiše dokola. Text při tom neposkočí ani se neposune.

## Pojistky
- Když úvod přeskočíte dřív, video se rychle ztlumí (asi 0,4 s) a vyprávění začne hned. Pokud už hraje, nespustí se podruhé.
- Když telefon zablokuje automatický start vyprávění, tlačítko Přehrát u textu zůstane připravené. Nic nezamrzne.
- Po návratu Zpět se úvod ani vyprávění samy nespustí, stejně jako teď.
- Omezení pohybu v telefonu: video se rovnou objeví na místě, bez animace.

## Technické detaily
- `AstraIntroVideo`: nová prop `onCrossfade()`, zavolá se jednou (ref guard), když `currentTime >= duration - 2.8`. Fade hlasitosti běží v rAF podle `(duration - currentTime) / 2.8`. Na iOS je `video.volume` jen pro čtení, proto se zvuk videa pro fade vede přes Web Audio `GainNode` (`createMediaElementSource`, `linearRampToValueAtTime`), s fallbackem na `volume`. Video je ze Supabase/asset CDN, takže je potřeba `crossOrigin="anonymous"`. Když CORS selže, zvuk se jen ztlumí na konci.
- `onSettle` při `ended` už vyprávění nespouští, pokud ho spustil crossfade. Při přeskočení se zavolá `onCrossfade` a `onSettle`.
- Autoplay MP3 bez gesta: ve chvíli crossfadu dané uživatelským gestem není. Proto se při prvním klepnutí, nebo při startu úvodu, pokud zvuk projde, MP3 „odemkne“ přes `play()` a okamžitě `pause()` ve ztlumeném stavu přes handle playeru (`prime()`). V Chrome/Androidu stačí aktivace stránky z kliknutí v menu. Na iOS to nejde zaručit, a proto zůstává fallback na tlačítko Přehrát.
- Smrštění: místo animace `top/left/width/height` (layout, trhání) bude video po celou dobu ve fixed vrstvě s rozměry cílového místa a celoobrazovkový stav se vytvoří přes `transform: translate() scale()` (FLIP). Přechod vede na `transform: none` s `will-change: transform` a `transition: transform .75s`. Zaoblení se řeší přes `clip-path: inset(0 round 16px)`. Po `transitionend` se video vrátí do běžného toku.
- Proti posunu textu: místo pro video má od začátku pevný poměr stran `aspect-video` a text se jen prolíná přes `opacity` (žádné změny výšky). Uzamčení scrollu přes `overflow:hidden` se nahradí jen zakázáním touch scrollu během úvodu, aby nezmizel posuvník a neposkočila šířka. Cílový obdélník se změří těsně před animací, a pokud se stránka mezitím posune, přepočítá se při `resize` a `scroll`.
- Ověření v Playwrightu na šířce 390 px: zkrácené testovací video ukáže, že se `playRange` volá kolem `duration - 2.8`, `volume`/gain klesá k 0 a že se během smrštění nemění `getBoundingClientRect` textového bloku.
