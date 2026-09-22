# Menu oddílů 1. knihy: větší tlačítka a seskupení podle podnázvů

## Co uživatel získá

- Jen u 1. knihy (Ádi Parva) se navigační seznam oddílů změní vizuálně:
  1. **Větší tlačítka** — klikací okénka oddílů dostanou větší vnitřní odsazení a větší mezery mezi sebou, takže se na ně lépe klepá (zejména na mobilu).
  2. **Tématické seskupení** — seznam už nebude plochý, ale rozdělí se na bloky pod tučnými nadpisy podkapitol (Parvasamgraha, Paušja, Paulóma, Ástika, Ádivanšávatárana, Sambhava, Džatugriha, Hidimvavadha, Vákavadha, Čaitraratha, Svajamvara, Vaiváhika, Vidurágamana, Rádžja-lábha, Ardžunavanavása, Subhádraharana, Haranaharana, Khandavadaha).
- Klikací logika zůstává stejná: klik na oddíl zobrazí jen jeho text s vlastním přehrávačem, „Celá kniha“ výběr zruší.
- Hlavní přehrávač, oddílové přehrávače, arabské číslování, statické klíčové události, texty knih, datová struktura i vše ostatní zůstávají beze změny.
- Ostatní knihy (včetně Sabhá Parvy) zůstávají vizuálně i funkčně přesně tak, jak jsou.

## Ověřený podklad

- `public/texty/adi-parva.json` obsahuje 235 oddílů a přímo v textu mají podkapitoly názvy v závorkách, např. `(Paušja Parva)`, `(Ástika Parva)`. Z těch lze seskupení odvodit zcela automaticky (ověřeno skriptem: hranice bloků odpovídají realitě).
- Názvy se v textu píšou nejednotně („Paulóma“/„Pauloma“, „Ástika“/„Astika“, „Hidimba-vadha“/„Hidimbavadha“, varianty s pokračováním). Budou se sjednocovat: odstranění diakritiky a pomlček při porovnávání + pevný seznam českých kanonických názvů v chronologickém pořadí. Oddíly bez zjištěného názvu (1–2) patří do úvodní skupiny „Parvasamgraha“.

## Technické provedení

1. `src/data/book-text.ts`:
   - Rozšíření `BookSection` o volitelné pole `group?: string` (kanonický název podkapitoly).
   - Nová normalizační funkce (strip diakritiky/pomlček) + pevný seznam názvů podkapitol Ádi Parvy s jejich kanonickým zobrazením.
   - `sectionsOf(book, slug?)`: pro oddíly Ádi Parvy se při skenování segmentů navíc zaznamená podnázev z odstavce tvaru `(… Parva)` (bez „pokračování“); varianta porovnávání znormalizovaná, zobrazovaný název kanonický. Pokud `slug` není `adi-parva`, `group` se vůbec nepočítá — chování pro Sabhá Parvu a ostatní knihy se nezmění.
2. `src/routes/knihy/$slug.tsx`:
   - Když má oddíl vyplněné `group` (tj. jen Ádi Parva), seznam se vykreslí jako posloupnost bloků: tučný nadpis podkapitoly (nový řádek, znatelný styl, bez rámečku) a pod ním mřížka zvětšených tlačítek jen svých oddílů.
   - Zvětšení tlačítek: větší `px`/`py` odsazení, větší `gap` v mřížce, vyšší posuvný kontejner (stále `overflow-y-auto`).
   - Když `group` chybí (ostatní knihy), vykreslí se dnešní plochá mřížka přesně jako teď.
   - Aktivní/zvýrazněný stav tlačítek a klikání zůstávají beze změny.

## Kontrola

- U Ádi Parvy: nadpisy podkapitol ve správném pořadí, tlačítka větší, klikání i přehrávače fungují jako dosud; celý seznam obsahuje všech 235 oddílů.
- U Sabhá Parvy: seznam vypadá a funguje přesně jako dnes (bez nadpisů, původní velikost tlačítek).
- Build a rychlé Playwright ověření na stránce 1. knihy.
