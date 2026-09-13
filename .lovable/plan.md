# Mahábhárata AI — dotazování v aplikaci

## Cíl
Propojit aplikaci s uloženým `GOOGLE_API_KEY` pro textovou komunikaci, čtení a vyhledávání v existujícím textu encyklopedie (18 Parv, postavy, astry). AI se integruje do stávajících prvků rozhraní — bez vytváření nových oken, plovoucích chatů či modálů.

## Poznámka k datům
Nahraný soubor obsahuje pouze původní zadání, nikoli plný text Mahábháraty. AI proto pracuje s texty, které encyklopedie již obsahuje (popisy knih, postav a zbraní v `src/data/*`). Pokud později nahrajete plný text eposu, rozšíříme dotazování i o něj.

## Co se postaví

### 1. AI ve stávajícím vyhledávání (`/hledat`)
- Do stránky hledání se přidá přepínač „AI odpověď" vedle běžného filtrování.
- Uživatel napíše dotaz přirozeným jazykem do stávajícího vyhledávacího pole.
- AI odpoví česky v panelu přímo na stránce (streamovaně) a pod odpovědí zobrazí odkazy na relevantní stránky encyklopedie (knihy, postavy, astry) vytěžené z dat aplikace.

### 2. AI interakce pod připravenými osobami (`/postavy/$slug`)
- Pod profilem každé postavy se přidá blok „Zeptat se na tuto postavu".
- Obsahuje nápovědné dotazy (např. „Proč tato postava jednala tak, jak jednala?") a pole pro vlastní otázku.
- Odpověď se vypíše přímo v bloku na stránce, s kontextem dané postavy (jméno, skupina, popis z dat aplikace).

### 3. Backend
- Nová server route `src/routes/api/chat.ts`: přijme dotaz + kontext (typ entity, název, popis), zavolá Google Gemini přes `GOOGLE_API_KEY` a vrátí streamovanou odpověď.
- Systémový prompt: odpovídá česky, drží se Mahábháraty a encyklopedického kontextu, uvádí sanskrtské názvy, odpovědi drží stručné a odkazuje na stránky aplikace.
- Klíč zůstává jen na serveru; nikdy se nedostane do prohlížeče.

### 4. Vzhled
- AI panely laděné do stávajícího chrámového stylu (tmavé pozadí, zlaté akcenty).
- Responzivní pro mobil i desktop.

## Co se nemění
- Žádná nová okna, plovoucí prvky ani navigace.
- Data v `src/data/*`, HD ilustrace, layout, filtry a mock předčítání.

## Technické detaily
- `src/routes/api/chat.ts` — streaming POST handler.
- `src/components/AiQueryBlock.tsx` — znovupoužitelný blok s dotazem a streamovanou odpovědí (AI SDK `useChat` / `DefaultChatTransport`).
- `src/lib/mahabharata-context.server.ts` — systémový prompt + kompaktní výtah obsahu encyklopedie.
- Závislosti: `ai`, `@ai-sdk/react`, `@ai-sdk/google` (doinstalují se, pokud chybí).
