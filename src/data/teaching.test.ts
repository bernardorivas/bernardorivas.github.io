import { describe, it, expect } from "vitest";
import { courseGroups } from "@/data/courses";
import { projects } from "@/data/projects";

describe("teaching landing", () => {
  it("has 4 groups with 1/3/7/1 courses", () => {
    expect(courseGroups.map(g => g.courses.length)).toEqual([1, 3, 7, 1]);
  });
  it("uses en dash in ICMC–USP group title", () => {
    expect(courseGroups[3].title).toContain("ICMC–USP");
  });
});

describe("projects", () => {
  it("has 4, each linking straight out", () => {
    expect(projects).toHaveLength(4);
    for (const p of projects) expect(p.link.href).toMatch(/^https:\/\//);
  });
});
