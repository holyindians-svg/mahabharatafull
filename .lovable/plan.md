# Zářící jména entit v textu

## Co uživatel uvidí
- V čisté čtečce (Knihy ke čtení) i v obou karaoke čtečkách svítí v textu každé jméno postavy, mudrce i zbraně z encyklopedie. Jména mají jantarové podsvícení, zlatou linku pod sebou, jemnou záři a tučné písmo. Platí to i pro skloňované tvary (Ardžunovi, Bhíšmou…).
- Když přijdete od konkrétní postavy, její jméno svítí stejně. Navíc zůstane lotosový rámeček kolem odstavce, kde se vyskytuje.
- Karaoke zvýraznění věty, posun textu a synchronizace se zvukem zůstávají beze změny. Jméno svítí uvnitř aktivní věty i mimo ni.

## Technické detaily
- `src/lib/entity-names.ts`: ze `characters` a `astras` (jména se berou přímo z dat encyklopedie, takže se nové položky přidají samy) se postaví jeden regex. Využije kmeny z `nameMatcher` v `occurrences.ts`, refaktorovaném tak, aby vracel zdroj vzoru. Jména se seřadí od nejdelšího a duplicity se odstraní. Hledá se bez ohledu na velká a malá písmena a diakritiku, celé slovo. `highlightSegments(text, extra?)` vrací pole úseků `{ text, entity: boolean }`. Mapování indexů zajišťuje `matchesIn`. Přidaná entita z URL (`hledat`) se přičte, i kdyby v seznamu chyběla.
- `src/components/EntityText.tsx`: vykreslí úseky a jména obalí do `<mark className="entity-highlight">`. Výsledek se memoizuje podle textu.
- Použití: odstavce v `knihy-ke-cteni.tsx` a text titulku v `KaraokeText.tsx` (uvnitř stávajícího `span` věty, takže klik na větu i seek fungují dál).
- `styles.css`: nový token `--entity-glow` z `--gold` a `@utility entity-highlight` s podkladem `color-mix(gold 30 %)`, barvou textu `--gold`, spodní linkou 2px gold, `box-shadow: 0 0 8px` gold 40 %, `font-weight: 700` a zaoblením. Žádné pevně zadané barvy Tailwindu, vše přes tokeny.
- Testy (`entity-names.test.ts`): „Ardžunovi“ i „ARDŽUNA“ se označí. Okolní slovo, které jen začíná stejnými písmeny, ale je delší, se neoznačí (u krátkých jmen). Text bez jmen vrátí jediný neoznačený úsek.
- Ověření v Playwrightu: v čtečce i karaoke se objeví `mark.entity-highlight` a snímek obrazovky potvrdí vzhled a čitelnost.
