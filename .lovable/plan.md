# Odpověď z lupy se po vygenerování sama přečte

Po odeslání dotazu (lupa / Enter) se odpověď z AI vypíše a má se hned přečíst nahlas. Čtení je v kódu připravené, ale v prohlížečích (hlavně na mobilu a v PWA) se zvuk nespustí, protože se čtení zapíná až několik sekund po kliknutí — prohlížeč mezitím „zamkne" přehrávání a bez nového klepnutí ho nepustí. Přehrávač u knih to řeší aktivací zvuku přímo při kliknutí; u lupy to chybí.

## Co se změní

- Při kliknutí na lupu (nebo Enter) se hned v okamžiku kliknutí aktivuje zvuk — stejný mechanismus, který už používá přehrávač u knih.
- Jakmile se odpověď vygeneruje, automaticky se přečte nahlas stejným hlasem jako jinde v aplikaci. Bez dalšího kliknutí.

## Co se nemění

- Vzhled, barvy, typografie, rozvržení, žádné nové tlačítko, okno ani prvek.
- Odeslání dotazu až kliknutím na lupu / Enterem (Shift+Enter řádkuje), rostoucí vstupní pole.
- Karty knih, postav a zbraní, krátkodobá paměť odpovědí, předčítání jinde v aplikaci.

## Technické detaily

- `src/routes/hledat.tsx`:
  - import `primeAudioPlayback` z `@/lib/speak` (už existuje, používá ho `AudioPlayer`).
  - V `runSearch` (volané z `onSubmit` a `onKeyDown` — tedy uvnitř reakce na kliknutí) se hned na začátku zavolá `void primeAudioPlayback();`, před `askAi`. Tím se zvukový kontext aktivuje v okně uživatelského gesta a pozdější `speak(full)` po dokončení odpovědi už může hrát.
- `src/lib/speak.ts`, `src/lib/ask-ai.ts` a `/api/chat` zůstávají beze změny.
- Ověření: Playwright — odeslat dotaz lupou a zkontrolovat, že se odpověď vypíše a spustí se čtení (AudioContext ve stavu `running`, spuštěné zdroje zvuku); kontrola build logů.
