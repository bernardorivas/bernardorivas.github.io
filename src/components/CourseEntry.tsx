import type { Course } from "@/data/types";
import Link from "next/link";

// Markup mirrors $OLD/teaching.html course entries. Two divergences from the
// task-brief skeleton, confirmed against source (e.g. #course-data-4980,
// #course-real-summer-2024):
//   - the <article> carries no `id` attribute of its own — only
//     `aria-labelledby`, matching PublicationEntry/TalkEntry.
//   - the <h3 class="title"> id is `course.id` itself, not `${course.id}-title`
//     (there is no separate "-title" id scheme in the source).
// Link labels carry no arrow glyph in the data; the arrow is appended here
// per link (→ internal via next/link, ↗ external via <a>), reproducing the
// source's literal "label →"/"label ↗" text with a plain space before the
// glyph (no &nbsp;).
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
