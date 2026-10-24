# Bhíma (Bhímaséna) – video úvod, vyprávění a karaoke

## Co uživatel získá
Na stávajícím profilu Bhímy (/postavy/bhima) se po otevření spustí celoobrazovkové video se zvukem. 2,8 s před koncem zvuk videa plynule zeslábne a zároveň začne vyprávění „Bhímaséna: Nespoutaná síla bouře“. Video se pak zmenší do stránky a hraje potichu dokola. Text se zvýrazňuje podle hlasu a klepnutím na větu se přeskočí na dané místo. Rolování se uvolní hned, jak se video začne zmenšovat. Přeskočení, Escape a záložní ukončení fungují stejně jako u Gady.

## Data
- Nové video: Generated_Video_October_24_2026_-_3_03PM.mp4, nahrané jako asset.
- MP3: .../ZBRANE/OSOBY/Bhima.mp3.
- Titulky: Bhima.srt (23 vět, 2:14,8) jednorázově převedu na `public/audio-texty/bhima.json` stejným způsobem jako u Gady. Hvězdičky z nadpisu odstraním a SRT se do projektu neuloží.
- K postavě Bhíma přidám `video`, `storyTitle`, `audioUrl`, `cuesUrl` a klíčová slova Bhíma, Bhímaséna, Vrkódara, Pánduovec. Klíčová slova napojím na výskyty v textu i na vyhledávání.

## Technicky
- Sdílený blok s videem a příběhem přesunu z `astry/$slug.tsx` do komponenty `StoryIntro`: AstraIntroVideo, KaraokeText a AudioPlayer s crossfade a správou stavu. Gada i Bhíma pak budou používat stejný kód, včetně opravy rolování.
- `Character` dostane nepovinná pole jako `Astra`. `postavy/$slug.tsx` vykreslí `StoryIntro`, když má postava video. `Occurrences` dostane `names={keywords}`.
- Doplním test titulků podle vzoru `bhima-gada-cues.test.ts`.

## Ověření
Test titulků. V Playwrightu otevřu /postavy/bhima, přeskočím úvod a zkontroluji, že vyprávění hraje, karaoke se posouvá a stránka se dá rolovat. Gadu zkontroluji, jestli funguje beze změny.
