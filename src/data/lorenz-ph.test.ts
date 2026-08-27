import { describe, expect, it } from "vitest";
import data from "./lorenz-ph.json";

// The animation only draws what this file contains, so the invariants the
// component relies on (window indices in range, pairs below the diagonal and
// inside the filtration cap) are pinned here.
describe("lorenz persistence data", () => {
  it("covers every frame window with trajectory samples", () => {
    expect(data.traj.length).toBeGreaterThan(0);
    expect(data.frames.length).toBeGreaterThan(0);
    for (const frame of data.frames) {
      expect(frame.i1 - frame.i0).toBe(data.meta.window);
      expect(frame.i0).toBeGreaterThanOrEqual(0);
      expect(frame.i1).toBeLessThanOrEqual(data.traj.length);
    }
  });

  it("advances the window by the declared step", () => {
    data.frames.forEach((frame, k) => {
      expect(frame.i0).toBe(k * data.meta.step);
    });
  });

  it("keeps persistence pairs below the diagonal and inside the cap", () => {
    for (const frame of data.frames) {
      for (const [birth, death] of frame.h1) {
        expect(birth).toBeGreaterThanOrEqual(0);
        expect(birth).toBeLessThan(death);
        expect(death).toBeLessThanOrEqual(data.meta.axisMax);
      }
    }
  });

  it("keeps at least one visible loop in most frames", () => {
    const visible = data.frames.filter(
      (frame) => frame.h1.some(([b, d]) => d - b > 1.5),
    ).length;
    expect(visible / data.frames.length).toBeGreaterThan(0.7);
  });
});
