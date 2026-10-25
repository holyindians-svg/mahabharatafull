# Ardžuna – video úvod, vyprávění a karaoke

Ardžuna už v encyklopedii má profil, takže ho rozšířím stejně jako Bhímu (žádný duplicitní profil).

## Co uživatel získá
- Po otevření Ardžuny se spustí celoobrazovkové video se zvukem; 2,8 s před koncem zvuk zeslábne a zároveň začne vyprávění.
- Video se smrští do stránky se zlatým lotosovým rámečkem, hraje tiše ve smyčce a text „Ardžuna: Dokonalý lučištník a nositel Gándívy“ se zvýrazňuje podle hlasu; klepnutím na větu se přeskočí.
- Rolování funguje hned po smrštění i při přeskočení (stejný sdílený úvod jako u Bhímy a Gady).
- Vyhledávání najde Ardžunu i podle „Ardžuna“, „Arjuna“, „Pártha“, „Gándíva“; stejná slova použije sekce „Výskyty v textu“.

## Technické detaily
- Video nahrát přes lovable-assets → `src/assets/ardzuna-loop.mp4.asset.json`.
- SRT (23 titulků, ~2:11) jednorázově převést na `public/audio-texty/ardzuna.json` ve stejném formátu jako `bhima.json` (odstranit `**` z nadpisu); SRT se neukládá.
- `src/data/characters.ts`: u `ardzuna` doplnit `video`, `storyTitle`, `audioUrl` (Arjuna.mp3), `cuesUrl`, `keywords` – stejně jako u `bhima`. Detail postavy už `StoryIntro` vykresluje automaticky.
- Hledání v `src/routes/hledat.tsx` doplnit klíčová slova stejně jako u Bhímy.
- Test `src/lib/ardzuna-cues.test.ts` podle `bhima-cues.test.ts` (počet titulků, konec, nadpis bez hvězdiček).
