# Mahábhárata — vizuální encyklopedie

Rozsáhlá, temně laděná encyklopedie indického eposu: 18 knih (Parv), desítky postav a magické zbraně (astry), vše v bohatých obrazových kartách s elegantním (vzhledovým) přehrávačem předčítání.

## Vzhled

- Tmavé téma s akcenty temně červené, královské modré a zářivé zlaté.
- Zlaté ornamentální linky, jemné zrno/textura, monumentální úvodní obrázek.
- Písma: dekorativní serif na nadpisy, čitelný sans na text.
- Atmosférické fotografie z Unsplash u každé knihy, postavy i zbraně.
- Texty česky, sanskrtské názvy v originále vedle českých (např. Ardžuna / Arjuna).

## Struktura aplikace

Boční panel s odkazy:

1. **Domů** — monumentální hero, úvod do eposu, rychlé vstupy do sekcí, statistiky (18 knih, 40+ postav, 15 zbraní).
2. **Knihy Mahábháraty** — mřížka 18 Parv s obrázky; klik otevře detail knihy (souhrn, klíčové události, postavy v knize, přehrávač).
3. **Genealogie a Postavy** — karty rozdělené do skupin: Předci a starší, Učitelé, Pánduovci a spojenci, Kauravové a spojenci, Božské postavy a Jádavové; filtr podle skupiny a hledání jménem; detail postavy s portrétem, popisem, vztahy a přehrávačem.
4. **Zbraně a artefakty (Astry)** — karty magických předmětů s popisem účinku, vlastníkem a božstvem; detail s přehrávačem.
5. **Hledat v textech** — vyhledávací pole napříč knihami, postavami a zbraněmi (výsledky seskupené podle typu).

## Přehrávač předčítání

Elegantní panel v detailu knihy, postavy i zbraně: tlačítko Play/Pause, posuvník průběhu, aktuální a celkový čas, rychlost. Vypadá a chová se jako funkční přehrávač (průběh se pohybuje), ale zvuk se nepřehrává — připraveno na pozdější doplnění skutečného audia.

## Obsah dat

- Všech 18 Parv s českým i sanskrtským názvem, popisem a obrázkem.
- Všechny postavy ze zadání (cca 40) s popisem, skupinou, rodinnými vazbami a portrétem.
- Všech 15 zbraní/artefaktů s popisem účinku.

Data jsou uložena v aplikaci jako statická sada, strukturovaná tak, aby se dala později bez přepisování obrazovek napojit na databázi.

## Technické poznámky

- TanStack Start routy: `/` (Domů), `/knihy`, `/knihy/$slug`, `/postavy`, `/postavy/$slug`, `/astry`, `/astry/$slug`, `/hledat`.
- Sdílený layout s bočním panelem v `__root.tsx` (na mobilu vysouvací).
- Design tokeny (barvy, gradienty, stíny) v `src/styles.css`, komponenty shadcn s vlastními variantami; žádné hardcoded barvy.
- Datové moduly v `src/data/{parvas,characters,astras}.ts` s typy — jednoduchá pozdější výměna za backend.
- `AudioPlayer` komponenta se simulovaným průběhem (bez zvuku).
- Vlastní head() s titulkem a popisem pro každou routu.
- Bez backendu; hledání běží nad lokálními daty.
