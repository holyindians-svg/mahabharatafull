# Prohození portrétů Satjavatí a Kuntí

## Co uživatel uvidí
- Satjavatí dostane portrét, který má teď Kuntí, a Kuntí dostane portrét Satjavatí. Prohodí se všude, kde se portréty ukazují: v seznamu postav, na detailu postavy i v kartách „Další ze skupiny“.
- Jména, popisky, vztahy a ostatní texty zůstanou beze změny.

## Technické detaily
- Portréty nejsou uložené v Lovable Cloud. Berou se z mapy obrázků v `src/data/images.ts`.
- V této mapě se prohodí jen dva řádky: `"satjavati": characters7` a `"kunti": characters1`. Soubory obrázků ani `characters.ts` se nemění.
- Ověření: snímky detailů `/postavy/satjavati` a `/postavy/kunti` ukážou prohozené portréty.
