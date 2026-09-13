# Nárada mezi mudrce a doplnění chybějících postav

Text Ádi Parvy uložený v aplikaci obsahuje 47 zmínek o Náradovi a desítky zmínek o dalších osobách, které v přehledu postav dosud nejsou. Přidáme novou skupinu mudrců, zařadíme do ní Náradu a doplníme ostatní důležité postavy — bez jakékoli změny vzhledu, rozvržení, tlačítek nebo existujících karet.

## Co uživatel uvidí

- V přehledu postav se objeví nová skupina **Mudrci a věštci (rišiové)** jako další filtrovací štítek vedle stávajících. Vzhled štítků i karet zůstane totožný.
- **Nárada (Nārada)** dostane vlastní kartu v této skupině: portrét ve stejném malovaném stylu, popis, vazby a předčítání jako u ostatních postav. Kontext vychází z toho, co o něm text říká — nebeský mudrc, který přechází mezi světy bohů a lidí, přináší zprávy a rady, radí Pánduovcům ohledně soužití s Draupadí a vypráví o osudech královských rodů.
- Doplníme další postavy, které text často zmiňuje a v přehledu chybí:
  - **Mudrci a věštci:** Nárada, Vaišampájana (vypravěč eposu Džanamédžajovi), Ugrašrava Sauti (vypravěč v poustevně), Šaunaka, Utanka, Astíka, Bhrigu, Kašjapa, Višvámitra, Parášara, Čjavana, Durvása, Agastja.
  - **Předci a rod:** Jajáti, Šakuntalá, Dušjanta, Bharata, Ambá, Ambiká, Ambáliká.
  - **Pánduovci a spojenci:** Subhadrá, Hidimbí, Uttará, Paríkšit.
  - **Kauravové a spojenci:** Džarásandha, Ékalavja.
  - **Božské a mytické bytosti:** Garuda, Takšaka.
- Každá nová karta má český i sanskrtský název, epiteton, popis, vazby a odhad délky předčítání — přesně ve struktuře stávajících karet.

## Trvalost zařazení

Skupina mudrců bude plnohodnotnou součástí seznamu skupin, ne výjimkou. Každá budoucí postava se zařadí jen přiřazením skupiny; filtr, počty i detailní stránky se přizpůsobí samy. Přidání dalších textů tedy pozici Nárady ani ostatních nezmění.

## Technické poznámky

- `src/data/types.ts`: do `CharacterGroupId` přidat `"mudrci"`; volitelně `order` u skupin není potřeba — pořadí určuje pole `characterGroups`.
- `src/data/characters.ts`: nová položka skupiny `mudrci` (vložená po `ucitele`), nové záznamy postav v poli `raw` se stejným tvarem (`slug`, `name`, `sanskrit`, `epithet`, `group`, `description`, `relations`, `audioMinutes`).
- `src/routes/postavy/index.tsx`: rozšířit `z.enum` ve `searchSchema` o `"mudrci"` (jinak filtr spadne na „vše“). Zbytek stránky se generuje z `characterGroups`, takže se nemění.
- Obrázky: pro každou novou postavu vygenerovat ilustraci ve stejném malovaném chrámovém stylu do `src/assets/hd/characters/<slug>.jpg` a zaregistrovat ji v `src/data/images.ts` (`CHARACTER_IMAGES`). Stávající ilustrace se nemění.
- Předčítání a odpovědi: `src/data/narrations.ts` staví text z dat postavy, takže nové karty budou mít okamžité offline předčítání bez dalších úprav.
- Popisy vycházejí z uloženého textu `public/texty/adi-parva.json`; text samotný se nemění a nekrátí.
- Kontrola po změně: typecheck + build, ověření filtru a detailu nové karty v náhledu.
