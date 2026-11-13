import { describe, expect, it } from "vitest";
import { betti, conleyIndex, connectingMap, connectingRanks, eventualRestriction, pairIndex, rank, signed } from "./conley-index";
import { morseGraph } from "./morse-graph";
import type { Point } from "./outer-approximation";

// An outer approximation of f on unit cells from padded samples: the closed
// cells meeting the images of an (n + 1) x (n + 1) grid of points of the cell,
// each padded by the largest gap between images of neighboring points plus pad.
function outer(f: (p: Point) => Point, n = 20, pad = 0.05) {
  return ([i, j]: Point): Point[] => {
    const img: Point[][] = [];
    for (let a = 0; a <= n; a++) {
      const row: Point[] = [];
      for (let b = 0; b <= n; b++) row.push(f([i + a / n, j + b / n]));
      img.push(row);
    }
    let d = 0;
    for (let a = 0; a <= n; a++) {
      for (let b = 0; b <= n; b++) {
        if (a < n) d = Math.max(d, Math.abs(img[a][b][0] - img[a + 1][b][0]), Math.abs(img[a][b][1] - img[a + 1][b][1]));
        if (b < n) d = Math.max(d, Math.abs(img[a][b][0] - img[a][b + 1][0]), Math.abs(img[a][b][1] - img[a][b + 1][1]));
      }
    }
    d += pad;
    const out = new Map<string, Point>();
    for (const row of img) {
      for (const [x, y] of row) {
        for (let a = Math.ceil(x - d) - 1; a <= Math.floor(x + d); a++) {
          for (let b = Math.ceil(y - d) - 1; b <= Math.floor(y + d); b++) out.set(`${a},${b}`, [a, b]);
        }
      }
    }
    return [...out.values()];
  };
}

const CENTER: Point[] = [[-1, -1], [-1, 0], [0, -1], [0, 0]];
// the index as signed matrices, one per degree
const index = (M: Point[], F: (c: Point) => Point[]) =>
  conleyIndex(M, F).shift.map((m) => m.map((row) => row.map(signed)));

// the Morse set containing a given cell, for F on the cells of [-half, half)^2
function morseSetOf(F: (c: Point) => Point[], half: number, cell: Point): Point[] {
  const side = 2 * half;
  const id = ([i, j]: Point) => (i + half) * side + (j + half);
  const of = (k: number): Point => [Math.floor(k / side) - half, (k % side) - half];
  const adj = Array.from({ length: side * side }, (_, k) =>
    F(of(k)).filter(([i, j]) => -half <= i && i < half && -half <= j && j < half).map(id),
  );
  const set = morseGraph(adj).sets.find((s) => s.includes(id(cell)));
  if (!set) throw new Error("no Morse set at the cell");
  return set.map(of);
}

describe("cubical homology", () => {
  it("computes Betti numbers of a square, an annulus and a pair", () => {
    const block = (i0: number, i1: number, j0: number, j1: number) => {
      const out: Point[] = [];
      for (let i = i0; i < i1; i++) for (let j = j0; j < j1; j++) out.push([i, j]);
      return out;
    };
    expect(betti(block(0, 3, 0, 3))).toEqual([1, 0, 0]);
    const ring = block(0, 3, 0, 3).filter(([i, j]) => i !== 1 || j !== 1);
    expect(betti(ring)).toEqual([1, 1, 0]);
    // a disk modulo the ring around it
    expect(betti(block(0, 3, 0, 3), ring)).toEqual([0, 0, 1]);
    // two cells meeting at a corner are connected
    expect(betti([[0, 0], [1, 1]])).toEqual([1, 0, 0]);
  });

  it("restricts a map to its eventual image", () => {
    expect(eventualRestriction([[0, 1], [0, 0]])).toEqual([]);
    expect(eventualRestriction([[1, 1], [0, 0]])).toEqual([[1]]);
    expect(eventualRestriction([])).toEqual([]);
  });
});

describe("Conley index of linear examples", () => {
  it("is (0, 0, [1]) for an expanding map that preserves orientation", () => {
    expect(index(CENTER, outer(([x, y]) => [2 * x, 2 * y]))).toEqual([[], [], [[1]]]);
  });

  it("is (0, 0, [-1]) for an expanding map that reverses orientation", () => {
    expect(index(CENTER, outer(([x, y]) => [2 * x, -2 * y]))).toEqual([[], [], [[-1]]]);
  });

  it("is (0, [1], 0) for a saddle and (0, [-1], 0) when the unstable direction flips", () => {
    expect(index(CENTER, outer(([x, y]) => [2 * x, y / 2]))).toEqual([[], [[1]], []]);
    expect(index(CENTER, outer(([x, y]) => [-2 * x, y / 2]))).toEqual([[], [[-1]], []]);
  });

  it("is ([1], 0, 0) for an attracting fixed point", () => {
    expect(index(CENTER, outer(([x, y]) => [x / 2, y / 2]))).toEqual([[[1]], [], []]);
  });

  it("is trivial for a set of cells that the map moves through", () => {
    // a translation along x that contracts y: the two cells of the column i = 0 that
    // touch y = 0 form a strongly connected component with a cycle, but contain no
    // invariant set
    const F = outer(([x, y]) => [x + 0.3, y / 4]);
    expect(index([[0, -1], [0, 0]], F)).toEqual([[], [], []]);
  });

  it("refuses a set whose exit cells map back into it", () => {
    const F = outer(([x, y]) => [x + 0.3, y / 4]);
    expect(() => conleyIndex([[0, 0]], F)).toThrow(/not an index pair/);
  });
});

