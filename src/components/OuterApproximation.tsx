"use client";

// Animation for the Software page: a few grid cells are carried by the time-tau
// map of the Van der Pol flow and the cells covering their images are shaded;
// then the outer approximation from padded samples is drawn as a graph on every
// cell, its Morse sets are singled out, and they move into the Morse graph, where
// the first closes into a sphere and the second shrinks to the periodic orbit.
// The page computes the graph and the indices at build time (src/lib/morse-figure.ts);
// this file only runs the clock, and src/lib/morse-figure-scene.ts draws each frame.

import { useEffect, useRef } from "react";
import { softwareCopy } from "@/data/copy";
import type { FigureData } from "@/lib/morse-figure";
import { CYCLE_S, STILL, drawFrame, makeScene, staticPart, type Palette } from "@/lib/morse-figure-scene";

export default function OuterApproximation({ data }: { data: FigureData }) {
  const figureRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const figure = figureRef.current;
    const canvas = canvasRef.current;
    const toggle = toggleRef.current;
    if (!figure || !canvas || !toggle) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scene = makeScene(data);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let paused = reducedMotion.matches;
    let visible = false;
    let clock = paused ? STILL : 0;
    let last: number | null = null;
    let raf = 0;
    // the static stretch of the loop shown by the last drawn frame, or -1
    let drawnPart = -1;
    let palette: Palette = { paper: "", ink: "", inkSoft: "", line: "", graph: "", blue: "", gold: "", serif: "serif" };

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
        serif: v("--font-serif") || "serif",
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
      return { width: box.width, height: box.height, ratio };
    }

    function draw() {
      const { width, height, ratio } = sizeCanvas();
      const t = clock % CYCLE_S;
      drawFrame(ctx!, width, height, t, palette, scene, ratio);
      drawnPart = staticPart(t);
    }

    function frame(now: number) {
      raf = 0;
      // cap the step so returning to a background tab does not jump the clock
      if (last !== null) clock += Math.min(0.1, (now - last) / 1000);
      last = now;
      // schedule the next frame first, so a failed draw cannot end the loop
      if (!paused && visible) raf = window.requestAnimationFrame(frame);
      else last = null;
      // within a stretch where the picture does not change there is nothing to
      // draw; resizing or a theme change redraw through draw() directly
      const part = staticPart(clock % CYCLE_S);
      if (part < 0 || part !== drawnPart) draw();
    }

    function play() {
      if (!raf && !paused && visible) raf = window.requestAnimationFrame(frame);
    }

    function syncToggle() {
      const label = paused ? "Play animation" : "Pause animation";
      // the label names what a click does, so the button carries no pressed state
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
      observer?.disconnect();
      themeObserver.disconnect();
      scheme.removeEventListener("change", onTheme);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [data]);

  const copy = softwareCopy.oaFigure;
  return (
    <figure className="oa-figure" ref={figureRef}>
      <canvas ref={canvasRef} className="oa-canvas" width={960} height={540} role="img" aria-label={copy.aria}>
        {copy.aria}
      </canvas>
      {/* the only control: a pause button in the corner of the figure (see .oa-toggle) */}
      <button
        ref={toggleRef}
        type="button"
        className="simulation-toggle oa-toggle"
        aria-label="Pause animation"
        data-state="playing"
        title="Pause animation"
      />
    </figure>
  );
}
