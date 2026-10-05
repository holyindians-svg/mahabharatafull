# Souvislé přehrávání oddílů jako audiokniha

Když dočte přehrávač oddílu poslední větu, sám otevře další oddíl a hned ho začne číst. Pokračuje tak až do konce knihy nebo dokud nestisknete pauzu. Vzhled zůstane stejný, nepřibude žádné tlačítko.

## Co se změní
- **Navázání:** po dočtení oddílu se automaticky vybere další oddíl. Zobrazí se jeho text a čtení začne od jeho začátku. Pauza nebo zastavení řetězení ukončí, stejně jako konec knihy.
- **Označení v seznamu:** nově čtené tlačítko „od. X“ se rozsvítí stejnou barvou jako dnes při ručním výběru.
- **Posun seznamu:** seznam oddílů se jemně posune, aby bylo právě čtené tlačítko vidět. Posouvá se jen uvnitř seznamu, celá stránka zůstane na místě.
- **Celá kniha:** při čtení celé knihy hlavním přehrávačem se v seznamu průběžně zvýrazní oddíl, který se právě čte, a seznam se k němu posune. Text se přitom nefiltruje, chování zůstává stejné jako dnes.
- **Na pozadí:** neslyšitelný zvuk mezi oddíly nevypne, takže telefon proces během přechodu neuspí. Vypne se až po skutečném zastavení nebo na konci knihy.
- Funguje to pro všechny knihy s oddíly (1., 2. a 3. kniha i ty budoucí).

## Technické detaily
- `AudioPlayer.tsx`:
  - nové volitelné props `autoStart` (po připojení spustí `startBook(0)` a ignoruje uloženou pozici), `onFinished` (zavolá se jen při přirozeném dočtení, ne po stopu uživatele) a `onSegment(index)`
  - rozlišení přirozeného konce od stopu přes příznak nastavený v `stopSpeech`
  - během autoplay se uloží i pozice oddílu
- `speak.ts` / `background-audio.ts`: `stopBackground()` při přirozeném konci se zpozdí o zhruba 2 s (grace period). Následný `startBackground()` ho zruší, takže tichá smyčka, watchdog i Wake Lock běží přes přechod. Explicitní stop vypíná hned.
- `knihy/$slug.tsx`:
  - stav `autoNext`; `onFinished` z oddílového přehrávače nastaví `selected = i + 1` a `autoNext = true` (nový přehrávač s `key` dostane `autoStart`)
  - ruční klik na oddíl nastaví `autoNext = false`
  - hlavní přehrávač přes `onSegment` mapuje segment → index oddílu (`playingSection`) pro zvýraznění
  - refy na tlačítka, při změně aktivního oddílu `scrollIntoView({block: "nearest", behavior: "smooth"})` omezené na seznam (výpočtem `scrollTop` kontejneru, ne celé stránky)
- Media Session „další/předchozí“ u oddílového přehrávače přepne oddíl místo odstavce.
- Ověření: typecheck, Playwright se zkráceným oddílem (mock `speechSynthesis` volá `onend`). Kontrola: přechod na další oddíl, zvýraznění, posun seznamu, tichá smyčka bez přerušení a zastavení po pauze.
