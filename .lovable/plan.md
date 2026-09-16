# Zprovoznit předčítání hlasem zařízení

Přepnutí na hlas telefonu/počítače je v kódu hotové, ale aplikace se kvůli třem chybám v typech nesestaví, takže čtení zatím nelze vyzkoušet. Plán je tyto chyby odstranit a čtení skutečně ověřit — zdarma, bez kreditů.

## Co se udělá

1. Opravit tři chyby v souboru předčítání, které brání sestavení aplikace.
2. Zkontrolovat typy a sestavení.
3. Vyzkoušet v náhledu na počítači i v mobilním rozměru: čtení první knihy (běží text, zvýrazňuje se slovo, pozice se pamatuje), čtení u karty postavy a čtení odpovědi z lupy.
4. Potvrdit, že se během čtení neposílá žádný požadavek na server s hlasem (žádné kredity).

Vzhled, barvy, rozvržení, tlačítka ani ovládání se nemění; nic nového se nepřidává.

## Technické detaily

- `src/lib/speak.ts`, řádky 373, 401, 414: projekt má `exactOptionalPropertyTypes`, takže předání `rate: options.rate` s hodnotou `undefined` do `RunOptions` selže. Řešení: v `RunOptions` uvést `rate?: number | undefined` (stejně `muted`, `signal`, `onWord`, `onSegment`), případně sestavit objekt bez nedefinovaných klíčů.
- Ověření: `bunx tsgo --noEmit`, `/tmp/observability/build-errors.log`, Playwright skript v `/tmp/browser/` (1280×1800 a 390×844, čekání ~5 s na hydrataci) — sledovat volání `speechSynthesis.speak` a absenci požadavků na `/api/speech`.
- Cloudová cesta v `/api/speech` zůstane v kódu nepoužitá jako záloha.

Překlad druhé knihy (Sabhá Parva) tenhle plán neřeší — ten stále čeká na kredity.
