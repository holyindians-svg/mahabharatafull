import { createFileRoute } from "@tanstack/react-router";
import { parvas } from "@/data/parvas";
import { EntityCard } from "@/components/EntityCard";
import { OfflineDownloadButton } from "@/components/OfflineDownloadButton";
import { audiobooks } from "@/data/audiobooks";
import { Page, PageHeader } from "@/components/Bits";

export const Route = createFileRoute("/knihy/")({
  head: () => ({
    meta: [
      { title: "18 knih Mahábháraty (Parv) – přehled" },
      {
        name: "description",
        content:
          "Vizuální přehled všech osmnácti knih Mahábháraty od Ádi Parvy po Svargárohanika Parvu, s obsahem a předčítáním.",
      },
      { property: "og:title", content: "18 knih Mahábháraty (Parv)" },
      {
        property: "og:description",
        content: "Od Ádi Parvy po vzestup do nebe – všech 18 Parv s popisem a klíčovými událostmi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Books,
});

function Books() {
  return (
    <Page>
      <PageHeader
        eyebrow="Aṣṭādaśa Parva"
        title="Knihy Mahábháraty"
        sanskrit="18 Parv"
        description="Epos je rozdělen do osmnácti knih. Prvních pět připravuje válku, čtyři popisují bitvu na Kurukšétře a zbývající vypráví o následcích, o učení a o odchodu hrdinů. Klikněte na kteroukoli knihu pro detail."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {parvas.map((p) => (
          <div key={p.slug} className="flex flex-col gap-2">
          <EntityCard
            to="/knihy/$slug"
            params={{ slug: p.slug }}
            image={p.image}
            overline={`${p.order}. kniha`}
            title={p.name}
            sanskrit={`${p.sanskrit} · ${p.subtitle}`}
            text={p.summary}
            className="border-primary/20"
          />
          {audiobooks[p.slug] ? <OfflineDownloadButton bookId={p.slug} /> : null}
          </div>
        ))}
      </div>
    </Page>
  );
}
