# Zajímavosti a pochopení – rozšíření o 5 nových témat, SRT ze Storage a řazení

Sekce, tabulka `insights`, menu, karty, detail, chytré odkazy v kapitolách i boční panel už existují (z minula). Tento plán je doplní podle nového zadání, nic nestavíme dvakrát.

## Co uživatel uvidí
- Seznam karet seřazený podle pořadí, s ikonou sluchátek u článků s MP3.
- 5 nových článků: Draupadí a pět manželů, Durjódhana vs. Pánduovci, Jaduovci, Vrndávan, Kršnova taktika – každý s MP3 přehrávačem a karaoke titulky (klik na větu = skok v čase).
- Článek bez titulků ukáže úhledně formátovaný text; bez MP3 jen text.
- Tlačítko offline stažení u článku uloží MP3 i titulky.
- Nové klíčové slovo z článku se samo objeví jako ⓘ odkaz v textu kapitol (max. 1× na téma v odstavci), klik nepřeruší přehrávání a otevře panel s tlačítkem „Otevřít v sekci Zajímavosti a pochopení (včetně audia)“.
- Nový řádek vložený do databáze se v aplikaci objeví bez úpravy kódu.

## Technické kroky
1. Migrace (aditivní): přidat `srt_url text null`, `sort_order integer not null default 0`, unikátní index na `slug` (pokud chybí), index na `sort_order`. Starý `cues_url` ponechat a označit DEPRECATED; hodnoty zpětně přenést jako fallback.
2. Storage: vytvořit veřejný bucket `insights` a nahrát 5 SRT souborů (`DRAUPADI.srt` …), jejich veřejné URL uložit do `srt_url`.
3. Data: vložit 5 řádků – název a SEO popisek převzít z úvodu titulků („POPISEK (SEO)“), `content` = text titulků spojený do odstavců, `audio_url` = zadané MP3 odkazy, `keywords` (např. Draupadí, polyandrie, hra v kostky; Durjódhana, Pánduovci; Jaduovci, Dváraka; Vrndávan, Gópí; Kršna, taktika/lest), `sort_order` 1–5 (stávající 2 články dostanou 6–7).
4. `src/lib/insights.ts`: dotaz řadit `sort_order, created_at`; nový loader titulků – stáhne SRT z `srt_url`, rozparsuje v prohlížeči na `{startTime,endTime,text}` (ms přesnost), s fallbackem na starý `cues_url` JSON.
5. Detail `/zajimavosti/$slug`: přehrávač nahoře jen při `audio_url`; při titulcích karaoke (sdílený KaraokeText), jinak Markdown `content` – vyřeší i dřívější duplicitní zobrazení.
6. Karty: ikona sluchátek dle `audio_url`.
7. Offline: rozšířit `offline-audio-store` tak, aby u článku uložil do stejné cache i SRT soubor; loader titulků zkusí nejprve cache.
8. Testy: parser SRT (časy, víceřádkové titulky) a řazení podle `sort_order`.

## Neověřitelné
Mobilní zařízení a skutečné offline stažení na iOS ověřím jen v prohlížeči.
