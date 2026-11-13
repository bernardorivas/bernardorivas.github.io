// Frames of the Software figure as a function of time. makeScene prepares what
// the frames read; drawFrame paints the frame at time t using only the 2D
// context, so the same code runs in the page and in a headless canvas.
//
// Timeline: a few cells are carried by the time-TAU map and the cells covering
// their images are shaded; then every cell becomes a vertex with edges to the
// cells covering its image (an outer approximation from padded samples); the
// edges outside the Morse sets fade; the Morse sets move aside into the Morse
// graph, where the first contracts to the equilibrium and the second retracts onto
// the periodic orbit; the Conley index of each appears, and an arrow from the first
// index to the second marks the connecting map between them.

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
  // the copies deform onto the invariant sets they isolate: a point and a circle
  homotopy: [SHOW_END + 8.0, SHOW_END + 9.2],
  arrow: [SHOW_END + 9.6, SHOW_END + 10.2],
  index: [SHOW_END + 10.5, SHOW_END + 11.2],
};
// delays of the second Morse set behind the first
const LAG = { scc: 0.45, fly: 0.35, homotopy: 0.35, index: 0.6 };
// the arrow between the indices grows once both are in place
const LINK = [T.index[1] + LAG.index + 0.3, T.index[1] + LAG.index + 0.9];
export const CYCLE_S = SHOW_END + 17.3;
// the figure fades over [OUT[0], OUT[0] + 0.55], then the bare plane moves back to the center
const OUT = [CYCLE_S - 1, CYCLE_S];
// the frame shown when motion is reduced: the Morse graph with both indices and the arrow between them
export const STILL = SHOW_END + 14.5;
// radius of the point the first Morse set contracts to, in pixels
const DOT_R = 4;
// stretches of the loop in which the picture does not change
const STATIC: [number, number][] = [
  [T.edges[1], T.scc[0]],
  [T.scc[1] + LAG.scc, T.slide[0]],
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
  // for each cell of the second Morse set, its corners (top left, top right, bottom
  // right, bottom left) moved along the rays from the equilibrium onto the periodic
  // orbit, which is star-shaped about it
  retract: Point[][];
  // the point of the periodic orbit above the equilibrium, where the edge of the Morse graph ends
  top: Point;
};

const matrix = (m: number[][]) => (m.length === 0 ? "0" : `[${m.map((row) => row.join(" ")).join("; ")}]`);

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
  const boxes = data.sets.map((set) => {
    const cells = set.map(cellOf);
    const is = cells.map((c) => c[0]);
    const js = cells.map((c) => c[1]);
    return [Math.min(...is), Math.max(...is) + 1, Math.min(...js), Math.max(...js) + 1] as [number, number, number, number];
  });
  const cycle = limitCycle();
  const byAngle = cycle.map((p): [number, Point] => [Math.atan2(p[1], p[0]), p]).sort((a, b) => a[0] - b[0]);
  const ray = ([x, y]: Point) => onRay(byAngle, Math.atan2(y, x));
  const retract = (data.sets[1] ?? []).map((k) => {
    const [i, j] = cellOf(k);
    return [
      [i, j + 1],
      [i + 1, j + 1],
      [i + 1, j],
      [i, j],
    ].map(([a, b]) => ray([a * CELL, b * CELL]));
  });
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
    labels: data.index.map((maps) => `(${maps.map(matrix).join(", ")})`),
    linked: data.connection.some((rank) => rank > 0),
    retract,
    top,
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

  // the exit set of each index pair, while its index appears
  data.exits.forEach((exit, p) => {
    const a = phase(t, T.index[0] + LAG.index * p, T.index[1] + LAG.index * p) * out;
    if (a <= 0 || exit.length === 0) return;
    ctx.strokeStyle = C[SET_COLOR[p]];
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.globalAlpha = a * 0.6;
    for (const k of exit) {
      const [x, y, w, h] = rectOf(cellOf(k));
      ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
    }
    ctx.setLineDash([]);
  });

  // the Morse sets move aside and become the vertices of the Morse graph; the
  // later (larger) sets are drawn first, so the earlier ones stay in view. There the
  // first contracts to the equilibrium and the second retracts along rays from the
  // equilibrium onto the periodic orbit; their colors stay.
  // a point of the plane in the copy of Morse set p
  const toCopy = (p: number, [x, y]: Point): Point => {
    const [i0, i1, j0, j1] = scene.boxes[p];
    return [L.nodes[p][0] + (x / CELL - (i0 + i1) / 2) * L.mini, L.nodes[p][1] - (y / CELL - (j0 + j1) / 2) * L.mini];
  };
  const equilibrium = toCopy(0, [0, 0]);
  for (let p = data.sets.length - 1; p >= 0; p--) {
    const t0 = T.fly[0] + LAG.fly * p;
    const e = phase(t, t0, T.fly[1] + LAG.fly * p);
    const born = clamp01((t - t0) / 0.3);
    if (e <= 0 || out <= 0) continue;
    const h = phase(t, T.homotopy[0] + LAG.homotopy * p, T.homotopy[1] + LAG.homotopy * p);
    const color = C[SET_COLOR[p]];
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    // the cells, which fade as the point or the circle they deform onto appears
    const fade = out * (1 - phase(h, 0.75, 1));
    data.sets[p].forEach((k, m) => {
      if (fade <= 0) return;
      const [i, j] = cellOf(k);
      if (h <= 0) {
        const [x, y, w] = rectOf([i, j]);
        const [mx, my] = toCopy(p, [i * CELL, (j + 1) * CELL]);
        const rx = lerp(x, mx, e);
        const ry = lerp(y, my, e);
        const rw = lerp(w, L.mini, e);
        ctx.globalAlpha = out * born * (0.3 + 0.2 * e);
        ctx.fillRect(rx, ry, rw, rw);
        ctx.globalAlpha = out * born;
        ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rw - 1);
        return;
      }
      const corners: Point[] = [
        [i * CELL, (j + 1) * CELL],
        [(i + 1) * CELL, (j + 1) * CELL],
        [(i + 1) * CELL, j * CELL],
        [i * CELL, j * CELL],
      ];
      const targets = p === 0 ? corners.map((): Point => [0, 0]) : scene.retract[m];
      path(
        corners.map((c, r) => toCopy(p, [lerp(c[0], targets[r][0], h), lerp(c[1], targets[r][1], h)])),
        true,
      );
      ctx.globalAlpha = fade * 0.5;
      ctx.fill();
      ctx.globalAlpha = fade;
      ctx.stroke();
    });
    const shape = out * phase(h, 0.6, 1);
    if (shape > 0) {
      ctx.globalAlpha = shape;
      if (p === 0) {
        ctx.beginPath();
        ctx.arc(equilibrium[0], equilibrium[1], DOT_R, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.lineWidth = 2;
        path(scene.cycle.map((q) => toCopy(1, q)), true);
        ctx.stroke();
      }
    }
  }

  // the edge of the Morse graph, from the point down to the circle
  const arrow = phase(t, T.arrow[0], T.arrow[1]) * out;
  if (arrow > 0 && data.edges.some(([p, q]) => p === 0 && q === 1)) {
    ctx.strokeStyle = C.inkSoft;
    ctx.fillStyle = C.inkSoft;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = arrow;
    const end = toCopy(1, scene.top);
    arrowFrom([equilibrium[0], equilibrium[1] + DOT_R + 7], [end[0], end[1] - 7], arrow);
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
