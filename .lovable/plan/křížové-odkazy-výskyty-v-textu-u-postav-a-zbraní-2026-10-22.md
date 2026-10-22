# Křížové odkazy: „Výskyty v textu“ u postav a zbraní

## Co uživatel uvidí
- Na detailu postavy (včetně mudrců/rišiů) a zbraně zůstane vše jako dnes. Pod popisem přibude sekce **„Výskyty v textu“**.
- Sekce se načte až po otevření detailu (krátký „Hledám výskyty…“), pak ukáže počet nálezů a seznam:
  - **Kniha počátků › od. 12**
  - jedna věta z textu, kde je jméno **tučně**.
- Zobrazí se prvních 20 výskytů, tlačítko „Zobrazit další“ přidá dalších 20. Pokud nic, krátká věta „V dostupných textech se jméno zatím nevyskytuje.“
- Klik na výskyt otevře **Knihy ke čtení** přímo s daným oddílem v čisté čtečce přes celou obrazovku; čtečka sama doroluje na danou větu a podbarví ji žlutě na 3 vteřiny. Zavřít vrátí na seznam knih (tlačítko Zpět prohlížeče vrátí na postavu).

## Kde se hledá
- Kniha počátků: z titulků nahrávky (věty ze SRT dat), jak zadáno.
- Sabhá a Vana Parva (zatím bez titulků): ze stejného českého textu, který používá čtečka, po větách. Jakmile kniha dostane titulky nebo přibude nová kniha, objeví se automaticky.

## Shoda jména
- Bez ohledu na velikost písmen a diakritiku, podle kmene jména, aby se chytilo skloňování (Ardžuna, Ardžunovi, Ardžunou…). Kmen = jméno bez koncové samohlásky; u krátkých jmen (≤4 písmena) jen celé slovo s pádovou koncovkou, aby „Bhíma“ nenašel nesouvisející slova.
- Víceslovná jména hledají první/hlavní slovo; shoda vždy od začátku slova.

## Technické detaily
- Nový `src/lib/occurrences.ts`: `findOccurrences(name, { limit })` — prochází `FULL_TEXT_BOOKS`; pro knihy s `audiobookFor(slug).cuesUrl` používá `loadCues()`, jinak `loadBookSegments` + `sectionsOf` (sdílené loadery, žádná duplikace textů). Vrací `{ bookSlug, bookName, sectionNumber, sectionTitle, sentence, matchStart, matchEnd, time? }`. Regex builder `nameMatcher(name)` v samostatné funkci + testy (`occurrences.test.ts`: Ardžuna/Ardžunovi shoda, Bhíma ≠ jiná slova, velikost písmen).
- Nová komponenta `src/components/Occurrences.tsx` (useQuery s klíčem jména, lazy po mountu), vložená do `postavy/$slug.tsx` a `astry/$slug.tsx` pod popis.
- Odkaz: `<Link to="/knihy-ke-cteni" search={{ kniha, oddil, veta, hledat }}>`. `knihy-ke-cteni.tsx` dostane `validateSearch` (zod + fallback, vše volitelné); po načtení knih otevře oddíl, najde odstavec/větu obsahující hledané jméno (pro Ádi i text oddílu, protože čtečka zobrazuje stejný text), `scrollIntoView({block:"center"})` a dočasná třída `bg-yellow`-token (nový sémantický token `--highlight` ve `styles.css`) na 3 s. Zavření overlaye smaže search parametry.
- AGENTS.md: pravidlo, že výskyty používají kanonické loadery textů a titulků.
- Ověření: test utility, Playwright: Ardžuna → výskyty → klik → otevřený oddíl se žlutou větou.
