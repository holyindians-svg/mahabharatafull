# Úprava odesílání poslechu na trvalou adresu dashboardu

## Co se změní
- Průběh poslechu se bude posílat na novou trvalou adresu `https://project--01f7a48d-5fe5-48e1-9bfb-6249d113bcdf-dev.lovable.app/api/public/listening`.
- Stav bude jen `playing` nebo `paused`, jak dashboard vyžaduje. Při dohrání nahrávky se pošle `paused` (dříve `completed`, které by dashboard odmítl).
- Ostatní zůstává: odeslání při spuštění, pauze, každou minutu a při dohrání; název knihy, aktuální čas, celková délka a oddíl. Chyby spojení poslech neruší.

## Technické detaily
- `src/lib/listening-sync.ts`: změnit `LISTENING_ENDPOINT`, `ListeningStatus = "playing" | "paused"`.
- `src/components/AudioPlayer.tsx` (ř. 287): `payload("completed")` → `payload("paused")`.
- Přidat test, že stav při dohrání je `paused` není potřeba — stávající test limitu zůstává; spustit jej.
- Dashboard musí povolit CORS z domény této aplikace (neověřeno).
