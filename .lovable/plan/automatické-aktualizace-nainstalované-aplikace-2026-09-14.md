# Automatické aktualizace nainstalované aplikace

Cíl: aplikace spuštěná z plochy telefonu se po připojení k internetu vždy sama obnoví na nejnovější verzi, bez mazání aplikace nebo čištění mezipaměti. Vzhled, obsah ani ovládání se nemění.

## Zjištění z kontroly
- Projekt žádný service worker nemá — nic se tedy neukládá do trvalé mezipaměti prohlížeče.
- Každé spuštění aplikace z ikony na ploše proto načítá aktuální soubory přímo ze serveru; nová verze se projeví při prvním otevření s internetem.
- Lovable už servíruje stránky a manifest s hlavičkami, které prohlížeči říkají, aby při každém načtení ověřil čerstvost.
- Manifest obsahuje `id`, `start_url` i `scope`, takže instalace drží stabilní identitu.

## Co se udělá
1. **Zachovat stav bez service workeru** – právě jeho absence zaručuje, že se nikdy nezasekne stará verze. Service worker by naopak mohl mezipamětí držet zastaralé soubory, a proto se nepřidává.
2. **Ověřit hlavičky automatickým testem** – skript zkontroluje na běžícím náhledu, že stránka, manifest i skripty mají správné hlavičky pro ověřování čerstvosti, a potvrdí, že se žádný service worker neregistruje.
3. **Zdokumentovat chování** – v `roadmap.md` zaznamenat, jak aktualizace fungují: stačí publikovat novou verzi a uživatel ji uvidí při příštím otevření aplikace s připojením k internetu.

## Co se záměrně nedělá
- Žádný service worker, žádné ruční mazání mezipaměti, žádné vynucené obnovování stránky ani nová okna či tlačítka.
- Žádná změna manifestu, ikon ani vzhledu.

## Ověření
- Automatický test potvrdí správné hlavičky a absenci service workeru.
- Kontrola, že build zůstane bezchybný.

## Technické detaily
- Kontrola přes Playwright skript v `/tmp/browser/`: načtení stránky, čtení hlaviček odpovědí (HTML, `/manifest.webmanifest`), dotaz `navigator.serviceWorker.getRegistrations()`.
- Zápis do `roadmap.md`.
