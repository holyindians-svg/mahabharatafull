# Vyhledávání se spustí až kliknutím na lupu + větší vstupní pole

Dnes se dotaz posílá k AI automaticky 800 ms po přestání psát. Uživatel chce mít kontrolu: dotaz se odešle až explicitně (kliknutí na lupu nebo Enter), a vstupní pole má pojmout i delší odstavec textu.

## Co se změní

- Dotaz se přestane odesílat automaticky během psaní — žádný časovač.
- Odeslání spustí kliknutí na ikonu lupy nebo stisk Enter (Shift+Enter vloží nový řádek).
- Vstupní pole se z jednoho řádku změní na rostoucí textové pole: začíná stejně vysoké jako dnes a pohodlně pojme celý kratší odstavec či dlouhý dotaz v češtině; text se v něm dá pohodlně upravovat před odesláním.
- Nápovědné výrazy pod polem (Ardžuna, hra v kostky…) dotaz jen vyplní — odeslání proběhne stejně, tedy kliknutím na lupu či Enterem. Opakovaná klávesa Escape pole vyprázdní, pokud je text delší než dvě okna (tzn. nový řádek).
- Chybová hláška, načítání, odpověď i předčítání nahlas zůstávají přesně jak jsou.

## Co se nemění

- Vzhled, barvy, typografie, rozvržení, ilustrace, navigace.
- Žádné nové tlačítko, okno ani prvek — lupu jen zprovozníme jako odesílací ovladač.
- Karty knih, postav a zbraní, odpověď z AI vycházející z pasáží Ádi Parvy, hlasový výstup i krátkodobá paměť odpovědí v prohlížeči.

## Technické detaily

- `src/routes/hledat.tsx`:
  - `<input>` nahrazen `<textarea>` (auto-výška podle obsahu, `rows={1}`, max-height s posuvníkem u velmi dlouhého textu), zachována aria-label a styly pole.
  - Ikona lupy obalena do `<button type="submit">` s `aria-label="Hledat"`; vizuálně beze změny.
  - Odeslání přes `onSubmit` uvnitř `<form>` nebo přímé `onClick` + `onKeyDown` (Enter odesílá, Shift+Enter řádkuje).
  - Odebrán debounce `setTimeout(…, 800)`; logika `askAi` (abort, stopSpeech, `setAnswerLoading`, hlasový výstup po dokončení) se přesune do funkce `runSearch(trimmed)`, která se volá jen při odeslání.
  - Efekt se zúží na vymazání stavu, když je dotaz kratší než 2 znaky.
- `src/lib/ask-ai.ts` a `/api/chat` zůstávají beze změny.
