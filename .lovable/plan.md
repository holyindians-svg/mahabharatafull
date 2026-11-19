# Volitelné offline stažení audioknih

## Důležité upozornění
Nahrávka Knihy počátků (Ádiparva) má **2,25 GB**. Stažení na mobilních datech je velké a na iPhonu může prohlížeč tak velký soubor odmítnout nebo smazat (Safari má přísné limity úložiště). V takovém případě aplikace ukáže českou hlášku o nedostatku místa a nedokončený soubor smaže. Na Androidu v Chrome by to mělo jít, pokud je v telefonu volné místo. Ostatní knihy MP3 zatím nemají, proto se tlačítko objeví jen u nich, až budou mít nahrávku.

V aplikaci neexistuje styl „Śrīmad Bhāgavatam“. Použiji stávající zlatý skleněný styl tlačítek přehrávače.

## Co uvidíte
- **U karty Ádiparvy a v hlavičce přehrávače / detailu oddílu** tlačítko s obláčkem a šipkou „Stáhnout offline · 2 147 MB“. Během stahování ukazuje průběh v % a MB. Po dokončení zelenou fajfku; kliknutí (s potvrzením) knihu smaže a uvolní místo.
- **V horní liště** nenápadná ikonka „Offline úložiště“. Otevře okno se seznamem stažených knih, velikostí každé, celkem zabraným místem, tlačítkem smazat u každé a „Smazat vše“.
- Stažená kniha se přehrává z telefonu i bez internetu, včetně skoků na oddíly, karaoke a přehrávání na pozadí. Jinak se streamuje jako dosud.

## Technické detaily
- `src/lib/offline-audio-store.ts` (Cache API `mhb-offline-audio-v1`):
  - `downloadOfflineAudio(bookId)`: `fetch` + `ReadableStream` reader, průběh podle `content-length`. Části se skládají do Blobu a uloží se `cache.put(audioUrl, new Response(blob))` s hlavičkami velikosti. Lze zrušit přes AbortController. Před stažením se zavolá `navigator.storage.persist()` a zkontroluje `navigator.storage.estimate()`: když nestačí místo, hned se ukáže hláška.
  - Stavy `not_downloaded | downloading | downloaded | error`, velikost v MB a součet. Jednoduchý store se subscribe a hook `useOfflineAudio()` (useSyncExternalStore). Stav se po startu načte z cache, jen v prohlížeči.
  - `removeOfflineAudio(bookId)`, `clearAllOfflineAudio()`, `getOfflineAudioUrl(bookId)`: vrací ObjectURL z uložené odpovědi s jednou keší na URL a revoke při smazání.
  - `QuotaExceededError` (i jako `DOMException` z `cache.put`): přerušit, smazat záznam, stav `error` a hláška „V zařízení není dost místa…“.
- `AudioPlayer.tsx`: ObjectURL se kvůli iOS gestu nesmí získávat asynchronně v kliknutí, proto se připraví předem. Při mountu a při změně stavu stažení se ObjectURL vyřeší do ref. Synchronní `playRange` pak použije offline URL, pokud je připravená, jinak online URL. Seek, oddíly, karaoke, analytika i dashboard zůstávají beze změny, protože se mění jen `src`. Pokud je stažení smazáno během hraní, aktuální přehrávání doběhne a další start už streamuje.
- `background-audio.ts`: Media Session funguje beze změny. Ověřím, že nespoléhá na konkrétní URL.
- UI: komponenta `OfflineDownloadButton` použitá v `EntityCard` (karta knihy s audioknihou), v `knihy/$slug.tsx` u přehrávače a v `AudioSectionDetail`. `OfflineStorageDialog` (shadcn Dialog) je vyvolaný ikonou v `AppShell`. Tlačítka mají min. 44 px.
- Service worker MP3 nekešuje, takže nevznikne kolize. Doplním pravidlo do `AGENTS.md`.
- Testy (node:test) s falešným Cache API a fetch stream:
  1. průběh dosáhne 100 % a stav je `downloaded` se správnými MB,
  2. QuotaExceededError → stav `error`, záznam smazán,
  3. `removeOfflineAudio` a `clearAllOfflineAudio` vynulují obsazené místo.
- Omezení: skutečné stažení 2,25 GB a přehrávání offline na telefonu ověřit nemohu, ověřím v prohlížeči na zmenšeném testovacím souboru.
