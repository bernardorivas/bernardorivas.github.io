// Everything the Software figure shows besides the flow itself: the outer
// approximation from padded samples on every cell of the grid (not rigorous;
// see outer-approximation.ts), its Morse sets and Morse graph, and the Conley
// index of each Morse set. The page computes it once, at build time,
// and passes it to the client component.

import { conleyIndex, signed } from "./conley-index";
import { cellIndex, cellOf, gridMap, morseGraph } from "./morse-graph";
import type { Point } from "./outer-approximation";

export type FigureData = {
  // map[k]: the cells covering the image of cell k, from padded samples (indices as in morse-graph.ts)
  map: number[][];
  // cells of each Morse set; every edge of the Morse graph goes from an earlier set to a later one
  sets: number[][];
  edges: [number, number][];
  // for each Morse set M, the exit set F(M) \ M of its index pair
  exits: number[][];
  // for each Morse set, the shift equivalence class of its index map on H_0, H_1, H_2,
  // as the matrix of its restriction to the eventual image (entries in (-p/2, p/2))
  index: number[][][][];
};

let cached: FigureData | null = null;

export function figureData(): FigureData {
  if (cached) return cached;
  const map = gridMap();
  const { sets, edges } = morseGraph(map);
  const F = (c: Point) => map[cellIndex(c)].map(cellOf);
  const indices = sets.map((set) => conleyIndex(set.map(cellOf), F));
  cached = {
    map,
    sets,
    edges,
    exits: indices.map((ci) => ci.P0.map(cellIndex).sort((a, b) => a - b)),
    index: indices.map((ci) => ci.shift.map((m) => m.map((row) => row.map(signed)))),
  };
  return cached;
}
