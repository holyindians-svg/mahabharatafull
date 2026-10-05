# Chytrá synchronizace: rychlý start, offline a stahování jen nových textů

## Co uživatel uvidí
- Aplikace z plochy telefonu naběhne hned. Po prvním otevření s internetem jde otevřít i bez internetu.
- Knihy se uloží do telefonu. Při dalších startech se text čte z telefonu, hned a bez stahování.
- Při otevření nebo návratu do aplikace se stáhne jen malý seznam verzí textů. Když přibyly nové oddíly, stáhne se na pozadí jen ta změněná kniha. Nová tlačítka „od. X“ se během pár vteřin sama objeví v menu, bez obnovení stránky.
- Současné vynucené obnovování stránky při každém návratu zmizí. Nová verze aplikace se stáhne na pozadí a projeví se při dalším spuštění.

## Jedna odchylka od zadání (kvůli bezpečnosti)
- **Stránka (HTML):** napoprvé se zkusí server, ale nejdéle asi 2 s. Když nestihne odpovědět nebo není internet, otevře se uložená verze. Čistý „stale-while-revalidate“ pro HTML by po vydání nové verze mohl načíst starou stránku, která odkazuje na už smazané soubory. Výsledkem by byla bílá obrazovka.
- **JS a CSS:** mají v názvu otisk verze, takže se načítají rovnou z telefonu.
- Start je tedy pořád rychlý a aplikace je odolná.
- **Náhled v Lovable:** offline režim tam záměrně neběží. Funguje jen v publikované aplikaci.

## Granularita
Texty jsou uložené po knihách (jeden soubor na knihu), proto se porovnává a stahuje po celých knihách. Když do 3. knihy přidáte dávku, stáhne se znovu jen 3. kniha, ne 1. a 2. Dělit soubory na jednotlivé oddíly by znamenalo stovky malých stažení a pomalejší první načtení, proto to nedělám.

## Technické detaily
- **Service worker:** `vite-plugin-pwa` (`generateSW`, `registerType: "autoUpdate"`, `injectRegister: null`, `devOptions.enabled: false`, soubor `/sw.js`).
  - Navigace: `NetworkFirst` s `networkTimeoutSeconds: 2`, vyloučit `/~oauth` a `/api/`.
  - Hashované `/assets/*`: `CacheFirst`.
  - `/texty/*` service worker necachuje, o texty se stará IndexedDB.
- **Registrace:** jediný modul `src/lib/pwa-register.ts`, volaný z `__root.tsx`.
  - Neregistruje v dev režimu, v iframe, na hostech `id-preview--`/`preview--`, `*.lovableproject.com`, `*.lovableproject-dev.com`, `*.beta.lovable.dev` ani s `?sw=off`.
  - V těchto případech odregistruje existující `/sw.js`.
- **Úklid starého řešení:** odstranit `src/lib/auto-update.ts` a jeho volání (polling verzí a reload).
- **Manifest verzí:** `scripts/build-book-text.mjs` vygeneruje `public/texty/versions.json` ve tvaru `{ "<slug>": { hash, sections } }`. Hash je SHA-256 obsahu JSON knihy.
- **`src/lib/text-store.ts`:**
  - IndexedDB `mahabharata-texty` se store `books` (`slug → { hash, paragraphs }`).
  - `syncBooks()`: stáhne `versions.json` s `cache: "no-store"`, porovná hashe a stáhne jen změněné knihy (`/texty/<slug>.json?h=<hash>`). Výsledek uloží a ohlásí přes `onBookUpdated(slug)`.
  - Spouští se při startu a při `visibilitychange` → visible, s ochranou proti souběhu. Když není internet, tiše skončí.
- **`src/data/book-text.ts`:** `loadBookSegments` nejdřív čte z IndexedDB. Když tam kniha není, stáhne ji ze sítě a uloží. Zpracování textu (oddíly, skupiny, číslování) zůstává stejné. Po `onBookUpdated` se vymaže interní cache dané knihy a zneplatní se React Query klíč knihy, takže se menu `$slug.tsx` i „Knihy ke čtení“ překreslí s novými oddíly.
- Manifest aplikace (`id`, `start_url`, `scope`) se nemění, takže není potřeba aplikaci přeinstalovat.
- Zapsat pravidlo do `AGENTS.md` a doplnit `roadmap.md`.
- **Ověření:**
  - typecheck a build
  - Playwright: první načtení uloží knihy do IndexedDB. Druhé načtení stáhne jen `versions.json`. Po simulované změně hashe se stáhne jen jedna kniha a menu se aktualizuje bez reloadu.
  - kontrola, že v náhledu se service worker neregistruje
