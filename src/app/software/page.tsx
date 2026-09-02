import { buildMetadata } from "@/lib/metadata";
import { softwareCopy } from "@/data/copy";
import { projects } from "@/data/projects";
import LorenzPersistence from "@/components/LorenzPersistence";
import ProjectCard from "@/components/ProjectCard";

export const metadata = buildMetadata({
  title: "Software — Bernardo Rivas",
  description:
    "Research software and computational demonstrations by Bernardo Rivas for the topological analysis of nonlinear dynamics.",
  path: "/software",
});

export default function Software() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <h1 className="page-title">{softwareCopy.h1}</h1>
        <p className="page-intro software-intro">{softwareCopy.intro}</p>

        <LorenzPersistence />

        <section aria-labelledby="software-projects-title">
          <h2 className="group-head" id="software-projects-title">{softwareCopy.projectsHeading}</h2>
          <div className="entries">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        <p className="note">{softwareCopy.fundingNote}</p>
      </div>
    </main>
  );
}
