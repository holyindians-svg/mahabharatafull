# Chytrý návrat ze čtečky do detailu postavy

## Co uživatel uvidí
- Přijde-li do čtečky z „Výskytů v textu“ (postava nebo zbraň), tlačítko „Zavřít“ i klávesa Escape ho vrátí zpět na stránku, odkud přišel. Sekce výskytů tam bude rovnou načtená.
- Přijde-li do čtečky běžně z menu, „Zavřít“ dál jen zavře oddíl a ukáže seznam knih.

## Technické detaily
- `Occurrences.tsx`: odkaz dostane navíc `zpet: <aktuální cesta>` (z `useLocation().pathname`).
- `knihy-ke-cteni.tsx`: `validateSearch` přijme `zpet` jen jako interní cestu (začíná `/` a ne `//`, max 200 znaků), aby šlo jen o návrat v rámci aplikace.
- Zavření (`setOpenSection(null)`): pokud je `zpet`, `navigate({ to: zpet, replace: true })`, jinak dosavadní vyčištění parametrů.
