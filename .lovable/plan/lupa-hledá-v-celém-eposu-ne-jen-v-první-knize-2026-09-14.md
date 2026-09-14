# Lupa hledá v celém eposu, ne jen v první knize

Dnes lupa prohledává plný text jen první knihy (Ádi Parva) a k tomu encyklopedické popisky aplikace. Dotaz na válku na Kurukšétře, na Bhagavadgítu nebo na odchod Pánduovců proto nemá v čem hledat.

## Co se změní

- Do aplikace se doplní text zbývajících knih (2–18) z Ganguliho překladu, rozdělený na čtyři části podle vašeho zadání:
  - Část 1: knihy 1–5 (Ádi, Sabhá, Vana, Virata, Udjóga)
  - Část 2: knihy 6–9 (Bhíšma, Dróna, Karna, Šalja)
  - Část 3: knihy 10–14 (Sauptika, Strí, Šánti, Anušásana, Ašvamédhika)
  - Část 4: knihy 15–18 (Ášramavásika, Mausala, Maháprasthánika, Svargárohanika)
- Podle tématu dotazu se vybere ta část, kam událost patří (začátek příběhu a vyhnanství → část 1; velká válka a Bhíšma, Dróna, Karna → části 2 a 3; poučení a odchod Pánduovců → části 3 a 4). Když si tím systém není jistý, prohledá přednostně části 2 a 3.
- V nalezené části se vyberou nejlépe odpovídající pasáže a odpověď z nich vychází.
- Odpověď je vždy česky, plynule, stručně a přívětivě, a uvádí knihu (Parvu), odkud informace pochází.
- První kniha zůstává v češtině, jak je uložená dnes; u ostatních knih se pasáže z anglického Ganguliho překladu převedou do české odpovědi.

## Co se nemění

- Vzhled, barvy, typografie, rozvržení, ilustrace, navigace.
- Žádné nové tlačítko, okno ani prvek: vyhledávací pole, lupa, nápovědné výrazy i plocha s výsledky zůstávají stejné.
- Předčítání odpovědi nahlas, karty knih, postav a zbraní i přehrávání první knihy fungují beze změny.

## Technické detaily

- `public/texty/mahabharata/cast-1..4.json` (nové) — texty knih rozdělené na části; každá část nese odstavce se značkou knihy (`{ book, paragraph }`). Část 1 přebírá stávající český `adi-parva.json` pro první knihu, ostatní knihy pocházejí z volně dostupného Ganguliho překladu (sacred-texts), stažené a rozsekané jednorázovým skriptem při implementaci.
- `src/lib/adi-parva-search.server.ts` → přejmenováno/rozšířeno na `src/lib/epos-search.server.ts` — `findPassages(question)` skóruje odstavce podle klíčových slov (stávající normalizace a stopwords), ale nejprve `pickParts(question)` vybere 1–2 části podle tematických záchytných slov (jména knih, postav, bitvy, filozofie); fallback = části 2 a 3. Načtené části se drží v paměti serveru, výsledek zůstává omezený (~18 000 znaků, ~10 míst se sousedními odstavci), každý blok nese název knihy.
- `src/routes/api/chat.ts` — sekce „NALEZENÉ PASÁŽE" nahradí dosavadní „NALEZENÉ PASÁŽE Z ÁDI PARVY" a obsahuje označení knihy u každého bloku; režim `narrate` beze změny.
- `src/lib/mahabharata-context.server.ts` — do `SYSTEM_PROMPT` se doplní: uvádět knihu (Parvu) jako zdroj, odpovídat stručně a přívětivě, anglické pasáže vždy podat česky.
- `src/routes/hledat.tsx`, `src/lib/ask-ai.ts`, `src/lib/speak.ts` beze změny.
