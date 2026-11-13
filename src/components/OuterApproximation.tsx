"use client";

// Animation for the Software page: one grid cell at a time is carried by the
// time-tau map of the Van der Pol flow, and the cells its image hits are
// shaded. The geometry lives in src/lib/outer-approximation.ts; this file only
// draws it. Every frame is a function of the clock, which runs only while the
// figure is on screen and playing.

import { useEffect, useRef } from "react";
import { softwareCopy } from "@/data/copy";
import {
  CELL,
  CELLS,
  STEPS,
  along,
  cellImage,
  limitCycle,
  type CellImage,
  type Point,
} from "@/lib/outer-approximation";

// seconds spent on each cell, and on the whole loop
const STEP_S = 4.5;
const CYCLE_S = STEP_S * CELLS.length;
// visible half-height of the phase plane
const Y_HALF = 3.25;
// frame shown when motion is reduced: the second cell with its hit cells shaded
const STILL = STEP_S + 3.4;

const clamp01 = (s: number) => Math.min(1, Math.max(0, s));
const ease = (s: number) => {
  const u = clamp01(s);
  return u * u * (3 - 2 * u);
};
const phase = (t: number, a: number, b: number) => ease((t - a) / (b - a));

export default function OuterApproximation() {
  const figureRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const rangeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const figure = figureRef.current;
    const canvas = canvasRef.current;
    const toggle = toggleRef.current;
    const range = rangeRef.current;
    if (!figure || !canvas || !toggle || !range) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: CellImage[] = CELLS.map(cellImage);
    const cycle = limitCycle();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let paused = reducedMotion.matches;
    let visible = false;
    let clock = paused ? STILL : 0;
    let last: number | null = null;
    let raf = 0;
    let palette = { paper: "", ink: "", inkSoft: "", line: "", graph: "", blue: "", gold: "" };

    function readPalette() {
      const styles = getComputedStyle(document.documentElement);
      const v = (name: string) => styles.getPropertyValue(name).trim();
      palette = {
        paper: v("--paper"),
        ink: v("--ink"),
        inkSoft: v("--ink-soft"),
        line: v("--line"),
        graph: v("--graph"),
        blue: v("--blue"),
        gold: v("--gold"),
      };
    }

    function sizeCanvas() {
      const box = canvas!.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(box.width * ratio));
      const height = Math.max(1, Math.round(box.height * ratio));
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
      }
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      return { width: box.width, height: box.height };
    }

    function draw() {
      const { width: W, height: H } = sizeCanvas();
      const c = ctx!;
      const s = H / (2 * Y_HALF);
      const X = (x: number) => W / 2 + x * s;
      const Y = (y: number) => H / 2 - y * s;
      const P = (p: Point): Point => [X(p[0]), Y(p[1])];
      const side = CELL * s;
      const cellRect = ([i, j]: Point) => [X(i * CELL), Y((j + 1) * CELL), side, side] as const;
      const path = (pts: Point[], close = false) => {
        c.beginPath();
        pts.forEach((p, k) => (k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
        if (close) c.closePath();
      };

      c.clearRect(0, 0, W, H);

      // the whole cells that fit in the canvas, centered on the origin
      c.globalAlpha = 1;
      c.strokeStyle = palette.line;
      c.lineWidth = 1;
      c.beginPath();
      const nx = Math.floor(W / 2 / side);
      const ny = Math.floor(H / 2 / side);
      for (let i = -nx; i <= nx; i++) {
        c.moveTo(X(i * CELL), Y(ny * CELL));
        c.lineTo(X(i * CELL), Y(-ny * CELL));
      }
      for (let j = -ny; j <= ny; j++) {
        c.moveTo(X(-nx * CELL), Y(j * CELL));
        c.lineTo(X(nx * CELL), Y(j * CELL));
      }
      c.stroke();

      c.setLineDash([3, 4]);
      c.strokeStyle = palette.graph;
      path(cycle.map(P), true);
      c.stroke();
      c.setLineDash([]);

      const t = clock % CYCLE_S;
      range!.value = String(t);
      const image = images[Math.floor(t / STEP_S)];
      const u = t % STEP_S;
      const env = 1 - phase(u, STEP_S - 0.5, STEP_S);
      const k = phase(u, 0.7, 2.4) * STEPS;

      // cells hit by the image
      const cover = phase(u, 2.5, 3.1) * env;
      if (cover > 0) {
        c.fillStyle = palette.blue;
        c.strokeStyle = palette.blue;
        for (const cell of image.hit) {
          const [x, y, w, h] = cellRect(cell);
          c.globalAlpha = cover * 0.22;
          c.fillRect(x, y, w, h);
          c.globalAlpha = cover;
          c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        }
      }

      // the cell
      const shown = phase(u, 0, 0.5) * env;
      const [x, y, w, h] = cellRect(image.cell);
      c.globalAlpha = shown * 0.3;
      c.fillStyle = palette.gold;
      c.fillRect(x, y, w, h);
      c.globalAlpha = shown;
      c.strokeStyle = palette.gold;
      c.lineWidth = 1.8;
      c.strokeRect(x, y, w, h);

      // orbits of the corners, the moving image, and sample points inside it
      const moving = phase(u, 0.6, 0.8) * env;
      if (moving > 0) {
        c.globalAlpha = moving * 0.7;
        c.strokeStyle = palette.graph;
        c.lineWidth = 1;
        for (const orbit of image.corners) {
          const pts = orbit.slice(0, Math.floor(k) + 1).map(P);
          pts.push(P(along(orbit, k)));
          path(pts);
          c.stroke();
        }
        const outline = image.boundary.map((orbit) => P(along(orbit, k)));
        c.globalAlpha = moving * 0.14;
        c.fillStyle = palette.blue;
        path(outline, true);
        c.fill();
        c.globalAlpha = moving;
        c.strokeStyle = palette.blue;
        c.lineWidth = 1.8;
        path(outline, true);
        c.stroke();
        c.globalAlpha = moving * 0.85;
        c.fillStyle = palette.ink;
        for (const orbit of image.dots) {
          const [px, py] = P(along(orbit, k));
          c.beginPath();
          c.arc(px, py, 1.5, 0, Math.PI * 2);
          c.fill();
        }
      }

      // the equilibrium
      c.globalAlpha = 1;
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(X(0), Y(0), 3, 0, Math.PI * 2);
      c.fillStyle = palette.paper;
      c.fill();
      c.strokeStyle = palette.ink;
      c.stroke();
    }

    function frame(now: number) {
      raf = 0;
      // cap the step so returning to a background tab does not jump the clock
      if (last !== null) clock += Math.min(0.1, (now - last) / 1000);
      last = now;
      draw();
      if (!paused && visible) raf = window.requestAnimationFrame(frame);
      else last = null;
    }

    function play() {
      if (!raf && !paused && visible) raf = window.requestAnimationFrame(frame);
    }

    function syncToggle() {
      const label = paused ? "Play animation" : "Pause animation";
      toggle!.setAttribute("aria-pressed", String(paused));
      toggle!.setAttribute("aria-label", label);
      toggle!.setAttribute("title", label);
      toggle!.dataset.state = paused ? "paused" : "playing";
    }

    function onToggleClick() {
      paused = !paused;
      syncToggle();
      play();
    }
    toggle.addEventListener("click", onToggleClick);

    // dragging the time bar pauses the animation at that time
    function onScrub() {
      clock = Math.min(Number(range!.value), CYCLE_S - 1e-3);
      if (!paused) {
        paused = true;
        syncToggle();
      }
      draw();
    }
    range.addEventListener("input", onScrub);

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries[0] ? entries[0].isIntersecting : true;
          if (visible) {
            draw();
            play();
          }
        },
        { rootMargin: "80px" },
      );
      observer.observe(figure);
    } else {
      visible = true;
    }

    const onTheme = () => {
      readPalette();
      draw();
    };
    const themeObserver = new MutationObserver(onTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", onTheme);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver(() => draw());
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", draw, { passive: true });
    }

    readPalette();
    syncToggle();
    draw();
    play();

    return () => {
      window.cancelAnimationFrame(raf);
      toggle.removeEventListener("click", onToggleClick);
      range.removeEventListener("input", onScrub);
      observer?.disconnect();
      themeObserver.disconnect();
      scheme.removeEventListener("change", onTheme);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, []);

  const copy = softwareCopy.oaFigure;
  return (
    <figure className="oa-figure" ref={figureRef}>
      <canvas ref={canvasRef} className="oa-canvas" width={960} height={540} role="img" aria-label={copy.aria}>
        {copy.aria}
      </canvas>
      <div className="oa-controls">
        <button
          ref={toggleRef}
          type="button"
          className="simulation-toggle"
          aria-label="Pause animation"
          aria-pressed={false}
          data-state="playing"
          title="Pause animation"
        />
        <input ref={rangeRef} type="range" min={0} max={CYCLE_S} step="any" defaultValue={0} aria-label="Time" />
      </div>
    </figure>
  );
}
