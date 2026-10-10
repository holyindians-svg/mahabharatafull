# Nová ikona aplikace: zlatý luk, šíp a paví péro

## Výsledek
Nahraný znak (zlatý luk se šípem a pavím perem na tmavě modrém podkladu) se stane ikonou aplikace. Odkazy v hlavičky stránky budou přesně podle zadání mířit na `/icon.png` – jako běžná ikona záložek i jako ikona pro iPhone. Ikona na ploše telefonu, v seznamu nainstalovaných aplikací i ve starší ikoně ve formátu .ico se vymění za stejný nový znak, aby vše ladilo.

## Postup
1. Z nahraného obrázku (1024 × 1024) vytvořit `public/icon.png` (512 × 1024 → 512 × 512, PNG) – přesně podle zadání bude cílem obou odkazů.
2. V hlavičce aplikace (`src/routes/__root.tsx`) nahradit současné odkazy:
   - `<link rel="icon" type="image/png" href="/icon.png" />`
   - `<link rel="apple-touch-icon" href="/icon.png" />`
3. Ze stejného zdroje přegenerovat zbývající ikony, které se nepoužívají z hlavičky, ale z instalace na plochu: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` (180 × 180) a `favicon.ico`. Soubory i jejich názvy zůstanou, vymění se jen obrázek uvnitř.
4. U maskovatelné varianty ponechat luk s perem uvnitř bezpečné oblasti (cca 80 % plochy), takže při oříznutí telefonem na kruh nebo čtverec nic důležité nezmizí; tmavé pozadí doplňuje rohy až ke krajům.
5. Ověřit, že oba odkazy jsou v hlavičce, že všechny ikony existují ve správných rozměrech a že se načítají; build bez chyb.

## Technické detaily
- Zdroj: nahraný JPEG 1024 × 1024; převede se na PNG (`magick`) – JPEG se pro ikony nehodí (ztrátové pruhy).
- Všechny ikony zůstanou jako skutečné soubory v `public/` (favicon musí být přímý soubor, ne odkaz z CDN).
- `public/manifest.webmanifest` se nemění – jen obsah souborů, na které ukazuje.
- Žádné změny stránek, tlačítek, textů, postav ani přehrávače.
- Aby se nový znak objevil v aplikaci nainstalované na ploše telefonu, je potřeba aplikaci publikovat a jednou otevřít.
