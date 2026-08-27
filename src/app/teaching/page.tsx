import { buildMetadata } from "@/lib/metadata";
import { teachingCopy } from "@/data/copy";
import { courseGroups } from "@/data/courses";
import CourseEntry from "@/components/CourseEntry";

export const metadata = buildMetadata({
  title: "Teaching — Bernardo Rivas",
  description:
    "Courses taught by Bernardo Rivas in analysis, differential equations, mathematical reasoning, statistics, and data science, with course materials.",
  path: "/teaching",
});

const groupIds = [
  "utoledo-instructor-title",
  "rutgers-instructor-title",
  "rutgers-ta-title",
  "usp-instructor-title",
];

export default function Teaching() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <h1 className="page-title">{teachingCopy.h1}</h1>

        {courseGroups.map((group, i) => (
          <section key={groupIds[i]} aria-labelledby={groupIds[i]}>
            <h2 className="group-head" id={groupIds[i]}>{group.title}</h2>
            <div className="entries">
              {group.courses.map((course) => (
                <CourseEntry key={course.id} course={course} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
