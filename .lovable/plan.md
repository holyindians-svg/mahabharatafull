# Kniha počátku: tři úrovně poslechu a číslování 1, 2, 3…

## Co už funguje a zůstane

- **Celá kniha** — hlavní přehrávač celé Ádi Parvy beze změny.
- **Jednotlivé oddíly** — seznam oddílů vedle textu je klikatelný; po kliknutí se zobrazí text pouze toho jednoho oddílu s vlastním přehrávačem (vybírá se jen výřez textu, nenačítá se celá kniha).
- **Klíčové události** — každá položka je klikatelná; po kliknutí je vidět jen její text a pod ním její vlastní přehrávač. Tlačítko „Všechny klíčové události“ / „Celá kniha“ výběr ruší.

Tuto část jen ověřím v náhledu (oddíl, klíčová událost, návrat na celou knihu) — zásah do kódu tu není potřeba.

## Co se změní: číslování

V seznamu oddílů i v samotném textu knihy se místo římských číslic zobrazí „Oddíl 1“, „Oddíl 2“, … „Oddíl 235“.

Důležité zjištění z textu: nadpisů oddílů je 235 a jejich římská čísla nejsou spolehlivá — u 31 z nich číslo nesouhlasí s pořadím (např. po „Oddíl CLXXVII“ následuje „Oddíl CLXXVI“, jinde je číslo přeskočené). Proto se **nepřepočítávají římské číslice**, ale čísluje se **podle skutečného pořadí v textu**: první nadpis v knize = 1, druhý = 2, atd. Tím je zaručeno, že text zůstane v původním chronologickém pořadí a každý oddíl bude spárovaný přesně se svým textem — pořadí odstavců se nijak nemění, mění se pouze zobrazený nadpis.

## Vzhled

Žádné nové barvy, prvky ani rozložení. Pouze text nadpisů.

## Technické provedení

- `src/data/book-text.ts`: v `loadBookSegments` (i ve `bookFallback`) se po sestavení odstavců přejmenují nadpisy oddílů — segment odpovídající `SECTION_HEADING` dostane tvar `Oddíl <poradi>` podle průběžného počítadla. Pořadí ani počet segmentů a `paragraphIndex` se nemění, takže přehrávač, zvýrazňování slov i uložená pozice fungují dál.
- `sectionsOf` zůstává; jeho `title` tím automaticky nese arabské číslo, takže navigační seznam i titulek lokálního přehrávače ukazují „Oddíl 5“.
- `src/routes/knihy/$slug.tsx` a `src/components/AudioPlayer.tsx` se nemění.
- Změna se dotkne i druhé knihy (Sabhá Parva používá stejné načítání) jen v podobě nadpisů; pokud to nechcete, omezím přečíslování pouze na `adi-parva`.

## Kontrola

- Na `/knihy/adi-parva` seznam obsahuje „Oddíl 1“ … „Oddíl 235“, žádné římské číslice.
- Kliknutí na „Oddíl 3“ zobrazí týž text, který dnes patří třetímu oddílu v pořadí, a jeho přehrávač čte jen tento oddíl.
- Kliknutí na klíčovou událost zobrazí jen ji a její přehrávač.
- Hlavní přehrávač celé knihy čte dál od začátku.
