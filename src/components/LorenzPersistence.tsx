"use client";

// Two-panel animation for the Research page: a sliding window [t_i, t_f] along
// a Lorenz trajectory (left) and the degree-one persistence diagram of the
// windowed points (right). All persistence pairs are precomputed offline
// (scratchpad gen_lorenz_ph.py, ripser on the 3D window subsample) and shipped
// in src/data/lorenz-ph.json; this component only draws.
//
// The DOM/lifecycle plumbing (imperative pause button, palette re-read on theme
// change, IntersectionObserver gating) follows the retired LorenzCanvas
// component, so SSR renders the static markup and the effect takes over after
// hydration.

import { useEffect, useRef } from "react";
import { researchCopy } from "@/data/copy";
import data from "@/data/lorenz-ph.json";

// Projection window for the (x, z) plane, matching the retired lib/lorenz.ts.
const X_MIN = -21;
const X_MAX = 21;
const Z_MIN = 0;
const Z_MAX = 52;

const FRAME_MS = 45;

type Pair = [number, number];
type Frame = { i0: number; i1: number; h1: Pair[] };

const traj = data.traj as Pair[];
const frames = data.frames as Frame[];
const { dt, t0, axisMax } = data.meta;

// Open on a frame whose diagram carries two salient loops, so the first paint
// (and the reduced-motion static view) is representative rather than empty.
const START_FRAME = Math.max(
  0,
  frames.findIndex((f) => f.h1.filter(([b, d]) => d - b > 1.5).length >= 2),
);

