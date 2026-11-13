import { describe, expect, it } from "vitest";
import { CELLS, STEPS, cellImage, hitCells, limitCycle, type Point } from "./outer-approximation";

// Hit sets for the four animated cells, computed separately with NumPy using
// the same RK4 scheme, 51 x 51 samples and padding. On all 144 cells of
// [-3, 3]^2 the 51 x 51 sets contain those from 1001 x 1001 samples.
const EXPECTED: Record<string, Point[]> = {
  "-5,5": [[-4, 1], [-4, 2], [-3, 2], [-3, 3], [-2, 3], [-2, 4], [-2, 5]],
  "-3,2": [[-2, 2], [-2, 3], [-2, 4], [-1, 3], [-1, 4], [-1, 5], [0, 4], [0, 5]],
  "-1,-1": [[-2, -2], [-2, -1], [-2, 0], [-1, -2], [-1, -1], [-1, 0], [0, -1], [0, 0]],
  "0,-3": [[-3, -5], [-3, -4], [-2, -6], [-2, -5], [-2, -4], [-2, -3], [-1, -5], [-1, -4]],
};

describe("outer approximation figure", () => {
  it("matches the reference hit sets", () => {
    for (const cell of CELLS) expect(hitCells(cell)).toEqual(EXPECTED[cell.join(",")]);
  });

  it("covers all four cells at the fixed point 0, which lies in the image of [-1/2, 0]^2", () => {
    const hit = hitCells([-1, -1]).map((c) => c.join(","));
    for (const c of ["-1,-1", "-1,0", "0,-1", "0,0"]) expect(hit).toContain(c);
  });

  it("keeps every image inside the drawn grid, which spans -3 <= y <= 3", () => {
    for (const cell of CELLS) {
      const image = cellImage(cell);
      for (const orbit of image.boundary) expect(Math.abs(orbit[STEPS][1])).toBeLessThanOrEqual(3);
      for (const [, j] of image.hit) {
        expect(j * 0.5).toBeGreaterThanOrEqual(-3);
        expect((j + 1) * 0.5).toBeLessThanOrEqual(3);
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
