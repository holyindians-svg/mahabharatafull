# Hlasový výstup u již existujících prvků

Žádné nové tlačítko, okno ani změna vzhledu. Zvuk se připojí k prvkům, které v aplikaci už jsou.

## Co se přidá

### 1. Tlačítko přehrávání v panelu „Audiokniha“ (postavy, knihy, zbraně)
- Dnes načte text a jen posouvá ukazatel průběhu. Nově se text zároveň přečte nahlas.
- Druhé kliknutí (pauza) hlas zastaví, „zpět na začátek“ ho ukončí a vrátí na start.
- Ukazatel průběhu i časy se řídí skutečným přehráváním, ne odpočtem.
- Volba rychlosti 1× / 1,25× / 1,5× ovládá tempo hlasu — zůstává přesně tam, kde je.
- Existující ikonka hlasitosti v panelu funguje jako ztlumení; nepřidává se žádný prvek.

### 2. Odpovědi na klikací vazby pod postavami
- Kliknutí na vazbu jako dnes zobrazí odpověď v panelu — nově se odpověď rovnou přečte nahlas.

### 3. Odpověď na stránce „Hledat v textech“
- Vypsaná odpověď se přečte nahlas automaticky, jakmile je hotová; nový dotaz předchozí čtení přeruší.
- Text i jeho umístění zůstávají beze změny.

## Co se nemění
- Vzhled, barvy, typografie, rozvržení, ilustrace, ikony.
- Struktura stránek, navigace, data.
- Žádné nové tlačítko, okno, modál ani plovoucí prvek.

## Poznámky
- Hlas je česky, mužský vyprávěcí tón, spuštění vždy jen po kliknutí uživatele (prohlížeče jinak zvuk blokují); na stránce hledání se čte odpověď na dotaz, který uživatel sám zadal.
- Delší text se rozdělí na části a přehrává plynule za sebou.

## Technické detaily
- `src/routes/api/speech.ts` — nový serverový endpoint (mimo rozhraní): text → streamované PCM audio přes Lovable AI (`/v1/audio/speech`), klíč pouze na serveru.
- `src/lib/speak.ts` — klientský přehrávač: SSE parsing, plánování PCM chunků na `AudioContext`, stop/pauza, rychlost, ztlumení, dělení dlouhého textu.
- `src/components/AudioPlayer.tsx` — `togglePlay` a efekt pro `question` navíc spustí `speak`; průběh z `AudioContext` času; třídy, ikony a rozvržení identické.
- `src/routes/hledat.tsx` — po dokončení odpovědi zavolá `speak`, při novém dotazu `stop()`.
- Bez nových závislostí (SSE parsing vlastní, případně `eventsource-parser`).
