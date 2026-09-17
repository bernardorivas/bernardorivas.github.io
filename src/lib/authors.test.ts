import { describe, it, expect } from "vitest";
import { highlightSelf } from "@/lib/authors";

describe("highlightSelf", () => {
  it("wraps B. Rivas wherever it appears", () => {
    const parts = highlightSelf("B. Cummins, M. Gameiro, B. Rivas") as unknown[];
    expect(JSON.stringify(parts)).toContain("author-self");
  });
  it("passes through strings without the name", () => {
    expect(highlightSelf("A. Nobody")).toEqual(["A. Nobody"]);
  });
});
