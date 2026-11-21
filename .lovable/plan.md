# Sekce „Zajímavosti a pochopení“

## Co přibude
1. **Lovable Cloud** se zapne pro tuto aplikaci a vytvoří se v něm tabulka článků. Kdokoli je může číst, upravovat ji nejde. Stávající nahrávky zůstanou tam, kde jsou teď.
2. **Dva první články** se vloží přesně podle vašeho znění, i s klíčovými slovy:
   - Maso, lov a oběti
   - Posledních sedm dní Paríkšita
3. **Nová položka v menu** „Zajímavosti a pochopení“ s ikonou jiskřiček:
   - Seznam karet s názvem a krátkým popisem, se zlatým okrajem a zaoblenými rohy.
   - Po kliknutí se otevře celý článek s nadpisy, odrážkami a citacemi, upravený pro pohodlné čtení.
4. **Poslech článků:** každý článek dostane přehrávač s vaší nahrávkou a zvýrazňováním textu podle přiložených titulků, jako u postav. Titulky se jednorázově převedou a samotné soubory se do aplikace neukládají.
5. **Chytré odkazy v textu kapitol** fungují v Knihách ke čtení, v detailu oddílu, ve velké čtečce i v karaoke řádcích:
   - Slova z článků dostanou jemné zlaté tečkované podtržení a malé ⓘ. Rozpoznají se i skloňované tvary.
   - Každý článek se zvýrazní nejvýš jednou v odstavci nebo v řádku titulků.
   - Klepnutí otevře boční panel s krátkým popisem, úvodem článku a tlačítkem „Přejít do sekce Zajímavosti a pochopení“. Hrající nahrávka se nezastaví ani se neposune.

## Technické detaily
- Migrace vytvoří `public.insights` se zadanými sloupci a oprávněním ke čtení pro anon a authenticated. RLS politika povolí jen veřejné čtení. Ve stejné migraci se vloží oba články přes `INSERT`.
- K tabulce přibudou dva volitelné sloupce `audio_url` a `cues_url`. Plní se odkazy na MP3 a vygenerované soubory `public/audio-texty/insight-<slug>.json`.
- Články se čtou z prohlížeče přes `useSuspenseQuery`, s dlouhou dobou platnosti. Načtou se jednou a sdílí je seznam, detail i všechny odkazy v textu.
- Trasy `/zajimavosti` a `/zajimavosti/$slug`, každá s vlastním `head()`. Markdown vykreslí `react-markdown`.
- Nový `InsightText` obalí text kapitol. Hledá klíčová slova přes `\b`-prefix regex bez ohledu na velikost písmen a uplatní limit jednoho výskytu na odstavec. Napojí se do stávajícího `EntityText` a `KaraokeText` jako vrstva, takže zvýraznění postavy z odkazu zůstane.
- Kliknutí na odkaz volá `stopPropagation` a `preventDefault`, aby se nespustil skok v nahrávce po klepnutí na větu. Panel je shadcn `Sheet`.
- Když se články nenačtou, například bez internetu, text se zobrazí bez odkazů a bez chyby.
- Do `AGENTS.md` přibude pravidlo, že kontextové odkazy berou klíčová slova výhradně z tabulky `insights`.
