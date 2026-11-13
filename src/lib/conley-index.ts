// Homological Conley index of a Morse set of a combinatorial map, over the
// field F_p with p = PRIME.
//
// Cells are the closed unit squares [i, i + 1] x [j, j + 1], and a cubical set is
// a union of cells. F sends a cell to the cells its image meets and is assumed
// to be an outer approximation of a continuous map f: f(|c|) lies in the
// interior of |F(c)|, and F(c) is not cut off by the edge of the grid.
//
// For a Morse set M, P1 = M u F(M) and P0 = F(M) \ M form an index pair when no
// cell of P0 maps back into M. The index map is i_*^{-1} phi_* on H_*(P1, P0),
// where i: (P1, P0) -> (Q1, Q0) = (P1 u F(P0), P0 u F(P0)) is the inclusion and
// phi is a chain map carried by the carrier that sends a face s of P1 to the
// intersection of F(c) over the cells c of P1 containing s. That carrier
// contains f(s), is monotone, and is checked to be acyclic, so phi_* = f_*.
// Over a field, the shift equivalence class of the index map is the similarity
// class of its restriction to its eventual image.

import type { Point } from "./outer-approximation";

export const PRIME = 65521;

const mod = (a: number) => ((a % PRIME) + PRIME) % PRIME;

function inverse(a: number): number {
  let [r0, r1, s0, s1] = [mod(a), PRIME, 1, 0];
  if (r0 === 0) throw new Error("inverse of 0");
  while (r1) {
    const q = Math.floor(r0 / r1);
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
  }
  return mod(s0);
}

// the representative of a in (-p/2, p/2)
export const signed = (a: number) => (a > PRIME / 2 ? a - PRIME : a);

// ---- cubical chains -----------------------------------------------------------
// Faces are keys "v i j" (the vertex (i, j)), "h i j" ([i, i + 1] x {j}),
// "u i j" ({i} x [j, j + 1]) and "q i j" (the square [i, i + 1] x [j, j + 1]).

type Chain = Map<string, number>;

const cellKey = ([i, j]: Point) => `${i} ${j}`;
const dimension = (face: string) => (face[0] === "v" ? 0 : face[0] === "q" ? 2 : 1);

function coordinates(face: string): Point {
  const [, i, j] = face.split(" ");
  return [Number(i), Number(j)];
}

function faces(cells: Iterable<Point>): Set<string> {
  const out = new Set<string>();
  for (const [i, j] of cells) {
    out.add(`q ${i} ${j}`);
    out.add(`h ${i} ${j}`).add(`h ${i} ${j + 1}`).add(`u ${i} ${j}`).add(`u ${i + 1} ${j}`);
    out.add(`v ${i} ${j}`).add(`v ${i + 1} ${j}`).add(`v ${i} ${j + 1}`).add(`v ${i + 1} ${j + 1}`);
  }
  return out;
}

function boundary(face: string): [string, number][] {
  const [i, j] = coordinates(face);
  switch (face[0]) {
    case "h":
      return [[`v ${i + 1} ${j}`, 1], [`v ${i} ${j}`, -1]];
    case "u":
      return [[`v ${i} ${j + 1}`, 1], [`v ${i} ${j}`, -1]];
    case "q":
      return [[`h ${i} ${j}`, 1], [`u ${i + 1} ${j}`, 1], [`h ${i} ${j + 1}`, -1], [`u ${i} ${j}`, -1]];
    default:
      return [];
  }
}

// cells (among all cells of the plane) that contain the face
function cellsContaining(face: string): Point[] {
  const [i, j] = coordinates(face);
  switch (face[0]) {
    case "v":
      return [[i - 1, j - 1], [i - 1, j], [i, j - 1], [i, j]];
    case "h":
      return [[i, j - 1], [i, j]];
    case "u":
      return [[i - 1, j], [i, j]];
    default:
      return [[i, j]];
  }
}

function addTo(c: Chain, face: string, a: number) {
  const v = mod((c.get(face) ?? 0) + a);
  if (v) c.set(face, v);
  else c.delete(face);
}

// the boundary of a chain, without the faces in A
function boundaryOf(c: Chain, A?: Set<string>): Chain {
  const out: Chain = new Map();
  for (const [face, a] of c) for (const [g, s] of boundary(face)) if (!A?.has(g)) addTo(out, g, a * s);
  return out;
}

