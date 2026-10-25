# Čistý zlatý rámeček u všech videí profilů

Všechny profily s videem (Bhímova Gadá, Bhímaséna, Ardžuna i budoucí) používají jednu sdílenou video komponentu, takže změna se projeví plošně najednou.

## Změny
1. Odstranit zdobnou vrstvu: lotosové rohy, vnitřní rámeček a vnitřní/zářivé stíny.
2. Nový rámeček přímo na kontejneru videa: tenká zlatá linka 2px (jantarový odstín z barev aplikace), zakulacené rohy `rounded-2xl`, `overflow-hidden`, aby video nepřesahovalo rohy.
3. Fáze 1 (full-screen intro): rámeček i zaoblení plynule zmizí (0px, bez okraje), aby video vyplnilo displej bez rámování na hranách obrazovky.
4. Fáze 2 (po zmenšení): rámeček se plynule objeví spolu se zmenšením; zaoblení 16px odpovídá `rounded-2xl`.

## Technické detaily
- Soubor: `src/components/AstraIntroVideo.tsx` — smazat funkci `LotusFrame` a její použití.
- Okraj řešit animovatelně (border-color z transparentní na `--primary`/amber, radius synchronizovaný s existujícím `clipPath`), bez layout shiftu.
- Ověření: build log + Playwright snímek profilu po přeskočení intra.
