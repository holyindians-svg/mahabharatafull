# Knihy ke čtení – čistý čtecí režim

## Co přidám

- Do hlavní nabídky přidám jasně viditelnou položku **Knihy ke čtení** s ikonou knihy.
- Vytvořím stránku se seznamem všech knih, pro které je v aplikaci uložen český plný text. Aktuálně se automaticky zobrazí Ádi Parva, Sabhá Parva a Vana Parva; budoucí přeložené knihy se načtou stejným způsobem.
- U každé knihy zobrazím její existující tematické skupiny a oddíly ve správném pořadí. Použiji současné názvy, číslování a zdroj textu, bez kopírování nebo úprav obsahu.

## Čisté čtení oddílu

- Kliknutí na oddíl nezmění adresu ani neotevře novou stránku. Nad aktuálním seznamem se zobrazí překryv přes celý displej.
- Překryv bude obsahovat pouze název oddílu, jeho český text a ovládání pro zavření; nebude v něm přehrávač, navigace ani jiné rušivé prvky aplikace.
- Text nastavím pro pohodlné dlouhé čtení: čitelná šířka řádku, větší písmo, vzdušné řádkování a zachované odstavce.
- Vpravo nahoře bude stále viditelné velké tlačítko s výrazným křížkem a textem **Zavřít** v červeném kruhovém zvýraznění. Zůstane na místě při libovolně hlubokém rolování.
- Zavření okamžitě vrátí uživatele na stejný seznam a stejné místo. Během otevření se nebude posouvat obsah pod překryvem.

## Co zůstane beze změny

- Nahrané texty, jejich pořadí a členění.
- Stávající stránky knih, hlavní a oddílové přehrávače, nastavení hlasu, lupa i ostatní části aplikace.
- Vzhled existující navigace a všech dosavadních stránek.

## Technické provedení

- Přidám samostatnou cestu `/knihy-ke-cteni` s vlastními údaji pro vyhledávače a odkazem v hlavním menu.
- Seznam i překryv budou používat existující `loadBookSegments`, `sectionsOf` a seznam knih s uloženým plným textem.
- Vybraný oddíl zůstane pouze ve stavu stránky, takže jeho otevření nevytvoří novou URL.
- Překryv bude mít nejvyšší vrstvu nad bočním i mobilním menu, vlastní rolování a pevně umístěné zavírací tlačítko se zohledněním bezpečného okraje telefonu.

## Ověření

- Ověřím otevření a zavření několika oddílů ze všech tří dostupných českých knih na mobilní i počítačové šířce.
- Ověřím, že dlouhý text roluje, zavírací tlačítko zůstává stále viditelné a zavření nemění URL.
- Ověřím správné pořadí oddílů, české odstavce a to, že stávající stránky a přehrávače zůstaly funkční.
