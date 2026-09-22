# Přirozená výslovnost „ó“ v předčítání

Hlas zařízení někdy čte dlouhé „ó“ jako „o s čárkou“. Opravíme to na jednom místě, aby to platilo pro všechny knihy, oddíly, postavy, zbraně i odpovědi lupy – dnešní i budoucí.

## Co se změní

- Před odesláním do hlasu se každé „ó“ změní na „o“ a „Ó“ na „O“.
- Na stránce zůstane text přesně tak, jak je teď – správná čeština včetně „ó“ (např. Nalópákhjána). Mění se jen to, co slyšíte.
- Platí automaticky pro celou aplikaci: hlavní přehrávač knihy, přehrávače jednotlivých oddílů, předčítání u postav a zbraní i předčítání odpovědi lupy.
- Zvýrazňování slov během čtení zůstane přesně srovnané s textem.

## Co se nemění

Vzhled, barvy, rozložení, ilustrace, menu oddílů, ovládání přehrávačů, uložená pozice čtení, vyhledávání lupou ani jakékoli texty knih.

## Technická část

- `src/lib/speak.ts`: do `sanitizeForSpeech` přidat `.replace(/ó/g, "o").replace(/Ó/g, "O")`.
- Stejnou záměnu aplikovat i ve větvi pro knihy (`buildSegmentItems` / `speakBookPrecisely`), která `sanitizeForSpeech` nepoužívá – zvlášť pro text posílaný do `SpeechSynthesisUtterance`, ne pro segmenty použité k zvýrazňování. Záměna je 1 znak za 1 znak, takže znakové pozice pro `onWord`/`onSegment` zůstávají platné.
- Žádné změny v `public/texty/*.json` ani v datech postav.

## Kontrola

Typecheck a build; v náhledu spustit hlavní přehrávač a přehrávač jednoho oddílu u 1.–3. knihy a ověřit, že se zvýrazňování stále drží slov a zobrazený text obsahuje „ó“.
