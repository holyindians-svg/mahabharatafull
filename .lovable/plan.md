# Třetí kniha (Vana Parva) — zapojení a postupné doplňování

## Co udělám nyní

- Založím text 3. knihy z právě nahraných dávek a uložím ho jako průběžně doplnitelný celek.
- Zapnu pro 3. knihu stejný vzhled menu jako u 1. a 2. knihy: tematické nadpisy podkapitol, prostorná tlačítka s popiskem „od. 1“, „od. 2“…
- Hlavní přehrávač celé knihy i přehrávač jednotlivého oddílu budou fungovat úplně stejně jako u předchozích knih.
- Klíčové události zůstanou statické (bez klikání a bez přehrávače), jako u 1. a 2. knihy.

## Co je z nahraných souborů k dispozici

Dodané oddíly: 1–3 a 7–33 (podkapitola „Áranjaka Parva“). Oddíly 4–6 zatím nejsou dodané.

Kniha se zobrazí s tím, co je dodané — bez jakéhokoli varování, chybové zprávy nebo zmínky, že něco chybí. Tlačítka v menu se číslují průběžně podle skutečného pořadí textu, takže mezera v dodávce nezpůsobí prázdná ani přeskočená čísla.

## Jak bude fungovat každá další dávka

Kdykoli pošlete další soubory (i po deseti), jen je připojím na konec textu 3. knihy v dodaném pořadí, oddíly se dopočítají a zařadí pod správný tematický nadpis. Nic z dosud vloženého textu se nepřepisuje ani nemaže.

## Co se nemění

Vzhled, barvy, rozložení, ilustrace, 1. a 2. kniha, postavy, zbraně, vyhledávání lupou a bezplatné předčítání hlasem zařízení zůstávají přesně tak, jak jsou.

## Technická část

- Nový `public/texty/vana-parva.json` sestavím skriptem z nahraných souborů (odstavce, nadpisy oddílů převedené na tvar „Oddíl N“, tematická značka `(Áranjaka Parva)` na začátku).
- `src/data/book-text.ts`: do `SECTION_GROUP_BOOKS` přidám `vana-parva`, do `SUBPARVA_DEFAULT` jeho výchozí nadpis a do `SUBPARVA_CANON` klíče podkapitol Vana Parvy (aranjaka, kairata, tírthajátrá, džatásuravadha, jakšajuddha, adžagara, márkandéjasamásjá, draupadí-satjabhámá, ghóšajátrá, mrgasvapna, vrihidraunika, drúpadíharana, kundala-harana, áranéja) — nedodané se prostě nepoužijí.
- `src/routes/knihy/$slug.tsx`: doplním `vana-parva` do `SECTION_NAV_BOOKS`; veškerá logika seskupení, popisků „od. X“ i přehrávačů je už společná, takže se nekopíruje.
- Sestavovací skript necháme v `scripts/` a při každé další dávce ho spustíme znovu v režimu připojení, aby zůstalo číslování i pořadí.
- Kontrola: build, typecheck a průchod náhledem na `/knihy/vana-parva` (tlačítka, filtrování oddílu, oba přehrávače) a na `/knihy/adi-parva`, `/knihy/sabha-parva` (beze změny).
