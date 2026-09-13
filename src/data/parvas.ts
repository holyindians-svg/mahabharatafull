import { imageFor } from "./images";
import type { Parva } from "./types";

const raw: Omit<Parva, "image" | "order">[] = [
  {
    slug: "adi-parva",
    name: "Kniha počátků",
    sanskrit: "Ádi Parva",
    subtitle: "Zrození rodu Kuruovců",
    summary:
      "Kniha počátků vypráví o původu dynastie Bháratů, o králi Šántanuovi a rybářské dceři Satjavatí, o hrozném slibu Bhíšmy a o narození Dhritaráštry, Pándua a Vidury. Sleduje dětství Pánduovců a Kauravů, jejich výcvik u Dróny, Ardžunovo vítězství na svatbě Draupadí i první zákeřné pokusy Durjódhany zbavit se bratranců.",
    events: [
      "Šántanuův sňatek s Gangou a Satjavatí",
      "Bhíšmův slib celoživotního celibátu",
      "Zrození sta Kauravů a pěti Pánduovců",
      "Požár domu z laku v Váranávatě",
      "Draupadina svajamvara a Ardžunův výstřel",
    ],
    characterSlugs: ["santanu", "satjavati", "bhisma", "vjasa", "pandu", "kunti", "draupadi"],
    audioMinutes: 74,
  },
  {
    slug: "sabha-parva",
    name: "Kniha sněmovní",
    sanskrit: "Sabhá Parva",
    subtitle: "Hra v kostky a ztráta království",
    summary:
      "Judhišthira vystaví v Indraprastze zázračnou sněmovní halu a vykoná obřad Rádžasúja. Durjódhanova žárlivost vede k pozvání na hru v kostky, kde Šakuni falešnými kostkami připraví Pánduovce o bohatství, království, svobodu i o Draupadí. Ponížení v sněmovní hale zaseje seménko války a Pánduovci odcházejí na třináct let do vyhnanství.",
    events: [
      "Stavba sněmovní haly Mája Danavou",
      "Obřad Rádžasúja a smrt Šišupály",
      "Hra v kostky se Šakuniho falešnými kostkami",
      "Ponížení Draupadí a Krišnova ochrana",
      "Vyhnanství na dvanáct let a rok v přestrojení",
    ],
    characterSlugs: ["judhisthira", "durjodhana", "sakuni", "draupadi", "dusasana", "vidura"],
    audioMinutes: 52,
  },
  {
    slug: "vana-parva",
    name: "Kniha lesní",
    sanskrit: "Vana Parva",
    subtitle: "Dvanáct let v divočině",
    summary:
      "Nejrozsáhlejší kniha eposu popisuje putování Pánduovců lesy. Ardžuna stoupá do Himálaje za pokáním a získává od Šivy Pášupatástru, Bhíma potkává Hanumána, mudrci vyprávějí příběhy o Nalovi a Damajantí i o Sávitrí. Bratři poznávají trpělivost, dharmu a moc askeze.",
    events: [
      "Ardžunovo pokání a získání božských zbraní",
      "Setkání Bhímy s Hanumánem",
      "Příběh Nala a Damajantí",
      "Únos Draupadí Džajadrathou",
      "Jakšova zkouška u jezera",
    ],
    characterSlugs: ["ardzuna", "bhima", "judhisthira", "draupadi", "dzajadratha"],
    audioMinutes: 118,
  },
  {
    slug: "virata-parva",
    name: "Kniha Virátova",
    sanskrit: "Viráta Parva",
    subtitle: "Rok v přestrojení",
    summary:
      "Poslední rok vyhnanství tráví Pánduovci skryti na dvoře krále Viráty. Judhišthira slouží jako hráč v kostky, Bhíma jako kuchař, Ardžuna jako eunuch Brihannala a Draupadí jako komorná. Když Kauravové vpadnou do země, Ardžuna odhalí svou totožnost a rozdrtí jejich vojsko.",
    events: [
      "Přestrojení pěti bratrů a Draupadí",
      "Bhímovo zabití Kíčaky",
      "Krádež Virátových krav",
      "Ardžuna bere zpět Gándívu",
      "Odhalení totožnosti Pánduovců",
    ],
    characterSlugs: ["virata", "ardzuna", "bhima", "draupadi", "abhimanju"],
    audioMinutes: 41,
  },
  {
    slug: "udyoga-parva",
    name: "Kniha přípravy",
    sanskrit: "Udjóga Parva",
    subtitle: "Poslední pokusy o mír",
    summary:
      "Obě strany shromažďují spojence a vyjednávají. Krišna přichází do Hastinápuru jako vyslanec míru, Durjódhana však odmítne vydat i pět vesnic. Karna se dozvídá o svém skutečném původu od Kuntí, ale zůstává věrný Durjódhanovi. Vojska se řadí na Kurukšétře.",
    events: [
      "Krišnovo mírové poselství",
      "Odmítnutí pěti vesnic",
      "Kuntí odhaluje Karnovi jeho původ",
      "Volba Krišny za Ardžunova vozataje",
      "Sestavení vojsk a pravidel války",
    ],
    characterSlugs: ["krisna", "durjodhana", "karna", "kunti", "salja", "balarama"],
    audioMinutes: 63,
  },
  {
    slug: "bhishma-parva",
    name: "Kniha Bhíšmova",
    sanskrit: "Bhíšma Parva",
    subtitle: "Bhagavadgíta a prvních deset dní",
    summary:
      "Uprostřed nastoupených vojsk klesá Ardžuna zdrcen a Krišna mu předává Bhagavadgítu – učení o dharmě, jednání bez připoutanosti a oddanosti. Následuje deset dní zuřivých bojů, v nichž Bhíšma kosí Pánduovská vojska, dokud jej Šikhandí neumožní srazit šípy do lože z hrotů.",
    events: [
      "Ardžunova malomyslnost a Bhagavadgíta",
      "Krišnovo zjevení vesmírné podoby",
      "Bhíšmovo desetidenní vítězné tažení",
      "Šikhandí v čele útoku",
      "Bhíšma na loži ze šípů",
    ],
    characterSlugs: ["bhisma", "krisna", "ardzuna", "sikhandi", "drona"],
    audioMinutes: 88,
  },
  {
    slug: "drona-parva",
    name: "Kniha Drónova",
    sanskrit: "Dróna Parva",
    subtitle: "Učitel jako vrchní velitel",
    summary:
      "Dróna přebírá velení kuruovského vojska a nasazuje nezničitelné formace. Mladý Abhimanju vniká sám do bludiště čakravjúha a padne v nerovném boji. Ardžuna přísahá pomstu Džajadrathovi a nasazují se božské zbraně, včetně Nárájanástry Ašvatthámovy.",
    events: [
      "Dróna vrchním velitelem",
      "Abhimanjuova smrt v čakravjúze",
      "Ardžunova přísaha a smrt Džajadrathy",
      "Nasazení Nárájanástry",
      "Drónovo sťatí Dhrištadjumnou",
    ],
    characterSlugs: ["drona", "abhimanju", "ardzuna", "dzajadratha", "asvatthama", "dhristadjumna"],
    audioMinutes: 96,
  },
  {
    slug: "karna-parva",
    name: "Kniha Karnova",
    sanskrit: "Karna Parva",
    subtitle: "Souboj dvou nejlepších lučištníků",
    summary:
      "Karna vede kuruovské vojsko a jeho lukostřelba připomíná bouři. Bhíma drtí Dušásanu, Šalja řídí Karnův vůz a nakonec dochází k dlouho očekávanému souboji Karny s Ardžunou, v němž Karna padne ve chvíli, kdy zvedá zapadlé kolo svého vozu.",
    events: [
      "Karna vrchním velitelem",
      "Smrt Dušásany",
      "Karnovo zapomenutí zaklínadel Bhárgavástry",
      "Souboj Karny a Ardžuny",
      "Karnova smrt a odhalení jeho původu vojsku",
    ],
    characterSlugs: ["karna", "ardzuna", "bhima", "dusasana", "salja", "krisna"],
    audioMinutes: 84,
  },
  {
    slug: "shalya-parva",
    name: "Kniha Šaljova",
    sanskrit: "Šalja Parva",
    subtitle: "Poslední den bitvy",
    summary:
      "Šalja padne Judhišthirovým kopím, kuruovské vojsko se rozpadá a Durjódhana se skrývá v jezeře. Vyzván k boji volí kyj a v posledním souboji jej Bhíma sráží zásahem do stehen – nečestným úderem, který ukončuje válku.",
    events: [
      "Šaljovo velení a smrt",
      "Rozpad kuruovského vojska",
      "Durjódhana v jezeře Dvaipájana",
      "Souboj kyji Bhíma proti Durjódhanovi",
      "Balarámův hněv nad nečestným úderem",
    ],
    characterSlugs: ["salja", "judhisthira", "durjodhana", "bhima", "balarama"],
    audioMinutes: 58,
  },
  {
    slug: "sauptika-parva",
    name: "Kniha nočního přepadu",
    sanskrit: "Sauptika Parva",
    subtitle: "Ašvatthámova pomsta",
    summary:
      "Ašvatthámá se v noci vplíží do pánduovského tábora a s Kritavarmou a Krípou zmasakruje spící bojovníky včetně synů Draupadí. Nakonec vypustí Brahmáširu proti nenarozenému potomku Pánduovců a je za to stižen strašlivou kletbou.",
    events: [
      "Noční vpád do spícího táboru",
      "Smrt synů Draupadí a Dhrištadjumny",
      "Vypuštění Brahmáširy",
      "Krišnova kletba nad Ašvatthámou",
      "Zrození Paríkšita jako naděje rodu",
    ],
    characterSlugs: ["asvatthama", "kripa", "kritavarma", "draupadi", "krisna"],
    audioMinutes: 37,
  },
  {
    slug: "stri-parva",
    name: "Kniha žen",
    sanskrit: "Strí Parva",
    subtitle: "Nářek nad mrtvými",
    summary:
      "Ženy obou rodů přicházejí na pole Kurukšétry oplakat padlé. Gándhárí, která spatří těla svých sta synů, ve svém žalu prokleje Krišnu a celý rod Jádavů. Kniha je nejtišší a nejtěžší částí eposu.",
    events: [
      "Nářek Gándhárí a Kuntí",
      "Gándhárina kletba nad Krišnou",
      "Pohřební obřady padlých",
      "Judhišthirovo zoufalství z vítězství",
      "Vidurova útěcha",
    ],
    characterSlugs: ["gandhari", "kunti", "dhritarastra", "krisna", "vidura"],
    audioMinutes: 34,
  },
  {
    slug: "shanti-parva",
    name: "Kniha uklidnění",
    sanskrit: "Šánti Parva",
    subtitle: "Moudrost z lože ze šípů",
    summary:
      "Judhišthira, zdrcený vinou, chce odejít do lesa. Bhíšma z lože ze šípů mu předává rozsáhlé učení o povinnostech krále, o osvobození a o dharmě. Nejfilozofičtější část Mahábháraty.",
    events: [
      "Judhišthirova korunovace",
      "Bhíšmovo učení o královské dharmě",
      "Rozprava o osvobození (mókša)",
      "Příběhy a podobenství mudrců",
      "Smíření s Dhritaráštrou",
    ],
    characterSlugs: ["bhisma", "judhisthira", "krisna", "vidura"],
    audioMinutes: 132,
  },
  {
    slug: "anushasana-parva",
    name: "Kniha pokynů",
    sanskrit: "Anušásana Parva",
    subtitle: "Bhíšmova poslední slova",
    summary:
      "Pokračování Bhíšmova učení – o darech, poutích, postech, o povinnostech vůči předkům a o síle pravdy. Poté Bhíšma opouští tělo a vydává se na nebeskou cestu.",
    events: [
      "Učení o daru a soucitu",
      "Rozpravy o poutích a obřadech",
      "Višnuova tisíc jmen",
      "Bhíšmova smrt při zimním obratu",
      "Judhišthirovy pohřební obřady za Bhíšmu",
    ],
    characterSlugs: ["bhisma", "judhisthira", "krisna"],
    audioMinutes: 101,
  },
  {
    slug: "ashvamedhika-parva",
    name: "Kniha koňské oběti",
    sanskrit: "Ašvamédhika Parva",
    subtitle: "Obnova království",
    summary:
      "Judhišthira vykoná obřad koňské oběti, aby očistil rod od vin války. Ardžuna provází obětního koně světem a musí bojovat i s vlastním synem Babhruvahanou. Rod Bháratů se pomalu uzdravuje.",
    events: [
      "Rozhodnutí o obřadu ašvamédha",
      "Ardžunovo tažení za obětním koněm",
      "Souboj s Babhruvahanou",
      "Anugíta – Krišnovo opakované učení",
      "Dokončení obřadu v Hastinápuru",
    ],
    characterSlugs: ["judhisthira", "ardzuna", "krisna", "vjasa"],
    audioMinutes: 69,
  },
  {
    slug: "ashramavasika-parva",
    name: "Kniha poustevnická",
    sanskrit: "Ášramavásika Parva",
    subtitle: "Odchod starých do lesa",
    summary:
      "Dhritaráštra, Gándhárí a Kuntí odcházejí do lesa jako poustevníci a nacházejí smrt v lesním požáru. Vjása dopřeje truchlícím vizi padlých bojovníků, kteří se zjeví z řeky Gangy.",
    events: [
      "Odchod Dhritaráštry a Gándhárí do lesa",
      "Kuntí opouští královský dvůr",
      "Vjásova vize padlých bojovníků",
      "Lesní požár a smrt starých",
      "Vidurova smrt v józe",
    ],
    characterSlugs: ["dhritarastra", "gandhari", "kunti", "vidura", "vjasa"],
    audioMinutes: 44,
  },
  {
    slug: "mausala-parva",
    name: "Kniha kyjů",
    sanskrit: "Mausala Parva",
    subtitle: "Zkáza Jádavů",
    summary:
      "Gándhárina kletba dozrává: Jádavové se v opojení vzájemně vyhubí kyji z železného prachu. Balaráma odchází v józe, Krišna opouští tělo pod stromem a Dváraká se potápí do moře.",
    events: [
      "Zlá znamení ve Dvárace",
      "Bratrovražedná řež Jádavů",
      "Balarámův odchod z těla",
      "Krišnova smrt lovcovým šípem",
      "Potopení Dváraky",
    ],
    characterSlugs: ["krisna", "balarama", "satjaki", "kritavarma", "ardzuna"],
    audioMinutes: 29,
  },
  {
    slug: "mahaprasthanika-parva",
    name: "Kniha velké cesty",
    sanskrit: "Mahápraštháníka Parva",
    subtitle: "Poutník k Himálaji",
    summary:
      "Pánduovci s Draupadí odcházejí na poslední pouť k hoře Méru. Jeden po druhém padají cestou; jen Judhišthira dojde na vrchol – provázen psem, jehož odmítne opustit i za cenu nebe.",
    events: [
      "Odchod Pánduovců z Hastinápuru",
      "Draupadin pád na cestě",
      "Postupný odchod bratrů",
      "Judhišthirova věrnost psu",
      "Indrův vůz na hoře Méru",
    ],
    characterSlugs: ["judhisthira", "bhima", "ardzuna", "nakula", "sahadeva", "draupadi"],
    audioMinutes: 26,
  },
  {
    slug: "svargarohanika-parva",
    name: "Kniha vzestupu do nebe",
    sanskrit: "Svargárohanika Parva",
    subtitle: "Poslední zkouška",
    summary:
      "Judhišthira prochází poslední zkouškou: v nebi spatří Durjódhanu, zatímco své bratry hledá v pekle. Když odmítne nebe bez nich, iluze se rozplyne a všichni se navracejí do své božské podstaty. Epos se uzavírá učením o tom, že dharma přetrvá.",
    events: [
      "Judhišthira v nebi spatří Durjódhanu",
      "Cesta pekelnými krajinami",
      "Odmítnutí nebe bez bratrů",
      "Rozplynutí iluze",
      "Návrat bojovníků k božským podobám",
    ],
    characterSlugs: ["judhisthira", "durjodhana", "draupadi", "krisna", "vjasa"],
    audioMinutes: 31,
  },
];

export const parvas: Parva[] = raw.map((p, index) => ({
  ...p,
  order: index + 1,
  image: imageFor(`parva-${p.slug}`),
}));

export function getParva(slug: string): Parva | undefined {
  return parvas.find((p) => p.slug === slug);
}
