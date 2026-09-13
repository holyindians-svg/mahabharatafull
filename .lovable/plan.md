# Mahábhárata AI průvodce

## Cíl
Přidat do vizuální encyklopedie inteligentního AI průvodce pro textovou komunikaci: dotazování, vysvětlování a vyhledávání v obsahu Mahábháraty.

## Poznámka ke zdrojovému textu
V projektu je zatím nahrané pouze původní zadání, nikoli plný text Mahábháraty. AI proto bude čerpat ze dvou zdrojů:
1. **Obsah aplikace** — všech 18 Parv, postavy a astry (popisy, které už v encyklopedii jsou).
2. **Znalosti o eposu** — širší kontext dharmy, souvislostí a příběhů.

Pokud později nahrajete plný text (např. překlad v .txt nebo .md), rozšíříme průvodce tak, aby vyhledával a citoval přímo v něm.

## Co se postaví

### 1. Backend: streaming chat endpoint
- Nová server route `src/routes/api/chat.ts`.
- Volá Google Gemini pomocí uloženého `GOOGLE_API_KEY`.
- Systémový prompt omezí AI na Mahábháratu, dharmu a védský kontext; odpovídá česky a uvádí originální sanskrtské názvy.
- Do promptu se vloží kompaktní přehled obsahu aplikace (názvy Parv, postav, aster + krátké popisy), aby AI odpovídala konzistentně s encyklopedií a mohla odkazovat na stránky.
- Odpovědi se streamují, aby uživatel viděl text průběžně.

### 2. Frontend: plovoucí chat průvodce
- Plovoucí tlačítko „Zeptat se AI“ v pravém dolním rohu na všech stránkách.
- Chatové okno obsahuje:
  - uvítací zprávu a 3–4 nápovědné dotazy („Kdo byl Karna?“, „Proč začala válka na Kurukšétře?“),
  - vstupní pole a odesílání,
  - streamovanou odpověď s indikátorem psaní,
  - jasné chybové hlášení, když služba nedostupná nebo vyčerpaná.
- Bez ukládání historie — jednoduchý, rychlý prototyp.

### 3. Vyhledávání s AI
- Stávající stránka `/hledat` získá režim „Zeptat se AI“ vedle běžného filtrování.
- Uživatel zadá dotaz přirozeným jazykem, AI vysvětlí odpověď a navrhne relevantní stránky encyklopedie jako odkazy.

### 4. Kontextové dotazy na detailech
- Na `/postavy/$slug`, `/knihy/$slug` a `/astry/$slug` tlačítko „Zeptat se AI na …“.
- Otevře chat s předvyplněným dotazem o dané entitě.

### 5. Vzhled
- Chat laděný do stávajícího chrámového stylu: tmavé pozadí, zlaté akcenty, jemné okraje.
- Plně responzivní; na mobilu chat přes celou obrazovku.

## Co se nemění
- Data v `src/data/*`, HD ilustrace a celý vizuální styl.
- Navigace, filtry, mock předčítání a rozvržení stránek.

## Technické detaily
- `src/routes/api/chat.ts` — streaming POST handler, čte `GOOGLE_API_KEY` z prostředí pouze na serveru.
- `src/components/AiChat.tsx` — plovoucí chatové okno (AI SDK `useChat` + `DefaultChatTransport`).
- `src/components/AskAiButton.tsx` — kontextové tlačítko.
- `src/lib/mahabharata-context.server.ts` — systémový prompt + kompaktní výtah z `parvas.ts`, `characters.ts`, `astras.ts`.
- Závislosti: `ai`, `@ai-sdk/react`, `@ai-sdk/google` (doinstalují se, pokud chybí).
- Klíč zůstává jen na serveru, nikdy se neposílá do prohlížeče.
