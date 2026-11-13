// Everything the Software figure shows besides the flow itself: the outer
// approximation from padded samples on every cell of the grid (not rigorous;
// see outer-approximation.ts), its Morse sets and Morse graph, the Conley
// index of each Morse set, and the connecting map between them. The page
// computes it once, at build time, and passes it to the client component.

import { conleyIndex, connectingRanks, signed, type ConleyIndex } from "./conley-index";
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
  // when the Morse graph is a single edge, from a repeller R to an attractor A: the rank
  // of the connecting map CH_k(R) -> CH_{k-1}(A) for k = 0, 1, 2, found with the index
  // of the invariant set isolated by the cells on paths between them; otherwise empty
  connection: number[];
};

// the vertices reachable from `from` along the edges `adj`, as a set
function reach(from: number[], adj: number[][]): Set<number> {
  const seen = new Set(from);
  const stack = [...from];
  while (stack.length) {
    for (const w of adj[stack.pop()!]) {
      if (!seen.has(w)) {
        seen.add(w);
        stack.push(w);
      }
    }
  }
  return seen;
}

let cached: FigureData | null = null;

export function figureData(): FigureData {
  if (cached) return cached;
  const map = gridMap();
  const { sets, edges } = morseGraph(map);
  const F = (c: Point) => map[cellIndex(c)].map(cellOf);
  const indices = sets.map((set) => conleyIndex(set.map(cellOf), F));
  const dims = (ci: ConleyIndex) => ci.shift.map((m) => m.length);
  let connection: number[] = [];
  if (sets.length === 2 && edges.length === 1 && edges[0][0] === 0 && edges[0][1] === 1) {
    const reverse: number[][] = map.map(() => []);
    map.forEach((targets, k) => targets.forEach((m) => reverse[m].push(k)));
    const back = reach(sets.flat(), reverse);
    const between = [...reach(sets.flat(), map)].filter((k) => back.has(k));
    connection = connectingRanks(dims(indices[1]), dims(indices[0]), dims(conleyIndex(between.map(cellOf), F)));
  }
  cached = {
    map,
    sets,
    edges,
    exits: indices.map((ci) => ci.P0.map(cellIndex).sort((a, b) => a - b)),
    index: indices.map((ci) => ci.shift.map((m) => m.map((row) => row.map(signed)))),
    connection,
  };
  return cached;
}
