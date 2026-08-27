import { describe, it, expect } from "vitest";
import { courseGroups, } from "@/data/courses";
import { coursePages } from "@/data/course-pages";
import { projects } from "@/data/projects";

describe("teaching landing", () => {
  it("has 4 groups with 1/3/7/1 courses", () => {
    expect(courseGroups.map(g => g.courses.length)).toEqual([1, 3, 7, 1]);
  });
  it("uses en dash in ICMC–USP group title", () => {
    expect(courseGroups[3].title).toContain("ICMC–USP");
  });
});

describe("course pages", () => {
  it("calc-i has 14 workshop chips", () => {
    expect(coursePages["calc-i"].groups[0].links).toHaveLength(14);
  });
  it("math300 homework keeps human labels", () => {
    const hw = coursePages["math300"].groups.find(g => g.title === "Homework")!;
    expect(hw.links).toHaveLength(10);
    expect(hw.links[2].label).toBe("3 · Direct proof & counterexample");
  });
  it("real-analysis workshops skip 04 and 06", () => {
    const ws = coursePages["real-analysis"].groups.map(g => g.links).flat().map(l => l.href);
    expect(ws.some(h => h.includes("workshop-04"))).toBe(false);
    expect(ws.some(h => h.includes("workshop-05"))).toBe(true);
  });
  it("preserves the + filename verbatim", () => {
    const all = Object.values(coursePages).flatMap(p => p.groups).flatMap(g => g.links);
    expect(all.some(l => l.href === "/files/teaching/math-reasoning/lectures/week4-day2+pigeonhole.pdf")).toBe(true);
  });
});

describe("projects", () => {
  it("has 4, each linking straight out", () => {
    expect(projects).toHaveLength(4);
    for (const p of projects) expect(p.link.href).toMatch(/^https:\/\//);
  });
});
