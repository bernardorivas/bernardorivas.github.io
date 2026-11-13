import { describe, expect, it } from "vitest";
import { CELLS, STEPS, cellImage, hitCells, limitCycle, type Point } from "./outer-approximation";

// Hit sets for the five animated cells, computed separately with NumPy using
// the same RK4 scheme, 51 x 51 samples and padding. On all 256 cells of
// [-3, 3]^2 the NumPy and TypeScript sets agree, and the 51 x 51 sets contain
// those from 1001 x 1001 samples without padding.
const EXPECTED: Record<string, Point[]> = {
  "-7,5": [[-5, 2], [-4, 2], [-4, 3], [-3, 2], [-3, 3], [-3, 4], [-2, 3], [-2, 4], [-2, 5], [-1, 5]],
  "-4,3": [[2, 7], [3, 5], [3, 6], [3, 7], [4, 3], [4, 4], [4, 5], [4, 6], [5, 3], [5, 4]],
  "-1,-1": [[-2, -2], [-2, -1], [-2, 0], [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1]],
  "2,-4": [[-6, -5], [-6, -4], [-6, -3], [-6, -2], [-5, -6], [-5, -5], [-5, -4], [-5, -3], [-4, -6]],
  "6,-5": [[1, -5], [1, -4], [2, -5], [2, -4], [2, -3], [3, -4], [3, -3], [4, -3], [4, -2]],
};

describe("outer approximation figure", () => {
  it("matches the reference hit sets", () => {
    for (const cell of CELLS) expect(hitCells(cell)).toEqual(EXPECTED[cell.join(",")]);
  });

  it("covers all four cells at the fixed point 0, which lies in the image of [-h, 0]^2", () => {
    const hit = hitCells([-1, -1]).map((c) => c.join(","));
    for (const c of ["-1,-1", "-1,0", "0,-1", "0,0"]) expect(hit).toContain(c);
  });

  it("keeps the images of the animated cells inside the grid, which spans -3 <= x, y <= 3", () => {
    for (const cell of CELLS) {
      const image = cellImage(cell);
      for (const orbit of image.boundary) {
        expect(Math.abs(orbit[STEPS][0])).toBeLessThanOrEqual(3);
        expect(Math.abs(orbit[STEPS][1])).toBeLessThanOrEqual(3);
      }
      for (const [i, j] of hitCells(cell)) {
        for (const k of [i, j]) {
          expect(k).toBeGreaterThanOrEqual(-8);
          expect(k).toBeLessThan(8);
        }
      }
    }
  });

  it("closes the limit cycle after one period of about 6.66", () => {
    const cycle = limitCycle();
    expect(cycle.length * 0.01).toBeCloseTo(6.66, 1);
    const [a, b] = [cycle[0], cycle[cycle.length - 1]];
    expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeLessThan(0.05);
  });
});
