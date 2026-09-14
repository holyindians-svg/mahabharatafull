# Odpověď z lupy se nečte — zpevnění přehrávání

Ověřil jsem, co se skutečně děje. Po kliknutí na lupu se odpověď vygeneruje a aplikace si i vyžádá hlas — v záznamech z vašeho náhledu je požadavek na čtení s hotovou odpovědí a server vrátil zvuková data (200). Ve zkušebním prohlížeči tady se odpověď i přehraje. Zvuk se tedy stahuje, ale u vás se nepřehraje — chyba je na straně přehrávání ve vašem prohlížeči, ne v generování textu.

Nejčastější důvody přesně tohoto chování:
- Mezi kliknutím a začátkem čtení je několik sekund (než AI odpoví). Některé prohlížeče, hlavně na iPhonu a v nainstalované aplikaci, mezitím zvuk uspí a bez nového klepnutí ho už nepustí.
- Na iPhonu tenhle způsob přehrávání ztiší i boční vypínač zvonění, i když je hlasitost nahoře.

## Co se změní

- Zvuk zůstane po celou dobu generování odpovědi bdělý, aby čtení mohlo začít i o několik sekund později.
- Přehrávání povede přes běžný zvukový výstup stránky, takže ho na iPhonu neztiší vypínač zvonění a funguje i v nainstalované aplikaci.
- Těsně před začátkem čtení se zvuk ještě raz probudí; když ho prohlížeč přesto nepustí, přečte odpověď vestavěným hlasem zařízení, aby uživatel slyšel odpověď vždy.
- Stejné zpevnění dostane i čtení u knih a u karet postav, aby se chovalo všude shodně.

## Co se nemění

- Vzhled, barvy, typografie, rozvržení, ilustrace, navigace.
- Žádné nové tlačítko, okno, modál ani plovoucí prvek.
- Odesílání dotazu lupou / Enterem, obsah odpovědi, karty knih, postav a zbraní, paměť odpovědí.

## Technické detaily

- `src/lib/speak.ts`:
  - Výstup přesměrovat z `ctx.destination` na `ctx.createMediaStreamDestination()` napojený na skrytý `<audio autoplay playsinline>` element (jediný, vytvořený jednou); tím se přehrávání řadí do mediální kategorie a obchází iOS silent switch i některá omezení v PWA.
  - `primeAudioPlayback()` navíc spustí `audio.play()` na tomto elementu ještě uvnitř gesta a nastaví krátký „keep-alive“: tichý oscilátor / opakovaně plánovaný jednosamplový buffer, který drží kontext v `running`, dokud nezačne skutečné čtení (a zruší se po jeho dokončení).
  - Ve `speak()` a `speakBookPrecisely()` před prvním plánováním znovu `await ctx.resume()` a `audio.play().catch(...)`; když je `ctx.state !== "running"` nebo se do ~1,5 s nespustí žádný zvuk, přepnout na `window.speechSynthesis` s českým hlasem (`lang="cs-CZ"`, rychlost dle `rate`) — stejné rozhraní `SpeakHandle` (`stop`, `setRate`, `setMuted`, `done`), aby volající kód zůstal beze změny.
- `src/routes/hledat.tsx`: bez zásahu do rozhraní; `primeAudioPlayback()` už se v `runSearch` volá, jen nově drží zvuk bdělý po celou dobu čekání na odpověď.
- Ověření: Playwright na desktopu i v mobilním profilu — po kliknutí na lupu zkontrolovat, že `AudioContext` je `running`, že se spustí zvukové zdroje, a v případě zablokovaného WebAudio že se zapne záložní hlas; kontrola build logů a typecheck.
