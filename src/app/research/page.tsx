import { buildMetadata } from "@/lib/metadata";
import { researchCopy } from "@/data/copy";
import { researchGroups } from "@/data/publications";
import { projects } from "@/data/projects";
import PublicationEntry from "@/components/PublicationEntry";
import ProjectCard from "@/components/ProjectCard";
import LorenzPersistence from "@/components/LorenzPersistence";

export const metadata = buildMetadata({
  title: "Research — Bernardo Rivas",
  description:
    "Papers, preprints, and research software by Bernardo Rivas on hybrid systems, regulatory networks, and learned dynamics.",
  path: "/research",
});

export default function Research() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <h1 className="page-title">{researchCopy.h1}</h1>
        <p className="page-intro">{researchCopy.intro}</p>

        <LorenzPersistence />

        {researchGroups.map((g) => (
          <section key={g.id} aria-labelledby={g.id}>
            <h2 className="group-head" id={g.id}>{g.title}</h2>
            <div className="entries">
              {g.entries.map((e) => (
                <PublicationEntry key={e.id} entry={e} />
              ))}
            </div>
          </section>
        ))}

        <section aria-labelledby="software-title">
          <h2 className="group-head" id="software-title">{researchCopy.softwareHeading}</h2>
          <div className="entries">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        <p className="note">{researchCopy.fundingNote}</p>
      </div>
    </main>
  );
}
