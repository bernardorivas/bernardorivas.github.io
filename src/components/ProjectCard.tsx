import type { Project } from "@/data/types";

// One piece of software, in the same entry shape as a paper: the role sits in
// the left rail, the link goes straight to the repository or documentation.
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="entry" aria-labelledby={project.id}>
      <div className="rail">{project.role}</div>
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
