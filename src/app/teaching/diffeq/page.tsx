import { buildMetadata } from "@/lib/metadata";
import { coursePages } from "@/data/course-pages";
import MaterialGroup from "@/components/MaterialGroup";
import Link from "next/link";

const page = coursePages["diffeq"];

export const metadata = buildMetadata({
  title: "Differential Equations — Bernardo Rivas",
  description: "Course materials for Elementary Differential Equations (Math 252) at Rutgers, Summer 2022.",
  path: "/teaching/diffeq",
  // og:title and og:description both differ from the meta title/description.
  ogTitle: "Differential Equations — Course Materials",
  ogDescription: "Syllabus, homework, labs, lecture notes, and review materials for Elementary Differential Equations.",
});

export default function DiffEq() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <Link className="backlink" href="/teaching">← Teaching</Link>
        <h1 className="page-title">{page.title}</h1>
        <p className="meta">{page.meta}</p>
        {page.note && <p className="page-intro">{page.note}</p>}
        {page.groups.map((g) => (
          <MaterialGroup key={g.title} group={g} />
        ))}
      </div>
    </main>
  );
}
