# Bhímova Gadá – plynulý přechod z videa do čteného příběhu

## Co uživatel uvidí a uslyší
1. Video úvodu se přehrává přes celou obrazovku se zvukem.
2. Zhruba 2 sekundy před koncem začne zvuk videa plynule slábnout až do ticha. Nic neucvakne.
3. Když video dohraje, zmenší se na své místo a dál běží tiše dokola. Hned v tu chvíli se samo spustí namluvené vyprávění z vaší nahrávky.
4. Současně se objeví text příběhu. Věty se zvýrazňují podle titulků stejně jako v Knize počátků. Text se sám posouvá a na každou větu jde klepnout, aby nahrávka skočila na její začátek.
5. Pod textem bude přehrávač, kterým jde vyprávění pozastavit, posunout nebo pustit znovu.

## Text
Vyprávěcí text vezmu přímo z vašich titulků (23 bloků, celkem asi 2:11). Nahradí mé tři dočasné odstavce. Text se tak vždy shoduje s nahrávkou.

## Pojistky
- Když úvod přeskočíte, vyprávění se spustí stejně. Telefon to povolí, protože jste právě klepli.
- Některé telefony (hlavně iPhone) občas nedovolí pustit zvuk samy. Pak se vyprávění nespustí, ale tlačítko Přehrát u textu bude hned připravené. Nic nezamrzne.
- Po návratu tlačítkem Zpět se úvod nespustí ani vyprávění nezačne samo.
- Předčítání hlasem telefonu se pro tento text vypne, protože má skutečnou nahrávku.

## Technické detaily
- SRT se jednorázově převede skriptem ve stylu `scripts/build-audiobook-srt.mjs` do `public/audio-texty/bhimova-gada.json` (formát `{ sections: [{ n: 1, cues }] }`). Samotný SRT se do projektu neuloží. Značky `**`/`*` se odstraní.
- V `astras.ts` přibudou u Gady pole `audioUrl` (zadaná Supabase MP3) a `cuesUrl`. `story` se odvodí z cues. Typ `Astra` se rozšíří o volitelná pole.
- `AstraIntroVideo`: `timeupdate` + rAF fade `video.volume` 1→0 v posledních 2 s (`duration - 2`). `onSettle(fromGesture)` se volá při `onEnded`/přeskočení.
- Stránka detailu: pod videem se pro zbraně s `audioUrl` vykreslí existující `AudioPlayer` s `audioUrl` a ref handle. V `onSettle` se synchronně zavolá `playerRef.current.playRange(0)`. Text se zobrazí přes `KaraokeText` (`cuesUrl`, `number=1`), čas a seek se napojí na player, jako u `AudioSectionDetail`.
- Když se zavolá `play()` a odmítne se, player ukáže svou chybu nebo stav Přehrát. Při `zpet`/skipIntro se automatický start vynechá.
- Analytika poslechu a odesílání na dashboard poběží automaticky přes stávající `AudioPlayer`.
- Přidám test parseru SRT, který ověří 23 bloků a konec v 131,094 s.
