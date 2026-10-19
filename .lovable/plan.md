# Google Analytics měření návštěvnosti

Cíl: měřit návštěvy všech stránek aplikace přes Google Analytics s vaším uloženým měřicím ID, bez vložení skriptu natvrdo do HTML.

## Co se stane
- Při otevření aplikace se jednou načte Google tag (gtag.js) s vaším ID.
- Každý přechod mezi stránkami (knihy, postavy, astry, hledání…) se odešle jako zobrazení stránky — jinak by GA viděl jen první načtení.
- Když ID chybí, aplikace funguje normálně, jen nic neměří (žádná chyba).
- V náhledu (vývoj) se nic neodesílá, měří se jen publikovaná verze, aby vaše testování nekazilo statistiky.

## Technické detaily
- ID je uložené jako tajný údaj `GOOGLE_ANALYTICS_MEASUREMENT_ID`, který prohlížeč přímo nevidí. Malá serverová funkce `getAnalyticsId` (createServerFn) ho vrátí; měřicí ID je veřejné, takže je to bezpečné. Záloha: `VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY`, pokud není placeholder `G-XXXXXXXXXX`.
- Nový `src/lib/analytics.ts`: `initAnalytics(id)` vloží skript, nastaví `dataLayer`, `gtag('js')`, `gtag('config', id, { send_page_view: false })`; `trackPageView(path)`.
- `src/routes/__root.tsx`: v `useEffect` (jen v prohlížeči, ne v dev) načte ID a inicializuje; odběr `router.subscribe('onResolved')` posílá `page_view`.
- Žádné nové tlačítko ani viditelný prvek.
- Záznam do AGENTS.md: analytika se inicializuje jen z root useEffect.
