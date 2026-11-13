// Frames of the Software figure as a function of time. makeScene prepares what
// the frames read; drawFrame paints the frame at time t using only the 2D
// context, so the same code runs in the page and in a headless canvas.
//
// Timeline: a few cells are carried by the time-TAU map and the cells covering
// their images are shaded; then every cell becomes a vertex with edges to the
// cells covering its image (an outer approximation from padded samples); the
// edges outside the Morse sets fade; the Morse sets move aside into the Morse
// graph. There the cells between the two Morse sets and a copy of the second join
// the first, forming the index pair (N, A) of the first; its cells straighten into a
// round disk with A collapsed onto the boundary circle, and the disk closes into a
// sphere with that circle at its top pole, the quotient N / A. Meanwhile the
// second, the pair (A, empty set), retracts onto the periodic orbit. The Conley
// index of each appears, and an arrow from the first index to the second marks the
// connecting map between them.

import type { FigureData } from "./morse-figure";
import { cellIndex, cellOf } from "./morse-graph";
import { CELL, CELLS, HALF, STEPS, along, cellImage, limitCycle, type CellImage, type Point } from "./outer-approximation";

export type Palette = {
  paper: string;
  ink: string;
  inkSoft: string;
  line: string;
  graph: string;
  blue: string;
  gold: string;
  serif: string;
};

// seconds each showcased cell takes, in the order of CELLS
const SHOW = [2.6, 2.0, 1.6, 1.4, 1.3];
const SHOW_END = SHOW.reduce((a, b) => a + b, 0);
const T = {
  nodes: [SHOW_END - 0.3, SHOW_END + 0.3],
  edges: [SHOW_END + 0.1, SHOW_END + 2.7],
  grow: 0.5,
  scc: [SHOW_END + 3.4, SHOW_END + 4.4],
  slide: [SHOW_END + 5.6, SHOW_END + 6.4],
  fly: [SHOW_END + 6.4, SHOW_END + 7.6],
  // the cells between and a copy of the second Morse set join the first
  gather: [SHOW_END + 8.0, SHOW_END + 8.8],
  // the first copy straightens into a round disk while the second retracts onto the
  // periodic orbit; then the disk closes into a sphere
  straighten: [SHOW_END + 9.0, SHOW_END + 10.0],
  close: [SHOW_END + 10.3, SHOW_END + 11.7],
  arrow: [SHOW_END + 12.0, SHOW_END + 12.6],
  index: [SHOW_END + 12.9, SHOW_END + 13.6],
};
// delays of the second Morse set behind the first
const LAG = { scc: 0.45, fly: 0.35, index: 0.6 };
// the arrow between the indices grows once both are in place
const LINK = [T.index[1] + LAG.index + 0.3, T.index[1] + LAG.index + 0.9];
export const CYCLE_S = SHOW_END + 19.7;
// the figure fades over [OUT[0], OUT[0] + 0.55], then the bare plane moves back to the center
const OUT = [CYCLE_S - 1, CYCLE_S];
// the frame shown when motion is reduced: the Morse graph with both indices and the arrow between them
export const STILL = SHOW_END + 17;
// radius of the pole of the sphere, in pixels
const DOT_R = 4;
// the sphere is seen from TILT above the plane of the disk it closes from, and its
// radius is SPHERE times that of the disk
const TILT = (50 * Math.PI) / 180;
const SPHERE = 0.8;
// stretches of the loop in which the picture does not change
const STATIC: [number, number][] = [
  [T.edges[1], T.scc[0]],
  [T.scc[1] + LAG.scc, T.slide[0]],
  [T.gather[1], T.straighten[0]],
  [T.close[1], T.arrow[0]],
  [T.arrow[1], T.index[0]],
  [LINK[1], OUT[0]],
];
// the static stretch containing t, or -1; frames within one stretch are identical
export const staticPart = (t: number) => STATIC.findIndex(([a, b]) => a < t && t < b);
// the colors of the Morse sets, in the order of FigureData.sets
const SET_COLOR: (keyof Palette)[] = ["gold", "blue"];

const clamp01 = (s: number) => Math.min(1, Math.max(0, s));
const ease = (s: number) => {
  const u = clamp01(s);
  return u * u * (3 - 2 * u);
};
const phase = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const lerp = (a: number, b: number, s: number) => a + (b - a) * s;

