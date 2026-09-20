# Klíčové události 1. knihy: čistě statický text

## Co zůstává beze změny

- Hlavní přehrávač celé Ádi Parvy.
- Klikatelné oddíly s vlastními přehrávači a číslováním 1, 2, 3…
- Vzhled, barvy, rozložení a zbytek aplikace.

## Co se změní

Sekce „Klíčové události" u první knihy se vrátí na jednoduchý statický textový seznam:

- Položky přestanou být tlačítky — žádná klikatelnost, po kliknutí se nic nestane.
- Odstraní se rámečky, podbarvení, hover efekty a vše, co vizuálně připomíná tlačítko. Zbude jen čistý text s tučným číslem/nadpisem, který zapadne do stylu stránky.
- Zmizí zvýraznění aktivní události, tlačítko „Všechny klíčové události" a lokální přehrávač, který se u vybrané události zobrazoval — u klíčových událostí žádné audio nebude.

## Technické provedení

- `src/routes/knihy/$slug.tsx`:
  - Odstraní se stav `selectedEvent`, `eventText`, `eventMinutes` a celý blok podmíněného vykreslení s kartou události a jejím `AudioPlayer`.
  - Tlačítka u jednotlivých událostí se nahradí obyčejnými `li` (stejný styl jako dnes u ostatních knih: flex, číslo `font-display`, text) — bez `button`, bez `hover`, bez rámečku; jemné oddělení jen volným prostorem, žádné ohraničení ani pozadí.
  - Tlačítko „Celá kniha" v panelu oddílů se zjednoduší (už nebude nulovat `selectedEvent`).
- `src/data/book-text.ts`, `src/components/AudioPlayer.tsx` a všechny ostatní soubory se nemění.

## Kontrola

- Klíčové události vypadají jako obyčejný text, nejde na ně kliknout a nic nezobrazí.
- U nich není žádný přehrávač ani tlačítko „Všechny klíčové události".
- Klikání na oddíly s jejich přehrávači funguje jako dosud, hlavní přehrávač beze změny.
- Build a typecheck bez chyb, ověřeno v náhledu.
