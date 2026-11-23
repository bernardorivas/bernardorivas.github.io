"use client";

import { useEffect, useRef, useState } from "react";
import { createDrawing, duration, palettes, squareSize, torusSize } from "./drawing";
import styles from "./donut.module.css";

export default function DonutAnimation() {
  const torus = useRef(null);
  const square = useRef(null);
  const progress = useRef(null);
  const player = useRef(null);
  const [playback, setPlayback] = useState("loading");

  useEffect(() => {
    const paint = createDrawing(torus.current, square.current);
    if (!paint) {
      setPlayback("unavailable");
      return;
    }

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let time = 0;
    let frame = 0;
    let startedAt = 0;

    function seek(value) {
      time = value;
      progress.current.value = String(Math.round(time));
      paint(time);
    }

    function tick(now) {
      seek(Math.min(duration, now - startedAt));
      if (time < duration) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        setPlayback("finished");
      }
    }

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function play() {
      if (time === duration) seek(0);
      startedAt = performance.now() - time;
      setPlayback("playing");
      frame = requestAnimationFrame(tick);
    }

    function respectMotion() {
      stop();
      if (motion.matches) {
        seek(duration);
        setPlayback("finished");
      } else {
        seek(0);
        play();
      }
    }

    player.current = {
      toggle() {
        if (frame) {
          stop();
          setPlayback("paused");
        } else {
          play();
        }
      },
      scrub(value) {
        stop();
        seek(value);
        setPlayback(value === duration ? "finished" : "paused");
      },
    };

    respectMotion();
    motion.addEventListener("change", respectMotion);
    return () => {
      stop();
      motion.removeEventListener("change", respectMotion);
      player.current = null;
    };
  }, []);

  const buttonLabel = {
    loading: "Play",
    unavailable: "Play",
    playing: "Pause",
    paused: "Play",
    finished: "Replay",
  }[playback];
  const disabled = playback === "loading" || playback === "unavailable";

  return (
    <figure className={styles.figure} aria-label="Two loops on a torus and its fundamental square">
      <div className={styles.panels}>
        <section className={styles.torusPanel} aria-labelledby="donut-surface">
          <h2 id="donut-surface">Donut surface</h2>
          <canvas ref={torus} width={torusSize.width} height={torusSize.height} role="img" aria-label="A blue loop goes around the central opening. An orange loop wraps around the tube, with hidden segments shown as dashed lines." />
        </section>
        <section className={styles.squarePanel} aria-labelledby="donut-square">
          <h2 id="donut-square">Square with glued edges</h2>
          <canvas ref={square} width={squareSize.width} height={squareSize.height} role="img" aria-label="The blue loop joins the left and right edges. The orange loop joins the bottom and top edges. Matching arrows show how opposite edges are identified." />
        </section>
      </div>
      <figcaption className={styles.caption}>
        <div className={styles.legend}>
          <span><i className={styles.loop} style={{ "--loop-color": palettes.a.line }}>a</i> Around the center</span>
          <span><i className={styles.loop} style={{ "--loop-color": palettes.b.line }}>b</i> Around the tube</span>
        </div>
        <div className={styles.controls}>
          <button type="button" disabled={disabled} onClick={() => player.current?.toggle()}>{buttonLabel}</button>
          <input ref={progress} type="range" min="0" max={duration} step="100" defaultValue="0" aria-label="Animation progress" disabled={disabled} onChange={(event) => player.current?.scrub(event.currentTarget.valueAsNumber)} />
        </div>
      </figcaption>
    </figure>
  );
}
