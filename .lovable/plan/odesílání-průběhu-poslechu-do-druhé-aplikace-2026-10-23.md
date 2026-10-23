# Odesílání průběhu poslechu do druhé aplikace

## Co se změní
- Přehrávač audioknihy bude posílat průběh poslechu na adresu, kterou jste zaslal (`/api/public/listening` ve vaší druhé aplikaci).
- Odešle se při spuštění, při pauze, každou minutu během poslechu a při dohrání.
- Na obrazovce se nic nezmění. Když druhá aplikace neodpoví, poslech běží dál bez chyb.

## Odesílaná data
- `book_title`: název knihy (např. „Kniha počátků“)
- `listened_seconds`: aktuální čas v nahrávce
- `total_seconds`: celková délka nahrávky
- `status`: `playing`, `paused` nebo `completed`
- `chapter`: aktuální oddíl, např. „Oddíl 2“

## Technické detaily
- Nový modul `src/lib/listening-sync.ts`: `fetch` POST s `keepalive: true`, chyby se tiše zachytí; průběžné odesílání nejvýš 1× za 60 s.
- Napojení v `AudioPlayer.tsx` na stávající události play/pause/ended/timeupdate (stejně jako analytika), jen pro MP3 režim.
- Adresa jako konstanta; druhá aplikace musí povolit CORS z této domény.
- Poznámka: adresa je náhledová (id-preview). Po publikaci druhé aplikace doporučuji přepnout na její trvalou adresu.
- Test: malý test na omezení odesílání na 1× za minutu.
