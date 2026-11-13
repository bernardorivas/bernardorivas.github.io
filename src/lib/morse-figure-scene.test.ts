import { describe, expect, it } from "vitest";
import { figureData } from "./morse-figure";
import { CYCLE_S, STILL, drawFrame, makeScene, staticPart, type Palette } from "./morse-figure-scene";

const C: Palette = {
  paper: "#faf9f5",
  ink: "#181c22",
  inkSoft: "#535c69",
  line: "#ddd9cd",
  graph: "#7188a3",
  blue: "#173d63",
  gold: "#87591f",
  serif: "serif",
};

// a 2D context that records every call and property assignment
function recorder() {
  const log: string[] = [];
  const state: Record<string | symbol, unknown> = {};
  const show = (v: unknown) => (typeof v === "number" ? v.toFixed(4) : String(v));
  const ctx = new Proxy(state, {
    get: (_, key) =>
      key in state ? state[key] : (...args: unknown[]) => void log.push(`${String(key)}(${args.map(show).join(",")})`),
    set: (_, key, value) => {
      state[key] = value;
      log.push(`${String(key)}=${show(value)}`);
      return true;
    },
  });
  return { ctx: ctx as unknown as CanvasRenderingContext2D, log };
}

const scene = makeScene(figureData());

function frame(W: number, H: number, t: number) {
  const { ctx, log } = recorder();
  drawFrame(ctx, W, H, t, C, scene, 2);
  return log;
}

describe("figure frames", () => {
  it("draws the same frame throughout each static stretch", () => {
    const stretches = new Map<number, number[]>();
    for (let t = 0; t < CYCLE_S; t += 0.01) {
      const part = staticPart(t);
      if (part >= 0) stretches.set(part, [...(stretches.get(part) ?? []), t]);
    }
    expect(stretches.size).toBe(4);
    for (const times of stretches.values()) {
      for (const [W, H] of [[773, 435], [360, 480]]) {
        const first = frame(W, H, times[0]);
        expect(frame(W, H, times[Math.floor(times.length / 2)])).toEqual(first);
        expect(frame(W, H, times[times.length - 1])).toEqual(first);
      }
    }
  });

  it("shows both Conley indices in the still frame", () => {
    const text = frame(773, 435, STILL).filter((entry) => entry.startsWith("fillText"));
    expect(text.map((entry) => entry.split(",")[0])).toEqual(["fillText((0", "fillText(([1]"]);
  });

  it("never draws NaN or negative sizes at the canvas sizes the page allows", () => {
    const bad: string[] = [];
    for (const [W, H] of [[773, 435], [521, 293], [520, 693], [288, 384]]) {
      for (let t = 0; t < CYCLE_S; t += 0.2) {
        for (const entry of frame(W, H, t)) {
          if (entry.includes("NaN")) bad.push(`${W}x${H} t=${t.toFixed(1)} ${entry}`);
          else if (entry.startsWith("fillRect(") || entry.startsWith("strokeRect(")) {
            const [, , w, h] = entry.slice(entry.indexOf("(") + 1, -1).split(",").map(Number);
            if (Math.min(w, h) < 0) bad.push(`${W}x${H} t=${t.toFixed(1)} ${entry}`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  }, 30000);
});
