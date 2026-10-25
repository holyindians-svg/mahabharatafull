import { createFileRoute } from "@tanstack/react-router";
import { astras } from "@/data/astras";
import { EntityCard } from "@/components/EntityCard";
import { Page, PageHeader } from "@/components/Bits";

export const Route = createFileRoute("/astry/")({
  head: () => ({
    meta: [
      { title: "Astry – magické zbraně a artefakty Mahábháraty" },
      {
        name: "description",
        content:
          "Brahmástra, Pášupatástra, Sudaršana Čakra, Gándíva a další božské zbraně Mahábháraty s popisem účinku a majiteli.",
      },
      { property: "og:title", content: "Astry – magické zbraně Mahábháraty" },
      {
        property: "og:description",
        content: "Patnáct božských zbraní a artefaktů eposu, jejich účinky a majitelé.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Astras,
});

function Astras() {
  return (
    <Page>
      <PageHeader
        eyebrow="Divyāstra"
        title="Magické zbraně a artefakty"
        sanskrit="Astry"
        description="Astra není jen zbraň, ale zaklínadlo, kterým bojovník přivolá moc určitého božstva. Některé lze vypustit jen jednou, jiné dokážou ukončit celý věk. Vedle nich stojí legendární luky a disky."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {astras.map((a) => (
          <EntityCard
            key={a.slug}
            to="/astry/$slug"
            params={{ slug: a.slug }}
            image={a.image}
            overline={a.kind}
            title={a.name}
            sanskrit={`${a.sanskrit} · ${a.deity}`}
            text={a.effect}
            className="border-primary/20"
          />
        ))}
      </div>
    </Page>
  );
}