const without = (c: Chain, A: Set<string>): Chain => new Map([...c].filter(([face]) => !A.has(face)));

// ---- linear algebra over F_p ----------------------------------------------------

// Vectors added one at a time, reduced against the earlier ones. A stored row is
// the reduced form of a combination of the stored inputs, and has no key below
// its pivot, which is its least key.
class Echelon {
  private rows = new Map<string, { v: Chain; c: Map<number, number> }>();
  count = 0;

  private reduce(v: Chain) {
    const r: Chain = new Map(v);
    const c = new Map<number, number>();
    for (;;) {
      let lead: string | null = null;
      for (const k of r.keys()) if (lead === null || k < lead) lead = k;
      if (lead === null) break;
      const row = this.rows.get(lead);
      if (!row) break;
      const f = (r.get(lead)! * inverse(row.v.get(lead)!)) % PRIME;
      for (const [k, a] of row.v) addTo(r, k, -f * a);
      for (const [m, a] of row.c) c.set(m, mod((c.get(m) ?? 0) + f * a));
      if (r.has(lead)) throw new Error("reduction failed");
    }
    return { r, c };
  }

  // stores v and returns its index if it is independent of the stored inputs, and -1 otherwise
  add(v: Chain): number {
    const { r, c } = this.reduce(v);
    if (r.size === 0) return -1;
    let lead = "";
    for (const k of r.keys()) if (lead === "" || k < lead) lead = k;
    const combo = new Map<number, number>([[this.count, 1]]);
    for (const [m, a] of c) if (a) combo.set(m, mod(-a));
    this.rows.set(lead, { v: r, c: combo });
    return this.count++;
  }

  // the coefficients of v in the stored inputs, or null if v is not in their span
  express(v: Chain): Map<number, number> | null {
    const { r, c } = this.reduce(v);
    return r.size === 0 ? c : null;
  }
}

function solve(A: number[][], B: number[][]): number[][] {
  // X with A X = B, for an invertible square A
  const n = A.length;
  const M = A.map((row, r) => [...row, ...B[r]]);
  for (let col = 0; col < n; col++) {
    const piv = M.findIndex((row, r) => r >= col && row[col] !== 0);
    if (piv < 0) throw new Error("inclusion is not an isomorphism in homology");
    [M[col], M[piv]] = [M[piv], M[col]];
    const f = inverse(M[col][col]);
    M[col] = M[col].map((a) => (a * f) % PRIME);
    for (let r = 0; r < n; r++) {
      if (r === col || M[r][col] === 0) continue;
      const g = M[r][col];
      M[r] = M[r].map((a, k) => mod(a - g * M[col][k]));
    }
  }
  return M.map((row) => row.slice(n));
}

function multiply(A: number[][], B: number[][]): number[][] {
  return A.map((row) => B[0].map((_, c) => row.reduce((s, a, k) => mod(s + a * B[k][c]), 0)));
}

// the restriction of A to its eventual image, the image of A^n for n = size of A,
// in a basis of that image
export function eventualRestriction(A: number[][]): number[][] {
  const n = A.length;
  if (n === 0) return [];
  let P = A;
  for (let k = 1; k < n; k++) P = multiply(P, A);
  const span = new Echelon();
  const basis: number[][] = [];
  for (let c = 0; c < n; c++) {
    const col = P.map((row) => row[c]);
    if (span.add(new Map(col.flatMap((a, r) => (a ? [[String(r).padStart(4, "0"), a]] : [])))) >= 0) basis.push(col);
  }
  return basis.map((w) => {
    const image = A.map((row) => row.reduce((s, a, k) => mod(s + a * w[k]), 0));
    const coords = span.express(new Map(image.flatMap((a, r) => (a ? [[String(r).padStart(4, "0"), a]] : []))));
    if (!coords) throw new Error("eventual image is not invariant");
    return basis.map((_, m) => coords.get(m) ?? 0);
  }).reduce<number[][]>((rows, column, c) => {
    column.forEach((a, r) => ((rows[r] ??= [])[c] = a));
    return rows;
  }, []);
}