export type Scene = {
  data: FigureData;
  images: CellImage[];
  // cells covering the image of each showcased cell
  hits: Point[][];
  cycle: Point[];
  // edges of the graph without self-loops, as [from, to] cell indices: those
  // between different Morse sets or outside them, and those inside each Morse set
  loose: [number, number][];
  inner: [number, number][][];
  // when the edges of a cell start to grow, as a fraction of the sweep
  start: number[];
  // Morse set of each cell, or -1
  setOf: number[];
  // bounding box of each Morse set in cell units, [i0, i1, j0, j1] with i1, j1 exclusive
  boxes: [number, number, number, number][];
  labels: string[];
  // whether the connecting map from the first index to the second is not zero
  linked: boolean;
  // where the corners "i,j" of the cells of the second Morse set go: along the rays
  // from the equilibrium onto the periodic orbit, which is star-shaped about it
  retract: Map<string, Point>;
  // the point of the periodic orbit above the equilibrium, where the edge of the Morse graph ends
  top: Point;
  // whether the indices come from the index triple (see morse-figure.ts)
  triple: boolean;
  // the cells of the first copy, each with 0 (the first Morse set), 1 (between) or 2
  // (the second Morse set, the exit set of the pair (N, A))
  pairCells: [Point, number][];
  // where the corners "i,j" of those cells go when the copy straightens: the cells of
  // N \ A radially onto the disk of radius R0 about the equilibrium, the corners of the
  // cells of A onto its boundary circle (N \ A is star-shaped about the equilibrium)
  round: Map<string, Point>;
  R0: number;
};

const matrix = (m: number[][]) => (m.length === 0 ? "0" : `[${m.map((row) => row.join(" ")).join("; ")}]`);
// an entry of an index: the rank of its homology in that degree when the index map
// there is the identity, as it is for every time-tau map of a flow, and otherwise the matrix
const entry = (m: number[][]) => (m.every((row, r) => row.every((a, c) => a === (r === c ? 1 : 0))) ? String(m.length) : matrix(m));

// the sides of the cells that no other cell of the set shares, as pairs of grid
// corners, each with the set on its left
function sides(cells: Point[]): [Point, Point][] {
  const inSet = new Set(cells.map((c) => c.join(",")));
  const free = (i: number, j: number) => !inSet.has(`${i},${j}`);
  const out: [Point, Point][] = [];
  for (const [i, j] of cells) {
    if (free(i, j - 1)) out.push([[i, j], [i + 1, j]]);
    if (free(i + 1, j)) out.push([[i + 1, j], [i + 1, j + 1]]);
    if (free(i, j + 1)) out.push([[i + 1, j + 1], [i, j + 1]]);
    if (free(i - 1, j)) out.push([[i, j + 1], [i, j]]);
  }
  return out;
}

// the boundary of a union of cells that is a closed disk, as its grid corners in order
function outline(cells: Point[]): Point[] {
  const next = new Map<string, Point>();
  for (const [a, b] of sides(cells)) {
    if (next.has(a.join(","))) throw new Error("the boundary touches itself");
    next.set(a.join(","), b);
  }
  const start = next.keys().next().value as string;
  const out: Point[] = [];
  let v = start;
  do {
    out.push(v.split(",").map(Number) as Point);
    v = next.get(v)!.join(",");
  } while (v !== start);
  if (out.length !== next.size) throw new Error("the boundary is not one curve");
  return out;
}

// the largest r with r (cos th, sin th) on the closed polygon
function farthest(polygon: Point[], th: number): number {
  const d: Point = [Math.cos(th), Math.sin(th)];
  const cross = (p: Point, q: Point) => p[0] * q[1] - p[1] * q[0];
  let best = 0;
  polygon.forEach((a, m) => {
    const b = polygon[(m + 1) % polygon.length];
    const e: Point = [b[0] - a[0], b[1] - a[1]];
    const den = cross(e, d);
    if (Math.abs(den) < 1e-12) {
      if (Math.abs(cross(a, d)) < 1e-12) best = Math.max(best, a[0] * d[0] + a[1] * d[1], b[0] * d[0] + b[1] * d[1]);
      return;
    }
    const u = -cross(a, d) / den;
    if (u < -1e-12 || u > 1 + 1e-12) return;
    best = Math.max(best, (a[0] + u * e[0]) * d[0] + (a[1] + u * e[1]) * d[1]);
  });
  return best;
}

