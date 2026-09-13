# Testování instalace aplikace na telefon před publikací

## Stav zjištěný kontrolou
- Manifest se servíruje správně (`/manifest.webmanifest`, typ `application/manifest+json`, kód 200).
- Ikony existují ve správných rozměrech: `icon-192.png` (192×192), `icon-512.png` (512×512), `apple-touch-icon.png` (180×180).
- Kořen aplikace už obsahuje všechny meta značky pro iOS (samostatné okno, tmavý vzhled, název „Mahábhárata").
- Náhledová adresa běží na HTTPS, takže instalace z náhledu funguje i bez publikování.

## Co se upraví (beze změny vzhledu)
1. **Doplnit `id` do manifestu** – stabilní identita aplikace, aby se instalace z náhledu i z publikované adresy chovala jako tatáž aplikace.
2. **Ověřit instalaci automatickým testem** – skript zkontroluje manifest, ikony, hlavičky i meta značky na běžícím náhledu a potvrdí, že prohlížeč aplikaci uzná jako instalovatelnou.

## Jak si to uživatel vyzkouší na telefonu (poinstruáž v závěru)
- **Android (Chrome):** otevřít náhledovou adresu → nabídka ⋮ → „Přidat na plochu" / „Nainstalovat aplikaci".
- **iPhone (Safari):** otevřít náhledovou adresu → Sdílet → „Přidat na plochu".
- Aplikace se pak otevře v samostatném okně s vlastní ikonou, přesně jako po publikování.

## Technické detaily
- Soubor `public/manifest.webmanifest`: přidat `"id": "/"`.
- Žádné nové tlačítko, okno ani změna designu; žádný service worker (není potřeba pro instalaci).
- Ověřovací skript v `/tmp/browser/` přes Playwright: načte stránku, vytáhne `<link rel="manifest">`, stáhne manifest a zkontroluje ikony a iOS meta značky.
