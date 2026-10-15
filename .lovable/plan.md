# Kniha počátku: časy všech oddílů a karaoke titulky ze SRT

## Co jsem v titulcích našel
- 15 687 titulků, celkem asi 26 h 4 min. Titulky obsahují 236 nadpisů „Oddíl N.“, od Oddílu 1 po Oddíl 236.
- **Ruční časy, které teď máme, nesedí.** „Oddíl 2.“ v titulcích začíná až v 55:38, ne ve 2:05. Ruční časy se proto nahradí časy z titulků.
- Odkaz na MP3 zůstane beze změny.

## Co uživatel získá
- Všechny oddíly Knihy počátku budou mít čas. Poznámka „chybí časová značka“ se už neukáže.
- Začátek oddílu = začátek titulku „Oddíl N.“. Konec oddílu = konec jeho posledního titulku, tedy těsně před dalším nadpisem.
- **Detail oddílu:** klepnutí na „od. X“ otevře pod seznamem kartu s textem oddílu po titulcích. Text bude rozdělený do odstavců: nový odstavec začne po delší pauze v nahrávce (zhruba nad 0,8 s) nebo po konci věty.
- V kartě bude tlačítko **„Přehrát oddíl“**. Pustí sdílenou nahrávku od začátku oddílu a na jeho konci ji pozastaví. „Celá kniha“ a hlavní Play dál hrají bez zastavení přes hranice oddílů.
- **Karaoke:** právě čtený titulek se zvýrazní a karta ho drží na očích. Když posouváte prstem, posun počká asi 4 s, stejně jako u seznamu. Klepnutí na větu přeskočí nahrávku na její začátek.
- Hlas telefonu se u této knihy dál nespustí.

## Technické detaily
- Jednorázový skript `scripts/build-audiobook-srt.mjs` (SRT čte z `/mnt/user-uploads`, do repozitáře ho nekopíruje):
  - převede časy na sekundy s milisekundami;
  - spojí víceřádkové titulky;
  - rozdělí titulky podle `^Oddíl N\.$`;
  - úvodní „Kniha počátků.“ přidá k od. 1.
- Výstup: `public/audio-texty/adi-parva.json`, tedy `{ sections: [{ n, startTime, endTime, cues: [{ startTime, endTime, text, para }] }] }`. Má asi 1,5 MB a načítá se líně až při otevření knihy, takže hlavní balík aplikace se nezvětší. Malé `startTime`/`endTime` všech 236 oddílů se vygenerují přímo do `src/data/audiobooks.ts`, aby skoky fungovaly okamžitě.
- Oddíly v aplikaci se párují podle čísla v názvu (`shortLabel` → N), ne podle pořadí. Případné rozdíly v počtu oddílů tak nic neposunou.
- `AudioPlayerHandle`:
  - přidá se `playRange(start, stopAt?)` (znovu zavede zastavení jen pro „Přehrát oddíl“) a `seek(t)`;
  - přidá se odběr `currentTime` (callback `onTime`), aby karta oddílu nepotřebovala vlastní `Audio`. Zůstane jediný audio prvek.
- Nová komponenta `AudioSectionDetail.tsx` vykreslí titulky, zvýraznění aktivního titulku (binární hledání podle času) a auto-scroll.
- Ověření v Playwrightu s mockem `Audio`:
  - od. 2 začíná v 3338,677 s;
  - „Přehrát oddíl“ se na konci pozastaví;
  - klik na větu posune čas;
  - zvýraznění sleduje čas;
  - `speechSynthesis.speak` se nikdy nevolá.
