# Zobrazení času s hodinami a relativní čas oddílů

## Co uvidíte
- Hlavní přehrávač ukáže celou knihu jako `26:03:56` místo `1563:56`; aktuální čas stejně (pod hodinu dál `MM:SS`).
- Full-screen čtečka už počítá čas od začátku oddílu; přepne se na stejný formát (dlouhé oddíly ukážou hodiny).
- Detail oddílu (pod seznamem) dostane řádek s časem: `03:12 / 45:20` — od nuly do délky oddílu (`endTime - startTime`).

## Technicky
- `src/lib/reader-time.ts`: nová `formatTime(seconds)` → `H:MM:SS` od hodiny výš, jinak `MM:SS`; `readerClock` ji použije.
- `AudioPlayer.tsx`: lokální `formatTime` nahradit sdílenou.
- `AudioSectionDetail.tsx`: nový prop `range`, zobrazí `sectionProgress(time, range)` formátovaný; `$slug.tsx` předá `timeOf(openSection)`.
- Testy v `reader-time.test.ts`: 93835.78 s → `26:03:55`, 2720 s → `45:20`, 3600 → `1:00:00`, 75 → `01:15`.