// For an attractor-repeller pair (A, R) of an isolated invariant set S, given the
// dimensions a_k, r_k, s_k of the three indices in each degree, the rank of each
// connecting map d_k: CH_k(R) -> CH_{k-1}(A), as an array indexed by k. Exactness of
// ... -> CH_k(A) -> CH_k(S) -> CH_k(R) -> CH_{k-1}(A) -> ... gives
// a_k + r_k - s_k = rank d_{k+1} + rank d_k (the Morse equation), and d_0 = 0.
export function connectingRanks(a: number[], r: number[], s: number[]): number[] {
  const n = Math.max(a.length, r.length, s.length);
  const ranks = [0];
  for (let k = 0; k < n; k++) ranks.push((a[k] ?? 0) + (r[k] ?? 0) - (s[k] ?? 0) - ranks[k]);
  // d_n leaves CH_n(R) = 0
  if (ranks.pop() !== 0 || ranks.some((q, k) => q < 0 || q > Math.min(r[k] ?? 0, k > 0 ? (a[k - 1] ?? 0) : 0))) {
    throw new Error("the indices do not satisfy the Morse equation");
  }
  return ranks;
}

// ---- relative homology ------------------------------------------------------------

class RelativeHomology {
  // representative cycles of a basis of H_k(X, A), k = 0, 1, 2
  reps: Chain[][] = [[], [], []];
  private spans: Echelon[] = [];
  private repIndex: number[][] = [[], [], []];

  constructor(X: Set<string>, private A: Set<string>) {
    const basis: string[][] = [[], [], []];
    for (const face of X) if (!A.has(face)) basis[dimension(face)].push(face);
    basis.forEach((b) => b.sort());
    for (let k = 0; k <= 2; k++) {
      // cycles: the kernel of the relative boundary on C_k(X, A)
      const cycles: Chain[] = [];
      if (k === 0) {
        for (const face of basis[0]) cycles.push(new Map([[face, 1]]));
      } else {
        const kernel = new Echelon();
        const stored: string[] = [];
        for (const face of basis[k]) {
          const d = boundaryOf(new Map([[face, 1]]), A);
          const c = kernel.express(d);
          if (c) {
            const z: Chain = new Map([[face, 1]]);
            for (const [m, a] of c) addTo(z, stored[m], -a);
            cycles.push(z);
          } else {
            kernel.add(d);
            stored.push(face);
          }
        }
      }
      // boundaries first, then the cycles that are independent of them
      const span = new Echelon();
      if (k < 2) for (const face of basis[k + 1]) span.add(boundaryOf(new Map([[face, 1]]), A));
      for (const z of cycles) {
        const m = span.add(z);
        if (m >= 0) {
          this.reps[k].push(z);
          this.repIndex[k].push(m);
        }
      }
      this.spans.push(span);
    }
  }

  // the coordinates of the class of a relative k-cycle in the basis of reps[k]
  coordinates(k: number, z: Chain): number[] {
    const c = this.spans[k].express(without(z, this.A));
    if (!c) throw new Error("not a relative cycle");
    return this.repIndex[k].map((m) => c.get(m) ?? 0);
  }
}

export const betti = (cells: Point[], exit: Point[] = []) =>
  new RelativeHomology(faces(cells), faces(exit)).reps.map((r) => r.length);

// ---- the index map ------------------------------------------------------------------

export type ConleyIndex = {
  // the index pair
  P1: Point[];
  P0: Point[];
  // the index map on H_k(P1, P0), k = 0, 1, 2, with entries in F_p
  maps: number[][][];
  // the restriction of each index map to its eventual image: the shift equivalence class
  shift: number[][][];
};

