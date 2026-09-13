# Náhrada API klíče a ověření funkčnosti

Aplikace už má vše potřebné hotové (vyhledávání odpovídá z textu, předčítání načítá text, klikací vazby pod postavami odesílají dotaz). Jediný problém je neplatný přístupový klíč ke službě.

## Co se udělá

### 1. Náhrada klíče
- Stávající nefunkční klíč `GOOGLE_API_KEY` se přepíše novou hodnotou, kterou jste poskytl.
- Klíč zůstává uložený jen na serveru — nikdy se nedostane do prohlížeče.

### 2. Ověření, že vše funguje
- Zkušební dotaz (např. „Kdo je Krišna?") musí vrátit odpověď z textu eposu.
- Kontrola v prohlížeči:
  - Předčítání u postavy (tlačítko přehrávání načte text).
  - Klikací vazby pod postavou (kliknutí zobrazí vysvětlení v panelu).
  - Vyhledávací pole na stránce „Hledat v textech" (dotaz vypíše odpověď).

## Co se nemění
- Vzhled, barvy, typografie, rozvržení, obrázky.
- Žádná nová tlačítka, okna ani prvky.
- Stávající prvky a klikací položky fungují v původním rozhraní.

## Technické detaily
- `secrets--set_secret` pro `GOOGLE_API_KEY` novou hodnotou.
- Test endpointu `src/routes/api/chat.ts` přes `curl` a Playwright kontrola stránek `/postavy/krisna` a `/hledat`.
