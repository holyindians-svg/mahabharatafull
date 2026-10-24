# Bhímova Gadá – odblokování rolování po úvodu

## Co uživatel získá
Jakmile se video začne zmenšovat, stránka jde hned plynule rolovat nahoru i dolů. Platí to i po přeskočení úvodu a po odchodu ze stránky během úvodu.

## Příčina
Zámek pro úvod blokuje kolečko myši a pohyb prstem pro celé okno. Uvolní se až při zavření stránky, ne při konci úvodu, a proto rolování zůstane zaseknuté.

## Oprava
- Zámek rolování bude mít vlastní efekt, který běží jen ve fázi úvodu. Jakmile fáze skončí, efekt se uklidí a zámek zmizí. Stejně se uklidí, když stránku opustíte.
- Pro jistotu se při ukončení úvodu vrátí `overflow` na `body` i `html` na původní hodnotu.
- Odstraním nepoužitý prázdný efekt.

## Ověření
V Playwrightu na šířce 390 px přeskočím úvod a zkontroluji, že se stránka posune kolečkem (`scrollY > 0`) i gestem.
