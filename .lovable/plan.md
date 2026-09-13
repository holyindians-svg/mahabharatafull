# Mahábhárata AI průvodce

## Cíl
Přidat do vizuální encyklopedie Mahábháraty inteligentního AI průvodce, který odpovídá na otázky o eposu, postavách, knihách a zbraních.

## Co se postaví

### 1. Backend: streaming chat endpoint
- Nová server route `src/routes/api/chat.ts`.
- Použije Lovable AI Gateway s modelem `openai/gpt-6-astra` přes Responses API.
- Systový prompt omezí AI na témata Mahábháraty, dharmy, védské kultury a obsah aplikace (18 Parv, postavy, astry).
- Podpora češtiny a sanskrtu: AI odpovídá v češtině a uvádí originální sanskrtské názvy.
- Základní bezpečnostní limity: odmítne témata mimo epos, neposkytuje lékařské/právní rady.

### 2. Frontend: plovoucí chat
- Plovoucí tlačítko „Zeptat se AI“ v pravém dolním rohu (na všech stránkách).
- Po rozkliku se otevře chatové okno s:
  - uvítací zprávou a nápovědnými dotazy,
  - vstupním polem,
  - streamovanými odpověďmi,
  - indikátorem psaní.
- Chat využívá AI SDK UI (`useChat` + `DefaultChatTransport`) napojený na `/api/chat`.
- Odpovědi se neukládají (žádná historie ani databáze) — jednoduchý prototyp.

### 3. Kontextové dotazy na stránkách entit
- Na stránkách `/postavy/$slug`, `/knihy/$slug` a `/astry/$slug` se přidá tlačítko „Zeptat se AI na [název]“.
- Kliknutí předvyplní chat dotazem o dané entitě.

### 4. Integrace do stávajícího designu
- Chatové okno laděné do chrámového vizuálního stylu aplikace (tmavé pozadí, zlaté akcenty, okrajové linky).
- Responzivní pro mobilní zařízení.

## Co se nemění
- Stávající data: `src/data/parvas.ts`, `characters.ts`, `astras.ts`, `images.ts`.
- Stávající HD ilustrace a vizuální styl.
- Navigace, filtry, mock předčítání a layout.

## Technické detaily
- `src/routes/api/chat.ts` — streaming POST handler.
- `src/components/AiChat.tsx` — plovoucí chatové okno.
- `src/components/AskAiButton.tsx` — tlačítko pro kontextové dotazy.
- `src/lib/mahabharata-system-prompt.ts` — sdílený systémový prompt.
- Závislosti: `ai`, `@ai-sdk/react`, `@ai-sdk/openai` (pokud chybí).
- `LOVABLE_API_KEY` se načte automaticky; není potřeba zásah uživatele.
