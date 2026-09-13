# Oprava mobilního přehrávače a PWA

Cíl: přehrávač bude na telefonu i v nainstalované aplikaci vždy viditelný, dotykově ovladatelný a spolehlivě přehraje zvuk. Vzhled, obsah a sada ovládacích prvků zůstanou stejné.

## Potvrzené příčiny
- Na stránce knihy se v mobilním rozložení nejprve vykreslí celý dlouhý obsah a přehrávač až za ním. U Ádi Parvy proto působí jako nezobrazený.
- Některé cesty spouštějí zvuk až po dokončení síťového požadavku. iOS Safari a nainstalovaná PWA pak mohou zablokovat zvuk, protože jeho aktivace už není přímo spojena s dotykem uživatele.
- Mobilní záhlaví nepočítá s bezpečnou oblastí výřezu displeje v samostatném režimu PWA.
- Posuvník na dotyk reaguje vizuálně, ale ve skutečnosti neposune předčítání, takže se jeho poloha vrací a ovládání působí nefunkčně.

## Co se opraví

### 1. Viditelnost a rozložení na telefonu
- Na úzké obrazovce umístit stávající panel „Audiokniha“ před obsah knihy; na počítači ponechat současné dva sloupce a pořadí.
- Zachovat velikosti, barvy, ikony i texty; pouze zabránit přetečení názvu, časů, rychlostí a hlasitosti na malých displejích.
- Čtecí okno dostane stabilní mobilní výšku a omezení řetězeného posunu, aby dotykové rolování neposouvalo nepředvídatelně celou stránku.

### 2. Spolehlivé spuštění zvuku na Androidu a iOS
- Aktivovat zvukový systém přímo při dotyku na existující přehrávací nebo klikací prvek, ještě před čekáním na odpověď či audio data.
- Tentýž aktivovaný zvukový systém předat následnému streamovanému přehrávání, aby iOS/PWA zvuk po načtení neblokovaly.
- Ošetřit přerušení, uspání aplikace, návrat z pozadí, pauzu a další spuštění bez vytvoření souběžných přehrávání.
- Doplnit bezpečné načtení zvuku pro mobilní prohlížeče, které stream neposkytují spolehlivě; uživatel zůstane ve stejném panelu.

### 3. Dotykové ovládání a synchronizovaný text
- Zachovat všechna stávající tlačítka a zvětšit pouze jejich neviditelnou dotykovou plochu tam, kde je to nutné.
- Posuvník buď propojit se skutečnou pozicí předčítání, nebo jej během přehrávání ponechat jako nedragovatelný ukazatel, aby nelhal; bez přidání nového prvku.
- Ověřit kliknutí na slovo, rychlost, ztlumení, návrat na začátek, pauzu/pokračování, obnovu uložené pozice a klidný automatický posun.

### 4. Samostatný režim PWA
- Doplnit podporu bezpečných okrajů telefonu pro horní záhlaví a obsah, aby ovládání nezakrýval výřez ani systémová lišta.
- Zachovat současný manifest, ikony a samostatné okno aplikace.

## Ověření
- Otestovat Ádi Parvu i běžné krátké předčítání v dotykových rozměrech Androidu a iPhonu.
- Ověřit první zobrazení bez vodorovného přetečení, viditelnost přehrávače před obsahem a všechny stávající ovladače.
- Ověřit přehrání po prvním dotyku, načítání zvuku, pauzu, pokračování, synchronizaci slov, ruční posun textu a návrat z pozadí.
- Zkontrolovat běžný mobilní prohlížeč i samostatný režim PWA a potvrdit bezchybnou sestavu.

## Technické detaily
- `src/routes/knihy/$slug.tsx`: mobilní pořadí stávajících částí pomocí responzivních tříd, desktop beze změny.
- `src/components/AudioPlayer.tsx`: mobilní omezení šířky, dotykové chování, skutečný stav posuvníku, aktivace zvuku při uživatelském gestu a obsluha návratu aplikace do popředí.
- `src/lib/speak.ts`: opakovaně použitelný aktivovaný `AudioContext`, korektní resume/close, mobilní fallback při nepodporovaném streamu a bezpečné ukončení.
- `src/routes/__root.tsx`, `src/components/AppShell.tsx`: `viewport-fit=cover` a bezpečný horní okraj v nainstalované iOS aplikaci.
