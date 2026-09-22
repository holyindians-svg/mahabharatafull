# Vzhled menu oddílů pro 2. knihu

## Výsledek

- Nový vzhled seznamu se použije pouze u 2. knihy (Sabhá Parva).
- Tlačítka oddílů dostanou zkrácené popisky „od. 1“, „od. 2“… a stejnou větší velikost i rozestupy jako u 1. knihy.
- Oddíly se zobrazí v tematických blocích podle podnadpisů skutečně obsažených v textu Sabhá Parvy; názvy z 1. knihy se nepoužijí.

## Ověřený podklad

- Sabhá Parva má nyní 79 oddílů.
- Její uložený text obsahuje tematické značky „Digvidžaja Parva“ a „Arghjaharana Parva“. Úvodní oddíly před první značkou dostanou vlastní výchozí nadpis „Sabhá Parva“.
- Současné seskupování i prostorné vykreslení je omezené na Ádi Parvu; Sabhá Parva se stále vykresluje jako plochý seznam s plnými názvy.

## Provedení

1. Rozšířit existující čtení podnadpisů také na `sabha-parva`, bez úprav uloženého textu knihy.
2. Pro každou knihu zachovat její vlastní výchozí název skupiny, aby se do Sabhá Parvy nikdy nepřenesl podnadpis z Ádi Parvy.
3. V menu Sabhá Parvy použít již existující seskupené vykreslení z 1. knihy:
   - tučný tematický nadpis,
   - mřížku větších tlačítek se stejným odsazením a rozestupy,
   - popisky tlačítek ve formátu „od. X“.
4. Nechat beze změny texty, pořadí a počet oddílů, hlavní i oddílové přehrávače, výběr oddílu, klíčové události a všechny ostatní stránky.

## Kontrola

- Sabhá Parva zobrazí 79 tlačítek ve správném pořadí a ve skupinách podle vlastních podnadpisů.
- Kliknutí na tlačítko dál zobrazí a přehraje pouze příslušný oddíl; hlavní přehrávač zůstane beze změny.
- Ádi Parva si zachová současný vzhled a vlastní podnadpisy.
- Ostatní knihy a celý zbytek aplikace zůstanou beze změny.
