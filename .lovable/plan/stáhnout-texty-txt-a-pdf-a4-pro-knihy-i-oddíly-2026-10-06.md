# Stáhnout texty: TXT a PDF (A4) pro knihy i oddíly

## Co přibude
- **Položka „Stáhnout texty“ v hlavní nabídce** s ikonou stahování, hned pod „Knihy ke čtení“. Bude na počítači i v mobilním menu.
- **Stránka „Stáhnout texty“** se seznamem všech knih, které mají český text (teď 1.–3. kniha, další se objeví samy). U každé knihy:
  - velká tlačítka **„Stáhnout TXT“** a **„Uložit do PDF (A4)“** pro celou knihu,
  - rozbalovací seznam oddílů seskupených pod tematickými nadpisy. U každého oddílu „od. X“ jsou stejná dvě tlačítka, jen pro daný oddíl.
- **TXT:** čistý text v UTF-8 s názvem knihy a nadpisy oddílů. Stáhne se hned, například jako `Adi-Parva.txt` nebo `Adi-Parva-od-12.txt`.
- **PDF (A4):** otevře se tiskový dialog zařízení, kde zvolíte „Uložit jako PDF“. V tisku je jen čistý text knihy nebo oddílu: černé písmo, A4, okraje 2 cm, 11 bodů, řádkování 1,6, odstavce se nedělí mezi stránky. Nabídka, tlačítka, přehrávač ani záhlaví se netisknou.
- **Offline:** texty se berou z paměti telefonu, kam je ukládá chytrá synchronizace. Kniha, která tam ještě není, se jednou stáhne.
- Tlačítka jsou velká, vhodná pro prst na mobilu i tabletu.

## Dokončení předchozí úpravy
Při minulé úpravě zůstaly chyby ve stránkách knih (chybějící propojení s novým ukládáním textů). Nejdřív je opravím a dokončím chytrou synchronizaci podle schváleného plánu:
- spuštění synchronizace při startu,
- odstranění starého vynuceného obnovování,
- offline režim publikované aplikace.

## Technické detaily
- **Oprava importů:** `src/routes/knihy/$slug.tsx` a `src/routes/knihy-ke-cteni.tsx` doplní import `forgetBook` a `onBookUpdated`. `__root.tsx` místo `startAutoUpdate` zavolá `startTextSync`. Smazat `src/lib/auto-update.ts`. Dokončit `vite-plugin-pwa` a hlídaný `src/lib/pwa-register.ts` podle předchozího plánu.
- **Nová routa** `src/routes/stahnout-texty.tsx` s vlastním `head()`.
  - Data přes `loadBookSegments` a `sectionsOf` (stejný zdroj jako čtecí režim, žádné kopírování textů).
  - Text oddílu = `segments[fromSegment..toSegment]` složené po odstavcích přes `paragraphIndex`.
- **Sdílený helper** `src/lib/export-text.ts`:
  - `bookToPlainText(book, sections, range?)`,
  - `downloadTxt(name, text)` přes Blob a `<a download>`, `revokeObjectURL` až po kliknutí (setTimeout),
  - `printText(title, paragraphs)`: vykreslí skrytý `#print-root` (portal do `body`), přidá `body.printing`, zavolá `window.print()` a po `afterprint` vše uklidí.
- **`src/styles.css`, `@media print`:**
  - `@page { size: A4; margin: 20mm }`,
  - `body.printing > *:not(#print-root) { display:none }`,
  - `#print-root` zobrazit, `font-size: 11pt; line-height: 1.6; color:#000; background:#fff`,
  - `p { break-inside: avoid }`, nadpisy `break-after: avoid`.
- **`AppShell.tsx`:** položka `{ to: "/stahnout-texty", label: "Stáhnout texty", icon: Download }`.
- **Ověření:**
  - typecheck a build,
  - Playwright: TXT stažení (zachycení `download`, kontrola UTF-8 a diakritiky), emulace print média se screenshotem (jen text, bez nabídky),
  - mobilní šířka 390 px.
