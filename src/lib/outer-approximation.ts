// Van der Pol flow x' = y, y' = (1 - x^2) y - x, its time-TAU map, and the
// grid cells hit by the images of sample points of a cell. Cell (i, j) is the
// square [i h, (i + 1) h] x [j h, (j + 1) h] with h = CELL, and the grid is the
// 2 HALF x 2 HALF cells of [-3, 3]^2, those with -HALF <= i, j < HALF.
//
// hitCells approximates the smallest outer approximation, the closed cells
// that meet f(|xi|), so that f(|xi|) lies in the interior of their union. It
// pads sampled image points instead of using rigorous enclosures.

export type Point = [number, number];

export const CELL = 0.375;
export const HALF = 8;
export const TAU = 1.3;
// RK4 steps over [0, TAU]
export const STEPS = 52;
// a cell is sampled at (x0 + k h / SAMPLES, y0 + l h / SAMPLES), 0 <= k, l <= SAMPLES
export const SAMPLES = 50;
// the cells the figure carries along the flow one at a time, in order
export const CELLS: Point[] = [
  [-7, 5],
  [-4, 3],
  [-1, -1],
  [2, -4],
  [6, -5],
];

function field(x: number, y: number): Point {
  return [y, (1 - x * x) * y - x];
}

export function rk4([x, y]: Point, dt: number): Point {
  const k1 = field(x, y);
  const k2 = field(x + (dt / 2) * k1[0], y + (dt / 2) * k1[1]);
  const k3 = field(x + (dt / 2) * k2[0], y + (dt / 2) * k2[1]);
  const k4 = field(x + dt * k3[0], y + dt * k3[1]);
  return [
    x + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    y + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
  ];
}

// the orbit of p at times 0, TAU / STEPS, ..., TAU
export function flowSteps(p: Point): Point[] {
  const out: Point[] = [p];
  for (let k = 0; k < STEPS; k++) out.push((p = rk4(p, TAU / STEPS)));
  return out;
}

// the image of p under the time-TAU map, the last point of flowSteps(p)
export function timeMap(p: Point): Point {
  for (let k = 0; k < STEPS; k++) p = rk4(p, TAU / STEPS);
  return p;
}

// one period of the limit cycle, between two downward crossings of the positive x-axis
export function limitCycle(dt = 0.01): Point[] {
  let p: Point = [2, 0];
  for (let i = 0; i < 4000; i++) p = rk4(p, dt);
  const pts: Point[] = [];
  let crossings = 0;
  for (let i = 0; i < 4000 && crossings < 2; i++) {
    const q = rk4(p, dt);
    if (p[1] > 0 && q[1] <= 0 && q[0] > 0) crossings++;
    if (crossings === 1) pts.push(q);
    p = q;
  }
  return pts;
}

// Indices of the closed cells meeting the image of cell (i, j), sorted. Each
// sampled image point q stands for the box q + [-d, d]^2, where d is the largest
// sup-norm distance between the images of adjacent sample points; to first order
// every point of the image lies within d of a sampled one. Cells outside the
// grid are included.
export function hitCells([i, j]: Point): Point[] {
  const n = SAMPLES;
  const img: Point[][] = [];
  for (let k = 0; k <= n; k++) {
    const row: Point[] = [];
    for (let l = 0; l <= n; l++) row.push(timeMap([i * CELL + (CELL * k) / n, j * CELL + (CELL * l) / n]));
    img.push(row);
  }
  const gap = (a: Point, b: Point) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
  let d = 0;
  for (let k = 0; k <= n; k++) {
    for (let l = 0; l <= n; l++) {
      if (k < n) d = Math.max(d, gap(img[k][l], img[k + 1][l]));
      if (l < n) d = Math.max(d, gap(img[k][l], img[k][l + 1]));
    }
  }
  const seen = new Set<string>();
  const out: Point[] = [];
  for (const row of img) {
    for (const [x, y] of row) {
      // the closed cell [a h, (a + 1) h] meets [x - d, x + d] iff these bounds hold, likewise in y
      for (let a = Math.ceil((x - d) / CELL) - 1; a <= Math.floor((x + d) / CELL); a++) {
        for (let b = Math.ceil((y - d) / CELL) - 1; b <= Math.floor((y + d) / CELL); b++) {
          const key = `${a},${b}`;
          if (!seen.has(key)) {
            seen.add(key);
            out.push([a, b]);
          }
        }
      }
    }
  }
  return out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

export type CellImage = {
  cell: Point;
  // orbits over [0, TAU] of points around the boundary, in order
  boundary: Point[][];
  // orbits of the four corners
  corners: Point[][];
  // orbits of a 5 x 5 grid of interior points
  dots: Point[][];
};

export function cellImage(cell: Point): CellImage {
  const x0 = cell[0] * CELL;
  const y0 = cell[1] * CELL;
  const h = CELL;
  const m = 16;
  const edge: Point[] = [];
  for (let k = 0; k < m; k++) edge.push([x0 + (h * k) / m, y0]);
  for (let k = 0; k < m; k++) edge.push([x0 + h, y0 + (h * k) / m]);
  for (let k = 0; k < m; k++) edge.push([x0 + h - (h * k) / m, y0 + h]);
  for (let k = 0; k < m; k++) edge.push([x0, y0 + h - (h * k) / m]);
  const dots: Point[] = [];
  for (let a = 0; a < 5; a++) {
    for (let b = 0; b < 5; b++) dots.push([x0 + (h * (a + 0.5)) / 5, y0 + (h * (b + 0.5)) / 5]);
  }
  return {
    cell,
    boundary: edge.map(flowSteps),
    corners: [0, m, 2 * m, 3 * m].map((k) => flowSteps(edge[k])),
    dots: dots.map(flowSteps),
  };
}

// position at the fractional step s in [0, STEPS] along a precomputed orbit
export function along(steps: Point[], s: number): Point {
  const k = Math.min(STEPS - 1, Math.floor(s));
  const f = s - k;
  return [steps[k][0] + (steps[k + 1][0] - steps[k][0]) * f, steps[k][1] + (steps[k + 1][1] - steps[k][1]) * f];
}
