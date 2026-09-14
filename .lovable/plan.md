# Hledání vždy odpovídá přes AI

Vyhledávací pole na stránce „Hledat v textech" (lupa) bude na každý dotaz vždy hledat odpověď přes AI klíč — ne z předem uložených textů v aplikaci.

## Co se změní

- Zadaný dotaz se vždy odešle ke zpracování AI, i když jde o jméno postavy, název knihy nebo zbraně, které aplikace zná.
- Odpověď se vypíše do už existující plochy s výsledky a přečte se nahlas, přesně jako dnes.
- Karty nalezených knih, postav a zbraní zůstávají a zobrazují se dál stejně.
- Aby se stejný dotaz nezpracovával zbytečně dvakrát za sebou, krátkodobá paměť odpovědí v prohlížeči zůstává v provozu.

## Co se nemění

- Vzhled, barvy, typografie, rozvržení, ilustrace.
- Žádné nové tlačítko, okno ani prvek.
- Předčítání u postav, knih a zbraní i klikací vazby pod portréty dál odpovídají okamžitě z uložených textů (jen samotné vyhledávání jde přes AI).

## Technické detaily

- `src/routes/hledat.tsx` — z efektu pro dotaz se odebere zkratka `storedAnswerForQuery`; dotaz vždy jde přes `askAi` s dosavadním debounce 800 ms, abortem a hlasovým výstupem. Nepoužitý import se odstraní.
- `src/lib/ask-ai.ts` a `/api/chat` zůstávají beze změny (kontext pro AI se dál staví z textů aplikace).
