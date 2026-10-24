# Bhímova Gadá – nová zbraň s videem ve smyčce

## Co uživatel uvidí
- V seznamu Astry přibude karta „Bhímova Gadá“ (palcát, božstvo Váju, nositel Bhíma). Obrázek bude z vaší fotky gady v chrámu.
- Detail zbraně má stejný vzhled jako ostatní: horní obrázek, Účinek, V eposu, Ničivá moc, předčítání, Nositelé, Výskyty v textu, Další astry.
- Navíc je tu nová sekce **„Bhímova Gadá: Drtivá síla boha větru“**. Vaše video v ní běží samo dokola, bez zvuku a bez klikání. Okraje videa se měkce rozplývají do tmavého pozadí. Na počítači je video vedle textu, na mobilu nad textem jako pás.
- Vyprávěcí text má teplou zlatavě pískovou barvu a sedí v jemném skleněném rámečku se zlatým okrajem.
- Výskyty v textu hledají jména „Bhíma“, „Bhímaséna“, „Gadá“ a „palcát“, včetně skloňovaných tvarů. Po prokliku do čtečky svítí nalezené slovo stejně jako u ostatních zbraní.
- Předčítací tlačítko přečte i nový vyprávěcí text.

## Text
V zadání chybí samotný vyprávěcí text, je tam jen značka. Pokud ho nepošlete, napíšu krátký text (asi 3 odstavce) podle eposu: Váju jako otec Bhímy, souboje s Džarásandhou a Durjódhanou, úder do stehna. Kdykoli ho pak můžete nahradit vlastním.

## Technické detaily
- Video a obrázek se nahrají přes lovable-assets: `src/assets/gada-loop.mp4.asset.json` a `src/assets/gada.png.asset.json`.
- `Astra` dostane volitelné položky `video?`, `storyTitle?`, `story?: string[]`, `keywords?: string[]`. Do `astras.ts` přibude záznam `bhimova-gada`. Pro jeho obrázek se místo `imageFor` použije URL z assetu.
- `Occurrences` začne přijímat `names?: string[]`. `findOccurrences` sloučí vzory z `namePattern` pro každé klíčové slovo a `zvyraz` předá všechna slova. `highlightSegments` už pole jmen podporuje.
- V `astry/$slug.tsx` přibude podmíněný blok `{astra.video && <AstraStory/>}` s grid layoutem `lg:grid-cols-2`. Video bude `<video autoPlay loop muted playsInline>` s `mask-image` radiálním gradientem přes nový `@utility video-fade` ve `styles.css`. Text dostane token `--sand`.
- `narrationFor` u této zbraně spojí `effect`, `lore` a `story`.
- Test: `findOccurrences` nebo matcher najde „palcátem“ i „Bhímasénovi“.
