# Zlatý lotosový rámeček videí (zbraně i postavy)

## Co uživatel uvidí
Každé video v úvodu, tedy u Bhímovy Gady i u Bhímy, dostane jemný zlatavý rámeček. Rámeček má vnitřní stín a v každém rohu lotosový ornament, který míří do středu obrazu. Je vidět při celoobrazovkovém úvodu i v malé tiché smyčce. Při zmenšování se rámeček zmenšuje plynule spolu s videem a rohy se nedeformují. Na klikání ani na přeskočení nemá vliv.

## Jak
- Rámeček přidám do sdílené komponenty video úvodu. Automaticky ho tak dostanou všechny zbraně i postavy s videem.
- Video a rámeček obalím jedním kontejnerem. Zvětšení na celou obrazovku a zmenšení zpět se bude týkat celého kontejneru, ne jen videa. Rámeček se tak pohybuje přesně s obrazem. Měřítko je v obou směrech stejné, takže se rohy nezkreslí.
- Vrstva rámečku neblokuje klikání. Má průhledný zlatý okraj, vnitřní tmavý stín a zaoblení stejné jako video.
- Čtyři rohové lotosové ornamenty budou ve vlastním zlatém vektorovém tvaru. Vytvořím jeden ornament a do dalších rohů ho otočím. Jejich velikost se řídí šířkou videa, takže dobře vypadají na mobilu i na desktopu.
- Barvy vezmu z existující zlaté palety aplikace, ne z pevně zadaných odstínů.

## Ověření
V prohlížeči otevřu Bhímovu Gadu a Bhímu a zkontroluji rámeček během úvodu, při zmenšování a po něm. Ověřím také, že funguje „Přeskočit“ a že se stránka dá dál rolovat.
