# Roadmap

- [x] Přidat celoobrazovkovou karaoke čtečku s nepřerušovaným audiem a společnými ovládacími prvky.
- [x] Ověřit čtečku, navazování oddílů a ovládání na rozměrech telefonu, tabletu a počítače.

- [x] Nahradit všechny fotografie původními mytologickými ilustracemi.
- [x] Přiřadit konkrétní obraz každé knize, postavě a astře.
- [x] Sjednotit rozhraní do chrámového stylu Divine Arched Chronicles.
- [x] Ověřit hlavní obrazovky na počítači a telefonu.
- [x] Nahradit titulní obraz a všech 69 ilustrací detailními HD verzemi bez změny motivů.
- [x] Optimalizovat nové HD soubory pro rychlé načítání.
- [x] Ověřit ostrost, přiřazení a ořezy na počítači i telefonu.
- [x] Plynulý poslech celé Ádi Parvy se zvýrazňováním a posouváním textu.
- [x] Přeložit nahranou anglickou Ádi Parvu (řádky 1–13717) do češtiny a uložit do aplikace.
- [x] Zvýrazňovat Ádi Parvu přesně slovo po slově a pamatovat si konkrétní slovo.
- [x] Sjednotit Ádi Parvu na přirozený český mužský hlas a plynulý proud bez trhání.
- [x] Opravit zobrazení a funkčnost přehrávače na mobilu a v PWA.
- [x] Odstranit bílý okraj z ikon Mahábháraty a ověřit instalaci.
- [x] Ověřit automatické aktualizace PWA (bez service workeru se vždy načte nejnovější verze).
- [x] Přidat čistý čtecí režim se seznamem přeložených knih a oddílů.
- [x] Otevírat oddíly v překryvu přes celý displej s trvale viditelným zavřením.

## Automatické aktualizace aplikace
Aplikace záměrně nepoužívá service worker, takže se nic nedrží v trvalé mezipaměti. Po publikování nové verze ji uživatel vidí při příštím otevření aplikace s připojením k internetu — nikdy nemusí aplikaci mazat ani čistit mezipaměť. Manifest se servíruje s vynuceným ověřením čerstvosti.
