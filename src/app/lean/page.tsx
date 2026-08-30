import { buildMetadata } from "@/lib/metadata";
import { leanCopy } from "@/data/copy";
import { leanProjects } from "@/data/lean-projects";

export const metadata = buildMetadata({
  title: "Lean — Bernardo Rivas",
  description: "Bernardo Rivas on using Lean in dynamical systems and topology.",
  path: "/lean",
});

export default function Lean() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <h1 className="page-title">{leanCopy.h1}</h1>
        <p className="page-intro">{leanCopy.intro}</p>

        {leanProjects.length > 0 && (
          <section aria-labelledby="lean-projects-title">
            <h2 className="group-head" id="lean-projects-title">{leanCopy.projectsHeading}</h2>
            <div className="lean-projects">
              {leanProjects.map((project) => (
                <article className="lean-project" key={project.id}>
                  <h3>
                    {project.href ? <a href={project.href}>{project.title}</a> : project.title}
                  </h3>
                  <p>{project.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
