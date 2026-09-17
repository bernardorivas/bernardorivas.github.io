import type { Course } from "@/data/types";
import Link from "next/link";

// Link markers distinguish internal and external course links.
export default function CourseEntry({ course }: { course: Course }) {
  return (
    <article className="entry" aria-labelledby={course.id}>
      <div className="rail"><span className="yr">{course.term}</span></div>
      <div className="body">
        <h3 className="title" id={course.id}>{course.title}</h3>
        {course.meta && <p className="meta">{course.meta}</p>}
        {course.links && (
          <div className="materials">
            {course.links.map(l =>
              l.external
                ? <a key={l.href} href={l.href}>{l.label} ↗</a>
                : <Link key={l.href} href={l.href}>{l.label} →</Link>)}
          </div>
        )}
      </div>
    </article>
  );
}
