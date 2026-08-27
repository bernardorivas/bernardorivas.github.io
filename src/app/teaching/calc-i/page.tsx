import { buildMetadata } from "@/lib/metadata";
import { coursePages } from "@/data/course-pages";
import MaterialGroup from "@/components/MaterialGroup";
import Link from "next/link";

const page = coursePages["calc-i"];

export const metadata = buildMetadata({
  title: "Calculus I — Workshops — Bernardo Rivas",
  description: "Recitation workshops for Calculus I (Math 135) at Rutgers, Fall 2021.",
  path: "/teaching/calc-i",
  // og:title and og:description both differ from the meta title/description.
  ogTitle: "Calculus I — Workshop Materials",
  ogDescription: "Weekly recitation workshops for Calculus I at Rutgers University.",
});

export default function CalcI() {
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
