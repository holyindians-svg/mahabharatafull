# Globální tlačítko „Obnovit“

## Co uvidíte
- Malé kulaté tlačítko s otáčivou šipkou v pravém horním rohu, na každé stránce.
- Poloprůhledné, rozmazané pozadí, jemný zlatý okraj, ladí s tmavým vzhledem.
- Při najetí myší se šipka plynule pootočí. Po klepnutí se rychle zatočí a stránka se obnoví.
- Klikací plocha je aspoň 44×44 px, samotná ikona je menší.

## Kolize s existujícími prvky
- **Mobil:** v pravém horním rohu je už tlačítko menu. Na mobilu proto tlačítko Obnovit dám do horní lišty hned vedle menu, aby se nepřekrývaly. Na počítači bude volně v rohu (`fixed top-4 right-4`).
- **Čtecí okna přes celou obrazovku** („Knihy ke čtení“ a velká karaoke čtečka) mají v pravém horním rohu tlačítko „Zavřít“. Tlačítko Obnovit bude pod nimi, aby „Zavřít“ zůstalo vždy klikatelné.

## Technické detaily
- Nová komponenta `src/components/RefreshButton.tsx`: `RefreshCw` (size-5), `rounded-full min-h-11 min-w-11`, `bg-background/40 backdrop-blur-md border-border`, třída `press`; hover `group-hover:rotate-180 transition-transform duration-500`.
- Po kliknutí stav `spinning` → `animate-spin` a `window.location.reload()` po cca 250 ms (aby byla odezva vidět).
- Vložení v `AppShell.tsx`: desktop varianta `hidden lg:grid fixed top-4 right-4 z-40`; mobilní varianta v hlavičce vedle menu. Overlaye mají z-50, takže jsou nad ním.
- Jen tokeny z design systému, žádné pevné barvy.
