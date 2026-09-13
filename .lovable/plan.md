# Ikona Mahábháraty bez bílého okraje

## Výsledek
Dodaná čakra s písmenem M zůstane zachována, ale tmavomodré pozadí vyplní celý čtverec až do krajů. Na ploše Androidu, iPhonu i ve faviconě se už nebude zobrazovat bílý rám.

## Postup
1. Upravit dodanou ikonku jako obrazový zdroj: odstranit pouze vnější bílou plochu, plynule rozšířit stávající tmavomodré pozadí do všech rohů a zachovat čakru, písmeno M, zlaté světlo i jejich proporce.
2. Z upraveného bezešvého čtverce vytvořit všechny používané velikosti: 512 × 512, 192 × 192, 180 × 180 pro iPhone a faviconu.
3. Aktualizovat manifest tak, aby běžná i maskovatelná varianta odkazovala na správné soubory. U maskovatelné varianty ponechat hlavní znak uvnitř bezpečné oblasti, zatímco pozadí bude pokračovat až k okrajům.
4. Zachovat stávající názvy a odkazy ikon, aby se nezměnilo rozhraní ani instalace aplikace.
5. Ověřit rozměry, nulový podíl bílých krajních pixelů, manifest a zobrazení ikon v běžné i samostatně spuštěné mobilní aplikaci.

## Technické detaily
- Zdroj: dodaný obrázek 1024 × 1024; naměřená bílá plocha tvoří přibližně 26 % obrazu a zasahuje všechny kraje.
- Výstupy: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` a `favicon.ico`.
- Manifest zůstane bez offline režimu a bez nového service workeru; mění se pouze obrazové soubory a případné rozlišení běžné/maskovatelné ikonky.
- Žádné změny stránek, tlačítek, textů, postav ani přehrávače.