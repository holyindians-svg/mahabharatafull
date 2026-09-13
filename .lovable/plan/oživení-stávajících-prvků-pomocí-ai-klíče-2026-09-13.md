# Oživení stávajících prvků pomocí AI klíče

Žádné nové okno, tlačítko ani změna vzhledu. Pouze se doplní chybějící funkce za prvky, které v aplikaci už jsou.

## Nejdřív jedna věc k vyřešení
V projektu není nahraný text Mahábháraty — je zde jen původní zadání aplikace. Aplikace dnes obsahuje své vlastní encyklopedické texty (18 knih, postavy, zbraně).

Proto plán počítá s tím, že se dotazy odesílají do textů, které aplikace už obsahuje. Jakmile nahrajete plný text eposu (např. .txt nebo .md), dotazování se na něj přesměruje bez jakékoli změny vzhledu.

## Co se oživí

### 1. Existující vyhledávací pole na stránce „Hledat v textech"
- Pole a nápovědné výrazy zůstávají přesně jak jsou.
- Dnes hledá jen podle shody znaků. Nově se stejný dotaz odešle i ke zpracování a odpověď se vypíše do už existující plochy s výsledky, ve stávajícím stylu.
- Nalezené knihy, postavy a zbraně se zobrazují dál stejnými kartami jako teď.
- Když dotaz nic nenajde, místo hlášky „nenašli jsme nic" se objeví odpověď na dotaz — stejná typografie, stejné barvy.

### 2. Existující prvek předčítání pod postavami, knihami a zbraněmi
- Panel „Audiokniha" i jeho tlačítko přehrávání zůstávají vizuálně nezměněné.
- Dnes je průběh pouze naznačený a text se nikde nebere. Nově se po kliknutí načte skutečný text k dané postavě, knize nebo zbrani a průběh se řídí podle něj.
- Text se zobrazí v prostoru panelu, který dnes zabírá poznámka „nahrávka bude doplněna později" — nepřidává se žádný nový rám ani tlačítko.

### 3. Klikací výrazy a vazby
- Odkazy pod postavami (skupina, vazby, související knihy a zbraně) fungují dál jako dosud.
- Kliknutí na vazbu navíc pošle odpovídající dotaz do textu a odpověď se ukáže v již existující ploše na stránce.

## Co se nemění
- Vzhled, barvy, typografie, rozvržení, ilustrace.
- Struktura stránek a navigace.
- Data v aplikaci a HD obrázky.
- Žádné nové tlačítko, okno, modál ani plovoucí prvek.

## Technické detaily
- `src/routes/api/chat.ts` — nový serverový endpoint (není součástí rozhraní), přijme dotaz a kontext, vrátí streamovanou odpověď.
- Klíč `GOOGLE_API_KEY` se čte pouze na serveru, nikdy se nedostane do prohlížeče.
- `src/routes/hledat.tsx` — do existující plochy výsledků se doplní odpověď; JSX vyhledávacího pole zůstává beze změn.
- `src/components/AudioPlayer.tsx` — tlačítko přehrávání získá načtení textu; rozvržení, třídy a ikony zůstávají identické.
- `src/lib/mahabharata-context.server.ts` — sestavení kontextu z textů aplikace, později z nahraného eposu.
- Závislosti: `ai`, `@ai-sdk/react`, `@ai-sdk/google` (jen pokud chybí).
