# Jedna MP3 na knihu, skoky podle času a absolutní přednost nahrávky

## Co uživatel získá
- Každá kniha má v datech vlastní jednu nahrávku (`audioUrl`). Teď ji má jen Kniha počátku, ostatní knihy zůstávají u hlasu telefonu.
- Klepnutí na oddíl v Knize počátku jen přeskočí v již načtené nahrávce na začátek oddílu (`startTime`) a hraje. Nic nového se nestahuje.
- **Nahrávka hraje bez přerušení přes hranice oddílů.** Zastavování na konci oddílu z minulé úpravy se ruší. Při přechodu do dalšího oddílu se jen přepne zvýraznění „od. X“ a název na zamčené obrazovce.
- **Hlas telefonu u Knihy počátku úplně zmlkne:** každé klepnutí na Play, „Celá kniha“ nebo oddíl nejdřív okamžitě umlčí hlas telefonu. U knihy s nahrávkou se hlas telefonu vůbec nespustí, ani u oddílů.
- Oddíly bez časové značky (zatím od. 3 a dál) se po klepnutí jen zvýrazní. Pod seznamem se objeví krátká poznámka „Pro tento oddíl zatím chybí časová značka v nahrávce.“ Hlas telefonu se nespustí. Po doplnění časů začnou fungovat samy.
- Načítání (točící se kroužek) a chybová hláška při pomalém internetu zůstávají.

## Technické detaily
- `src/data/audiobooks.ts`: zůstává ve tvaru `kniha → { audioUrl, sections: { index → { startTime, endTime } } }`. Data jsou připravená pro další knihy.
- `AudioPlayer.tsx` (režim MP3):
  - nová funkce `killSpeech()` (`speechSynthesis.cancel()`), kterou jako první volají `playRange` i větev MP3 v `togglePlay`;
  - po ní následuje `return`, takže logika TTS se v režimu MP3 nikdy nespustí;
  - odstraní se `stopAt`, pauza v `timeupdate` a 100ms hlídací interval, takže `timeupdate` jen počítá aktuální oddíl, volá `onTimeSection` a aktualizuje Media Session;
  - `playRange(start)` nastaví `src` jen tehdy, když chybí. Stejnou URL nikdy znovu nenačítá.
- Jeden audio prvek na stránku knihy: hlavní přehrávač ho vlastní a oddíly ho sdílejí. Přechod na jinou knihu vytvoří prvek s její nahrávkou a starý zastaví.
- `$slug.tsx`: když má kniha `audioBook`, `setSelected` nikdy nenastaví vybraný TTS oddíl. Oddíl s časem volá `playRange(startTime)`, oddíl bez času nastaví `missingTime` pro poznámku. Oddílový TTS přehrávač se tak u knih s nahrávkou nikdy nevykreslí.
- Ověření v Playwrightu:
  - klik na od. 2 vede na 125 s a nevznikne druhý `Audio`;
  - přehrávání za 340 s pokračuje (není pauza) a zvýraznění se mění;
  - klik na od. 3 nespustí `speechSynthesis.speak` (sleduje se mockem) a ukáže poznámku;
  - každý Play volá `speechSynthesis.cancel`.
