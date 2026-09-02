import { buildMetadata } from "@/lib/metadata";
import { researchCopy } from "@/data/copy";
import { researchPublicationGroups } from "@/data/publications";
import PublicationEntry from "@/components/PublicationEntry";

export const metadata = buildMetadata({
  title: "Research — Bernardo Rivas",
  description:
    "Papers, preprints, and work in preparation by Bernardo Rivas on hybrid systems, regulatory networks, and learned dynamics.",
  path: "/research",
});

export default function Research() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <h1 className="page-title">{researchCopy.h1}</h1>

        {researchPublicationGroups.map((group) => (
          <section className="publication-year-group" key={group.id} aria-labelledby={group.id}>
            <h2 className="group-head" id={group.id}>{group.title}</h2>
            <div className="entries">
              {group.publications.map((entry) => (
                <PublicationEntry key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
