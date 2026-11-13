import { describe, expect, it } from "vitest";
import { conleyIndex, connectingRanks, pairIndex, signed } from "./conley-index";
import { figureData } from "./morse-figure";
import { cellIndex, cellOf } from "./morse-graph";
import type { Point } from "./outer-approximation";

describe("figure data", () => {
  const data = figureData();
  const F = (c: Point) => data.map[cellIndex(c)].map(cellOf);
  const shift = (maps: number[][][]) => maps.map((m) => m.map((row) => row.map(signed)));
  const N = [...data.sets.flat(), ...data.between];

  it("has an equilibrium and a periodic orbit, with an edge from the first to the second", () => {
    expect(data.sets.map((set) => set.length)).toEqual([14, 78]);
    expect(data.edges).toEqual([[0, 1]]);
    expect(data.index).toEqual([
      [[], [], [[1]]],
      [[[1]], [[1]], []],
    ]);
  });

  it("finds the same indices from the index triple as from each Morse set alone", () => {
    expect(data.index).toEqual(data.sets.map((set) => shift(conleyIndex(set.map(cellOf), F).shift)));
  });

  it("isolates the first Morse set in N \\ A: the only cells of N \\ A on a path that stays there are its own", () => {
    const hole = new Set([...data.sets[0], ...data.between]);
    const inv = new Set(hole);
    for (let changed = true; changed; ) {
      changed = false;
      for (const k of [...inv]) {
        const forward = data.map[k].some((m) => inv.has(m));
        const backward = [...inv].some((m) => data.map[m].includes(k));
        if (!forward || !backward) {
          inv.delete(k);
          changed = true;
        }
      }
    }
    expect([...inv].sort((a, b) => a - b)).toEqual([...data.sets[0]].sort((a, b) => a - b));
  });

  it("has a connecting map of rank 1 from H_2 of the first index to H_1 of the second, as the Morse equation requires", () => {
    expect(data.connection).toEqual([0, 0, 1]);
    const dims = (maps: number[][][]) => maps.map((m) => m.length);
    // N is an attracting block whose index is that of a disk
    const whole = shift(pairIndex(N.map(cellOf), [], F).shift);
    expect(whole).toEqual([[[1]], [], []]);
    expect(connectingRanks(dims(data.index[1]), dims(data.index[0]), dims(whole))).toEqual(data.connection);
  });
});
