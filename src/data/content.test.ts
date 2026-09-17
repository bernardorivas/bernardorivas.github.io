import { describe, it, expect } from "vitest";
import { researchPublicationGroups, researchPublications, recentPublications } from "@/data/publications";
import { talks } from "@/data/talks";

describe("publications", () => {
  it("has nine research entries", () => {
    expect(researchPublications).toHaveLength(9);
  });
  it("lists every paper exactly once", () => {
    const ids = researchPublications.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("groups public papers by year and leaves unfinished work undated", () => {
    expect(researchPublicationGroups.map(group => group.title)).toEqual(["2026", "2024", "In preparation"]);
    expect(researchPublicationGroups[0].publications.map(entry => entry.id)).toEqual([
      "prep-latent",
      "pub-learned",
      "pub-hybrid",
      "pub-boolean",
    ]);
    expect(researchPublicationGroups[1].publications.map(entry => entry.id)).toEqual(["pub-global"]);
    expect(researchPublicationGroups[2].publications.every(entry => entry.year === undefined)).toBe(true);
  });
  it("keeps arXiv ids verbatim (including future-dated ones)", () => {
    const ids = researchPublications.map(e => e.arxivId).filter(Boolean);
    expect(ids.sort()).toEqual(["2412.11078", "2606.14925", "2606.18501", "2609.01509"]);
  });
  it("links the published L4DC paper to its PMLR record, not to arXiv", () => {
    const learned = researchPublications.find(e => e.id === "pub-learned")!;
    expect(learned.authors).toBe("B. Rivas, W. Kalies, K. Iwasaki, A. Bloch, M. Ghaffari");
    expect(learned.url).toBe("https://proceedings.mlr.press/v331/rivas26a.html");
    expect(learned.arxivId).toBeUndefined();
    expect(learned.links).toContainEqual({
      label: "paper",
      href: "https://proceedings.mlr.press/v331/rivas26a.html",
    });
  });
  it("promotes the completed latent-space paper to an arXiv preprint", () => {
    const latent = researchPublications.find(e => e.id === "prep-latent")!;
    expect(latent.title).toBe("Characterizing High-dimensional Dynamics by Combinatorial-Topological Methods on a Latent Space");
    expect(latent.authors).toBe("P. Bailon, M. Gameiro, B. Gelb, W. Kalies, M. Kramar, K. Mischaikow, B. Rivas, E. Vieira");
    expect(latent.year).toBe("2026");
    expect(latent.url).toBe("https://arxiv.org/abs/2609.01509");
    expect(latent.arxivId).toBe("2609.01509");
    expect(latent.links).toContainEqual({ label: "code", href: "https://github.com/begelb/latent_dynamics/tree/paper" });
  });
  it("marks in-preparation entries only through their group heading", () => {
    const prep = researchPublicationGroups.find(group => group.title === "In preparation")!.publications;
    expect(prep).toHaveLength(4);
    for (const e of prep) {
      expect(e.venue).toBeUndefined();
      expect(e.year).toBeUndefined();
      expect(e.arxivId).toBeUndefined();
      expect(e.url).toBeUndefined();
    }
  });
  it("shows 3 recent papers on the landing page, each linking to the paper", () => {
    expect(recentPublications.map(e => e.id)).toEqual(["prep-latent", "pub-learned", "pub-hybrid"]);
    for (const e of recentPublications) expect(e.url).toBeTruthy();
  });
});

describe("talks", () => {
  it("is a single list of 11, newest first", () => {
    expect(talks).toHaveLength(11);
    const years = talks.map(t => Number(t.year));
    expect(years).toEqual([...years].sort((a, b) => b - a));
    expect(talks.filter(t => t.year === "2025").map(t => t.id)).toEqual([
      "talk-topology-regulation",
      "talk-systems-biology",
      "talk-grn-dynamics",
      "talk-network-dynamics",
    ]);
  });
  it("uses the middle-dot separator in venues", () => {
    for (const t of talks) expect(t.venue).toContain("·");
  });
});
