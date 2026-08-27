import { describe, it, expect } from "vitest";
import { profile } from "@/data/profile";

describe("profile", () => {
  it("has the site-authoritative email and links", () => {
    expect(profile.email).toBe("bernardo.dopradorivas@utoledo.edu");
    expect(profile.links.map(l => l.label)).toEqual(["Email", "Google Scholar", "GitHub", "LinkedIn"]);
    expect(profile.jsonLd.knowsAbout).toHaveLength(8);
  });
  it("keeps ORCID machine-readable even though it is not in the icon row", () => {
    expect(profile.links.some(l => l.label === "ORCID")).toBe(false);
    expect(profile.jsonLd.sameAs).toContain("https://orcid.org/0009-0008-8603-0142");
  });
});
