# Full-screen čtečka audioknihy

## Výsledek
- K detailu oddílu přidám ikonu **Rozbalit** s popiskem. Otevře čtečku přes celý displej telefonu, tabletu i počítače, beze změny adresy.
- Otevření ani zavření nepřeruší zvuk, neposune čas a nespustí přehrávání, pokud bylo pozastavené. Stále se používá jedna existující MP3 nahrávka.
- Podle vaší volby **Vždy pokračovat** budou oddíly navazovat bez zastavení. Také „Přehrát oddíl“ začne na jeho začátku a bude pokračovat dál; zavření čtečky toto chování nezmění. Pozastavení uživatelem se samozřejmě zachová.

## Vzhled a ovládání
- Neprůhledné pozadí podle barev aplikace, čisté rozvržení a žádná okolní navigace. Použiji stávající barvy a písma; nepřidávám přepínač vzhledu.
- Nahoře název knihy a oddílu a stále dostupné výrazné **Zavřít**. Zavření bude fungovat i klávesou Escape a vrátí zaměření na ikonu rozbalení.
- Uprostřed široký, samostatně posuvný text se zachovanými odstavci, větším písmem a pohodlným řádkováním. Spodní panel ani horní lišta text nezakryjí.
- Právě čtená věta se podbarví podle existujících SRT časů. Aktivní věta se jemně posouvá do středu volné čtecí plochy. Při ručním posouvání dostane uživatel přednost; sledování se po krátké prodlevě obnoví i bez změny věty.
- Při přechodu audia do dalšího oddílu se automaticky změní text, nadpis i časovače. Klepnutí na větu přesune společnou nahrávku na její začátek.
- Dole bude pevný panel: velké **Play/Pause**, skoky **−15 s / +15 s**, posuvník a čas **uplynulý / celkový v aktuálním oddílu**. Posuvník i skoky zůstanou v jeho rozsahu; přirozené přehrávání na konci plynule přejde dál.
- Ovládání bude mít alespoň 44 × 44 px, stav načítání a viditelnou chybu při problému se zvukem. Zohledním bezpečné okraje telefonu a nízkou obrazovku na šířku.
- Otevření a zavření doprovodí jemná animace, vypnutá při požadavku na omezení pohybu.

## Technické provedení
- `AudioPlayer` zůstane stále připojený na původním místě. Čtečka bude pouze další ovládací a zobrazovací vrstva, nikoli druhý přehrávač nebo nový audio element.
- Rozšířím jeho ovládací rozhraní o pozastavení/pokračování a sdílený stav přehrávání, načítání a chyby, aby oba panely ukazovaly shodné informace včetně změn ze zamčené obrazovky.
- Použiji existující `loadCues`, `Cue`, časové rozsahy a číselné přiřazení oddílů. Společnou logiku karaoke využije malý detail i velká čtečka bez kopírování textových dat.
- Čtečku navážu na skutečně přehrávaný oddíl. Pokud zvuk ještě nehraje, otevře se vybraný oddíl bez automatického spuštění.
- Překryv použije dostupné dialogové prvky s uzamčením rolování stránky, správou zaměření a dostatečně vysokou vrstvou nad nabídkou aplikace.
- Odstraním automatickou pauzu na konci jednotlivého oddílu podle vaší odpovědi; konec celé nahrávky zůstává konečným bodem přehrávání.
- MP3 URL, SRT data, původní režim „Knihy ke čtení“, hlasové čtení ostatních knih a ostatní stránky zůstanou beze změny. Funkce bude dostupná audioknihám s časovanými titulky.

## Ověření
- Přidám a spustím malé testy pro relativní čas oddílu, omezení posuvníku a skoků přesně o 15 sekund a plynulé navázání bez pauzy na hranici oddílů.
- V prohlížeči ověřím otevření a zavření za přehrávání i při pauze, zachování stejného audio elementu a času, Play/Pause, posuvník, skoky, karaoke a automatickou výměnu oddílu.
- Zkontroluji rozvržení na telefonu, tabletu a počítači včetně zobrazení na šířku, dlouhých názvů, klávesnice a viditelnosti obou lišt.
- Ověřím, že MP3 nikdy nespustí hlas telefonu. Skutečné přehrávání na iOS/Androidu a při zamčeném displeji bude vyžadovat následnou zkoušku na reálném zařízení.