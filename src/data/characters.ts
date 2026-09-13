import { imageFor } from "./images";
import type { Character, CharacterGroup } from "./types";

export const characterGroups: CharacterGroup[] = [
  {
    id: "predci",
    title: "Předci a starší",
    description: "Zakladatelé rodu Kuruovců, jejich královny a strážci dharmy.",
  },
  {
    id: "ucitele",
    title: "Učitelé",
    description: "Mistři zbraní, kteří vychovali obě znesvářené strany.",
  },
  {
    id: "panduovci",
    title: "Pánduovci a spojenci",
    description: "Pět bratrů, jejich žena Draupadí a královské rody, které jim stály po boku.",
  },
  {
    id: "kauravove",
    title: "Kauravové a spojenci",
    description: "Sto synů Dhritaráštry a bojovníci, kteří se přidali k Durjódhanovi.",
  },
  {
    id: "bozske",
    title: "Božské postavy a Jádavové",
    description: "Krišna, jeho rod a bojovníci z Dváraky, kteří určili osud války.",
  },
];

const raw: Omit<Character, "image">[] = [
  {
    slug: "santanu",
    name: "Šántanu",
    sanskrit: "Śantanu",
    epithet: "Král Hastinápuru",
    group: "predci",
    description:
      "Král z rodu Bháratů, jehož touhy rozhýbaly celý epos. Vzal si nebeskou Gangu, která mu dala syna Dévavratu (Bhíšmu), a později rybářskou dceru Satjavatí – za cenu slibu, který navždy změnil následnictví trůnu.",
    relations: ["Manžel Gangy a Satjavatí", "Otec Bhíšmy", "Předek Kuruovců i Pánduovců"],
    audioMinutes: 12,
  },
  {
    slug: "satjavati",
    name: "Satjavatí",
    sanskrit: "Satyavatī",
    epithet: "Královna z rybářského rodu",
    group: "predci",
    description:
      "Žena mimořádné vůle. Ještě před sňatkem se Šántanuem porodila mudrci Parášarovi syna Vjásu. Právě ona později Vjásu povolá, aby zajistil potomky pro vymírající rod.",
    relations: ["Matka Vjásy", "Manželka Šántanua", "Babička Dhritaráštry a Pándua"],
    audioMinutes: 9,
  },
  {
    slug: "bhisma",
    name: "Bhíšma",
    sanskrit: "Bhīṣma",
    epithet: "Strašlivý slib",
    group: "predci",
    description:
      "Dévavrata, syn Gangy, se zřekl trůnu i potomstva, aby otci umožnil sňatek. Za to získal dar smrti podle vlastní vůle. Nepřekonatelný lučištník, který v bitvě velel Kauravům, ačkoli jeho srdce patřilo dharmě – a nakonec ležel na loži z vlastních šípů a učil Judhišthiru.",
    relations: ["Syn Gangy a Šántanua", "Prastrýc Pánduovců i Kauravů", "Žák Parašurámy"],
    audioMinutes: 26,
  },
  {
    slug: "vjasa",
    name: "Vjása",
    sanskrit: "Vyāsa",
    epithet: "Autor a svědek eposu",
    group: "predci",
    description:
      "Mudrc Krišna Dvaipájana Vjása, který Mahábháratu složil a zároveň v ní vystupuje. Skrze něj se rodí Dhritaráštra, Pándu i Vidura a jeho slovo se v příběhu opakovaně stává obratem osudu.",
    relations: ["Syn Satjavatí a Parášary", "Otec Dhritaráštry, Pándua a Vidury", "Autor eposu"],
    audioMinutes: 18,
  },
  {
    slug: "dhritarastra",
    name: "Dhritaráštra",
    sanskrit: "Dhṛtarāṣṭra",
    epithet: "Slepý král",
    group: "predci",
    description:
      "Nejstarší syn, kterému slepota zabránila v nástupu na trůn, a jehož slabost k synu Durjódhanovi dovolila válce vzejít. Vládl Hastinápuru, ale nikdy nedokázal být jeho pánem.",
    relations: ["Manžel Gándhárí", "Otec sta Kauravů", "Bratr Pándua a Vidury"],
    audioMinutes: 16,
  },
  {
    slug: "gandhari",
    name: "Gándhárí",
    sanskrit: "Gāndhārī",
    epithet: "Královna se zavázanými očima",
    group: "predci",
    description:
      "Zavázala si oči, aby žila v témže světě jako její slepý manžel. Matka sta synů, která marně varovala Durjódhanu. Její žal po bitvě dozrál v kletbu, jež zničila i rod Jádavů.",
    relations: ["Manželka Dhritaráštry", "Matka Durjódhany", "Sestra Šakuniho"],
    audioMinutes: 14,
  },
  {
    slug: "pandu",
    name: "Pándu",
    sanskrit: "Pāṇḍu",
    epithet: "Prokletý král",
    group: "predci",
    description:
      "Král, po němž se Pánduovci jmenují. Kletba mudrce mu zapověděla dotek milované ženy, a tak jeho synové přišli na svět skrze zaklínadlo darované Kuntí.",
    relations: ["Manžel Kuntí a Mádrí", "Otec pěti Pánduovců", "Bratr Dhritaráštry"],
    audioMinutes: 11,
  },
  {
    slug: "kunti",
    name: "Kuntí",
    sanskrit: "Kuntī",
    epithet: "Matka pěti bratrů",
    group: "predci",
    description:
      "Pritha, adoptovaná dcera krále Kuntibhódži, obdařená zaklínadlem k přivolání bohů. Matka Judhišthiry, Bhímy a Ardžuny – a dříve i Karny, jehož jako dívka poslala po vodě.",
    relations: ["Matka Karny", "Matka tří starších Pánduovců", "Krišnova teta"],
    audioMinutes: 19,
  },
  {
    slug: "madri",
    name: "Mádrí",
    sanskrit: "Mādrī",
    epithet: "Druhá královna Pánduova",
    group: "predci",
    description:
      "Princezna z Madry a Šaljova sestra, matka dvojčat Nakuly a Sahadévy. Po Pánduově smrti jej následovala na hranici a své syny odkázala Kuntí.",
    relations: ["Manželka Pándua", "Matka Nakuly a Sahadévy", "Sestra Šalji"],
    audioMinutes: 8,
  },
  {
    slug: "vidura",
    name: "Vidura",
    sanskrit: "Vidura",
    epithet: "Hlas svědomí dvora",
    group: "predci",
    description:
      "Nejmoudřejší muž Hastinápuru, zrozený ze služebnice, a proto vylučen z trůnu. Rádce, který jako jediný mluvil pravdu i tehdy, když nikdo neposlouchal, a jehož varování Pánduovcům opakovaně zachránila život.",
    relations: ["Bratr Dhritaráštry a Pándua", "Rádce Kuruovců", "Ochránce Pánduovců"],
    audioMinutes: 15,
  },
  {
    slug: "drona",
    name: "Dróna",
    sanskrit: "Droṇa",
    epithet: "Mistr zbraní",
    group: "ucitele",
    description:
      "Bráhmanský válečník, který vycvičil Kaurany i Pánduovce a v Ardžunovi našel nejlepšího žáka. Vázán vděčností ke dvoru bojoval proti těm, které miloval, a padl v okamžiku, kdy uvěřil lživé zprávě o smrti svého syna.",
    relations: ["Otec Ašvatthámy", "Učitel Ardžuny a Karny", "Vrchní velitel Kauravů"],
    audioMinutes: 22,
  },
  {
    slug: "kripa",
    name: "Kripa",
    sanskrit: "Kṛpa",
    epithet: "První učitel princů",
    group: "ucitele",
    description:
      "Bráhman a mistr zbraní, který učil kuruovské princy ještě před Drónou. Jeden z mála bojovníků, kteří válku přežili, a později učitel Paríkšita.",
    relations: ["Bratr Krípí, Drónovy ženy", "Učitel Kauravů i Pánduovců", "Přežil bitvu"],
    audioMinutes: 10,
  },
  {
    slug: "asvatthama",
    name: "Ašvattháma",
    sanskrit: "Aśvatthāmā",
    epithet: "Nesmrtelný s klenotem na čele",
    group: "ucitele",
    description:
      "Drónův syn, mocný a nezkrotný. Po otcově smrti se změnil v nástroj pomsty: přepadl spící tábor a vypustil Brahmáširu proti nenarozenému dítěti. Krišnova kletba jej odsoudila k tisíciletému bloudění.",
    relations: ["Syn Dróny", "Přítel Durjódhany", "Prokletý Krišnou"],
    audioMinutes: 20,
  },
  {
    slug: "judhisthira",
    name: "Judhišthira",
    sanskrit: "Yudhiṣṭhira",
    epithet: "Král dharmy",
    group: "panduovci",
    description:
      "Nejstarší z Pánduovců, syn boha Dharmy. Neúchylně pravdivý a spravedlivý, a přesto svou slabostí ke hře v kostky přivedl rodinu do vyhnanství. Po válce vládl obnovenému království a jako jediný dosáhl hory Méru v těle.",
    relations: ["Syn Kuntí a Dharmy", "Manžel Draupadí", "Král Indraprastha a Hastinápuru"],
    audioMinutes: 24,
  },
  {
    slug: "bhima",
    name: "Bhíma",
    sanskrit: "Bhīma",
    epithet: "Síla vichru",
    group: "panduovci",
    description:
      "Syn boha větru Váju, bojovník s kyjem, jehož síla vyvažovala celé vojsko. Nezapomněl žádné ponížení Draupadí a v posledním souboji srazil Durjódhanu.",
    relations: ["Syn Kuntí a Váju", "Otec Ghatótkači", "Bratr Hanumánův duchem"],
    audioMinutes: 23,
  },
  {
    slug: "ardzuna",
    name: "Ardžuna",
    sanskrit: "Arjuna",
    epithet: "Nepřekonatelný lučištník",
    group: "panduovci",
    description:
      "Syn Indry a nejlepší lukostřelec světa, majitel luku Gándíva. Přítel a žák Krišny, jemuž na Kurukšétře zazněla Bhagavadgíta. Jeho pochybnost na počátku bitvy se stala nejslavnějším rozhovorem indické tradice.",
    relations: ["Syn Kuntí a Indry", "Přítel Krišny", "Otec Abhimanjua"],
    audioMinutes: 28,
  },
  {
    slug: "nakula",
    name: "Nakula",
    sanskrit: "Nakula",
    epithet: "Mistr meče a koní",
    group: "panduovci",
    description:
      "Jedno z dvojčat Mádrí, nejpohlednější z bratrů, nedostižný šermíř a znalec koní. V přestrojení u Viráty pracoval jako správce stájí.",
    relations: ["Syn Mádrí a Ašvinů", "Dvojče Sahadévy", "Manžel Draupadí"],
    audioMinutes: 9,
  },
  {
    slug: "sahadeva",
    name: "Sahadéva",
    sanskrit: "Sahadeva",
    epithet: "Nejmoudřejší z bratrů",
    group: "panduovci",
    description:
      "Druhé z dvojčat, znalec hvězd, krav a skrytých věcí. Judhišthira si u něj cenil rady i mlčení; jako jediný znal budoucnost, ale nesměl o ní mluvit.",
    relations: ["Syn Mádrí a Ašvinů", "Dvojče Nakuly", "Manžel Draupadí"],
    audioMinutes: 9,
  },
  {
    slug: "draupadi",
    name: "Draupadí",
    sanskrit: "Draupadī",
    epithet: "Zrozená z ohně",
    group: "panduovci",
    description:
      "Dcera krále Drupady, žena všech pěti Pánduovců a nejsilnější hlas eposu. Její ponížení ve sněmovní hale a otázka, kterou tam položila, jsou skutečným počátkem války.",
    relations: ["Dcera Drupady", "Žena pěti Pánduovců", "Sestra Dhrištadjumny"],
    audioMinutes: 25,
  },
  {
    slug: "abhimanju",
    name: "Abhimanju",
    sanskrit: "Abhimanyu",
    epithet: "Chlapec v bludišti",
    group: "panduovci",
    description:
      "Ardžunův syn, obdařený otcovou odvahou. Sám vnikl do formace čakravjúha, kterou umělo prorazit jen několik bojovníků, a padl v boji proti sedmi velitelům zároveň.",
    relations: ["Syn Ardžuny a Subhadry", "Krišnův synovec", "Otec Paríkšita"],
    audioMinutes: 17,
  },
  {
    slug: "ghatotkaca",
    name: "Ghatótkača",
    sanskrit: "Ghaṭotkaca",
    epithet: "Rákšasa mezi bratranci",
    group: "panduovci",
    description:
      "Bhímův syn s rákšasí Hidimbí, obr schopný měnit velikost i letět. V noční bitvě řádil v kuruovských řadách, dokud jej Karna nesrazil Vášaví Šakti – kopím určeným Ardžunovi.",
    relations: ["Syn Bhímy a Hidimbí", "Bojovník Pánduovců", "Zabit Vášaví Šakti"],
    audioMinutes: 13,
  },
  {
    slug: "drupada",
    name: "Drupada",
    sanskrit: "Drupada",
    epithet: "Král Pančály",
    group: "panduovci",
    description:
      "Drónův bývalý druh z mládí a později jeho nepřítel. Vykonal obřad, z jehož ohně vyšli Draupadí a Dhrištadjumna – dcera určená Ardžunovi a syn určený k zabití Dróny.",
    relations: ["Otec Draupadí", "Otec Dhrištadjumny", "Spojenec Pánduovců"],
    audioMinutes: 12,
  },
  {
    slug: "dhristadjumna",
    name: "Dhrištadjumna",
    sanskrit: "Dhṛṣṭadyumna",
    epithet: "Vrchní velitel Pánduovců",
    group: "panduovci",
    description:
      "Zrozen z obětního ohně jako Drónova smrt. Velel pánduovskému vojsku po celou bitvu a Drónu skutečně sťal – aby sám padl v noci pod Ašvatthámovou rukou.",
    relations: ["Syn Drupady", "Bratr Draupadí", "Zabil Drónu"],
    audioMinutes: 14,
  },
  {
    slug: "sikhandi",
    name: "Šikhandí",
    sanskrit: "Śikhaṇḍī",
    epithet: "Bhíšmův osud",
    group: "panduovci",
    description:
      "Dítě Drupady, vychované jako syn, jehož zrození nesla tíha minulého života Ambá. Proti Šikhandímu Bhíšma odmítl zvednout zbraň, a tím se otevřela cesta k jeho pádu.",
    relations: ["Dítě Drupady", "Klíč k Bhíšmově smrti", "Bojovník Pánduovců"],
    audioMinutes: 13,
  },
  {
    slug: "virata",
    name: "Viráta",
    sanskrit: "Virāṭa",
    epithet: "Král Matsjů",
    group: "panduovci",
    description:
      "Vládce, na jehož dvoře přečkali Pánduovci třináctý rok v přestrojení. Jeho dcera Uttará se stala Abhimanjuovou ženou a matkou Paríkšita, pokračovatele rodu.",
    relations: ["Král Matsjů", "Ochránce Pánduovců v přestrojení", "Dědeček Paríkšita"],
    audioMinutes: 10,
  },
  {
    slug: "durjodhana",
    name: "Durjódhana",
    sanskrit: "Duryodhana",
    epithet: "Nejstarší Kaurava",
    group: "kauravove",
    description:
      "Král, který nikdy nedokázal snést, že Pánduovci existují. Statečný, štědrý ke svým a naprosto neústupný: odmítl vydat i pět vesnic a raději nechal padnout celý svůj rod. V posledním souboji čelil Bhímovi s kyjem.",
    relations: ["Syn Dhritaráštry a Gándhárí", "Přítel Karny", "Zabit Bhímou"],
    audioMinutes: 27,
  },
  {
    slug: "dusasana",
    name: "Dušásana",
    sanskrit: "Duśāsana",
    epithet: "Ruka, která strhla sárí",
    group: "kauravove",
    description:
      "Durjódhanův nejbližší bratr a vykonavatel jeho nejhorších rozkazů, především ponížení Draupadí ve sněmovní hale. Bhíma na něm vykonal krutou pomstu, kterou přísahal ve vyhnanství.",
    relations: ["Bratr Durjódhany", "Ponížil Draupadí", "Zabit Bhímou"],
    audioMinutes: 11,
  },
  {
    slug: "jujucu",
    name: "Jujuču",
    sanskrit: "Yuyutsu",
    epithet: "Kaurava, který přešel",
    group: "kauravove",
    description:
      "Dhritaráštrův syn ze služebnice, jediný z rodu, který se před bitvou přidal k Pánduovcům. Válku přežil a pomáhal spravovat obnovené království.",
    relations: ["Syn Dhritaráštry", "Přešel k Pánduovcům", "Přežil bitvu"],
    audioMinutes: 8,
  },
  {
    slug: "karna",
    name: "Karna",
    sanskrit: "Karṇa",
    epithet: "Syn Slunce",
    group: "kauravove",
    description:
      "Kuntíin první syn, vychovaný vozatajem, celý život posmívaný pro nízký původ. Rovnocenný Ardžunovi, věrný Durjódhanovi až za hrob a nejtragičtější postava celého eposu. Vzdal se své nezranitelné zbroje, protože nikdy neodmítl žádost o dar.",
    relations: ["Syn Kuntí a Súrji", "Nejstarší bratr Pánduovců", "Zabit Ardžunou"],
    audioMinutes: 29,
  },
  {
    slug: "sakuni",
    name: "Šakuni",
    sanskrit: "Śakuni",
    epithet: "Pán falešných kostek",
    group: "kauravove",
    description:
      "Gándhárin bratr, princ z Gándháry, který kostkami dokázal víc než jiní vojskem. Jeho hra připravila Pánduovce o všechno a jeho rada vedla Durjódhanu do zkázy.",
    relations: ["Bratr Gándhárí", "Strýc Durjódhany", "Zabit Sahadévou"],
    audioMinutes: 15,
  },
  {
    slug: "salja",
    name: "Šalja",
    sanskrit: "Śalya",
    epithet: "Vozataj bez věrnosti",
    group: "kauravove",
    description:
      "Král Madry a strýc Nakuly a Sahadévy, lstí získaný na kuruovskou stranu. Jako Karnův vozataj jej podle úmluvy s Judhišthirou soustavně oslaboval slovy. Poslední den velel vojsku a padl.",
    relations: ["Bratr Mádrí", "Karnův vozataj", "Zabit Judhišthirou"],
    audioMinutes: 13,
  },
  {
    slug: "dzajadratha",
    name: "Džajadratha",
    sanskrit: "Jayadratha",
    epithet: "Král Sindhu",
    group: "kauravove",
    description:
      "Durjódhanův švagr, který ve vyhnanství unesl Draupadí a v bitvě uzavřel Abhimanjuovi cestu z bludiště. Ardžuna přísahal, že jej zabije do západu slunce – a Krišna mu k tomu zatemnil nebe.",
    relations: ["Manžel Dušaly", "Podílel se na smrti Abhimanjua", "Zabit Ardžunou"],
    audioMinutes: 12,
  },
  {
    slug: "krisna",
    name: "Krišna",
    sanskrit: "Kṛṣṇa",
    epithet: "Vozataj a božství samo",
    group: "bozske",
    description:
      "Vasudévův syn, vládce Dváraky a vtělení Višnua. V bitvě nezvedl zbraň, jen vedl Ardžunův vůz – a přesto rozhodl o všem. Jeho učení v Bhagavadgítě je srdcem celé Mahábháraty.",
    relations: ["Ardžunův vozataj", "Kuntíin synovec", "Vtělení Višnua"],
    audioMinutes: 34,
  },
  {
    slug: "balarama",
    name: "Balaráma",
    sanskrit: "Balarāma",
    epithet: "Mistr kyje",
    group: "bozske",
    description:
      "Krišnův starší bratr, učitel Bhímy i Durjódhany v boji s kyjem. Do války odmítl zasáhnout a odešel na poutě; vrátil se právě včas, aby se rozhněval nad nečestným úderem, který ukončil válku.",
    relations: ["Bratr Krišny", "Učitel Bhímy a Durjódhany", "Zdržel se války"],
    audioMinutes: 16,
  },
  {
    slug: "satjaki",
    name: "Sátjaki",
    sanskrit: "Sātyaki",
    epithet: "Jádavský lučištník",
    group: "bozske",
    description:
      "Vrišniovský válečník a Krišnův věrný druh, který se se svým vojskem přidal k Pánduovcům. Nebojácný, prudký a jeden z nejúčinnějších bojovníků na jejich straně.",
    relations: ["Žák Ardžuny", "Krišnův druh", "Bojovník Pánduovců"],
    audioMinutes: 12,
  },
  {
    slug: "kritavarma",
    name: "Kritavarma",
    sanskrit: "Kṛtavarmā",
    epithet: "Jádava na druhé straně",
    group: "bozske",
    description:
      "Vůdce jádavského oddílu, který si vybral kuruovskou stranu. Přežil bitvu i noční přepad, jehož se s Ašvatthámou zúčastnil, a padl teprve při vzájemné zkáze Jádavů.",
    relations: ["Jádavský velitel", "Spojenec Durjódhany", "Padl při zkáze Jádavů"],
    audioMinutes: 10,
  },
];

export const characters: Character[] = raw.map((c) => ({
  ...c,
  image: imageFor(`char-${c.slug}`, 800, 900),
}));

export function getCharacter(slug: string): Character | undefined {
  return characters.find((c) => c.slug === slug);
}

export function charactersByGroup(group: string) {
  return characters.filter((c) => c.group === group);
}
