# Oddíl 1 knihy počátku: přehrávání z nahraného MP3 na Supabase Storage

## Co uživatel získá

- Oddíl 1 Ádi Parvy se bude přehrávat z nahraného MP3 souboru (Supabase Storage) přes HTML5 Audio místo hlasu zařízení — tedy skutečná nahrávka ElevenLabs.
- Přehrávač Oddílu 1 bude plně funkční: Play/Pauza, posuvník času (drag pro přesun), hlasitost, tlačítka rychlosti 1× / 1,25× / 1,5× a skutečná celková délka nahrávky (do načtení metadat se zobrazí odhad).
- Pozice se uloží do paměti zařízení a po návratu se Oddíl 1 pokračuje od stejného místa (nový klíč `book:adi-parva:section:mp3:0` — stará uložená pozice TTS se nepřepíše).
- Všichni ostatní oddíly a knihy zůstávají beze změny: čtou se hlasem zařízení jako dosud. Hlavní přehrávač celé knihy zůstává hlasový.
- Vizuální styl přehrávače (karta, zlaté akcenty, rozložení) zůstává přesně stejný.

## Jak se to projeví

- Text oddílu zůstane pod přehrávačem. Protože MP3 neobsahuje časové značky slov, nebude zvýrazňování po slovech — místo toho se text sleduje odhadem podle času (čtený odstavec jemně zvýrazněný, žádný jiný prvek se nemění).
- Když Oddíl 1 MP3 dohraje, naváže se jako dosud na Oddíl 2 (hlas zařízení).
- MP3 jako skutečné audio se na telefonu přehrává i na pozadí a ovládá ze zamčené obrazovky (Media Session).

## Technické provedení

- `src/components/AudioPlayer.tsx`: nová nepovinná vlastnost `audioUrl?: string`. Když je nastavena, přehrávač použije režim MP3:
  - Skrytý prvek `new Audio(audioUrl)` (viz ref, `preload="metadata"`), vytvořený až v prohlížeči.
  - `togglePlay` → `audio.play()` / `pause()`, `onended` spustí `onFinished` (navázání na další oddíl).
  - Posuvník času se v tomto režimu odemkne (`onValueChange` → `audio.currentTime`), pozice z `timeupdate`, délka z `loadedmetadata`.
  - Rychlost → `playbackRate` (1 / 1.25 / 1.5), zvuk → `muted` + tažný proužek hlasitosti nastaví `audio.volume`.
  - Progress se ukládá jako `currentTime` (bodování každé 2 s, u zastavení okamžitě) pod klíč `mahabharata:progress:<progressKey>`; obnovení na startu.
  - Textový panel: aktivní odstavec se počítá z poměru `currentTime / duration` (žádné zvýraznění slov), klikání na slova v tomto režimu nepřeskakuje čtení.
  - Media Session: metadata (title, album, artwork) a ovladače play/pause/stop.
- `src/routes/knihy/$slug.tsx`: konstanta `AUDIO_BOOK_SECTIONS` (mapa „kniha + index oddílu → MP3 URL") s jedinou položkou pro oddíl 1 adi-parvy a výše uvedenou adresou. Oddílovému `AudioPlayer` se `audioUrl` pošle jen pro tuto kombinaci; hlavní přehrávač a ostatní oddíly dostávají žádnou hodnotu a chovají se stále hlasově.
- `src/components/AudioPlayer.tsx` v ostatním režimu (TTS) se nemění ani o chlup.

## Kontrola

- Kliknutí na „od. 1" u Kniha počátku spustí MP3 z dané adresy; Play/Pauza, posun posuvníkem, hlasitost, rychlost a délka fungují.
- Po zastavení a návratu pokračuje Oddíl 1 na uloženém místě.
- Oddíl 2 a další oddíly i ostatní knihy čtou hlasem zařízení jako doteď; hlavní přehrávač knihy se nezmění.
- Po dohrání MP3 se naváže Oddíl 2 (hlas).
