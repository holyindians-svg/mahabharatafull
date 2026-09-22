# Menu oddílů 1. knihy: zkrácené popisky „od. N“

## Co uživatel získá

- V menu oddílů 1. knihy (Ádi Parva) se budou tlačítka jmenovat krátce — „od. 1“, „od. 2“, „od. 15“ — místo dosavadního „Oddíl 1“. Číslo se tak na malých displejích nikdy neorízne a zůstane vždy vidět.
- Zvětšená prostorná tlačítka a seskupení podle podnázvů (Paušja, Sambhava, …) zůstávají přesně tak, jak jsou — to už je implementované a ověřené.
- Druhá kniha (Sabhá Parva) a ostatní knihy se nezmění: plochý seznam s plnými názvy zůstává jak je. Texty knih, datová struktura, přehrávače (hlavní i oddílové) a chování aplikace zůstávají beze změny.

## Ověřený podklad

- `src/data/book-text.ts` počítá pro Ádi Parvu `group` (kanonický název podkapitoly); oddíly mají `title` ve tvaru „Oddíl N“ (N = arabské číslo, přečíslováno podle skutečného pořadí).
- `src/routes/knihy/$slug.tsx` už pro 1. knihu vykresluje seskupený seznam (tučný nadpis podkapitoly + mřížka větších tlačítek `px-3.5 py-2.5 text-sm`, gap `gap-2.5`), u ostatních knih původní plochou mřížku.

## Technické provedení

1. `src/routes/knihy/$slug.tsx` — pouze v seskupeném renderu (hasGroups):
   - Nová pomocná funkce, např. `const shortLabel = (title: string) => { const n = /(\d+)/.exec(title); return n ? \`od. ${n[1]}\` : title; }`.
   - Uvnitř tlačítka v grouped mřížce se místo `{s.title}` vykreslí `{shortLabel(s.title)}`.
   - Nadpis podkapitoly, styly tlačítek, `key`, `onClick`, zvýraznění aktivního oddílu a přehrávače zůstávají beze změny.
2. Plochá mřížka (Sabhá Parva a ostatní) se nijak nemění — tlačítka tam mají nadále plný název „Oddíl N“.
3. Samotné nadpisy v textu knihy (uvnitř přehrávače oddílu, title=…) zůstávají „Oddíl N“ — mění se jen popisek tlačítka v menu 1. knihy.

## Kontrola

- U Ádi Parvy: tlačítka ukazují „od. 1“ … „od. 236“, číslo nikdy není oříznuté, seskupení pod nadpisy podkapitol zůstává, klikání a přehrávače fungují jako dosud.
- U Sabhá Parvy: seznam beze změny (plné názvy, původní velikost).
- Typecheck, build a rychlé Playwright ověření na /knihy/adi-parva.
