# Plynulé sledování textu a paměť místa, kde jste přestali

Dvě úpravy u poslechu Ádi Parvy. Vzhled, barvy, rozvržení, tlačítka, postavy ani okna se nemění.

## 1. Text běží plynule, bez přeskakování

Dnes se zvýrazňuje jedna věta a okno u každé věty poskočí. Navíc si aplikace samotné automatické posunutí spletla s ručním posunem, takže se sledování občas samo vypnulo a pak zase skokem dohnalo. Nově:

- Zvýrazní se celý právě čtený odstavec a v něm jemněji věta, která právě zní — oko tak neztrácí místo v textu.
- Okno se posouvá klidně a jen tehdy, když se čtená pasáž blíží k okraji viditelné plochy; malé pohyby uvnitř plochy nic neposouvají.
- Ruční posun se pozná jen podle skutečného dotyku, kolečka nebo přetažení. Po chvíli se sledování samo vrátí ke čtenému místu.
- Zvýraznění jde vždy jen dopředu, nikdy nepřeskočí zpět na starší část.

## 2. Pamatuje si, kde jste skončili

- Místo v knize se průběžně ukládá do paměti zařízení.
- Po zavření aplikace, vypnutí zařízení nebo pozdějším návratu se text otevře přesně na uloženém místě a přehrávání odtud pokračuje — už žádný skok na začátek.
- Tlačítko „zpět na začátek" uloženou pozici smaže, takže se dá začít znovu od začátku.
- Uloží se zvlášť pro každou knihu, spolu s naposledy zvolenou rychlostí čtení.

## Technické detaily

- `src/components/AudioPlayer.tsx`
  - nový volitelný prop `progressKey?: string` (např. `book:adi-parva`) a `paragraphOf?: (index: number) => number` mapa věta → odstavec; bez nich se komponenta chová jako dnes.
  - `active` se aktualizuje monotónně (`setActive((p) => (p === null || i > p ? i : p))`).
  - odstavcové zvýraznění: obal každého odstavce `bg-primary/10`, aktivní věta `text-foreground`; stávající třídy zůstávají.
  - auto-scroll: nahradit `scrollIntoView` výpočtem nad `scrollBox` — posunout jen když je aktivní řádek mimo pás 25–75 % výšky plochy, `scrollTo({ top, behavior: "smooth" })`; programový posun hlídat příznakem `autoScrolling` (reset v `scrollend`/timeout), takže `onScroll` už neblokuje sám sebe. Ruční pauza se nastavuje z `onWheel`/`onTouchStart`/`onPointerDown` (6 s), ne z `onScroll`.
  - persistence: `localStorage` klíč `mahabharata:progress:<progressKey>` = `{ index, rate }`, zapisuje se s throttlem ~2 s při změně `active` a při `stop`; čte se v `useEffect` po hydrataci (žádný SSR přístup) a nastaví `active` bez spuštění zvuku; `togglePlay` startuje `startBook(active ?? 0)` — už funguje. Tlačítko `RotateCcw` navíc `localStorage.removeItem(...)` a `setActive(0)`.
- `src/data/adi-parva-text.ts` — vedle vět vrátit i `paragraphIndex: number[]` (ze stávajícího `toSentences` mapování), aby šlo seskupit věty do odstavců.
- `src/routes/knihy/$slug.tsx` — předat `progressKey={"book:" + parva.slug}` a mapu odstavců.
- `src/lib/speak.ts` bez nových schopností; jen dnešní `startIndex` se použije z obnovené pozice.
- Bez nových závislostí, bez databáze, bez volání přes klíč pro tuto knihu.
