// Everything the Software figure shows besides the flow itself: the outer
// approximation from padded samples on every cell of the grid (not rigorous;
// see outer-approximation.ts), its Morse sets and Morse graph, the Conley
// index of each Morse set, and the connecting map between them. The page
// computes it once, at build time, and passes it to the client component.
//
// When the Morse graph is a single edge from a repeller R to an attractor A, both
// indices come from one index triple: N, the cells on paths between the two Morse
// sets, contains A, and A contains nothing. The pair (A, empty set) gives the index
// of A, the pair (N, A) the index of R, since F(N) lies in N, F(A) lies in A and the
// only invariant part of N \ A is R, and the connecting map of the triple is the
// boundary H_k(N, A) -> H_{k-1}(A).

import { conleyIndex, connectingMap, pairIndex, rank, signed, type ConleyIndex } from "./conley-index";
import { cellIndex, cellOf, gridMap, morseGraph } from "./morse-graph";
import type { Point } from "./outer-approximation";

export type FigureData = {
  // map[k]: the cells covering the image of cell k, from padded samples (indices as in morse-graph.ts)
  map: number[][];
  // cells of each Morse set; every edge of the Morse graph goes from an earlier set to a later one
  sets: number[][];
  edges: [number, number][];
  // for each Morse set, the shift equivalence class of its index map on H_0, H_1, H_2,
  // as the matrix of its restriction to the eventual image (entries in (-p/2, p/2))
  index: number[][][][];
  // for a single edge: the cells of N in neither Morse set, sorted, and the rank of the
  // connecting map H_k(N, A) -> H_{k-1}(A) for k = 0, 1, 2; otherwise both empty
  between: number[];
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

const shiftClass = (ci: ConleyIndex) => ci.shift.map((m) => m.map((row) => row.map(signed)));

let cached: FigureData | null = null;

export function figureData(): FigureData {
  if (cached) return cached;
  const map = gridMap();
  const { sets, edges } = morseGraph(map);
  const F = (c: Point) => map[cellIndex(c)].map(cellOf);
  if (!(sets.length === 2 && edges.length === 1 && edges[0][0] === 0 && edges[0][1] === 1)) {
    cached = { map, sets, edges, index: sets.map((set) => shiftClass(conleyIndex(set.map(cellOf), F))), between: [], connection: [] };
    return cached;
  }
  const reverse: number[][] = map.map(() => []);
  map.forEach((targets, k) => targets.forEach((m) => reverse[m].push(k)));
  const back = reach(sets.flat(), reverse);
  const N = [...reach(sets.flat(), map)].filter((k) => back.has(k)).sort((a, b) => a - b);
  const A = sets[1].map(cellOf);
  const inSets = new Set(sets.flat());
  cached = {
    map,
    sets,
    edges,
    index: [shiftClass(pairIndex(N.map(cellOf), A, F)), shiftClass(pairIndex(A, [], F))],
    between: N.filter((k) => !inSets.has(k)),
    connection: connectingMap(N.map(cellOf), A).map(rank),
  };
  return cached;
}
