# Druhá kniha (Sabhá Parva) česky — ke čtení, poslechu i hledání

Dnes je v aplikaci v češtině celý text jen první knihy (Ádi Parva, 1715 odstavců). Druhá kniha je uložená pouze v anglickém Ganguliho znění (448 odstavců), takže se nedá číst ani předčítat a lupa v ní hledá anglicky.

## Co se udělá

- Celý text druhé knihy (Sabhá Parva), od prvního po poslední oddíl, se přeloží do plynulé češtiny ve stejné kvalitě a struktuře jako první kniha: nadpisy oddílů zůstanou (Oddíl I, II, …), jména v české transkripci (Judhišthira, Draupadí, Durjódhana, Šakuni).
- Přeložený text se uloží přímo do aplikace, takže se otevře okamžitě, bez čekání a bez dotazu přes klíč.
- Na stránce druhé knihy začne fungovat stejné předčítání jako u první: plynulé čtení od začátku do konce, zvýrazňování právě čteného slova, posun textu, klik na větu začne od ní a pozice se pamatuje.
- Lupa bude ve druhé knize hledat v češtině — najde tedy i hru v kostky, Draupadino ponížení nebo Judhišthirovu obětní slavnost přímo v českém znění a odpověď uvede knihu, ze které pochází.

## Co se nemění

- Vzhled, barvy, typografie, rozvržení, ilustrace, navigace.
- Žádné nové tlačítko, okno ani prvek — použije se stávající přehrávač a stávající vyhledávací pole.
- První kniha, karty postav a zbraní i ostatní knihy fungují beze změny.

## Postup a technické detaily

- Překlad proběhne jednorázovým skriptem při implementaci: anglické odstavce knihy 2 z `public/texty/mahabharata/cast-1.json` se po blocích (~8–10 odstavců) přeloží přes Lovable AI Gateway (`openai/gpt-6-astra`) s pokynem na plynulou češtinu, českou transkripci jmen, zachování nadpisů oddílů a bez zkracování. Výsledek se uloží jako `public/texty/sabha-parva.json` ve stejném formátu jako `adi-parva.json` (`{ "paragraphs": [...] }`).
- Tytéž české odstavce nahradí knihu 2 v `public/texty/mahabharata/cast-1.json`, aby lupa hledala v češtině.
- `src/data/adi-parva-text.ts` → zobecní se na načítání podle knihy: `loadBookSegments(slug)` s mapou `slug → /texty/<slug>.json` (`adi-parva`, `sabha-parva`); stávající funkce (`toReadableParagraphs`, `paragraphIndexFor`, fallback z `narrations`) zůstávají, cache bude per slug.
- `src/routes/knihy/$slug.tsx` — `hasFullText` se rozšíří na množinu slugů s plným textem a použije `loadBookSegments(parva.slug)`; JSX i props `AudioPlayer` beze změny.
- `src/components/AudioPlayer.tsx`, `src/lib/speak.ts`, `src/lib/epos-search.server.ts`, `src/routes/api/chat.ts` beze změny.
- Kontrola po překladu: počet odstavců i nadpisů oddílů musí odpovídat originálu (448 odstavců), žádný blok nesmí zůstat anglicky; nakonec typecheck, build a ověření čtení druhé knihy v náhledu.
- Poznámka: překlad ~440 tisíc znaků je delší dávková operace (desítky volání modelu); pojede na pozadí ve fázi implementace a proběhne po částech, aby se nic neztratilo.