describe("Conley index of an attracting circle", () => {
  const R = 4.5;
  const circleMap = (flip: boolean) => ([x, y]: Point): Point => {
    const r = Math.hypot(x, y);
    const a = (flip ? -1 : 1) * Math.atan2(y, x) + 0.3;
    const s = R + (r - R) / 2;
    return [s * Math.cos(a), s * Math.sin(a)];
  };

  it("is ([1], [1], 0) when the map turns the circle", () => {
    const F = outer(circleMap(false));
    const M = morseSetOf(F, 8, [4, 0]);
    expect(betti(M)).toEqual([1, 1, 0]);
    expect(index(M, F)).toEqual([[[1]], [[1]], []]);
  });

  it("is ([1], [-1], 0) when the map reflects the circle", () => {
    const F = outer(circleMap(true));
    const M = morseSetOf(F, 8, [4, 0]);
    expect(index(M, F)).toEqual([[[1]], [[-1]], []]);
  });
});

describe("connecting maps of a pair of cubical sets", () => {
  const block = (i0: number, i1: number, j0: number, j1: number) => {
    const out: Point[] = [];
    for (let i = i0; i < i1; i++) for (let j = j0; j < j1; j++) out.push([i, j]);
    return out;
  };
  const ring = block(0, 3, 0, 3).filter(([i, j]) => i !== 1 || j !== 1);

  it("send the disk relative to its ring onto the loop of the ring", () => {
    expect(connectingMap(block(0, 3, 0, 3), ring).map(rank)).toEqual([0, 0, 1]);
  });

  it("vanish when the rest of the set is apart from the subset", () => {
    expect(connectingMap([...ring, [6, 6]], ring).map(rank)).toEqual([0, 0, 0]);
  });
});

describe("an index triple of a repelling fixed point inside an attracting circle", () => {
  // the radius r goes to r (1 + (1 - r^2 / 16) / 2), and the angle turns by 0.3
  const F = outer(([x, y]) => {
    const s = 1 + 0.5 * (1 - (x * x + y * y) / 16);
    return [s * (Math.cos(0.3) * x - Math.sin(0.3) * y), s * (Math.sin(0.3) * x + Math.cos(0.3) * y)];
  });
  const R = morseSetOf(F, 8, [0, 0]);
  const A = morseSetOf(F, 8, [4, 0]);
  // N: the cells on a path from R to A
  const key = ([i, j]: Point) => `${i},${j}`;
  const inGrid = ([i, j]: Point) => -8 <= i && i < 8 && -8 <= j && j < 8;
  const reach = (from: Point[], step: (c: Point) => Point[]) => {
    const seen = new Map(from.map((c) => [key(c), c]));
    const stack = [...from];
    while (stack.length) {
      for (const d of step(stack.pop()!)) {
        if (inGrid(d) && !seen.has(key(d))) {
          seen.set(key(d), d);
          stack.push(d);
        }
      }
    }
    return seen;
  };
  const all: Point[] = [];
  for (let i = -8; i < 8; i++) for (let j = -8; j < 8; j++) all.push([i, j]);
  const images = new Map(all.map((c) => [key(c), F(c).filter(inGrid)]));
  const preimages = new Map<string, Point[]>(all.map((c) => [key(c), []]));
  for (const c of all) for (const d of images.get(key(c))!) preimages.get(key(d))!.push(c);
  const forward = reach(R, (c) => images.get(key(c))!);
  const backward = reach(A, (c) => preimages.get(key(c))!);
  const N = [...forward.values()].filter((c) => backward.has(key(c)));

  it("gives the index of the circle from (A, empty set) and that of the point from (N, A)", () => {
    expect(betti(N)).toEqual([1, 0, 0]);
    expect(pairIndex(A, [], F).shift.map((m) => m.map((row) => row.map(signed)))).toEqual([[[1]], [[1]], []]);
    expect(pairIndex(N, A, F).shift.map((m) => m.map((row) => row.map(signed)))).toEqual([[], [], [[1]]]);
    // the same as from the Morse sets alone
    expect(pairIndex(N, A, F).shift).toEqual(conleyIndex(R, F).shift);
  });

  it("has a connecting map of rank 1 from H_2 of the pair (N, A) to H_1 of A", () => {
    expect(connectingMap(N, A).map(rank)).toEqual([0, 0, 1]);
  });

  it("refuses a pair whose exit set leads back into the rest", () => {
    expect(() => pairIndex(N, R, F)).toThrow(/not an index pair/);
  });
});

describe("connecting maps of an attractor-repeller pair", () => {
  it("have ranks forced by the dimensions of the three indices", () => {
    // a repelling equilibrium inside an attracting periodic orbit, in the disk they bound
    expect(connectingRanks([1, 1, 0], [0, 0, 1], [1, 0, 0])).toEqual([0, 0, 1]);
    // on the line, a repelling point and an attracting one, in an interval with trivial index
    expect(connectingRanks([1], [0, 1], [])).toEqual([0, 1]);
    // the same two indices, in a set whose index is their sum
    expect(connectingRanks([1], [0, 1], [1, 1])).toEqual([0, 0]);
  });

  it("are refused for dimensions that violate the Morse equation", () => {
    expect(() => connectingRanks([1], [], [])).toThrow(/Morse equation/);
    expect(() => connectingRanks([], [0, 1], [])).toThrow(/Morse equation/);
  });
});
