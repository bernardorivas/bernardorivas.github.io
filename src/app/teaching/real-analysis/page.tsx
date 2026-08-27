import { buildMetadata } from "@/lib/metadata";
import { coursePages } from "@/data/course-pages";
import MaterialGroup from "@/components/MaterialGroup";
import Link from "next/link";

const page = coursePages["real-analysis"];

export const metadata = buildMetadata({
  title: "Real Analysis I — Workshops — Bernardo Rivas",
  description:
    "Homework and selected recitation workshops for Introduction to Real Analysis I (Math 311) at Rutgers, Summer 2024 and Fall 2023.",
  path: "/teaching/real-analysis",
  // og:title and og:description both differ from the meta title/description.
  ogTitle: "Real Analysis I — Course Materials",
  ogDescription: "Homework, selected workshops, and review materials for Introduction to Real Analysis I.",
});

export default function RealAnalysis() {
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
