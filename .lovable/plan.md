# Předčítání zdarma hlasem zařízení

Hlas se přestane brát z placené služby. Aplikace bude číst vestavěným hlasem telefonu nebo počítače — zdarma, bez čekání na stahování zvuku a bez ubírání kreditů.

## Co se změní

- Předčítání u knih, postav a zbraní i čtení odpovědi z lupy použije hlas zařízení (český, mužský, když je v systému dostupný).
- Zvýrazňování právě čteného slova, posun textu, klik na větu a paměť místa, kde jste přestali, zůstávají — nově se řídí přímo mluveným slovem hlasu zařízení.
- Rychlost 1× / 1,25× / 1,5× a ztlumení fungují stejně jako dnes.
- Když zařízení žádný český hlas nemá, aplikace to jednou tiše oznámí v místě, kde už dnes hlásí chybu — žádné nové okno.

## Co se nemění

- Vzhled, barvy, typografie, rozvržení, ilustrace, ikony, navigace, data.
- Žádná nová tlačítka, okna ani plovoucí prvky.
- Vyhledávání a odpovědi na dotazy zůstávají beze změny (ty klíč používají dál — hlas už ne).

## Poznámka

Hlas zařízení zní o něco jinak než dosavadní cloudový vypravěč a jeho kvalita se liší podle telefonu či prohlížeče. Zato je zdarma, okamžitý a funguje i bez internetu.

## Technické detaily

- `src/lib/speak.ts` — `speechSynthesis` se z fallbacku stane hlavní cestou: `speak()` i `speakBookPrecisely()` půjdou přes `SpeechSynthesisUtterance` (výběr `cs-CZ` hlasu, preference mužského podle jména), časování slov ze `onboundary` (s dopočtem pro prohlížeče, které `onboundary` nedávají). Zachová se stávající `SpeakHandle` rozhraní (stop, pauza, `done`, rate, muted), aby volající kód nemusel měnit.
- Cloudová cesta (`AudioContext` + PCM ze `/api/speech`) se přestane volat; kód zůstane v souboru jako nepoužitá záloha nebo se odstraní podle výsledku úklidu.
- `src/routes/api/speech.ts` — endpoint se ponechá, ale aplikace ho už nevolá.
- `AudioPlayer.tsx` a `hledat.tsx` beze změny kromě případného odstranění `primeAudioPlayback` volání, které už není potřeba.