// the convex hull of points, counterclockwise
function convexHull(points: Point[]): Point[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const turn = (o: Point, a: Point, b: Point) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Point[]) => {
    const out: Point[] = [];
    for (const p of list) {
      while (out.length >= 2 && turn(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    return out.slice(0, -1);
  };
  return [...half(pts), ...half([...pts].reverse())];
}

// the point of a closed curve, star-shaped about the origin, on the ray at angle th
function onRay(byAngle: [number, Point][], th: number): Point {
  const n = byAngle.length;
  let k = byAngle.findIndex(([a]) => a > th);
  if (k < 0) k = 0;
  const [a1, p1] = byAngle[k];
  const [a0, p0] = byAngle[(k + n - 1) % n];
  const span = (((a1 - a0) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const f = span > 0 ? ((((th - a0) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / span : 0;
  const q: Point = [lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f)];
  // back onto the ray
  const r = Math.hypot(q[0], q[1]);
  return [r * Math.cos(th), r * Math.sin(th)];
}

export function makeScene(data: FigureData): Scene {
  const n = data.map.length;
  const setOf = new Array<number>(n).fill(-1);
  data.sets.forEach((set, p) => set.forEach((k) => (setOf[k] = p)));
  const loose: [number, number][] = [];
  const inner: [number, number][][] = data.sets.map(() => []);
  data.map.forEach((targets, k) => {
    for (const m of targets) {
      if (m === k) continue;
      if (setOf[k] >= 0 && setOf[k] === setOf[m]) inner[setOf[k]].push([k, m]);
      else loose.push([k, m]);
    }
  });
  // a clockwise sweep around the origin, starting at the top, as the flow turns
  const angle = (k: number) => {
    const [i, j] = cellOf(k);
    const a = Math.PI / 2 - Math.atan2(j + 0.5, i + 0.5);
    return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  };
  const order = [...data.map.keys()].sort((a, b) => angle(a) - angle(b));
  const start = new Array<number>(n);
  order.forEach((k, r) => (start[k] = r / (n - 1)));
  const triple = data.connection.length > 0;
  const pairCells: [Point, number][] = [
    ...data.sets[0].map((k): [Point, number] => [cellOf(k), 0]),
    ...(triple ? data.between.map((k): [Point, number] => [cellOf(k), 1]) : []),
    ...(triple ? data.sets[1].map((k): [Point, number] => [cellOf(k), 2]) : []),
  ];
  const boxOf = (cells: Point[]) => {
    const is = cells.map((c) => c[0]);
    const js = cells.map((c) => c[1]);
    return [Math.min(...is), Math.max(...is) + 1, Math.min(...js), Math.max(...js) + 1] as [number, number, number, number];
  };
  const boxes = data.sets.map((set, p) => boxOf(p === 0 ? pairCells.map(([c]) => c) : set.map(cellOf)));
  const cycle = limitCycle();
  const byAngle = cycle.map((p): [number, Point] => [Math.atan2(p[1], p[0]), p]).sort((a, b) => a[0] - b[0]);
  const ray = ([x, y]: Point) => onRay(byAngle, Math.atan2(y, x));
  const corner = ([a, b]: Point): Point => [a * CELL, b * CELL];
  const cornersOf = ([i, j]: Point): Point[] => [[i, j], [i + 1, j], [i, j + 1], [i + 1, j + 1]];
  const retract = new Map<string, Point>();
  for (const k of data.sets[1] ?? []) for (const q of cornersOf(cellOf(k))) retract.set(q.join(","), ray(corner(q)));
  // the straightening of the first copy
  const hole = pairCells.filter(([, kind]) => kind < 2).map(([c]) => c);
  const R0 = Math.sqrt((hole.length * CELL * CELL) / Math.PI);
  const round = new Map<string, Point>();
  if (triple) {
    const polygon = outline(hole).map(corner);
    const onCircle = new Set(pairCells.filter(([, kind]) => kind === 2).flatMap(([c]) => cornersOf(c).map((q) => q.join(","))));
    for (const [c] of pairCells) {
      for (const q of cornersOf(c)) {
        const key = q.join(",");
        if (round.has(key)) continue;
        const [x, y] = corner(q);
        const th = Math.atan2(y, x);
        const to = onCircle.has(key) ? R0 : x === 0 && y === 0 ? 0 : (R0 * Math.hypot(x, y)) / farthest(polygon, th);
        round.set(key, [to * Math.cos(th), to * Math.sin(th)]);
      }
    }
  }
  // the panel x of the equilibrium in the first copy, as a plane x in the second copy
  const centerX = (p: number) => (boxes[p] ? (boxes[p][0] + boxes[p][1]) / 2 : 0);
  const x0 = (centerX(1) - centerX(0)) * CELL;
  const top = cycle.reduce<Point>((best, p, m) => {
    const q = cycle[(m + 1) % cycle.length];
    if ((p[0] - x0) * (q[0] - x0) > 0 || p[0] === q[0]) return best;
    const y = lerp(p[1], q[1], (x0 - p[0]) / (q[0] - p[0]));
    return y > best[1] ? [x0, y] : best;
  }, [x0, -Infinity]);
  return {
    data,
    images: CELLS.map(cellImage),
    hits: CELLS.map((c) => data.map[cellIndex(c)].map(cellOf)),
    cycle,
    loose,
    inner,
    start,
    setOf,
    boxes,
    labels: data.index.map((maps) => `(${maps.map(entry).join(", ")})`),
    linked: data.connection.some((rank) => rank > 0),
    retract,
    top,
    triple,
    pairCells,
    round,
    R0,
  };
}

type Layout = {
  // the phase plane [-3, 3]^2 as a square of side `size` with top left corner (x, y)
  x: number;
  y: number;
  size: number;
  // centers of the Morse graph vertices, the side of a cell there, and where the labels start
  nodes: Point[];
  mini: number;
  labelX: number;
  labelY: number[];
  font: number;
};

function layout(W: number, H: number, slide: number, scene: Scene): Layout {
  const pad = 8;
  const gap = 18;
  const rows = scene.boxes.map(([, , j0, j1]) => j1 - j0);
  const widest = Math.max(...scene.boxes.map(([i0, i1]) => i1 - i0));
  const font = Math.round(Math.min(17, Math.max(13, H * 0.038)));
  const labelW = font * 6.4;
  const stack = (top: number, height: number, between: number, mini: number) => {
    const total = (rows[0] + rows[1]) * mini + between;
    const y0 = top + (height - total) / 2;
    return [y0 + (rows[0] * mini) / 2, y0 + rows[0] * mini + between + (rows[1] * mini) / 2];
  };
  // Morse graph beside the plane, when it leaves room for cells of at least 4 px
  if (W / H >= 1.4) {
    const size = H - 2 * pad;
    const panelX = pad + size + gap;
    const panelW = W - panelX - pad;
    const between = Math.max(34, H * 0.12);
    const mini = Math.min((H * 0.86 - between) / (rows[0] + rows[1]), (panelW - labelW - 24) / widest);
    if (mini >= 4) {
      const nx = panelX + (widest * mini) / 2 + 6;
      return {
        x: lerp((W - size) / 2, pad, slide),
        y: pad,
        size,
        nodes: stack(0, H, between, mini).map((y) => [nx, y] as Point),
        mini,
        labelX: nx + (widest * mini) / 2 + 22,
        labelY: stack(0, H, between, mini),
        font,
      };
    }
  }
  // Morse graph below the plane, which shrinks as it moves up to make room
  const size0 = Math.min(W - 2 * pad, H * 0.64);
  const size1 = Math.min(W - 2 * pad, H * 0.52);
  const panelY = pad + size1 + gap;
  const panelH = H - panelY - pad;
  const between = Math.max(24, panelH * 0.16);
  const mini = Math.max(1, Math.min((panelH * 0.92 - between) / (rows[0] + rows[1]), (W - 2 * pad - labelW - 40) / widest));
  const nx = W / 2 - (labelW + 22) / 2;
  const size = lerp(size0, size1, slide);
  return {
    x: (W - size) / 2,
    y: lerp((H - size0) / 2, pad, slide),
    size,
    nodes: stack(panelY, panelH, between, mini).map((y) => [nx, y] as Point),
    mini,
    labelX: nx + (widest * mini) / 2 + 22,
    labelY: stack(panelY, panelH, between, mini),
    font,
  };
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  C: Palette,
  scene: Scene,
  dpr = 1,
) {
  const { data } = scene;
  const out = 1 - phase(t, OUT[0], OUT[0] + 0.55);
  const slide = phase(t, T.slide[0], T.slide[1]) * (1 - phase(t, OUT[0] + 0.45, OUT[1]));
  const L = layout(W, H, slide, scene);
  const s = L.size / (2 * HALF * CELL);
  const X = (x: number) => L.x + (x + HALF * CELL) * s;
  const Y = (y: number) => L.y + (HALF * CELL - y) * s;
  const P = (p: Point): Point => [X(p[0]), Y(p[1])];
  const side = CELL * s;
  const rectOf = ([i, j]: Point) => [X(i * CELL), Y((j + 1) * CELL), side, side] as const;
  const path = (pts: Point[], close = false) => {
    ctx.beginPath();
    pts.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    if (close) ctx.closePath();
  };
  // an arrow from a toward b, drawn up to the fraction s of its length
  const arrowFrom = (a: Point, b: Point, s: number) => {
    const tip: Point = [lerp(a[0], b[0], s), lerp(a[1], b[1], s)];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const head = 7;
    if (Math.hypot(tip[0] - a[0], tip[1] - a[1]) > head * 0.7) {
      path([a, [tip[0] - Math.cos(ang) * head * 0.7, tip[1] - Math.sin(ang) * head * 0.7]]);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(tip[0], tip[1]);
    ctx.lineTo(tip[0] - head * Math.cos(ang - 0.42), tip[1] - head * Math.sin(ang - 0.42));
    ctx.lineTo(tip[0] - head * Math.cos(ang + 0.42), tip[1] - head * Math.sin(ang + 0.42));
    ctx.closePath();
    ctx.fill();
  };
  // edges are hairlines: one device pixel
  const hair = 1 / dpr;

  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // grid and limit cycle
  ctx.globalAlpha = 1;
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = -HALF; k <= HALF; k++) {
    ctx.moveTo(X(k * CELL), Y(HALF * CELL));
    ctx.lineTo(X(k * CELL), Y(-HALF * CELL));
    ctx.moveTo(X(-HALF * CELL), Y(k * CELL));
    ctx.lineTo(X(HALF * CELL), Y(k * CELL));
  }
  ctx.stroke();
  const graphOn = phase(t, T.nodes[0], T.nodes[1]) * out;
  ctx.globalAlpha = 1 - 0.55 * graphOn;
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = C.graph;
  path(scene.cycle.map(P), true);
  ctx.stroke();
  ctx.setLineDash([]);

  // one cell at a time: the cell, its image under the flow, and the cells covering the image
  if (t < SHOW_END) {
    let a = 0;
    let idx = 0;
    while (idx < SHOW.length - 1 && t >= a + SHOW[idx]) a += SHOW[idx++];
    const D = SHOW[idx];
    const u = t - a;
    const image = scene.images[idx];
    const env = 1 - phase(u, 0.82 * D, D);
    const k = phase(u, 0.12 * D, 0.55 * D) * STEPS;
    const cover = phase(u, 0.55 * D, 0.68 * D) * env;
    if (cover > 0) {
      ctx.fillStyle = C.blue;
      ctx.strokeStyle = C.blue;
      ctx.lineWidth = 1;
      for (const cell of scene.hits[idx]) {
        const [x, y, w, h] = rectOf(cell);
        ctx.globalAlpha = cover * 0.22;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = cover;
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      }
    }
    const shown = phase(u, 0, 0.12 * D) * env;
    const [x, y, w, h] = rectOf(image.cell);
    ctx.globalAlpha = shown * 0.3;
    ctx.fillStyle = C.gold;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = shown;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(x, y, w, h);
    const moving = phase(u, 0.1 * D, 0.14 * D) * env;
    if (moving > 0) {
      ctx.globalAlpha = moving * 0.7;
      ctx.strokeStyle = C.graph;
      ctx.lineWidth = 1;
      for (const orbit of image.corners) {
        const pts = orbit.slice(0, Math.floor(k) + 1).map(P);
        pts.push(P(along(orbit, k)));
        path(pts);
        ctx.stroke();
      }
      const outline = image.boundary.map((orbit) => P(along(orbit, k)));
      ctx.globalAlpha = moving * 0.14;
      ctx.fillStyle = C.blue;
      path(outline, true);
      ctx.fill();
      ctx.globalAlpha = moving;
      ctx.strokeStyle = C.blue;
      ctx.lineWidth = 1.8;
      path(outline, true);
      ctx.stroke();
      ctx.globalAlpha = moving * 0.85;
      ctx.fillStyle = C.ink;
      for (const orbit of image.dots) {
        const [px, py] = P(along(orbit, k));
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // the graph on all cells
  const sccOn = data.sets.map((_, p) => phase(t, T.scc[0] + LAG.scc * p, T.scc[1] + LAG.scc * p) * out);
  const fadeRest = phase(t, T.scc[0], T.scc[1]);
  if (graphOn > 0) {
    const n = data.map.length;
    const cx = new Float64Array(n);
    const cy = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      const [i, j] = cellOf(k);
      cx[k] = X((i + 0.5) * CELL);
      cy[k] = Y((j + 0.5) * CELL);
    }
    const sweep = T.edges[1] - T.edges[0] - T.grow;
    const grown = t >= T.edges[1];
    // each edge in two parts, fainter near its tail, so the direction shows
    const strokeEdges = (edges: [number, number][], color: string, alpha: number) => {
      if (alpha <= 0.002) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = hair;
      for (const [part, a0, a1] of [[0.35, 0, 0.45], [1, 0.45, 1]] as const) {
        ctx.globalAlpha = alpha * part;
        ctx.beginPath();
        for (const [p, q] of edges) {
          const g = grown ? 1 : phase(t, T.edges[0] + scene.start[p] * sweep, T.edges[0] + scene.start[p] * sweep + T.grow);
          if (g <= a0) continue;
          const b = Math.min(g, a1);
          ctx.moveTo(lerp(cx[p], cx[q], a0), lerp(cy[p], cy[q], a0));
          ctx.lineTo(lerp(cx[p], cx[q], b), lerp(cy[p], cy[q], b));
        }
        ctx.stroke();
      }
    };
    const base = 0.55 * out;
    strokeEdges(scene.loose, C.graph, base * (1 - 0.88 * fadeRest));
    // edges inside a Morse set stand out, then recede once the Morse graph takes over
    const recede = 1 - 0.5 * phase(t, T.slide[0], T.slide[1]);
    scene.inner.forEach((edges, p) => {
      strokeEdges(edges, C.graph, base * (1 - sccOn[p]));
      strokeEdges(edges, C[SET_COLOR[p]], (0.35 + 0.55 * sccOn[p]) * sccOn[p] * recede);
    });
    // vertices
    const r = Math.max(1.1, side * 0.06);
    for (let k = 0; k < n; k++) {
      const p = scene.setOf[k];
      const a = graphOn * (p < 0 ? 1 - 0.75 * fadeRest : 1);
      if (a <= 0) continue;
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = p >= 0 && sccOn[p] > 0.5 ? C[SET_COLOR[p]] : C.inkSoft;
      ctx.beginPath();
      ctx.arc(cx[k], cy[k], r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // the Morse sets in the plane
  data.sets.forEach((set, p) => {
    const a = sccOn[p];
    if (a <= 0) return;
    const color = C[SET_COLOR[p]];
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (const k of set) {
      const [x, y, w, h] = rectOf(cellOf(k));
      ctx.globalAlpha = a * 0.26;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = a * 0.75;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }
  });

  // the cells between the Morse sets, which join the first one in the pair (N, A)
  const joined = phase(t, T.gather[0], T.gather[0] + 0.4) * out;
  if (joined > 0 && data.between.length) {
    ctx.strokeStyle = C.gold;
    ctx.fillStyle = C.gold;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    for (const k of data.between) {
      const [x, y, w, h] = rectOf(cellOf(k));
      ctx.globalAlpha = joined * 0.08;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = joined * 0.6;
      ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
    }
    ctx.setLineDash([]);
  }

  // The Morse sets move aside and become the two vertices of the Morse graph, keeping
  // their colors. A point of the plane in the copy of Morse set p:
  const toCopy = (p: number, [x, y]: Point): Point => {
    const [i0, i1, j0, j1] = scene.boxes[p];
    return [L.nodes[p][0] + (x / CELL - (i0 + i1) / 2) * L.mini, L.nodes[p][1] - (y / CELL - (j0 + j1) / 2) * L.mini];
  };
  const equilibrium = toCopy(0, [0, 0]);
  // a cell of copy p: on its way from the plane while e < 1, then with its corners moved
  // by the fraction h toward where `to` sends them; fill and stroke are its opacities
  const drawCell = (p: number, [i, j]: Point, e: number, h: number, to: Map<string, Point>, fill: number, stroke: number) => {
    if (h <= 0) {
      const [x, y, w] = rectOf([i, j]);
      const [mx, my] = toCopy(p, [i * CELL, (j + 1) * CELL]);
      const rx = lerp(x, mx, e);
      const ry = lerp(y, my, e);
      const rw = lerp(w, L.mini, e);
      ctx.globalAlpha = fill * (0.6 + 0.4 * e);
      ctx.fillRect(rx, ry, rw, rw);
      ctx.globalAlpha = stroke;
      ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rw - 1);
      return;
    }
    const corners: Point[] = [[i, j + 1], [i + 1, j + 1], [i + 1, j], [i, j]];
    path(
      corners.map((q) => {
        const from: Point = [q[0] * CELL, q[1] * CELL];
        const target = to.get(q.join(",")) ?? from;
        return toCopy(p, [lerp(from[0], target[0], h), lerp(from[1], target[1], h)]);
      }),
      true,
    );
    ctx.globalAlpha = fill;
    ctx.fill();
    ctx.globalAlpha = stroke;
    ctx.stroke();
  };

  // The round disk of the first copy closing into a sphere: the cap of geodesic radius R
  // and angle s pi on the sphere of radius R / (s pi) that touches the plane at the
  // equilibrium, seen from s TILT above the plane and scaled so that it ends as the
  // sphere of radius SPHERE R centered at the equilibrium. Its boundary circle, onto
  // which A collapsed, ends at the top pole.
  const drawBag = (s: number, alpha: number) => {
    if (alpha <= 0) return;
    const R = (scene.R0 / CELL) * L.mini;
    const flat = s < 1e-4;
    const a = flat ? 0 : R / (s * Math.PI);
    const sinB = Math.sin(TILT * s);
    const cosB = Math.cos(TILT * s);
    const grow = 1 + (SPHERE * Math.PI - 1) * s;
    const lift = flat ? 0 : s * a * sinB;
    const at = (rho: number, th: number): { q: Point; seen: boolean } => {
      let [x, y, z] = [R * rho * Math.cos(th), R * rho * Math.sin(th), 0];
      let seen = true;
      if (!flat) {
        const phi = s * Math.PI * rho;
        [x, y, z] = [a * Math.sin(phi) * Math.cos(th), a * Math.sin(phi) * Math.sin(th), a * (1 - Math.cos(phi))];
        // a point on the far side of the sphere shows only through the opening of the cap
        const dv = -y * sinB + (z - a) * cosB;
        if (dv < 0) {
          const qz = z - 2 * dv * cosB;
          seen = Math.acos(Math.max(-1, Math.min(1, (a - qz) / a))) > s * Math.PI + 1e-9;
        }
      }
      return { q: [equilibrium[0] + grow * x, equilibrium[1] - grow * (y * cosB + z * sinB - lift)], seen };
    };
    const ring = (rho: number) => Array.from({ length: 73 }, (_, m) => at(rho, (m / 72) * 2 * Math.PI));
    const rings = [0.25, 0.5, 0.75].map(ring);
    const meridians = Array.from({ length: 8 }, (_, k) => Array.from({ length: 25 }, (_, m) => at(m / 24, (k * Math.PI) / 4)));
    const rim = ring(1);
    // the outline: the convex hull of a fine mesh of the cap
    const mesh: Point[] = [];
    for (let r = 0; r <= 12; r++) for (let m = 0; m < 48; m++) mesh.push(at(r / 12, (m / 48) * 2 * Math.PI).q);
    path(convexHull(mesh), true);
    ctx.globalAlpha = alpha * 0.16;
    ctx.fillStyle = C.gold;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // a curve: the stretches in view solid, the hidden ones faint
    const curve = (pts: { q: Point; seen: boolean }[], color: string, width: number, front: number, back: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      const shown = (m: number) => pts[m].seen && pts[m + 1].seen;
      let first = 0;
      for (let m = 0; m < pts.length - 1; m++) {
        if (m === pts.length - 2 || shown(m + 1) !== shown(m)) {
          ctx.globalAlpha = shown(m) ? front : back;
          path(pts.slice(first, m + 2).map((pt) => pt.q));
          ctx.stroke();
          first = m + 1;
        }
      }
    };
    const bend = phase(s, 0, 0.35);
    for (const r of rings) curve(r, C.gold, 1, alpha * 0.75, alpha * 0.15);
    for (const r of meridians) curve(r, C.gold, 1, alpha * 0.6 * bend, alpha * 0.12 * bend);
    curve(rim, C.blue, 1.8, alpha, alpha * 0.3);
    // the center of the boundary circle, which ends as the top pole
    const pole = alpha * phase(s, 0.8, 1);
    if (pole > 0) {
      const px = equilibrium[0];
      const py = equilibrium[1] - grow * (a * (1 - Math.cos(s * Math.PI)) * sinB - lift);
      ctx.globalAlpha = pole;
      ctx.fillStyle = C.blue;
      ctx.beginPath();
      ctx.arc(px, py, DOT_R, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // the second copy, the pair (A, empty set): it retracts along rays from the
  // equilibrium onto the periodic orbit
  if (data.sets[1]) {
    const t0 = T.fly[0] + LAG.fly;
    const e = phase(t, t0, T.fly[1] + LAG.fly);
    const h = phase(t, T.straighten[0], T.straighten[1]);
    const fade = out * clamp01((t - t0) / 0.3) * (1 - phase(h, 0.75, 1));
    ctx.fillStyle = C.blue;
    ctx.strokeStyle = C.blue;
    ctx.lineWidth = 1;
    if (e > 0 && fade > 0) for (const k of data.sets[1]) drawCell(1, cellOf(k), e, h, scene.retract, fade * 0.5, fade);
    const shape = out * phase(h, 0.6, 1);
    if (shape > 0) {
      ctx.globalAlpha = shape;
      ctx.lineWidth = 2;
      path(scene.cycle.map((q) => toCopy(1, q)), true);
      ctx.stroke();
    }
  }

  // the first copy: the first Morse set, joined by the cells between and by a copy of
  // A, the pair (N, A); it straightens into a round disk and closes into a sphere
  {
    const e = phase(t, T.fly[0], T.fly[1]);
    const g = phase(t, T.gather[0], T.gather[1]);
    const h = scene.triple ? phase(t, T.straighten[0], T.straighten[1]) : 0;
    const fade = out * (1 - phase(h, 0.75, 1));
    ctx.lineWidth = 1;
    for (const kind of [2, 1, 0]) {
      const [move, t0] = kind === 0 ? [e, T.fly[0]] : [g, T.gather[0]];
      const a = fade * clamp01((t - t0) / 0.3);
      if (move <= 0 || a <= 0) continue;
      const [fill, stroke] = kind === 1 ? [0.18, 0.45] : [0.5, 1];
      ctx.fillStyle = kind === 2 ? C.blue : C.gold;
      ctx.strokeStyle = ctx.fillStyle;
      for (const [cell, k] of scene.pairCells) if (k === kind) drawCell(0, cell, move, h, scene.round, a * fill, a * stroke);
    }
    if (scene.triple) drawBag(phase(t, T.close[0], T.close[1]), out * phase(h, 0.6, 1));
  }

  // the edge of the Morse graph, from the sphere down to the circle
  const arrow = phase(t, T.arrow[0], T.arrow[1]) * out;
  if (arrow > 0 && data.edges.some(([p, q]) => p === 0 && q === 1)) {
    ctx.strokeStyle = C.inkSoft;
    ctx.fillStyle = C.inkSoft;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = arrow;
    const below = scene.triple ? SPHERE * (scene.R0 / CELL) * L.mini : ((scene.boxes[0][3] - scene.boxes[0][2]) * L.mini) / 2;
    const end = toCopy(1, scene.top);
    arrowFrom([equilibrium[0], equilibrium[1] + below + 7], [end[0], end[1] - 7], arrow);
  }

  // the Conley index of each Morse set: its index map on H_0, H_1, H_2 up to shift equivalence
  scene.labels.forEach((label, p) => {
    const a = phase(t, T.index[0] + LAG.index * p, T.index[1] + LAG.index * p) * out;
    if (a <= 0) return;
    ctx.globalAlpha = a;
    ctx.fillStyle = C.ink;
    ctx.font = `${L.font}px ${C.serif}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, L.labelX - 6 * (1 - a), L.labelY[p]);
  });

  // the connecting map from the first index to the second, when it is not zero: a
  // vertical arrow halfway between the centers of the two labels
  const link = phase(t, LINK[0], LINK[1]) * out;
  if (link > 0 && scene.linked) {
    ctx.font = `${L.font}px ${C.serif}`;
    const x = L.labelX + (ctx.measureText(scene.labels[0]).width + ctx.measureText(scene.labels[1]).width) / 4;
    ctx.strokeStyle = C.inkSoft;
    ctx.fillStyle = C.inkSoft;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = link;
    arrowFrom([x, L.labelY[0] + 0.8 * L.font], [x, L.labelY[1] - 0.8 * L.font], link);
  }

  // the equilibrium
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(X(0), Y(0), 3, 0, Math.PI * 2);
  ctx.fillStyle = C.paper;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.stroke();
}
