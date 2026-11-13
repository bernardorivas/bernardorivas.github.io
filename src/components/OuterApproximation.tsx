"use client";

// Animation for the Software page: a few grid cells are carried by the time-tau
// map of the Van der Pol flow and the cells covering their images are shaded;
// then the outer approximation from padded samples is drawn as a graph on every
// cell, its Morse sets are singled out, and they move into the Morse graph with
// their Conley indices.
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
  const rangeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const figure = figureRef.current;
    const canvas = canvasRef.current;
    const toggle = toggleRef.current;
    const range = rangeRef.current;
    if (!figure || !canvas || !toggle || !range) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scene = makeScene(data);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let paused = reducedMotion.matches;
    let visible = false;
    let clock = paused ? STILL : 0;
    let last: number | null = null;
    let raf = 0;
    let scrubbing = false;
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
      range!.value = String(t);
      drawFrame(ctx!, width, height, t, palette, scene, ratio);
      drawnPart = staticPart(t);
    }

    function frame(now: number) {
      raf = 0;
      // cap the step so returning to a background tab does not jump the clock
      // while the time bar is held, the clock stays where the bar puts it
      if (last !== null && !scrubbing) clock += Math.min(0.1, (now - last) / 1000);
      last = now;
      // schedule the next frame first, so a failed draw cannot end the loop
      if (!paused && visible) raf = window.requestAnimationFrame(frame);
      else last = null;
      // within a stretch where the picture does not change, only the time bar moves;
      // resizing, a theme change or the time bar redraw through draw() directly
      const t = clock % CYCLE_S;
      const part = staticPart(t);
      if (part >= 0 && part === drawnPart) range!.value = String(t);
      else draw();
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

    // dragging the time bar moves the clock; playback continues from there on release
    function onScrub() {
      clock = Math.min(Number(range!.value), CYCLE_S - 1e-3);
      draw();
    }
    const onScrubStart = () => {
      scrubbing = true;
    };
    const onScrubEnd = () => {
      scrubbing = false;
    };
    range.addEventListener("input", onScrub);
    range.addEventListener("pointerdown", onScrubStart);
    window.addEventListener("pointerup", onScrubEnd);
    window.addEventListener("pointercancel", onScrubEnd);

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
      range.removeEventListener("pointerdown", onScrubStart);
      window.removeEventListener("pointerup", onScrubEnd);
      window.removeEventListener("pointercancel", onScrubEnd);
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
