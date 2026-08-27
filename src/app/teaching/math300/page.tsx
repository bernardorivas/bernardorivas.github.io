import { buildMetadata } from "@/lib/metadata";
import { coursePages } from "@/data/course-pages";
import MaterialGroup from "@/components/MaterialGroup";
import Link from "next/link";

const page = coursePages["math300"];

export const metadata = buildMetadata({
  title: "Mathematical Reasoning — Bernardo Rivas",
  description: "Course materials for Introduction to Mathematical Reasoning (Math 300) at Rutgers, Summer 2023.",
  path: "/teaching/math300",
  // og:title and og:description both differ from the meta title/description.
  ogTitle: "Mathematical Reasoning — Course Materials",
  ogDescription: "Syllabus, homework, lecture notes, and activities for Introduction to Mathematical Reasoning.",
});

export default function Math300() {
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
