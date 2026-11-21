CREATE TABLE public.insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  short_summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}',
  audio_url text,
  cues_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.insights TO anon, authenticated;
GRANT ALL ON public.insights TO service_role;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insights are publicly readable" ON public.insights FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.insights (slug, title, short_summary, keywords, audio_url, cues_url, created_at, content) VALUES
('maso-lov-a-obeti-v-mahabharate',
 'Maso, lov a oběti v Mahábháratě vs. vaišnavské vegetariánství',
 'Proč se v Mahábháratě zmiňuje lov, zvěřina a zvířecí oběti, když vaišnavská tradice učí čisté vegetariánství? Pohled šáster a áčárjů.',
 ARRAY['maso','masa','masem','zvěřin','lov','lovu','ašvamédh','rádžasúj','oběť koně','zvířecí obě'],
 'https://ckcnmvnjxziekezhzozh.supabase.co/storage/v1/object/public/audiobooks/MAHABHARATA/ZAJIMAVOSTI/VEG%20MB.mp3',
 '/audio-texty/insight-maso-lov-a-obeti-v-mahabharate.json',
 now() - interval '1 minute',
$a$Čtenáře zvyklého na čistě vegetariánský standard Bhagavad-gíty a Šrímad Bhágavatamu může v Mahábháratě překvapit, že se v ní běžně zmiňuje lov, zvěřina na královských hostinách nebo védské zvířecí oběti. Nejde o rozpor ani o selhání hrdinů, ale o rozdíl v účelu písma, historické době a duchovní úrovni adresátů.

### 1. Princip déša-kála-pátra (místo, čas a okolnosti)
Mahábhárata je itihása (historická kronika) z konce Dvápara-jugy. Nepopisuje pouze život v klášterech, ale celou tehdejší civilizaci – včetně vládnoucí třídy válečníků (kšatrijů), která se přirozeně pohybuje v kvalitě vášně (radžas).
- **Kšatrijská dharma:** Válečníci museli udržovat bojovou dravost a schopnost zabít nepřítele v bitvě. Proto měli z védského práva povolený regulovaný lov v lese (mrgajá) jako součást vojenského výcviku a ulovenou zvěř mohli jíst. Nikdy však nešlo o průmyslové zabíjení ani o jatka.
- **Složení hostin:** Když Mahábhárata (např. v Sabhá Parvě při oběti Rádžasúja) popisuje hostinu pro statisíce hostů, mluví souhrnně. Zúčastnili se jí králové, válečníci i cizinci (mléččhové), stejně jako bráhmanové. Sáttvické pokrmy (rýže, ghí, mléko, ovoce, sladkosti) byly určeny pro bráhmany, zatímco zvěřina pro kšatrije.

### 2. Záměrná gradace uvnitř samotné Mahábháraty
Vjásadéva sestavil Mahábháratu jako „pátou Védu“ pro běžné lidi. Příběh začíná v syrovém světě politiky, vášně a válek, ale postupně čtenáře vede k vyššímu poznání. V závěrečných filozofických knihách (Šánti a Anušásana Parva, kapitoly 114–116) se Judhišthira přímo ptá umírajícího Bhíšmy na jedení masa. Bhíšma tam kšatrijské kompromisy opouští a vytyčuje nejvyšší duchovní ideál:
> „Ahiṁsā paramo dharmaḥ“ — Neubližování je nejvyšší dharma. Člověk, který se zřekne masa, získává duchovní zásluhy rovnající se vykonání sta koňských obětí (Aśvamedha). (Mahábhárata, Anušásana Parva 115)

### 3. Pohled Gaudíja vaišnavských áčárjů a komentátorů
- **Regulace místo okamžitého zákazu (Šríla Prabhupáda a Šrímad Bhágavatam 11.5.11):** Védy berou podmíněnou duši tam, kde se právě nachází. Pokud má člověk silnou touhu po mase, písmo mu ji nejprve přísně omezí skrze oběti, aby ho postupně dovedlo k úplnému odříkání (nivrtti-márga).
- **Proč Vjásadéva napsal Šrímad Bhágavatam (Šríla Džíva Gósvámí a Višvanátha Čakravartí Thákura):** V 1. zpěvu Šrímad Bhágavatamu Nárada Muni vytkl Vjásadévovi, že v Mahábháratě udělal příliš mnoho ústupků hmotným touhám (pravrtti-márga), a vyzval ho k sepsání čistě duchovního Bhágavatamu.
- **Skutečný význam slov (Šrí Madhvāčárja):** V díle Mahábhárata-tātparya-nirṇaya upozorňuje, že čistí oddaní a bráhmanové maso nejedli; slovo māṁsa může označovat i dužinu ovoce a v některých obětech se používala figurína z těsta a ghí (piṣṭa-paśu).

### 4. Zákaz védských obětí v Kali-juze
V Dvápara-juze dokázali kvalifikovaní bráhmanové silou manter dát obětovanému zvířeti nové tělo nebo ho povýšit do lidského zrození. Pro náš věk (Kali-juga) jsou však tyto oběti přísně zakázány (Brahma-vaivarta Purána, citováno v Šrí Čaitanja Čaritámritě, Ádi-lílá 17.164). Pro dnešního čtenáře platí jasný standard Bhagavad-gíty (9.26):
> „Obětuje-li Mi někdo s láskou a oddaností lístek, květ, plod nebo vodu, přijmu to.“$a$),
('poslednich-sedm-dni-maharadze-pariksita',
 'Posledních sedm dní mahárádže Paríkšita: Mahábhárata vs. Šrímad Bhágavatam',
 'Jak sladit dva odlišné popisy smrti krále Paríkšita? Pevnost na jediném sloupu v Mahábháratě oproti půstu na břehu Gangy v Šrímad Bhágavatamu.',
 ARRAY['Paríkšit','Takšak','Šrngí','sloupu','eka-stambha','Kašjap','prájópavéš'],
 'https://ckcnmvnjxziekezhzozh.supabase.co/storage/v1/object/public/audiobooks/MAHABHARATA/ZAJIMAVOSTI/PARIKSIT%20TAKSAKA.mp3',
 '/audio-texty/insight-poslednich-sedm-dni-maharadze-pariksita.json',
 now(),
$a$Jedním z nejzajímavějších zdánlivých rozporů ve védské literatuře je popis posledních sedmi dnů krále Paríkšita poté, co byl proklet bráhmanským chlapcem Šrngím, že zemře na uštknutí hadem Takšakou. Mahábhárata a Šrímad Bhágavatam tuto událost popisují odlišně – nejde však o chybu, ale o rozdíl v účelu obou děl a védském chápání času.

### 1. Pohled Mahábháraty (Ádi Parva, Ástíka Parva)
V Mahábháratě je příběh podán z pohledu politické historie a lidské bezmoci vůči osudu. Král Paríkšit se po vyslechnutí prokletí poradí s ministry a nechá postavit dokonale střežený palác na jediném vysokém sloupu (eka-stambha-prásáda), obklopený strážemi, lékaři a bráhmany znalými manter proti jedu. Sedmého dne však Takšaka podplatí léčitele Kašjapu a sám se v podobě drobného červa v ovoci dostane až ke králi, uštkne ho a palác shoří.

### 2. Pohled Šrímad Bhágavatamu (1. a 12. zpěv)
V Šrímad Bhágavatamu Paríkšit prokletí s vděčností přijme jako Krišnovu milost. Okamžitě předá trůn synu Džanamédžajovi, odejde na břeh Gangy k půstu až do smrti (prájópavéša) a celých sedm dní a nocí v naprostém odevzdání naslouchá Šukadévovi Gósvámímu. Tělo opouští bez jakéhokoliv strachu z Takšaky.

### 3. Vysvětlení áčárjů a šástrické souvislosti
- **Rozdíl v účelu obou spisů (Níti vs. Bhakti):** Mahábhárata je historická kronika pro celou společnost – jejím cílem je ukázat neúprosnost osudu, před kterým neuteče ani císař v pevnosti. Šrímad Bhágavatam (Paramahamsa-samhitá) je písmo pro čisté oddané a soustředí se výhradně na vnitřní duchovní přípravu na smrt skrze naslouchání o Krišnovi (šravanam).
- **Souběžnost vnější povinnosti a vnitřního odevzdání (Šríla Džíva Gósvámí, Višvanátha Čakravartí Thákura, Šríla Prabhupáda):** Oba popisy se doplňují. Paríkšit nezakazoval ministrům a lékařům plnit jejich povinnost (rádžadharma) a postavit u Gangy ochranný pavilon na sloupu. Zatímco dvořané zvenčí řešili obranu, uvnitř byl král zcela odevzdaný Krišnovi a pohroužený do slov Šukadévy.
- **Princip Kalpa-bhéda (rozdíly v kosmických cyklech):** Védská tradice učí, že události se v nekonečných kosmických cyklech (kalpách) opakují s určitými obměnami podle toho, jakou lekci mají přinést. Oba záznamy jsou tak autentické a pravdivé.

### Shrnutí pro čtenáře
Mahábhárata nám dává lekci, že žádná hmotná pevnost nás před smrtí nezachrání. Šrímad Bhágavatam na stejném příběhu ukazuje jedinou skutečnou cestu ke svobodě: přijmout konec života bez strachu a využít zbývající čas k naslouchání o Nejvyšším Pánu.$a$);