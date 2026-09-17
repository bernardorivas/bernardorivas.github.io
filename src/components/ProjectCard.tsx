import type { Project } from "@/data/types";

// One piece of software, with a direct repository or documentation link.
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="entry project-entry" aria-labelledby={project.id}>
      <div className="body">
        <h3 className="title" id={project.id}>
          <a href={project.link.href}>{project.name}</a>
        </h3>
        <p className="venue">{project.description}</p>
        <div className="links"><a href={project.link.href}>{project.link.label}</a></div>
      </div>
    </article>
  );
}
