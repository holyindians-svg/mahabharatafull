# Tři způsoby čtení a poslechu první knihy

## Co už je hotové

- Hlavní přehrávač celé Ádi Parvy zůstává na svém místě, nezměněný.
- Vedle textu je klikatelný seznam všech oddílů (Oddíl I – CCXXXVI). Po kliknutí se zobrazí text jen toho oddílu a k němu vlastní přehrávač; tlačítko „Celá kniha“ výběr zruší.

## Co doplním (klíčové události)

Blok „Klíčové události“ je na stránce seznam devíti krátkých bodů. Dnes se jen zobrazují.

- Každý bod v seznamu se stane klikatelným — stejné karty, stejné číslování, stejné barvy, jen reagují na kliknutí.
- Po kliknutí na událost se zobrazí pouze její text a pod ním samostatný přehrávač, který přečte jen tuto jednu událost.
- Dalším kliknutím na tutéž událost (nebo přes „Celá kniha“) se výběr zruší a vrátí se celý seznam.
- Výběr oddílu a výběr klíčové události se nekříží: kliknutí na jedno zruší druhé, takže je vždy vidět jen jedna vybraná část s jedním lokálním přehrávačem.

Uživatel má tedy tři možnosti: celá kniha, konkrétní oddíl, konkrétní klíčová událost — každá se svým přehrávačem.

Platí zatím jen pro první knihu; ostatní knihy zůstávají přesně jako dnes.

## Vzhled

Žádné nové barvy, žádné nové rozložení. Aktivní položka se zvýrazní stejným zlatým stylem, jaký už používá aktivní oddíl.

## Technické provedení

- `src/routes/knihy/$slug.tsx`:
  - nový stav `selectedEvent: number | null` vedle stávajícího `selected`; settery se vzájemně nulují.
  - položky `parva.events` se z `li` změní na `li > button` (celá šířka, `text-left`), třídy karty zůstávají identické, přidá se jen podmíněné zvýraznění rámečku/pozadí jako u aktivního oddílu.
  - při `selectedEvent !== null` se místo celého `ol` vykreslí jedna karta s textem té události a pod ní `AudioPlayer` s `presetText` = text události, `title` = `Klíčová událost ${n}`, `subtitle` = `${parva.name} · klíčová událost`, `minutes` = odhad z počtu slov (min. 1), bez `progressKey` (krátký text).
  - vše ohraničené konstantou `SECTION_NAV_BOOKS` (jen `adi-parva`), takže ostatní knihy zůstanou bit-shodné.
- `src/components/AudioPlayer.tsx` a `src/data/book-text.ts` se nemění.

## Kontrola

- Kliknutí na klíčovou událost zobrazí jen její text a její přehrávač ji přečte celou a skončí.
- Kliknutí na oddíl a na událost se navzájem vylučují; „Celá kniha“ vrátí původní stav.
- Stránka Sabhá Parvy vypadá a funguje bez jakékoli změny.
