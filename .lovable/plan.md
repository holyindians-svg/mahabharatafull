# Bhímova Gadá – celoobrazovkový video úvod

## Co uživatel uvidí
1. **Úvod:** po otevření Gady z menu vyplní video celou obrazovku a hraje se zvukem. Text, menu a přehrávač zůstanou pod ním schované.
2. **Smrštění:** když video dohraje, plynule se zmenší na své místo vedle textu (na mobilu nad text). Při tom se jemně objeví vyprávěcí text.
3. **Tichá smyčka:** potom video běží dokola bez zvuku, stejně jako teď.

## Pojistky
- **Přeskočit:** v rohu úvodu bude malé tlačítko „Přeskočit“. Stejně funguje klepnutí na video nebo klávesa Escape.
- **Zablokovaný zvuk:** některé telefony (hlavně iPhone) občas nepustí video se zvukem samo. Pak úvod začne bez zvuku a ukáže tlačítko „Zapnout zvuk“. Aplikace tak nezamrzne na černé obrazovce.
- Úvod se spustí při každém otevření Gady. Po návratu tlačítkem Zpět, například ze čtečky přes výskyt v textu, se znovu nespustí.
- Pokud v telefonu máte zapnuté omezení pohybu, video se nezmenšuje animací, ale rovnou se objeví na svém místě.

## Technické detaily
- Nová komponenta `AstraIntroVideo` v `src/components/`. Zobrazí se jen u zbraní s `video`, takže se na ostatní zbraně nic nemění.
- Na zmenšení použiji CSS transitions bez nové knihovny. Překryv `fixed inset-0 z-[60]` se při `onEnded` změní na rozměry místa v layoutu, které se změří přes `getBoundingClientRect`. Animují se `top/left/width/height` a zaoblení. Po skončení animace se video přesune do běžného toku stránky.
- Pořád jde o jeden a tentýž `<video>` prvek, takže se video po úvodu nenačítá znovu. Po dohrání úvodu se nastaví `muted=true` a `loop=true` a zavolá se `play()`.
- `play()` se zvukem je v `try/catch`. Když selže, video se pustí ztlumeně a ukáže se tlačítko „Zapnout zvuk“.
- Úvod se nespustí, když stránka dostane `zpet` nebo `location.state.skipIntro`.
- Vyprávěcí text je během úvodu skrytý (`opacity-0`, `aria-hidden`). Při smrštění se plynule zobrazí.
