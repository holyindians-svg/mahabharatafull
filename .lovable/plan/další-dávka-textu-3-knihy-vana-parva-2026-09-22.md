# Další dávka textu 3. knihy (Vana Parva)

## Co se stane

1. **Připojení nové dávky do textu 3. knihy**
   - Nově dodané soubory: oddíly 4–6 (dosud chybějící) a oddíly 81–91.
   - Soubory `ai_studio_code_27.txt` a `_28.txt` jsou identické — použije se jen jeden.
   - Zdrojové soubory se zkopírují do `src/data/texty-zdroje/vana-parva/` a přegeneruje se `public/texty/vana-parva.json` stávajícím skriptem `scripts/build-book-text.mjs`.
   - Skript řadí dávky podle čísla prvního oddílu, takže oddíly 4–6 se vloží na správné místo (za oddíl 3) a 81–91 se připojí na konec.
   - Číslování oddílů v menu se dopočítá automaticky podle skutečného pořadí textu; podkapitola Tírthajátrá Parva se roztáhne přes nové oddíly.

2. **Nic jiného se nemění**
   - Vzhled menu (skupiny podle podnadpisů, tlačítka „od. X“), hlavní i oddílové přehrávače, klíčové události, 1. a 2. kniha, postavy, zbraně, lupa i předčítání zůstávají beze změny.
   - Žádná upozornění na neúplnost knihy se nezobrazují.

## Kontrola

- Typecheck a build.
- Náhled `/knihy/vana-parva`: nový počet tlačítek, správné pořadí, klik na oddíl zobrazí jen jeho text s přehrávačem.
- Náhled `/knihy/adi-parva` a `/knihy/sabha-parva`: beze změny.
