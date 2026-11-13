import { describe, expect, it } from "vitest";
import { figureData } from "./morse-figure";

describe("figure data", () => {
  const data = figureData();

  it("has an equilibrium and a periodic orbit, with an edge from the first to the second", () => {
    expect(data.sets.map((set) => set.length)).toEqual([14, 78]);
    expect(data.edges).toEqual([[0, 1]]);
    expect(data.index).toEqual([
      [[], [], [[1]]],
      [[[1]], [[1]], []],
    ]);
  });

  it("has a connecting map of rank 1 from H_2 of the first index to H_1 of the second", () => {
    expect(data.connection).toEqual([0, 0, 1]);
  });
});
