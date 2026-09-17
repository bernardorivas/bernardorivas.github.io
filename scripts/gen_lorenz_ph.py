"""Precompute the sliding-window Lorenz + persistent homology animation data.

Requires numpy and ripser (pip install numpy ripser); run from the repo root.

Mirrors the retired src/lib/lorenz.ts exactly: sigma=10, rho=28, beta=8/3, RK4 with
dt=0.005 from [0.1, 0, 0], transient of 1800 steps discarded, every 2nd
sample kept (sample spacing 0.01 time units).

For each animation frame, a window of W samples is subsampled and fed to
ripser (Vietoris-Rips, maxdim=1) on the full 3D points; the H1 pairs are the
persistence diagram shown in the right panel.
"""
import json
import numpy as np
from ripser import ripser

SIGMA, RHO, BETA = 10.0, 28.0, 8.0 / 3.0
DT = 0.005

def deriv(s):
    x, y, z = s
    return np.array([SIGMA * (y - x), x * (RHO - z) - y, x * y - BETA * z])

def rk4(s, dt):
    k1 = deriv(s)
    k2 = deriv(s + k1 * dt / 2)
    k3 = deriv(s + k2 * dt / 2)
    k4 = deriv(s + k3 * dt)
    return s + dt * (k1 + 2 * k2 + 2 * k3 + k4) / 6

# integrate: discard transient (1800 steps), then keep every 2nd sample
state = np.array([0.1, 0.0, 0.0])
samples = []
N_SAMPLES = 2600              # 26 time units of post-transient trajectory
i = 0
while len(samples) < N_SAMPLES:
    state = rk4(state, DT)
    i += 1
    if i > 1800 and i % 2 == 0:
        samples.append(state.copy())
samples = np.array(samples)   # (N, 3), spacing 0.01 t.u.

W = 650                       # window length in samples (6.5 time units)
STEP = 5                      # window advance per frame (0.05 time units)
SUB = 3                       # subsample inside the window for Rips (217 pts)
# Cap the filtration below the attractor's diameter scale: beyond ~15 the only
# classes are bridges between the two wings' clouds, which would dominate the
# axis without saying anything about the windowed trajectory itself.
THRESH = 15.0
MIN_PERS = 0.1
T0 = 1800 * DT                # absolute time of first kept sample

frames = []
max_death = 0.0
pair_counts = []
for start in range(0, len(samples) - W, STEP):
    cloud = samples[start : start + W : SUB]
    dgm = ripser(cloud, maxdim=1, thresh=THRESH)["dgms"][1]
    finite = dgm[np.isfinite(dgm[:, 1])]
    finite = finite[finite[:, 1] - finite[:, 0] > MIN_PERS]
    # keep the 30 most persistent pairs; the rest is diagonal dust
    order = np.argsort(finite[:, 1] - finite[:, 0])[::-1][:30]
    pairs = [[round(float(b), 3), round(float(d), 3)] for b, d in finite[order]]
    pairs.sort()
    if pairs:
        max_death = max(max_death, max(d for _, d in pairs))
    pair_counts.append(len(pairs))
    frames.append({"i0": start, "i1": start + W, "h1": pairs})

out = {
    "meta": {
        "dt": 0.01,               # sample spacing in time units
        "t0": round(T0, 3),       # time of sample 0
        "window": W,
        "step": STEP,
        "sub": SUB,
        "thresh": THRESH,
        "axisMax": float(np.ceil(max_death)),
    },
    # projected (x, z) for drawing, matching the old lib's projection
    "traj": [[round(float(x), 2), round(float(z), 2)] for x, _, z in samples],
    "frames": frames,
}

path = "src/data/lorenz-ph.json"
with open(path, "w") as f:
    json.dump(out, f, separators=(",", ":"))

import os
print("frames:", len(frames))
print("pairs/frame: min %d  mean %.1f  max %d" % (min(pair_counts), np.mean(pair_counts), max(pair_counts)))
print("max death: %.2f  axisMax: %.0f" % (max_death, out["meta"]["axisMax"]))
print("json size: %.0f KB" % (os.path.getsize(path) / 1024))
# sanity: births below deaths, indices in range
assert all(b < d for fr in frames for b, d in fr["h1"])
assert all(fr["i1"] <= len(samples) for fr in frames)
print("sanity ok")