export default function LorenzPersistence() {
  const figureRef = useRef<HTMLElement | null>(null);
  const trajCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const diagramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const figure = figureRef.current;
    const trajCanvas = trajCanvasRef.current;
    const diagramCanvas = diagramCanvasRef.current;
    const toggle = toggleRef.current;
    if (!figure || !trajCanvas || !diagramCanvas || !toggle) return;
    const trajCtx = trajCanvas.getContext("2d");
    const diagramCtx = diagramCanvas.getContext("2d");
    if (!trajCtx || !diagramCtx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let paused = reducedMotion.matches;
    let visible = true;
    let cursor = START_FRAME;
    let lastFrame = 0;
    let raf = 0;
    let palette = { line: "", graph: "", blue: "", gold: "", inkSoft: "" };
    const mono = '11px ui-monospace, "SF Mono", Menlo, monospace';

    function readPalette() {
      const styles = getComputedStyle(document.documentElement);
      palette = {
        line: styles.getPropertyValue("--line").trim(),
        graph: styles.getPropertyValue("--graph").trim(),
        blue: styles.getPropertyValue("--blue").trim(),
        gold: styles.getPropertyValue("--gold").trim(),
        inkSoft: styles.getPropertyValue("--ink-soft").trim(),
      };
    }

    function sizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
      const box = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(box.width * ratio));
      const height = Math.max(1, Math.round(box.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      return { width: box.width, height: box.height };
    }

    function drawTrajectory(frame: Frame) {
      const { width, height } = sizeCanvas(trajCanvas!, trajCtx!);
      const ctx = trajCtx!;
      const pad = Math.max(14, width * 0.06);
      const scale = Math.min(
        (width - 2 * pad) / (X_MAX - X_MIN),
        (height - 2 * pad) / (Z_MAX - Z_MIN),
      );
      const ox = (width - (X_MAX - X_MIN) * scale) / 2;
      const oy = (height - (Z_MAX - Z_MIN) * scale) / 2;
      const px = (p: Pair) => ox + (p[0] - X_MIN) * scale;
      const py = (p: Pair) => oy + (Z_MAX - p[1]) * scale;

      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      traj.forEach((p, i) => {
        if (i === 0) ctx.moveTo(px(p), py(p));
        else ctx.lineTo(px(p), py(p));
      });
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = palette.graph;
      ctx.lineWidth = 0.8;
      ctx.lineJoin = "round";
      ctx.stroke();

      ctx.beginPath();
      for (let i = frame.i0; i < frame.i1; i += 1) {
        if (i === frame.i0) ctx.moveTo(px(traj[i]), py(traj[i]));
        else ctx.lineTo(px(traj[i]), py(traj[i]));
      }
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = palette.blue;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.stroke();

      const head = traj[frame.i1 - 1];
      ctx.beginPath();
      ctx.arc(px(head), py(head), 3, 0, Math.PI * 2);
      ctx.globalAlpha = 1;
      ctx.fillStyle = palette.gold;
      ctx.fill();

      const ti = (t0 + frame.i0 * dt).toFixed(1);
      const tf = (t0 + frame.i1 * dt).toFixed(1);
      ctx.fillStyle = palette.inkSoft;
      ctx.font = mono;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(`t ∈ [${ti}, ${tf}]`, pad * 0.5, height - 8);
    }

    function drawDiagram(frame: Frame) {
      const { width, height } = sizeCanvas(diagramCanvas!, diagramCtx!);
      const ctx = diagramCtx!;
      const mLeft = 34;
      const mBottom = 30;
      const mTop = 12;
      const mRight = 14;
      const side = Math.min(width - mLeft - mRight, height - mTop - mBottom);
      const x0 = mLeft + (width - mLeft - mRight - side) / 2;
      const y1 = height - mBottom - (height - mTop - mBottom - side) / 2;
      const sx = (v: number) => x0 + (v / axisMax) * side;
      const sy = (v: number) => y1 - (v / axisMax) * side;

      ctx.clearRect(0, 0, width, height);

      // The death < birth half is unreachable; shade it like graph paper.
      ctx.beginPath();
      ctx.moveTo(sx(0), sy(0));
      ctx.lineTo(sx(axisMax), sy(axisMax));
      ctx.lineTo(sx(axisMax), sy(0));
      ctx.closePath();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = palette.line;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(sx(0), sy(0));
      ctx.lineTo(sx(axisMax), sy(axisMax));
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = palette.line;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(sx(0), sy(axisMax));
      ctx.lineTo(sx(0), sy(0));
      ctx.lineTo(sx(axisMax), sy(0));
      ctx.strokeStyle = palette.inkSoft;
      ctx.stroke();

      ctx.font = mono;
      ctx.fillStyle = palette.inkSoft;
      ctx.globalAlpha = 1;
      for (let v = 0; v <= axisMax; v += 5) {
        ctx.beginPath();
        ctx.moveTo(sx(v), sy(0));
        ctx.lineTo(sx(v), sy(0) + 4);
        ctx.moveTo(sx(0), sy(v));
        ctx.lineTo(sx(0) - 4, sy(v));
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(String(v), sx(v), sy(0) + 7);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(String(v), sx(0) - 7, sy(v));
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("birth", sx(axisMax / 2), sy(0) + 18);
      ctx.save();
      ctx.translate(x0 - 24, sy(axisMax / 2));
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = "bottom";
      ctx.fillText("death", 0, 0);
      ctx.restore();

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = palette.blue;
      frame.h1.forEach(([b, d]) => {
        ctx.beginPath();
        ctx.arc(sx(b), sy(d), 2.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function draw() {
      const frame = frames[cursor];
      if (!frame) return;
      drawTrajectory(frame);
      drawDiagram(frame);
    }

    function syncToggle() {
      toggle!.setAttribute("aria-pressed", String(paused));
      toggle!.textContent = paused ? "Play motion" : "Pause motion";
    }

    function animate(timestamp: number) {
      if (!paused && visible && timestamp - lastFrame > FRAME_MS) {
        cursor = (cursor + 1) % frames.length;
        draw();
        lastFrame = timestamp;
      }
      raf = window.requestAnimationFrame(animate);
    }

    function onToggleClick() {
      paused = !paused;
      syncToggle();
      draw();
    }
    toggle.addEventListener("click", onToggleClick);

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries[0] ? entries[0].isIntersecting : true;
          if (visible) draw();
        },
        { rootMargin: "80px" },
      );
      observer.observe(figure);
    }

    const themeObserver = new MutationObserver(() => {
      readPalette();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let resizeObserver: ResizeObserver | undefined;
    const onResize = () => draw();
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver(() => draw());
      resizeObserver.observe(trajCanvas);
    } else {
      window.addEventListener("resize", onResize, { passive: true });
    }

    readPalette();
    syncToggle();
    draw();
    raf = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(raf);
      toggle.removeEventListener("click", onToggleClick);
      observer?.disconnect();
      themeObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const copy = researchCopy.phFigure;
  return (
    <figure className="research-figure" ref={figureRef}>
      <div className="figure-pair figure-pair-even">
        <div className="figure-panel figure-panel-canvas">
          <canvas ref={trajCanvasRef} className="ph-canvas" width={480} height={480} aria-label={copy.trajAria}>
            {copy.trajAria}
          </canvas>
          <span>{copy.trajLabel}</span>
        </div>
        <div className="figure-panel figure-panel-canvas">
          <canvas ref={diagramCanvasRef} className="ph-canvas" width={480} height={480} aria-label={copy.diagramAria}>
            {copy.diagramAria}
          </canvas>
          <span>{copy.diagramLabel}</span>
        </div>
      </div>
      <div className="figure-controls">
        <button ref={toggleRef} type="button" className="simulation-toggle" aria-pressed={false}>
          Pause motion
        </button>
      </div>
      <figcaption>{copy.caption}</figcaption>
    </figure>
  );
}
