import { describe, expect, it } from "vitest";
import {
  isDraftRoute,
  publicNavItems,
  publicSitemapPaths,
} from "@/data/routes";
import { buildMetadata } from "@/lib/metadata";

describe("route visibility", () => {
  it("keeps Lean available as an unlisted draft", () => {
    expect(isDraftRoute("/lean")).toBe(true);
    expect(publicNavItems).not.toContainEqual({ label: "Lean", href: "/lean" });
    expect(publicSitemapPaths).not.toContain("/lean");
  });

  it("keeps Hobbies available as an unlisted draft", () => {
    expect(isDraftRoute("/hobbies")).toBe(true);
    expect(publicNavItems).not.toContainEqual({ label: "Hobbies", href: "/hobbies" });
    expect(publicSitemapPaths).not.toContain("/hobbies");
  });

  it("prevents search engines from indexing drafts", () => {
    const metadata = buildMetadata({
      title: "Lean — Bernardo Rivas",
      description: "Lean 4 work by Bernardo Rivas.",
      path: "/lean",
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe("/lean/");
  });

  it("keeps public pages listed and indexable", () => {
    expect(publicNavItems).toEqual([
      { label: "Research", href: "/research" },
      { label: "Teaching", href: "/teaching" },
      { label: "Software", href: "/software" },
      { label: "Talks", href: "/talks" },
    ]);
    expect(publicSitemapPaths).toContain("/research");
    expect(publicSitemapPaths).toContain("/software");

    const metadata = buildMetadata({
      title: "Research — Bernardo Rivas",
      description: "Research by Bernardo Rivas.",
      path: "/research",
    });

    expect(metadata.robots).toBeUndefined();
    expect(metadata.alternates?.canonical).toBe("/research/");

    const softwareMetadata = buildMetadata({
      title: "Software — Bernardo Rivas",
      description: "Software by Bernardo Rivas.",
      path: "/software",
    });

    expect(softwareMetadata.robots).toBeUndefined();
    expect(softwareMetadata.alternates?.canonical).toBe("/software/");
  });
});
