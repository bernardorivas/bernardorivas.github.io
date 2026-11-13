# Lorenz persistence figure

Two-panel animation that was on `/software` until 2026-11-12: a sliding window on a Lorenz trajectory and the degree-one persistence diagram of the windowed points. This folder is excluded from the build, type checking, linting and tests.

To restore it, move the files back:

- `LorenzPersistence.tsx` to `src/components/`
- `lorenz-ph.json` and `lorenz-ph.test.ts` to `src/data/`
- `gen_lorenz_ph.py` to `scripts/`

Then add `<LorenzPersistence />` to `src/app/software/page.tsx`, and restore the copy and the CSS below.

`softwareCopy.phFigure` in `src/data/copy.tsx`:

```ts
  // Sliding-window Lorenz + persistence animation. The pairs are precomputed
  // with ripser on the 3D windowed points; the filtration is capped at 15 so
  // the axis is not dominated by large-scale classes bridging the two wings.
  phFigure: {
    trajLabel: "Timeseries data from the Lorenz system",
    diagramLabel: "Persistence diagram of the data (H_1)",
    trajAria:
      "Animated Lorenz trajectory in the (x, z) plane with a highlighted sliding time window",
    diagramAria:
      "Animated persistence diagram of the points in the current time window",
  },
```

In `src/styles/globals.css`:

```css
.figure-pair-even { grid-template-columns: repeat(2, minmax(0, 1fr)); }

.ph-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
}
```
