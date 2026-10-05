# Nastavení hlasu s trvalým uložením

## Co přibude
1. **Položka „Nastavení hlasu“ v hlavní nabídce** (boční panel na počítači i výsuvné menu na mobilu), s ikonou ozubeného kola, ve stejném stylu jako ostatní položky.
2. **Nová stránka „Nastavení hlasu“** ve vzhledu aplikace:
   - rozbalovací seznam všech hlasů zařízení (české nahoře, u každého název a jazyk; první volba „Automaticky – český hlas“),
   - posuvník Rychlost 0,5× – 1,5× (výchozí 1,0×),
   - posuvník Výška hlasu 0,5 – 1,5 (výchozí 1,0),
   - tlačítko „Vyzkoušet“ (přečte krátkou ukázkovou větu) a „Obnovit výchozí“.
3. **Trvalé uložení**: každá změna se hned uloží do paměti zařízení a po zavření, obnovení nebo návratu za měsíc se načte zpět.
4. **Platí všude**: knihy (celá kniha i oddíly), postavy, zbraně i odpovědi lupy. Před každým začátkem čtení se načte uložený hlas, rychlost a výška. Pokud vybraný hlas na zařízení zrovna není, použije se český hlas jako dosud.

## Jak se to skládá s přehrávačem
Stávající volba 1× / 1,25× / 1,5× v přehrávači zůstává a násobí rychlost z nastavení (např. nastavení 0,9× a přehrávač 1,25× = 1,125×). Úprava „ó“ → „o“ pro hlas zůstává.

## Co se nemění
Vzhled ostatních stránek, texty knih, oddíly, zvýrazňování slov, pamatování pozice, lupa.

## Technické detaily
- `src/lib/voice-settings.ts`: `loadVoiceSettings()/saveVoiceSettings()` (localStorage klíč `mahabharata:voice-settings`, `{voiceURI, rate, pitch}`, validace a ořez rozsahů), malý odběr změn.
- `src/lib/speak.ts`: v `speakItem` číst nastavení při každé promluvě; `pickVoice` nejprve hledá uložený `voiceURI`; `utterance.rate = rate * settings.rate`, `utterance.pitch = settings.pitch` (místo pevných 0.95); odhad průběhu počítá s výslednou rychlostí.
- `src/routes/nastaveni-hlasu.tsx`: stránka se shadcn `Select` a `Slider`, hlasy načteny v `useEffect` + `voiceschanged`; vlastní `head()`.
- `src/components/AppShell.tsx`: položka `{ to: "/nastaveni-hlasu", label: "Nastavení hlasu", sanskrit: "Svara", icon: Settings }`.