export function conleyIndex(M: Point[], F: (cell: Point) => Point[]): ConleyIndex {
  const inM = new Set(M.map(cellKey));
  const union = (cells: Point[]) => {
    const out = new Map<string, Point>();
    for (const c of cells) for (const d of F(c)) out.set(cellKey(d), d);
    return out;
  };
  const image = union(M);
  const P0 = [...image.values()].filter((c) => !inM.has(cellKey(c)));
  const P1 = [...M, ...P0];
  for (const c of P0) {
    if (F(c).some((d) => inM.has(cellKey(d)))) throw new Error("(M u F(M), F(M) \\ M) is not an index pair");
  }
  const exitImage = [...union(P0).values()];
  const inP1 = new Set(P1.map(cellKey));
  const X1 = faces(P1);
  const X0 = faces(P0);
  const Y0 = faces([...P0, ...exitImage]);
  const Y1 = new Set([...X1, ...Y0]);

  // the carrier of a face of P1, as a set of cells, checked to be acyclic
  const carriers = new Map<string, Point[]>();
  const acyclic = new Map<string, boolean>();
  const carrier = (face: string): Point[] => {
    let K = carriers.get(face);
    if (K) return K;
    const images = cellsContaining(face)
      .filter((c) => inP1.has(cellKey(c)))
      .map((c) => new Set(F(c).map(cellKey)));
    K = images.length
      ? F(cellsContaining(face).find((c) => inP1.has(cellKey(c)))!)
          .filter((d) => images.every((image) => image.has(cellKey(d))))
          .sort((a, b) => a[0] - b[0] || a[1] - b[1])
      : [];
    const id = K.map(cellKey).join(";");
    if (!acyclic.has(id)) acyclic.set(id, K.length > 0 && betti(K).join() === "1,0,0");
    if (!acyclic.get(id)) throw new Error(`carrier of ${face} is not acyclic`);
    carriers.set(face, K);
    return K;
  };

  // a chain selector: phi(s) is a chain of the carrier of s with boundary phi(boundary of s)
  const phi = new Map<string, Chain>();
  const facesByDim: string[][] = [[], [], []];
  for (const face of X1) facesByDim[dimension(face)].push(face);
  facesByDim.forEach((b) => b.sort());
  for (const face of facesByDim[0]) {
    const [i, j] = carrier(face)[0];
    phi.set(face, new Map([[`v ${i} ${j}`, 1]]));
  }
  for (const face of facesByDim[1]) {
    // a path in the 1-skeleton of the carrier from phi(start) to phi(end)
    const K = faces(carrier(face));
    const [[end], [start]] = boundary(face).map(([g]) => [...phi.get(g)!.keys()]);
    const steps = new Map<string, [string, string, number]>(); // vertex -> [previous vertex, edge, sign]
    const queue = [start];
    const seen = new Set([start]);
    while (queue.length && !seen.has(end)) {
      const v = queue.shift()!;
      const [i, j] = coordinates(v);
      const moves: [string, string, number][] = [
        [`v ${i + 1} ${j}`, `h ${i} ${j}`, 1],
        [`v ${i - 1} ${j}`, `h ${i - 1} ${j}`, -1],
        [`v ${i} ${j + 1}`, `u ${i} ${j}`, 1],
        [`v ${i} ${j - 1}`, `u ${i} ${j - 1}`, -1],
      ];
      for (const [w, e, s] of moves) {
        if (seen.has(w) || !K.has(e)) continue;
        seen.add(w);
        steps.set(w, [v, e, s]);
        queue.push(w);
      }
    }
    if (!seen.has(end)) throw new Error(`no path in the carrier of ${face}`);
    const c: Chain = new Map();
    for (let v = end; v !== start; ) {
      const [prev, e, s] = steps.get(v)!;
      addTo(c, e, s);
      v = prev;
    }
    phi.set(face, c);
  }
  for (const face of facesByDim[2]) {
    const target: Chain = new Map();
    for (const [g, s] of boundary(face)) for (const [e, a] of phi.get(g)!) addTo(target, e, s * a);
    const squares = carrier(face).map(([i, j]) => `q ${i} ${j}`);
    const span = new Echelon();
    const stored: string[] = [];
    for (const q of squares) if (span.add(boundaryOf(new Map([[q, 1]]))) >= 0) stored.push(q);
    const c = span.express(target);
    if (!c) throw new Error(`no 2-chain in the carrier of ${face}`);
    phi.set(face, new Map([...c].filter(([, a]) => a).map(([m, a]) => [stored[m], a])));
  }

  const apply = (z: Chain): Chain => {
    const out: Chain = new Map();
    for (const [face, a] of z) for (const [g, b] of phi.get(face)!) addTo(out, g, a * b);
    return out;
  };

  const domain = new RelativeHomology(X1, X0);
  const target = new RelativeHomology(Y1, Y0);
  const maps: number[][][] = [];
  for (let k = 0; k <= 2; k++) {
    const reps = domain.reps[k];
    if (reps.length !== target.reps[k].length) throw new Error("inclusion is not an isomorphism in homology");
    if (reps.length === 0) {
      maps.push([]);
      continue;
    }
    const columns = (f: (z: Chain) => Chain) => {
      const cols = reps.map((z) => target.coordinates(k, f(z)));
      return cols[0].map((_, r) => cols.map((col) => col[r]));
    };
    const inclusion = columns((z) => z);
    const pushed = columns(apply);
    maps.push(solve(inclusion, pushed));
  }
  return { P1, P0, maps, shift: maps.map(eventualRestriction) };
}
