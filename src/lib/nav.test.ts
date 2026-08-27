import { describe, it, expect } from "vitest";
import { navCurrent } from "@/lib/nav";

describe("navCurrent", () => {
  it("marks exact route current", () => { expect(navCurrent("/research", "/research")).toBe(true); });
  it("marks Teaching current on subpages (section-level)", () => {
    expect(navCurrent("/teaching/calc-i", "/teaching")).toBe(true);
    expect(navCurrent("/teaching", "/teaching")).toBe(true);
  });
  it("does not mark others on teaching subpages", () => { expect(navCurrent("/teaching/calc-i", "/research")).toBe(false); });
  it("never marks the CV pdf link", () => { expect(navCurrent("/files/cv.pdf", "/files/cv.pdf")).toBe(false); });
});
