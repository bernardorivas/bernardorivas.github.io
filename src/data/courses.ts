// Transcribed verbatim from $OLD/teaching.html.
//
// Arrow-glyph decision: the source inlines the arrow glyph in each <a> text
// node ("Course materials →", "Course description ↗") rather than putting it
// in a separate element. Even so, labels below are stored WITHOUT the arrow:
// the CourseLink type's own doc comment ("external renders '↗', internal
// '→'") establishes that the rendering component derives the glyph from the
// `external` flag, so keeping the glyph in the label text would duplicate it.

import type { CourseGroup } from "@/data/types";

const rutgersRealAnalysisDescription =
  "https://math.rutgers.edu/academics/undergraduate/course-descriptions/955-01-640-311-introduction-to-real-analysis-i";
const rutgersOdeEngDescription =
  "https://math.rutgers.edu/academics/undergraduate/course-descriptions/947-01-640-244-differential-equations-for-engineering-and-physics";

export const courseGroups: CourseGroup[] = [
  {
    title: "University of Toledo · Instructor of record",
    courses: [
      {
        id: "course-data-4980",
        term: "Spring 2026",
        title: "Advanced Topics in Data Science",
        meta: "DATA 4980",
      },
    ],
  },
  {
    title: "Rutgers University · Instructor of record",
    courses: [
      {
        id: "course-real-summer-2024",
        term: "Summer 2024",
        title: "Introduction to Real Analysis I",
        meta: "640:311",
        links: [
          { label: "Course materials", href: "/teaching/real-analysis" },
          { label: "Course description", href: rutgersRealAnalysisDescription, external: true },
        ],
      },
      {
        id: "course-reasoning-2023",
        term: "Summer 2023",
        title: "Introduction to Mathematical Reasoning",
        meta: "640:300",
        links: [{ label: "Course materials", href: "/teaching/math300" }],
      },
      {
        id: "course-ode-2022",
        term: "Summer 2022",
        title: "Elementary Differential Equations",
        meta: "640:252 · Online",
        links: [{ label: "Course materials", href: "/teaching/diffeq" }],
      },
    ],
  },
  {
    title: "Rutgers University · Teaching assistant",
    courses: [
      {
        id: "course-real-spring-2024",
        term: "Spring 2024",
        title: "Introduction to Real Analysis I",
        meta: "640:311",
        links: [{ label: "Course description", href: rutgersRealAnalysisDescription, external: true }],
      },
      {
        id: "course-real-fall-2023",
        term: "Fall 2023",
        title: "Introduction to Real Analysis I",
        meta: "640:311",
        links: [
          { label: "Selected workshops", href: "/teaching/real-analysis" },
          { label: "Course description", href: rutgersRealAnalysisDescription, external: true },
        ],
      },
      {
        id: "course-ode-244-2023",
        term: "Spring 2023",
        title: "Differential Equations for Engineering and Physics",
        meta: "640:244",
        links: [{ label: "Course description", href: rutgersOdeEngDescription, external: true }],
      },
      {
        id: "course-stats-2022",
        term: "Fall 2022",
        title: "Mathematical Theory of Statistics",
        meta: "640:481",
        links: [
          {
            label: "Course description",
            href: "https://math.rutgers.edu/academics/undergraduate/course-descriptions/991-01-640-481-mathematical-theory-of-statistics",
            external: true,
          },
        ],
      },
      {
        id: "course-advanced-calc-2022",
        term: "Fall 2022",
        title: "Advanced Calculus for Engineering",
        meta: "640:421",
        links: [
          {
            label: "Course description",
            href: "https://math.rutgers.edu/academics/undergraduate/course-descriptions/974-01-640-421-advanced-calculus-for-engineering",
            external: true,
          },
        ],
      },
      {
        id: "course-ode-244-2022",
        term: "Spring 2022",
        title: "Differential Equations for Engineering and Physics",
        meta: "640:244",
        links: [{ label: "Course description", href: rutgersOdeEngDescription, external: true }],
      },
      {
        id: "course-calc-2021",
        term: "Fall 2021",
        title: "Calculus I for the Life and Social Sciences",
        meta: "640:135",
        links: [
          { label: "Workshops", href: "/teaching/calc-i" },
          {
            label: "Course description",
            href: "https://math.rutgers.edu/academics/undergraduate/course-descriptions/938-01-640-135-calculus-i",
            external: true,
          },
        ],
      },
    ],
  },
  {
    title: "ICMC–USP · Instructor",
    courses: [
      {
        id: "course-minicourse-2019",
        term: "Winter 2019",
        title: "Minicourse on Differential Equations",
      },
    ],
  },
];
