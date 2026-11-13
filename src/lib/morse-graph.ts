// The outer approximation from padded samples (hitCells) on the grid as a
// directed graph, cell -> cells covering its image, together with its strongly
// connected components and Morse graph.
// A Morse set is a strongly connected component that carries a cycle of the
// graph: it has at least two cells, or one cell that hits itself.

import { HALF, hitCells, type Point } from "./outer-approximation";

// cells per side of the grid
export const SIDE = 2 * HALF;

export const inGrid = ([i, j]: Point) => -HALF <= i && i < HALF && -HALF <= j && j < HALF;
export const cellIndex = ([i, j]: Point) => (i + HALF) * SIDE + (j + HALF);
export const cellOf = (k: number): Point => [Math.floor(k / SIDE) - HALF, (k % SIDE) - HALF];

// targets of every cell of the grid, as sorted cell indices; images are cut to the grid
export function gridMap(): number[][] {
  const map: number[][] = [];
  for (let k = 0; k < SIDE * SIDE; k++) {
    map.push(hitCells(cellOf(k)).filter(inGrid).map(cellIndex).sort((a, b) => a - b));
  }
  return map;
}

// Strongly connected components by Tarjan's algorithm, as the component of each
// vertex. A component is numbered after every component it reaches, so the
// numbering is a reverse topological order of the condensation.
export function components(adj: number[][]): number[] {
  const n = adj.length;
  const order = new Array<number>(n).fill(-1);
  const low = new Array<number>(n).fill(0);
  const onStack = new Array<boolean>(n).fill(false);
  const comp = new Array<number>(n).fill(-1);
  const stack: number[] = [];
  let next = 0;
  let count = 0;
  for (let s = 0; s < n; s++) {
    if (order[s] >= 0) continue;
    const work: [number, number][] = [[s, 0]];
    order[s] = low[s] = next++;
    stack.push(s);
    onStack[s] = true;
    while (work.length) {
      const top = work[work.length - 1];
      const v = top[0];
      if (top[1] < adj[v].length) {
        const w = adj[v][top[1]++];
        if (order[w] < 0) {
          order[w] = low[w] = next++;
          stack.push(w);
          onStack[w] = true;
          work.push([w, 0]);
        } else if (onStack[w]) {
          low[v] = Math.min(low[v], order[w]);
        }
      } else {
        work.pop();
        if (work.length) {
          const u = work[work.length - 1][0];
          low[u] = Math.min(low[u], low[v]);
        }
        if (low[v] === order[v]) {
          let w: number;
          do {
            w = stack.pop()!;
            onStack[w] = false;
            comp[w] = count;
          } while (w !== v);
          count++;
        }
      }
    }
  }
  return comp;
}

export type MorseGraph = {
  // the cells of each Morse set, sorted, listed so that every edge goes from an earlier set to a later one
  sets: number[][];
  // [p, q] when a path of the graph leads from set p to set q through no other Morse set
  edges: [number, number][];
};

export function morseGraph(adj: number[][]): MorseGraph {
  const comp = components(adj);
  const count = Math.max(-1, ...comp) + 1;
  const members: number[][] = Array.from({ length: count }, () => []);
  comp.forEach((c, v) => members[c].push(v));
  const recurrent = members.map((m) => m.length > 1 || adj[m[0]].includes(m[0]));
  // components in topological order: reached components come later
  const ids = members.map((_, c) => c).filter((c) => recurrent[c]).reverse();
  const sets = ids.map((c) => members[c]);

  const succ: Set<number>[] = Array.from({ length: count }, () => new Set());
  adj.forEach((targets, v) => {
    for (const w of targets) if (comp[v] !== comp[w]) succ[comp[v]].add(comp[w]);
  });
  // Morse sets reached from component c by a path whose interior avoids every Morse set
  const position = new Map(ids.map((c, p) => [c, p]));
  const edges: [number, number][] = [];
  ids.forEach((c, p) => {
    const seen = new Set<number>([c]);
    const queue = [c];
    while (queue.length) {
      const d = queue.pop()!;
      for (const e of succ[d]) {
        if (seen.has(e)) continue;
        seen.add(e);
        if (position.has(e)) edges.push([p, position.get(e)!]);
        else queue.push(e);
      }
    }
  });
  // keep the edges of the Hasse diagram of the order these paths generate
  const reach = sets.map((_, p) => {
    const out = new Set<number>();
    const queue = [p];
    while (queue.length) {
      const q = queue.pop()!;
      for (const [a, b] of edges) {
        if (a === q && !out.has(b)) {
          out.add(b);
          queue.push(b);
        }
      }
    }
    return out;
  });
  const hasse = edges.filter(([p, q]) => !edges.some(([a, r]) => a === p && r !== q && reach[r].has(q)));
  hasse.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return { sets, edges: hasse };
}
