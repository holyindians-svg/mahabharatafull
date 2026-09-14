# Chytré vyhledávání přímo v textu Ádi Parvy

Lupa „Hledat v textech" už dnes každý dotaz posílá ke zpracování AI. Chybí ale to hlavní: AI zatím vidí jen krátké encyklopedické popisky aplikace, ne uložený plný text první knihy. Proto na dotaz jako „jak probíhala hra v kostky" odpoví obecně a bez konkrétní pasáže.

## Co se změní

- Před odesláním dotazu aplikace prohledá uložený plný text Ádi Parvy (1715 odstavců) a vybere nejvíc odpovídající pasáže.
- Tyto pasáže se pošlou spolu s dotazem, takže odpověď vychází ze skutečného textu knihy — srozumitelné vysvětlení, shrnutí nebo přesný výtah, vždy v češtině.
- Když se v textu najde konkrétní místo, odpověď smí krátký úryvek ocitovat.
- Když se nic vhodného nenajde, AI odpoví jako dosud z encyklopedických textů aplikace.
- Vyhledávání zvládne i volnou otázku bez shody znaků (dnes u takového dotazu karty nic nenajdou a odpověď byla mělká).

## Co se nemění

- Vzhled, barvy, typografie, rozvržení, ilustrace.
- Žádné nové tlačítko, okno ani prvek; vyhledávací pole, nápovědné výrazy i plocha s výsledky zůstávají stejné.
- Karty knih, postav a zbraní se zobrazují dál stejně; předčítání odpovědi nahlas zůstává.
- Předčítání u postav, knih a zbraní i klikací vazby fungují beze změny.

## Technické detaily

- `src/lib/adi-parva-search.server.ts` (nový) — načte `public/texty/adi-parva.json` (fetch z vlastního originu, uložení do paměti serveru pro další dotazy), normalizuje diakritiku, oskóruje odstavce podle překryvu klíčových slov dotazu (bez běžných českých spojek), vybere ~10 nejlepších míst včetně sousedních odstavců a nejbližšího nadpisu, výsledek omezí ~18 000 znaků.
- `src/routes/api/chat.ts` — pro režim `ask` se do zprávy vloží nová sekce „NALEZENÉ PASÁŽE Z ÁDI PARVY" před dosavadní encyklopedický korpus; režim `narrate` zůstává nezměněn.
- `src/lib/mahabharata-context.server.ts` — do `SYSTEM_PROMPT` se doplní pokyn: přednostně vycházet z nalezených pasáží, smět citovat krátký úryvek, a když pasáže dotaz nepokrývají, opřít se o encyklopedii.
- `src/routes/hledat.tsx` a `src/lib/ask-ai.ts` zůstávají beze změny (krátkodobá paměť odpovědí v prohlížeči dál běží).
