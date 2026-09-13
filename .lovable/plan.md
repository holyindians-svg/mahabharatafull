# Oprava hlasu: přirozená rodilá čeština

Cíl: hlas musí znít jako běžný český vypravěč, bez cizího přízvuku. Vzhled, rozvržení ani ovládací prvky se nijak nemění.

## Co se změní

### 1. Jiný hlas pro čtení
Dnešní hlas je z anglicky laděné sady, proto u českého textu zní s cizím přízvukem. Přejde se na hlasovou službu, která umí češtinu nativně, a vybere se mužský vyprávěcí hlas s českou výslovností. Pokud by tato služba selhala, čtení se automaticky přepne na dosavadní řešení, aby zvuk nikdy zcela nechyběl.

### 2. Zadání pro výslovnost
Hlasu se předá jasný pokyn: mluv česky jako rodilý mluvčí, klidné důstojné tempo, přirozená česká intonace, žádný ruský, ukrajinský ani anglický přízvuk. Sanskrtská jména se čtou v české podobě, jak jsou napsaná.

### 3. Text připravený k předčítání
Před čtením se text lehce upraví, aby nezněl cizorodě:
- vynechají se sanskrtské názvy v závorkách (v psaném textu na stránce zůstávají),
- odstraní se uvozovky, hvězdičky a další znaky, které hlas vyslovuje jako šum,
- číslice a zkratky se přečtou česky.

### 4. Čeština v generovaných odpovědích
Do zadání pro text se doplní pravidlo: odpovídej výhradně plynulou spisovnou češtinou, bez anglických slov a bez míchání jazyků; jestliže se v odpovědi objeví cizí slovo, uveď český ekvivalent.

## Co se nemění
- Vzhled, barvy, typografie, rozvržení, ikony, ilustrace.
- Žádné nové tlačítko, okno ani prvek; ovládání zůstává tam, kde je.
- Struktura stránek, navigace, data.

## Technické detaily
- `src/routes/api/speech.ts` — přechod na `google/gemini-2.5-pro-tts` (Google request shape: `contents` + `generationConfig.responseModalities: ["AUDIO"]` + `speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName`), pokyn k výslovnosti se prefixuje přímo do textu. Zachovává `stream_format: "sse"`; při chybě upstreamu jednorázový fallback na `openai/gpt-4o-mini-tts`.
- Gemini SSE posílá PCM v `speech.audio.delta` stejně jako OpenAI, takže klient (`src/lib/speak.ts`) zůstává kompatibilní; doplní se jen normalizace textu (`sanitizeForSpeech`: odstranění závorkových glos, `*`, `#`, `"`).
- `src/lib/mahabharata-context.server.ts` — zpřesnění `SYSTEM_PROMPT` a `NARRATION_PROMPT` (výhradně čeština, bez anglicismů).
- Ověření: `curl` na `/api/speech`, kontrola, že přichází `speech.audio.delta` a `speech.audio.done`, plus přehrání v prohlížeči.
