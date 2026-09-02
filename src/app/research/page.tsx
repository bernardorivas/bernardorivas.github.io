import { buildMetadata } from "@/lib/metadata";
import { researchCopy } from "@/data/copy";
import { researchPublications } from "@/data/publications";
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
        <div className="entries">
          {researchPublications.map((entry) => (
            <PublicationEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </main>
  );
}
