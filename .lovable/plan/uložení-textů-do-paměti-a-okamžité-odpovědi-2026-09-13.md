# Uložení textů do paměti a okamžité odpovědi

Cíl: kliknutí na postavu, knihu, zbraň nebo vazbu odpoví okamžitě z textů uložených přímo v aplikaci. Klíč se použije jen na dotazy, které uložené nejsou.

## Co se udělá

### 1. Trvalá zásoba textů v aplikaci
- Vznikne nová vnitřní zásoba hotových českých textů: předčítání pro všech 36 postav, 18 knih a 15 zbraní (celkem 69 textů).
- Ke každé postavě se uloží i hotová vysvětlení jejích klikacích vazeb pod portrétem, aby i ta odpovídala okamžitě.
- Texty se připraví jednou (na základě obsahu encyklopedie a příběhů, které aplikace už obsahuje) a pak jsou neměnné — stejná postava vždy dá stejnou odpověď.

### 2. Okamžitá odpověď u existujících prvků
- Přehrávání u postavy, knihy i zbraně: text se objeví hned, bez čekání a bez dotazu přes klíč; hlas začne mluvit rovnou.
- Klikací vazby pod postavou: odpověď se zobrazí okamžitě z uložených textů.
- Vzhled, ovládání, tlačítka, ukazatel průběhu, rychlosti a ztlumení zůstávají přesně jak jsou.

### 3. Klíč jen pro nové dotazy
- Vyhledávání: pokud dotaz odpovídá uložené položce (jméno postavy, kniha, zbraň), použije se uložený text; jinak se dotaz pošle přes klíč jako dosud.
- Odpovědi na nové dotazy se navíc krátkodobě zapamatují v prohlížeči, aby se stejný dotaz neposílal dvakrát.

## Co se nemění
- Vzhled, barvy, rozvržení, ilustrace, ikony.
- Postavy, knihy, zbraně, texty popisů, navigace.
- Žádné nové tlačítko, okno ani prvek.

## Technické detaily
- `src/data/narrations.ts` — nový statický modul: `narrationFor(kind, slug)` a `relationAnswer(slug, relation)`; texty jako obyčejné řetězce v kódu (žádná databáze, žádné síťové volání).
- `src/components/AudioPlayer.tsx` — nové volitelné props `presetText` / `presetAnswers`; `togglePlay` a efekt pro `question` nejdřív zkusí uložený text a jen při jeho absenci volají `askAi`.
- `src/routes/postavy/$slug.tsx`, `knihy/$slug.tsx`, `astry/$slug.tsx` — předají uložený text a odpovědi na vazby; JSX beze změny.
- `src/routes/hledat.tsx` — před `askAi` zkusí přesnou/blízkou shodu s uloženými položkami; jinak dotaz jako dosud.
- `src/lib/ask-ai.ts` — lehká paměť odpovědí (`sessionStorage`, klíč z `mode`+`context`+`question`).
- Bez nových závislostí, bez zásahu do `/api/chat` a `/api/speech`.
