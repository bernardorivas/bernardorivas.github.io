import { describe, expect, it } from "vitest";
import { betti } from "./conley-index";
import { figureData } from "./morse-figure";
import { cellIndex, cellOf, components, inGrid, morseGraph } from "./morse-graph";
import { CELL, hitCells, limitCycle } from "./outer-approximation";

describe("strongly connected components", () => {
  it("numbers a component after every component it reaches", () => {
    // 4 -> 0 -> 1 -> 2 -> 0, 2 -> 3 -> 3
    const comp = components([[1], [2], [0, 3], [3], [0]]);
    expect(comp[0]).toBe(comp[1]);
    expect(comp[1]).toBe(comp[2]);
    expect(comp[3]).toBeLessThan(comp[0]);
    expect(comp[0]).toBeLessThan(comp[4]);
  });

  it("keeps the components that carry a cycle and the Hasse diagram of their order", () => {
    // a 2-cycle {0, 1}, a self-loop at 2, a 2-cycle {3, 4}, and 5 without a cycle;
    // {0, 1} -> 2 -> {3, 4} and {0, 1} -> 5 -> {3, 4}
    const { sets, edges } = morseGraph([[1, 2, 5], [0], [2, 3], [4], [3], [3]]);
    expect(sets).toEqual([[0, 1], [2], [3, 4]]);
    expect(edges).toEqual([[0, 1], [1, 2]]);
  });
});

describe("Morse graph of the figure", () => {
  const data = figureData();
  const [source, orbit] = data.sets.map((set) => set.map(cellOf));

  it("has two Morse sets, the equilibrium above the periodic orbit", () => {
    expect(data.sets.map((s) => s.length)).toEqual([14, 78]);
    expect(data.edges).toEqual([[0, 1]]);
    for (const c of [[-1, -1], [-1, 0], [0, -1], [0, 0]] as [number, number][]) {
      expect(data.sets[0]).toContain(cellIndex(c));
    }
  });

  it("covers the limit cycle with the second Morse set, an annulus", () => {
    const cells = new Set(orbit.map((c) => c.join(",")));
    for (const [x, y] of limitCycle()) {
      const near = [Math.floor(x / CELL), Math.floor(y / CELL)];
      expect(cells.has(near.join(","))).toBe(true);
    }
    expect(betti(orbit)).toEqual([1, 1, 0]);
    expect(betti(source)).toEqual([1, 0, 0]);
  });

  it("computes each index from images that stay in the grid", () => {
    // the index pair (M u F(M), F(M) \ M) and the images of its cells, uncut
    data.sets.forEach((set, p) => {
      for (const k of [...set, ...data.exits[p]]) expect(hitCells(cellOf(k)).every(inGrid)).toBe(true);
    });
    expect(data.exits.map((e) => e.length)).toEqual([42, 0]);
  });

  it("finds the Conley indices of a repelling equilibrium and an attracting periodic orbit", () => {
    expect(data.index).toEqual([
      [[], [], [[1]]],
      [[[1]], [[1]], []],
    ]);
  });
});
