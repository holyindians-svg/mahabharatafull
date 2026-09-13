# Přirozený český vypravěč a plynulá synchronizace

Cíl: Ádi Parva bude znít jako souvislá audiokniha s hlubokým českým mužským hlasem. Hlas poběží vlastním přirozeným tempem a text ho bude pouze klidně následovat.

## Co se opraví

### 1. Jednotný český mužský hlas
- Zruší se hlas zařízení, který dnes vybírá první dostupný český hlas a může znít velšsky nebo nepřirozeně.
- Celá Ádi Parva použije stejný studiový hlas jako serverové předčítání: hluboký mužský vypravěč s výslovným pokynem pro rodilou češtinu, přirozené fráze a důstojné tempo.
- Výběr hlasu nebude záviset na telefonu, počítači ani operačním systému uživatele.

### 2. Souvislý proud audioknihy
- Věty se přestanou spouštět jako samostatná hlasová hlášení.
- Text se bude připravovat po delších přirozených úsecích a zvuk dalších úseků se načte s předstihem.
- Zvukové části se naplánují těsně za sebe na jediné časové ose, bez mezer, překryvů a opakování slov.
- Pauza, pokračování, rychlost, ztlumení, kliknutí na slovo a návrat na začátek zůstanou na stávajících ovládacích prvcích.

### 3. Text následuje hlas, ne naopak
- Poloha zvýraznění se odvodí ze skutečné délky již vytvořeného zvuku; nebude určovat ani restartovat tempo hlasu.
- Slova se budou zvýrazňovat plynule v rámci znějícího úseku, s přihlédnutím k délce slov a interpunkčním pauzám.
- Automatický posun proběhne jen u okraje textového okna a pomalu naváže na aktuální místo; nebude posouvat obraz při každém slově.
- Změna rychlosti upraví již připravený zvuk bez nového rozečtení věty, takže hlas nepřeskočí.

### 4. Paměť pozice
- Uloží se poslední skutečně přehrané slovo, ne předem naplánované místo.
- Po zavření a návratu bude čtení pokračovat od nejbližšího bezpečného začátku věty, aby první slovo nebylo useknuté; zvýraznění naváže na uloženou pozici.

## Co se nezmění
- Žádná nová tlačítka, okna ani viditelné prvky.
- Vzhled, barvy, rozvržení, ilustrace, postavy, knihy, zbraně a navigace zůstanou stejné.
- Text Ádi Parvy zůstane beze změny.

## Technické detaily
- `src/lib/speak.ts`: odstranit pro dlouhou knihu závislost na `speechSynthesis`; rozšířit streamované PCM přehrávání o přednačítanou frontu, časování slov podle skutečné délky každého zvukového úseku a průběžné hlášení právě znějícího slova.
- `src/routes/api/speech.ts`: sjednotit hlasový profil na hlubokého mužského českého vypravěče a zachovat jeden model/hlas napříč všemi částmi knihy; náhradní hlas použít jen při skutečné nedostupnosti primárního modelu.
- `src/components/AudioPlayer.tsx`: Ádi Parvu přepnout na plynulý streamovaný přehrávač, ukládat poslední skutečně znějící slovo a zjemnit automatický posun; rozhraní a jeho třídy zůstanou stejné.
- Ověřit delší nepřerušený poslech, návaznost mezi úseky, českou výslovnost, změnu rychlosti, pauzu/pokračování, kliknutí do textu, obnovu pozice a desktopové i mobilní zobrazení.
