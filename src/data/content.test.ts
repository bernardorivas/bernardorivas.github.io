import { describe, it, expect } from "vitest";
import { researchGroups, recentPublications } from "@/data/publications";
import { talks } from "@/data/talks";

describe("publications", () => {
  it("has 9 papers across 3 themes (3/4/2), learning first", () => {
    expect(researchGroups.map(g => g.entries.length)).toEqual([3, 4, 2]);
    expect(researchGroups[0].title).toBe("Learned and data-driven dynamics");
  });
  it("lists every paper exactly once", () => {
    const ids = researchGroups.flatMap(g => g.entries).map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("keeps arXiv ids verbatim (including future-dated ones)", () => {
    const ids = researchGroups.flatMap(g => g.entries).map(e => e.arxivId).filter(Boolean);
    expect(ids.sort()).toEqual(["2412.11078", "2606.14925", "2606.18501"]);
  });
  it("links the published L4DC paper to its PMLR record, not to arXiv", () => {
    const learned = researchGroups.flatMap(g => g.entries).find(e => e.id === "pub-learned")!;
    expect(learned.url).toBe("https://proceedings.mlr.press/v331/rivas26a.html");
    expect(learned.arxivId).toBeUndefined();
  });
  it("marks in-preparation entries by venue, with no year and no arXiv id", () => {
    const prep = researchGroups.flatMap(g => g.entries).filter(e => e.venue === "In preparation.");
    expect(prep).toHaveLength(5);
    for (const e of prep) {
      expect(e.year).toBeUndefined();
      expect(e.arxivId).toBeUndefined();
      expect(e.url).toBeUndefined();
    }
  });
  it("shows 3 recent papers on the landing page, each linking to the paper", () => {
    expect(recentPublications).toHaveLength(3);
    for (const e of recentPublications) expect(e.url).toBeTruthy();
  });
});

describe("talks", () => {
  it("is a single list of 11, newest first", () => {
    expect(talks).toHaveLength(11);
    const years = talks.map(t => Number(t.year));
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });
  it("uses the middle-dot separator in venues", () => {
    for (const t of talks) expect(t.venue).toContain("·");
  });
});
