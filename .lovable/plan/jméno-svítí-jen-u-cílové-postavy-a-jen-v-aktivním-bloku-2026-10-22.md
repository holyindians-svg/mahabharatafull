# Jméno svítí jen u cílové postavy a jen v aktivním bloku

## Co uživatel uvidí
- Ve čtečce už nesvítí každé jméno z encyklopedie. Když do ní přijdete běžně z menu, žádné jméno se navíc nezvýrazní.
- Když přijdete od postavy nebo zbraně přes „Výskyty v textu“, svítí jen její jméno (i skloňované: Ardžunovi, Ardžunem…). A jen uvnitř aktuálního bloku s lotosovým rámečkem.
- Když hraje zvuk, rámeček s ním putuje po textu. Jméno svítí jen v právě čteném bloku a v předchozím zhasne.
- Vzhled zůstává jako dosud: jantarové podsvícení, záře a tučné písmo.

## Jak se určí aktivní blok
- Čtečka Knihy ke čtení ukazuje text po odstavcích. Při přehrávání se proto aktivní odstavec určí podle právě čtené věty z titulků. Bez zvuku zůstane aktivní odstavec, na který jste přišli.
- Karaoke čtečky v detailu knihy dostanou stejnou možnost (svítí jen aktivní věta), pokud se do nich předá cílové jméno. Bez něj nesvítí nic, takže se při běžném poslechu nic nezmění.

## Technické detaily
- `EntityText`: místo celé encyklopedie vezme povinné jméno `name`. Bez něj vrátí čistý text. `highlightSegments(text, [name])` využije stávající kořenový regex (`namePattern`). Plošný seznam `ALL_NAMES` a jeho mezipaměť se odstraní.
- `knihy-ke-cteni.tsx`: `EntityText` se použije jen pro odstavec `index === flash`, ostatní dostanou čistý text. `ReaderAudioBar` dostane `onTime` a čtečka z titulků oddílu (`loadCues`) najde aktivní větu přes `activeCueIndex`. Odstavec s ní se určí podle nejlepší shody textu: první odstavec, který obsahuje začátek věty (normalizovaný, prvních ~40 znaků). Výsledek se uloží do `flash`, takže s ním putuje i lotosový rámeček. Přepočítá se jen při změně věty.
- `KaraokeText`: nový volitelný prop `entity`. `EntityText` se vykreslí jen pro aktivní větu a jen když je `entity` zadaný. `AudioSectionDetail` a `ImmersiveReader` ho předají dál (zatím nevyplněný).
- Testy: `entity-names.test.ts` doplnit o případ, kdy bez jména nic nesvítí a s cílem svítí jen cíl, ne jiná jména. Ověřit v Playwrightu: z menu 0 zvýraznění, z výskytu zvýraznění jen v orámovaném odstavci, po posunu zvuku se rámeček i jméno přesunou.
