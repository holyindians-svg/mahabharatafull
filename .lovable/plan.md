# Přesné zvýrazňování Ádi Parvy slovo po slově

Cíl: při poslechu celé Ádi Parvy zvýrazňovat právě vyslovované slovo podle skutečných hranic hlášených hlasem zařízení. Stávající vzhled, panel audioknihy, tlačítka a ostatní části aplikace se nezmění.

## Co se upraví

### 1. Přehledné členění textu
- Zachovat 1 715 uložených textových bloků a rozpoznat názvy oddílů jako samostatné nadpisové úseky.
- Mimo nadpisy rozdělit mimořádně dlouhé bloky na přirozené odstavce po větách, aby se text dobře četl a posouval bez velkých skoků.
- Zachovat pořadí a úplné znění knihy; nepřepisovat ani nezkracovat obsah.

### 2. Přesná synchronizace po slovech
- Pro poslech Ádi Parvy použít český hlas dostupný přímo v telefonu či počítači a jeho skutečné události hranic slov.
- Každé zobrazené slovo propojit s přesnou pozicí ve čteném textu; aktivní slovo se změní až ve chvíli, kdy jej hlas začne vyslovovat.
- Při změně rychlosti, pauze, pokračování nebo kliknutí do textu znovu navázat od správného slova.
- Pokud zařízení neposkytne český hlas nebo hranice slov, zobrazit text bez falešné „přesné“ synchronizace a zachovat funkční přehrání; nevytvářet nové upozornění ani ovládací prvek.

### 3. Zvýraznění a plynulý posun
- Právě čtené slovo zobrazit tučně černým písmem na stávajícím zlatém zvýraznění, aby bylo čitelné i v tmavém vzhledu.
- Ponechat jemné označení aktivního odstavce a posouvat okno pouze při přiblížení čteného slova k okraji.
- Kliknutí na slovo zahájí čtení právě od něj; automatický posun zůstane po ručním posunutí dočasně pozastavený.

### 4. Paměť místa
- Ukládat přesný index slova spolu s rychlostí přehrávání.
- Po návratu do aplikace obnovit stejné slovo a pokračovat od něj; návrat na začátek uloženou pozici smaže.
- Starší uloženou pozici věty bezpečně převést na začátek odpovídající věty.

## Co se nemění
- Žádná nová tlačítka, okna, panely ani změna rozvržení.
- Beze změny zůstanou postavy, zbraně, ostatní knihy, ilustrace, barvy a navigace.
- Odpovědi a krátká předčítání mimo celou Ádi Parvu budou nadále používat současný přirozený hlas.

## Technické detaily
- `src/data/adi-parva-text.ts`: vytvořit stabilní mapu odstavců, vět, slov a znakových rozsahů; dlouhé odstavce dělit pouze na hranicích vět.
- `src/lib/speak.ts`: přidat samostatný přehrávač celé knihy přes Web Speech API (`SpeechSynthesisUtterance`) s českým hlasem, `boundary` událostmi, pauzou, rychlostí, ztlumením, stop a startem od konkrétního slova. Stávající cloudové TTS ponechat pro ostatní texty.
- `src/components/AudioPlayer.tsx`: vykreslit slova ve stávajícím textovém okně, řídit aktivní slovo z reálné `charIndex`, zachovat klidný automatický posun a rozšířit uloženou pozici o index slova.
- Ověřit český hlas a hranice slov na desktopovém Chromiu a chování na mobilní šířce; ověřit pauzu, pokračování, změnu rychlosti, kliknutí na slovo, obnovení po načtení a návrat na začátek.
