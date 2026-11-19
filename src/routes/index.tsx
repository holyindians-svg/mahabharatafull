import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Flame, Search, Swords, Users } from "lucide-react";
import { HERO_IMAGE } from "@/data/images";
import { parvas } from "@/data/parvas";
import { characters } from "@/data/characters";
import { astras } from "@/data/astras";
import { EntityCard } from "@/components/EntityCard";
import { Chip, Page, Section } from "@/components/Bits";
import { AudioPlayer } from "@/components/AudioPlayer";
import { OfflineDownloadButton } from "@/components/OfflineDownloadButton";
import { audiobooks } from "@/data/audiobooks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mahábhárata – vizuální encyklopedie indického eposu" },
      {
        name: "description",
        content:
          "Prozkoumejte 18 knih Mahábháraty, genealogii postav a božské zbraně astry v bohatě ilustrované encyklopedii s předčítáním.",
      },
      { property: "og:title", content: "Mahábhárata – vizuální encyklopedie indického eposu" },
      {
        property: "og:description",
        content: "18 Parv, desítky postav a magické astry v temně ladění encyklopedii.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "18", label: "Knih (Parv)" },
  { value: String(characters.length), label: "Postav" },
  { value: String(astras.length), label: "Zbraní a artefaktů" },
  { value: "100 000", label: "Dvojverší" },
];

const sections = [
  {
    to: "/knihy",
    icon: BookOpen,
    title: "Knihy Mahábháraty",
    text: "Osmnáct Parv od zrození rodu Kuruovců až po vzestup do nebe.",
  },
  {
    to: "/postavy",
    icon: Users,
    title: "Genealogie a postavy",
    text: "Předci, učitelé, Pánduovci, Kauravové a Jádavové v přehledných skupinách.",
  },
  {
    to: "/astry",
    icon: Swords,
    title: "Zbraně a artefakty",
    text: "Brahmástra, Pášupatástra, Sudaršana Čakra a další božské zbraně.",
  },
  {
    to: "/hledat",
    icon: Search,
    title: "Hledat v textech",
    text: "Prohledejte knihy, postavy i zbraně jediným dotazem.",
  },
] as const;

function Home() {
  return (
    <div>
      <section className="grain relative flex min-h-[78vh] items-end overflow-hidden border-b border-border">
        <img
          src={HERO_IMAGE}
          alt="Krišna vede Ardžunův válečný vůz na bojišti Kurukšétry"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8">
          <Chip className="border-primary/40 text-primary">
            <Flame className="mr-2 size-3.5" /> Védská epika
          </Chip>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.1] sm:text-6xl">
            <span className="text-gilded">Mahábhárata</span>
          </h1>
          <p className="mt-2 font-display text-xl text-muted-foreground">Mahābhārata</p>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-foreground/85 sm:text-base">
            Největší epos světa: příběh rodu, který se rozdělil sám v sobě, války na Kurukšétře a
            učení, jež z ní vzešlo. Osmnáct knih, stovky bojovníků, božské zbraně a otázka dharmy,
            kterou epos nikdy neuzavře jednou odpovědí.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/knihy"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Otevřít 18 knih <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/postavy"
              className="inline-flex items-center gap-2 rounded-md border border-primary/40 px-5 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              Prohlédnout postavy
            </Link>
          </div>

          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-2xl text-primary sm:text-3xl">{s.value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Page>
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.to}
                to={s.to}
                className="card-relief group rounded-xl p-6 transition-all hover:-translate-y-1"
              >
                <span className="grid size-10 place-items-center rounded-full border border-primary/40 bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </span>
                <h2 className="mt-4 font-display text-lg text-foreground group-hover:text-primary">
                  {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </Link>
            );
          })}
        </div>

        <Section title="Kde začít">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[parvas[0]!, parvas[5]!, parvas[7]!].map((p) => (
              <div key={p.slug} className="space-y-2">
              <EntityCard
                to="/knihy/$slug"
                params={{ slug: p.slug }}
                image={p.image}
                overline={`${p.order}. Parva`}
                title={p.name}
                sanskrit={p.sanskrit}
                text={p.subtitle}
              />
              {audiobooks[p.slug] ? <OfflineDownloadButton bookId={p.slug} /> : null}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Nechte si předčítat">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <AudioPlayer
              title="Bhagavadgíta – zpěv Vznešeného"
              subtitle="Bhíšma Parva, rozhovor Krišny s Ardžunou"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Každá kniha, postava i zbraň má v detailu vlastní panel předčítání. Můžete si vybrat
              rychlost, posunout se v textu a pokračovat později. Zvukové nahrávky se doplňují –
              rozhraní je na ně už připravené.
            </p>
          </div>
        </Section>

        <Section title="Božské zbraně">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {astras.slice(0, 3).map((a) => (
              <EntityCard
                key={a.slug}
                to="/astry/$slug"
                params={{ slug: a.slug }}
                image={a.image}
                overline={a.kind}
                title={a.name}
                sanskrit={a.sanskrit}
                text={a.effect}
              />
            ))}
          </div>
        </Section>
      </Page>
    </div>
  );
}
