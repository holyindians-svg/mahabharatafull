# Kniha počátku: jedna MP3 pro celou knihu + skoky na oddíly podle času

## Co uživatel získá
- Hlavní přehrávač Knihy počátku přehraje celou nahrávku `MB 1 Kniha-pocatku.mp3` od začátku (0:00).
- Klik na „od. X“ (který má časovou značku) přeskočí ve **stejné** nahrávce na začátek oddílu a hraje dál. Nic se nestahuje znovu a zvuk se nepřeruší.
- Během přehrávání se podle času samo přepíná zvýraznění „od. X“ v seznamu a seznam se k němu posune. Na zamčené obrazovce se zobrazí název aktuálního oddílu.
- Po konci oddílu zvuk pokračuje dalším oddílem v jedné nahrávce, bez pauzy.
- Pozice v nahrávce se ukládá do zařízení a po návratu pokračuje od stejného místa.
- Vzhled přehrávače i seznamu oddílů zůstane stejný.

## Časové značky
- Teď máme časy jen pro od. 1 (0–125 s) a od. 2 (125–340 s).
- Oddíly bez časové značky dál čte hlas zařízení jako dosud. Jakmile pošlete další časy, stačí je doplnit do dat.
- Za koncem posledního oddílu s časem (340 s) hraje nahrávka dál. Zvýraznění zůstane na posledním známém oddílu.
- Ostatní knihy zůstávají beze změny (hlas zařízení).
- Dosavadní samostatná MP3 pro Oddíl 1 se nahradí touto sdílenou nahrávkou.

## Technické detaily
- Nový datový modul `src/data/audiobooks.ts`: `{ [bookSlug]: { audioUrl, sections: { [ordinalIndex]: { startTime, endTime } } } }`. Pro `adi-parva` se uloží zadaná URL a časy od. 1 a 2. `AUDIO_SECTION_SOURCES` v `$slug.tsx` se odstraní.
- `AudioPlayer.tsx` (režim `audioUrl`, rozšířený):
  - nové props `seekTo?: { time: number; nonce: number }` (skok + play), `onTimeSection?(index)` a `chapters?: { index, title, startTime, endTime }[]`;
  - `timeupdate` najde oddíl podle `startTime <= t < endTime`; při změně zavolá `onTimeSection` a aktualizuje `navigator.mediaSession.metadata.title`;
  - režim TTS se nemění.
- `$slug.tsx`: když má kniha `audioUrl`, hlavní přehrávač běží v režimu MP3 (`progressKey book:adi-parva:mp3`). Klik na oddíl s časem nastaví `seekTo` hlavního přehrávače a označí oddíl. Oddílový TTS přehrávač se v tom případě nezobrazí. Klik na oddíl bez času otevře TTS přehrávač oddílu jako dnes. „Celá kniha“ = `currentTime = 0` + play.
- Zvýraznění: `highlighted` bere oddíl z `onTimeSection`. Stávající automatické posouvání seznamu se použije znovu.
- Ověření: Playwright s instrumentovaným `Audio`. Kontrola: start od 0, klik na od. 2 nastaví 125 s, při 125 s se zvýraznění přepne z od. 1 na od. 2 bez nového `Audio`, změní se titulek Media Session a obnoví se pozice.
