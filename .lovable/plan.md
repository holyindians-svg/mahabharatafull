# Nastavení hlasu: jen české hlasy, obnovení hlasů a návod na prémiové hlasy

## Co se změní na stránce „Nastavení hlasu“
1. **Jen české hlasy v seznamu:** v seznamu hlasů budou jen hlasy s jazykem začínajícím na „cs“ (cs-CZ, cs_CZ, cs) nebo se slovem „Czech“ / „čeština“ v názvu. Ostatní jazyky se tam vůbec neukážou. První volba „Automaticky – český hlas“ zůstane.
2. **Tlačítko „Obnovit hlasy z telefonu“** s ikonou obnovení hned vedle seznamu. Znovu načte hlasy ze zařízení, znovu je profiltruje na češtinu a aktualizuje seznam. Potom krátce ukáže, kolik českých hlasů našlo. Když zařízení žádný český hlas nemá, objeví se pod seznamem krátká věta, že je potřeba ho doinstalovat (viz návod).
3. **Rozbalovací návod** pod nastavením: „Jak získat mnohem přirozenější a prémiový hlas bez internetu?“ Uvnitř bude přesně váš text pro iOS (Apple) a pro Android.
4. **Trvalé uložení:** zvolený hlas se hned uloží do zařízení (už to funguje) a použije se při každém dalším spuštění. Pokud uložený hlas není český nebo už v zařízení není, čte se automaticky vybraným českým hlasem.

## Co se nemění
Posuvníky rychlosti a výšky, tlačítka „Vyzkoušet“ a „Obnovit výchozí“, přehrávače, texty a ostatní stránky.

## Technické detaily
- `src/lib/voice-settings.ts`: přidat `isCzechVoice(v)` (lang normalizovaný `_`→`-`, lowercase, `startsWith("cs")`, nebo jméno obsahuje „czech“/„čeština“/„cestina“).
- `src/routes/nastaveni-hlasu.tsx`: v `load` filtrovat přes `isCzechVoice`, řadit podle názvu. Tlačítko s ikonou `RefreshCw` (lucide) zavolá `speechSynthesis.getVoices()` a pak `load()` ještě jednou po ~500 ms (hlasy se doplňují pomaleji), toast přes sonner. Pokud je uložený `voiceURI` mimo seznam, zobrazit Automaticky. Návod pomocí shadcn `Collapsible` (nebo `Accordion`) ve stylu karty.
- `src/lib/speak.ts`: uložený hlas použít jen když projde `isCzechVoice`, jinak `pickVoice`.
- Ověření: typecheck a Playwright na /nastaveni-hlasu (simulované hlasy cs i en → v seznamu jen cs, funguje tlačítko obnovení i rozbalení návodu).
