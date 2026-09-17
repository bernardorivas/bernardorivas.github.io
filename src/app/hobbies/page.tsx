import { buildMetadata } from "@/lib/metadata";
import { hobbiesCopy } from "@/data/copy";
import { hobbyProjects } from "@/data/hobby-projects";

export const metadata = buildMetadata({
  title: "Hobbies — Bernardo Rivas",
  description: "Bernardo Rivas on 3D printing and personal projects.",
  path: "/hobbies",
});

export default function Hobbies() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <h1 className="page-title">{hobbiesCopy.h1}</h1>
        <p className="page-intro">{hobbiesCopy.intro}</p>

        {hobbyProjects.length > 0 && (
          <section aria-labelledby="hobby-projects-title">
            <h2 className="group-head" id="hobby-projects-title">{hobbiesCopy.projectsHeading}</h2>
            <div className="hobby-projects">
              {hobbyProjects.map((project) => (
                <article className="hobby-project" key={project.id}>
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
