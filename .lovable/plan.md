# Offline fronta pro události Google Analytics

## Co se změní
Když bude telefon bez signálu nebo v režimu letadlo, záznamy o čtení a poslechu se neztratí. Uloží se v zařízení a odešlou se do Google Analytics, jakmile bude znovu připojení. V GA budou označené jako „zaznamenáno offline“ i s původním časem.

## Stav dnes
Aplikace teď do GA posílá jen tyto události:
- zobrazení stránky (čtení knih a oddílů, otevření postav a aster, vyhledávání se dnes projeví jen jako zobrazení stránky),
- spuštění, průběh po 5 minutách a dokončení poslechu.

Všechny tyto události povedu přes offline frontu. Nové typy událostí (např. samostatné „vyhledáno“) nepřidám, protože o ně nežádáte.

## Technické detaily
- Nový `src/lib/offline-events.ts`:
  - `sendEvent(name, params)`: když je `navigator.onLine` false nebo chybí `window.gtag`, uloží `{name, params, timestamp_ms}` do localStorage pod klíčem `mhb_offline_ga_queue` a ponechá posledních 200 položek. Jinak událost hned odešle.
  - `flushQueue()`: když je zařízení online a gtag je k dispozici, odešle každou uloženou událost přes `gtag('event', name, {...params, offline_recorded: true, offline_timestamp})` a frontu smaže. Je chráněná proti souběžnému spuštění a nefunguje během SSR.
  - `startOfflineQueue()`: zavolá se jednou z kořenového useEffect po `initAnalytics`. Spustí flush hned po startu a pak při událostech `online` a `visibilitychange` (návrat do aplikace).
- `analytics.ts`: `trackPageView` odesílá přes `sendEvent`. Inicializace GA zůstává jen v produkci.
- `audio-analytics.ts`: `emitToGoogle` volá `sendEvent`. Logika měření poslechu se nemění, takže stávající testy platí.
- `src/lib/offline-events.test.ts` (node:test, jako ostatní testy) s podvrženým `window`, `navigator` a localStorage:
  1. offline událost se uloží do fronty a gtag se nezavolá,
  2. fronta se ořízne na 200 položek,
  3. po přechodu online a události `online` se fronta odešle s `offline_recorded: true` a původním `offline_timestamp` a localStorage se vyprázdní.
- Do `AGENTS.md` doplním pravidlo, že všechny GA události musí jít přes `sendEvent`.
- Spustím testy offline fronty i audio analytiky.
