# Bhímova Gadá – dokončení

Většina zadání už je hotová: karta i detail zbraně, video ve smyčce s rozplynulými okraji, pískově zlatý text ve skleněném rámečku, výskyty v textu podle slov „Bhíma“, „Bhímaséna“, „Gadá“, „palcát“ a předčítání.

## Co zbývá
1. **Globální hledání** – Gadá se objeví i ve výsledcích stránky „Hledat“. Hledání slov „gada“, „palcát“ nebo „Bhímova“ ji nabídne jako odkaz na její stránku, stejně jako ostatní zbraně.
2. **Vyprávěcí text** – v zadání je pořád jen značka „[ZDE VLOŽ PŘIPRAVENÝ TEXT]“. Nechám zatím tři odstavce, které jsem napsal sám podle eposu. Pokud pošlete vlastní text, vyměním ho beze změny vzhledu.
3. **Kontrola** – projdu stránku na počítači i na mobilu: video vedle textu a jako pás nad textem na mobilu.

## Technické detaily
- V `src/routes/hledat.tsx` nejdřív ověřím, jak se zbraně hledají. Pak do porovnání přidám `astra.keywords`, aby hledání vycházelo ze stejných dat v `astras.ts`.
- Malý test: dotaz „palcát“ najde `bhimova-gada`.
