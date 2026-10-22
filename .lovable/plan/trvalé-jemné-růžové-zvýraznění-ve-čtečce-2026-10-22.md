# Trvalé jemné růžové zvýraznění ve čtečce

## Co uživatel uvidí
- Odstavec, na který se proklikne z výskytu, zůstane zvýrazněný po celou dobu, co je oddíl otevřený. Zmizí až po zavření čtečky.
- Žlutou barvu nahradí jemný průsvitný růžový podklad se skleněným efektem a zaoblenými rohy. Text přes něj zůstane dobře čitelný ve světlém i tmavém vzhledu.

## Technické detaily
- `knihy-ke-cteni.tsx`: odstranit `setTimeout`/`clearTimeout` pro `flash`; při zavření overlaye `flash` vynulovat.
- `styles.css`: token `--highlight` změnit na průsvitnou růžovou (oklch, alfa ~0.15). Platí jedna hodnota pro oba vzhledy, protože aplikace má jen jedno `:root` téma. Zvýrazněný odstavec dostane `bg-highlight backdrop-blur-sm rounded-md px-1`, místo pevně zadaných barev Tailwindu, aby barva zůstala řízená tématem aplikace.
