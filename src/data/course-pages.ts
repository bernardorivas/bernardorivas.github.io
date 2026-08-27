// Transcribed verbatim from $OLD/teaching-calc-i.html, $OLD/teaching-diffeq.html,
// $OLD/teaching-math300.html, $OLD/teaching-real-analysis.html.
//
// Link labels are human-authored and not derivable from the PDF filenames
// (e.g. math300 lecture labels hide the "+pigeonhole" / "-midterm" /
// "-4thofJuly" filename suffixes; diffeq's "Practice problems — Midterm"
// label has no relation to its "suggested-problems.pdf" filename). PDF hrefs
// are root-relative.

import type { CoursePage } from "@/data/types";

export const coursePages: Record<"calc-i" | "diffeq" | "math300" | "real-analysis", CoursePage> = {
  "calc-i": {
    title: "Calculus I",
    meta: "Math 135 · 640:135 · Rutgers · Fall 2021",
    note: "Weekly recitation workshops from my Fall 2021 sections.",
    groups: [
      {
        title: "Workshops",
        sub: "One worksheet per week of the semester.",
        style: "filegrid",
        links: [
          { label: "Workshop 1", href: "/files/teaching/calculus-i/workshop-01.pdf" },
          { label: "Workshop 2", href: "/files/teaching/calculus-i/workshop-02.pdf" },
          { label: "Workshop 3", href: "/files/teaching/calculus-i/workshop-03.pdf" },
          { label: "Workshop 4", href: "/files/teaching/calculus-i/workshop-04.pdf" },
          { label: "Workshop 5", href: "/files/teaching/calculus-i/workshop-05.pdf" },
          { label: "Workshop 6", href: "/files/teaching/calculus-i/workshop-06.pdf" },
          { label: "Workshop 7", href: "/files/teaching/calculus-i/workshop-07.pdf" },
          { label: "Workshop 8", href: "/files/teaching/calculus-i/workshop-08.pdf" },
          { label: "Workshop 9", href: "/files/teaching/calculus-i/workshop-09.pdf" },
          { label: "Workshop 10", href: "/files/teaching/calculus-i/workshop-10.pdf" },
          { label: "Workshop 11", href: "/files/teaching/calculus-i/workshop-11.pdf" },
          { label: "Workshop 12", href: "/files/teaching/calculus-i/workshop-12.pdf" },
          { label: "Workshop 13", href: "/files/teaching/calculus-i/workshop-13.pdf" },
          { label: "Workshop 14", href: "/files/teaching/calculus-i/workshop-14.pdf" },
        ],
      },
    ],
  },

  diffeq: {
    title: "Elementary Differential Equations",
    meta: "Math 252 · 640:252 · Rutgers · Summer 2022 · online · Instructor",
    note: "Assignments and notes as PDFs; solutions are not posted.",
    groups: [
      {
        title: "Syllabus",
        style: "doclinks",
        links: [{ label: "Syllabus (PDF)", href: "/files/teaching/differential-equations/syllabus.pdf" }],
      },
      {
        title: "Homework",
        style: "doclinks",
        links: [
          { label: "Homework 1", href: "/files/teaching/differential-equations/homework/homework-01.pdf" },
          { label: "Homework 2", href: "/files/teaching/differential-equations/homework/homework-02.pdf" },
          { label: "Homework 3", href: "/files/teaching/differential-equations/homework/homework-03.pdf" },
          { label: "Homework 4", href: "/files/teaching/differential-equations/homework/homework-04.pdf" },
          { label: "Homework 5", href: "/files/teaching/differential-equations/homework/homework-05.pdf" },
        ],
      },
      {
        title: "MATLAB labs",
        style: "doclinks",
        links: [
          { label: "Lab 1", href: "/files/teaching/differential-equations/labs/lab-01.pdf" },
          { label: "Lab 2", href: "/files/teaching/differential-equations/labs/lab-02.pdf" },
        ],
      },
      {
        title: "Lecture notes",
        sub: "Thirteen lectures across the summer term.",
        style: "filegrid",
        links: [
          { label: "Lecture 1", href: "/files/teaching/differential-equations/lectures/lecture-01.pdf" },
          { label: "Lecture 2", href: "/files/teaching/differential-equations/lectures/lecture-02.pdf" },
          { label: "Lecture 3", href: "/files/teaching/differential-equations/lectures/lecture-03.pdf" },
          { label: "Lecture 4", href: "/files/teaching/differential-equations/lectures/lecture-04.pdf" },
          { label: "Lecture 5", href: "/files/teaching/differential-equations/lectures/lecture-05.pdf" },
          { label: "Lecture 6", href: "/files/teaching/differential-equations/lectures/lecture-06.pdf" },
          { label: "Lecture 7", href: "/files/teaching/differential-equations/lectures/lecture-07.pdf" },
          { label: "Lecture 8", href: "/files/teaching/differential-equations/lectures/lecture-08.pdf" },
          { label: "Lecture 9", href: "/files/teaching/differential-equations/lectures/lecture-09.pdf" },
          { label: "Lecture 10", href: "/files/teaching/differential-equations/lectures/lecture-10.pdf" },
          { label: "Lecture 11", href: "/files/teaching/differential-equations/lectures/lecture-11.pdf" },
          { label: "Lecture 12", href: "/files/teaching/differential-equations/lectures/lecture-12.pdf" },
          { label: "Lecture 13", href: "/files/teaching/differential-equations/lectures/lecture-13.pdf" },
        ],
      },
      {
        title: "Practice & review",
        style: "doclinks",
        links: [
          { label: "Practice problems — Midterm", href: "/files/teaching/differential-equations/supplements/suggested-problems.pdf" },
          { label: "Practice problems — Final", href: "/files/teaching/differential-equations/supplements/suggested-problems-final.pdf" },
          { label: "Linear algebra review", href: "/files/teaching/differential-equations/supplements/linear-algebra-review.pdf" },
        ],
      },
    ],
  },

  math300: {
    title: "Introduction to Mathematical Reasoning",
    meta: "Math 300 · 640:300 · Rutgers · Summer 2023 · Instructor",
    note: "Assignments and notes as PDFs; solutions are not posted.",
    groups: [
      {
        title: "Syllabus",
        style: "doclinks",
        links: [{ label: "Syllabus (PDF)", href: "/files/teaching/math-reasoning/syllabus.pdf" }],
      },
      {
        title: "Homework",
        sub: "Ten weekly problem sets, one per topic.",
        style: "doclinks",
        links: [
          { label: "1 · Set theory", href: "/files/teaching/math-reasoning/homework/homework-01.pdf" },
          { label: "2 · Logic", href: "/files/teaching/math-reasoning/homework/homework-02.pdf" },
          { label: "3 · Direct proof & counterexample", href: "/files/teaching/math-reasoning/homework/homework-03.pdf" },
          { label: "4 · Contrapositive & contradiction", href: "/files/teaching/math-reasoning/homework/homework-04.pdf" },
          { label: "5 · Pigeonhole principle", href: "/files/teaching/math-reasoning/homework/homework-05.pdf" },
          { label: "6 · Non-conditional statements", href: "/files/teaching/math-reasoning/homework/homework-06.pdf" },
          { label: "7 · Induction", href: "/files/teaching/math-reasoning/homework/homework-07.pdf" },
          { label: "8 · Relations", href: "/files/teaching/math-reasoning/homework/homework-08.pdf" },
          { label: "9 · Functions", href: "/files/teaching/math-reasoning/homework/homework-09.pdf" },
          { label: "10 · Cardinality", href: "/files/teaching/math-reasoning/homework/homework-10.pdf" },
        ],
      },
      {
        title: "Lecture notes",
        sub: "Daily notes from the six-week term.",
        style: "filegrid",
        links: [
          { label: "Week 1 · Day 2", href: "/files/teaching/math-reasoning/lectures/week1-day2.pdf" },
          { label: "Week 2 · Day 2", href: "/files/teaching/math-reasoning/lectures/week2-day2.pdf" },
          { label: "Week 3 · Day 1", href: "/files/teaching/math-reasoning/lectures/week3-day1.pdf" },
          { label: "Week 3 · Day 2", href: "/files/teaching/math-reasoning/lectures/week3-day2.pdf" },
          { label: "Week 4 · Day 1", href: "/files/teaching/math-reasoning/lectures/week4-day1.pdf" },
          { label: "Week 4 · Day 2", href: "/files/teaching/math-reasoning/lectures/week4-day2+pigeonhole.pdf" },
          { label: "Week 5 · Day 1", href: "/files/teaching/math-reasoning/lectures/week5-day1.pdf" },
          { label: "Week 5 · Day 2", href: "/files/teaching/math-reasoning/lectures/week5-day2-midterm.pdf" },
          { label: "Week 6 · Day 1", href: "/files/teaching/math-reasoning/lectures/week6-day1-4thofJuly.pdf" },
          { label: "Week 6 · Day 2", href: "/files/teaching/math-reasoning/lectures/week6-day2.pdf" },
        ],
      },
      {
        title: "In-class activities",
        style: "doclinks",
        links: [
          { label: "Week 3, Day 2", href: "/files/teaching/math-reasoning/activities/activity-week3-day2.pdf" },
          { label: "Week 4, Day 1", href: "/files/teaching/math-reasoning/activities/activity-week4-day1.pdf" },
        ],
      },
    ],
  },

  "real-analysis": {
    title: "Introduction to Real Analysis I",
    meta: "Math 311 · 640:311 · Rutgers",
    note: "Instructor of record, Summer 2024; teaching assistant, Fall 2023. Solutions are not posted.",
    groups: [
      {
        title: "Homework",
        sub: "Summer 2024, as instructor of record — a selection.",
        style: "doclinks",
        links: [
          { label: "Homework 3", href: "/files/teaching/real-analysis/homework/homework-03.pdf" },
          { label: "Homework 9", href: "/files/teaching/real-analysis/homework/homework-09.pdf" },
        ],
      },
      {
        title: "Selected recitation workshops",
        sub: "Fall 2023, as teaching assistant — weekly problem sets on set theory, induction, sequences, and limits.",
        style: "filegrid",
        links: [
          { label: "Workshop 1", href: "/files/teaching/real-analysis/workshop-01.pdf" },
          { label: "Workshop 2", href: "/files/teaching/real-analysis/workshop-02.pdf" },
          { label: "Workshop 3", href: "/files/teaching/real-analysis/workshop-03.pdf" },
          { label: "Workshop 5", href: "/files/teaching/real-analysis/workshop-05.pdf" },
          { label: "Workshop 7", href: "/files/teaching/real-analysis/workshop-07.pdf" },
          { label: "Workshop 8", href: "/files/teaching/real-analysis/workshop-08.pdf" },
          { label: "Workshop 9", href: "/files/teaching/real-analysis/workshop-09.pdf" },
          { label: "Workshop 10", href: "/files/teaching/real-analysis/workshop-10.pdf" },
          { label: "Workshop 11", href: "/files/teaching/real-analysis/workshop-11.pdf" },
          { label: "Workshop 12", href: "/files/teaching/real-analysis/workshop-12.pdf" },
        ],
      },
      {
        title: "Review",
        style: "doclinks",
        links: [{ label: "Review session problems (PDF)", href: "/files/teaching/real-analysis/review-session.pdf" }],
      },
    ],
  },
};
