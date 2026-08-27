import { Fragment } from "react";
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

// The Van der Pol / Rook Fields figure sits with the group it illustrates
// (the pure Conley-theoretic work), while the animated Lorenz figure leads
// the page next to the data-driven group.
function VanDerPolFigure() {
  return (
    <figure className="research-figure">
      <div className="figure-pair">
        <div className="figure-panel figure-panel-map">
          <img
            src="/assets/vanderpol-multivalued-map.png"
            alt={researchCopy.figure.mapAlt}
            width={1422}
            height={1422}
            loading="lazy"
          />
          <span>{researchCopy.figure.mapLabel}</span>
        </div>
        <div className="figure-panel figure-panel-graph">
          <img
            src="/assets/vanderpol-morse-graph.png"
            alt={researchCopy.figure.graphAlt}
            width={395}
            height={470}
            loading="lazy"
          />
          <span>{researchCopy.figure.graphLabel}</span>
        </div>
      </div>
      <figcaption>{researchCopy.figure.caption}</figcaption>
    </figure>
  );
}

export default function Research() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <h1 className="page-title">{researchCopy.h1}</h1>
        <p className="page-intro">{researchCopy.intro}</p>

        <LorenzPersistence />

        {researchGroups.map((g) => (
          <Fragment key={g.id}>
            {g.id === "hybrid-title" && <VanDerPolFigure />}
            <section aria-labelledby={g.id}>
              <h2 className="group-head" id={g.id}>{g.title}</h2>
              <div className="entries">
                {g.entries.map((e) => (
                  <PublicationEntry key={e.id} entry={e} />
                ))}
              </div>
            </section>
          </Fragment>
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
