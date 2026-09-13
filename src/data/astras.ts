import { imageFor } from "./images";
import type { Astra } from "./types";

const raw: Omit<Astra, "image">[] = [
  {
    slug: "brahmastra",
    name: "Brahmástra",
    sanskrit: "Brahmāstra",
    deity: "Brahmá",
    owners: ["Ardžuna", "Dróna", "Ašvattháma", "Karna"],
    kind: "Zbraň zkázy",
    effect:
      "Vypuštěna zaklínadlem, nikdy neselže a spálí vše, na co je zaměřena. Země pod dopadem zůstává na dlouhá léta neplodná a nespadne na ni kapka dešťě.",
    lore: "Nejobávanější ze všech aster. Smí být použita jen jednou a nikdy proti tomu, kdo je slabší.",
    power: 98,
    audioMinutes: 9,
  },
  {
    slug: "brahmasira",
    name: "Brahmášira",
    sanskrit: "Brahmaśira",
    deity: "Brahmá",
    owners: ["Ašvattháma", "Ardžuna"],
    kind: "Zbraň konce věku",
    effect:
      "Čtyřhlavá podoba Brahmástry, schopná zničit celý svět. Její vypuštění vyvolá žár, který vysuší řeky a promění vzduch v popel.",
    lore: "Ašvattháma ji obrátil proti nenarozenému dítěti Pánduovců; Krišna dítě ochránil a Ašvatthámu proklel.",
    power: 100,
    audioMinutes: 8,
  },
  {
    slug: "pasupatastra",
    name: "Pášupatástra",
    sanskrit: "Pāśupatāstra",
    deity: "Šiva",
    owners: ["Ardžuna"],
    kind: "Zbraň rozpuštění",
    effect:
      "Vypouští se myslí, zrakem, slovem nebo lukem a dokáže rozpustit veškeré stvoření. Proti ní neexistuje obrana.",
    lore: "Ardžuna ji získal po tvrdé askezi v Himálaji přímo od Šivy, s příkazem nikdy ji nepoužít proti obyčejnému protivníkovi.",
    power: 100,
    audioMinutes: 11,
  },
  {
    slug: "narajanastra",
    name: "Nárájanástra",
    sanskrit: "Nārāyaṇāstra",
    deity: "Višnu (Nárájana)",
    owners: ["Ašvattháma"],
    kind: "Zbraň nekonečných šípů",
    effect:
      "Sesílá milion šípů, disků a kopií zároveň. Čím více se jí bojovník brání, tím je silnější – jedinou záchranou je odložit zbraně a vzdát se.",
    lore: "Na Krišnovu radu Pánduovci seskočili z vozů a beze zbraně ulehli; zbraň nad nimi přešla bez škody.",
    power: 94,
    audioMinutes: 8,
  },
  {
    slug: "vaisnavastra",
    name: "Vaišnavástra",
    sanskrit: "Vaiṣṇavāstra",
    deity: "Višnu",
    owners: ["Bhagadatta"],
    kind: "Neomylná zbraň",
    effect:
      "Neomylně zasáhne a zničí svůj cíl; nikdy nevrací se s prázdnou. Zastavit ji může jen Višnu sám.",
    lore: "Když ji Bhagadatta vypustil na Ardžunu, Krišna přijal její zásah na svou hruď a proměnil ji v květinový věnec.",
    power: 92,
    audioMinutes: 7,
  },
  {
    slug: "nagastra",
    name: "Nágástra",
    sanskrit: "Nāgāstra",
    deity: "Nágové",
    owners: ["Karna"],
    kind: "Hadí zbraň",
    effect:
      "Šíp se v letu mění v hada s neomylným zaměřením a smrtelným jedem. Kdo je zasažen, upadne dřív, než pochopí, co jej ranilo.",
    lore: "Karnův hadí šíp minul Ardžunovu hlavu jen proto, že Krišna vůz zabořil kolena do země.",
    power: 78,
    audioMinutes: 6,
  },
  {
    slug: "varunastra",
    name: "Várunástra",
    sanskrit: "Vāruṇāstra",
    deity: "Varuna",
    owners: ["Ardžuna", "Bhíšma"],
    kind: "Zbraň vody",
    effect:
      "Vyvolá záplavu, mořskou bouři a stěny vody, které smetou vojsko. Je pravým protikladem ohnivé Ágnéjástry.",
    lore: "Používala se především k pohlcení ohnivých zbraní protivníka.",
    power: 82,
    audioMinutes: 6,
  },
  {
    slug: "vajavyastra",
    name: "Vájavyástra",
    sanskrit: "Vāyavyāstra",
    deity: "Váju",
    owners: ["Ardžuna", "Bhíšma", "Dróna"],
    kind: "Zbraň vichru",
    effect:
      "Rozpoutá vichřici, jež odnese vozy, koně i bojovníky. Zháší ohnivé zbraně a rozhání šípové bouře.",
    lore: "Váju, otec Bhímy, ji daroval těm, kdo si vydobyli jeho přízeň askezí.",
    power: 80,
    audioMinutes: 6,
  },
  {
    slug: "agnejastra",
    name: "Ágnéjástra",
    sanskrit: "Āgneyāstra",
    deity: "Agni",
    owners: ["Ardžuna", "Dróna", "Ašvattháma"],
    kind: "Zbraň ohně",
    effect:
      "Vyvolá neuhasitelný oheň, který se rozlije po celém poli. Uhasit jej lze pouze Várunástrou.",
    lore: "Nejčastěji nasazovaná božská zbraň Kurukšétry – téměř každý velký lučištník ji ovládal.",
    power: 84,
    audioMinutes: 6,
  },
  {
    slug: "indrastra",
    name: "Indrástra",
    sanskrit: "Indrāstra",
    deity: "Indra",
    owners: ["Ardžuna"],
    kind: "Zbraň blesku",
    effect: "Sesílá z nebe hustý příval šípů podobný krupobití, doprovázený hromy a blesky.",
    lore: "Dar Ardžunova nebeského otce Indry, jehož zvuk oznamoval příchod syna blesku.",
    power: 88,
    audioMinutes: 6,
  },
  {
    slug: "bhargavastra",
    name: "Bhárgavástra",
    sanskrit: "Bhārgavāstra",
    deity: "Parašuráma (Bhárgava)",
    owners: ["Karna"],
    kind: "Zbraň učitele",
    effect:
      "Vypustí nespočetné množství šípů, jež zaplní celé nebe a v jediném okamžiku pokosí tisíce bojovníků.",
    lore: "Karna ji dostal od Parašurámy, ale kletba mu způsobila, že si v nejtěžší chvíli nemohl vzpomenout na její zaklínadlo.",
    power: 90,
    audioMinutes: 7,
  },
  {
    slug: "vasavi-sakti",
    name: "Vášaví Šakti",
    sanskrit: "Vāsavī Śakti",
    deity: "Indra",
    owners: ["Karna"],
    kind: "Kopí jedné rány",
    effect:
      "Nezastavitelné kopí, které bezpečně zabije kohokoli – ale lze je použít jen jednou a pak se navrací k Indrovi.",
    lore: "Karna je získal výměnou za svou nezranitelnou zbroj a nakonec je vyplýtval na Ghatótkaču místo na Ardžunu.",
    power: 96,
    audioMinutes: 8,
  },
  {
    slug: "sudarsana-cakra",
    name: "Sudaršana Čakra",
    sanskrit: "Sudarśana Cakra",
    deity: "Višnu",
    owners: ["Krišna"],
    kind: "Božský disk",
    effect:
      "Rotující disk se sto osmi zubatými hranami, který se sám vrací do ruky svého pána a rozetne jakoukoli zbroj i kletbu.",
    lore: "Krišna jej v bitvě nepoužil proti vojsku – zvedl ho jen dvakrát, aby ukázal, kdo skutečně je.",
    power: 99,
    audioMinutes: 9,
  },
  {
    slug: "gandiva",
    name: "Gándíva",
    sanskrit: "Gāṇḍīva",
    deity: "Brahmá / Varuna",
    owners: ["Ardžuna"],
    kind: "Nebeský luk",
    effect:
      "Luk s tětivou, kterou nelze přetrhnout, a hlasem tak hlubokým, že se vojska při jeho zaznění zachvějí. Nikdy se nezkřiví ani neunaví.",
    lore: "Vytvořen Brahmou, předán skrze Varunu Ardžunovi před vypálením lesa Khándava; provázel jej celý život.",
    power: 95,
    audioMinutes: 8,
  },
  {
    slug: "vidzaja",
    name: "Vidžaja",
    sanskrit: "Vijaya",
    deity: "Šiva",
    owners: ["Karna", "Parašuráma"],
    kind: "Luk vítězství",
    effect:
      "Luk zaručující vítězství svému nositeli, schopný vystřelit každou astru bez ztráty přesnosti. Rovnocenný Gándívě.",
    lore: "Šiva jej daroval Parašurámovi a ten Karnovi. Ve rozhodujícím souboji stály oba nejmocnější luky světa proti sobě.",
    power: 94,
    audioMinutes: 7,
  },
];

export const astras: Astra[] = raw.map((a) => ({
  ...a,
  image: imageFor(`astra-${a.slug}`, 900, 700),
}));

export function getAstra(slug: string): Astra | undefined {
  return astras.find((a) => a.slug === slug);
}
