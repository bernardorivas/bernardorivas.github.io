#!/usr/bin/env python3

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-lorenz-2026.jpg"
WIDTH, HEIGHT, SCALE = 1200, 630, 2

PAPER = (250, 249, 245)
INK = (24, 28, 34)
NAVY = (23, 61, 99)
GRAPH = (113, 136, 163)
GOLD = (135, 89, 31)


def point(x: float, y: float) -> tuple[int, int]:
    return round(x * SCALE), round(y * SCALE)


def draw_lorenz(layer: Image.Image, data: dict) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    trajectory = np.asarray(data["traj"], dtype=float)
    x_min, z_min = trajectory.min(axis=0)
    x_max, z_max = trajectory.max(axis=0)
    left, top, right, bottom = 610, 48, 1178, 612
    scale = min((right - left) / (x_max - x_min), (bottom - top) / (z_max - z_min))
    x_offset = (left + right - (x_max - x_min) * scale) / 2
    z_offset = (top + bottom - (z_max - z_min) * scale) / 2

    def project(sample) -> tuple[int, int]:
        x, z = sample
        return point(x_offset + (x - x_min) * scale, bottom - z_offset + top - (z - z_min) * scale)

    projected = [project(sample) for sample in trajectory]
    draw.line(projected, fill=(*GRAPH, 58), width=1 * SCALE, joint="curve")

    frame = next(
        frame for frame in data["frames"]
        if sum(death - birth > 1.5 for birth, death in frame["h1"]) >= 2
    )
    segment = projected[frame["i0"]:frame["i1"]]
    draw.line(segment, fill=(*NAVY, 165), width=2 * SCALE, joint="curve")
    if segment:
        x, y = segment[-1]
        radius = 4 * SCALE
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*GOLD, 210))


def draw_persistence(layer: Image.Image, data: dict) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    left, top, side = 575, -35, 660
    right, bottom = left + side, top + side
    axis_max = data["meta"]["axisMax"]
    frame = next(
        frame for frame in data["frames"]
        if sum(death - birth > 1.5 for birth, death in frame["h1"]) >= 2
    )
    draw.line([point(left, bottom), point(right, top)], fill=(*GRAPH, 48), width=SCALE)
    for birth, death in frame["h1"]:
        x = left + side * birth / axis_max
        y = bottom - side * death / axis_max
        radius = 3.4 if death - birth > 1.5 else 1.8
        draw.ellipse((round((x - radius) * SCALE), round((y - radius) * SCALE), round((x + radius) * SCALE), round((y + radius) * SCALE)), fill=(*NAVY, 142))


def fade_visuals(layer: Image.Image) -> Image.Image:
    alpha = np.asarray(layer.getchannel("A"), dtype=np.float32)
    x = np.linspace(0, 1, layer.width, dtype=np.float32)
    start = 0.38
    finish = 0.56
    horizontal = np.clip((x - start) / (finish - start), 0, 1)
    alpha *= horizontal[np.newaxis, :]
    layer.putalpha(Image.fromarray(alpha.astype(np.uint8), mode="L"))
    return layer


def main() -> None:
    with (ROOT / "src" / "data" / "lorenz-ph.json").open() as handle:
        lorenz_data = json.load(handle)

    image = Image.new("RGB", (WIDTH * SCALE, HEIGHT * SCALE), PAPER)
    visuals = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw_lorenz(visuals, lorenz_data)
    draw_persistence(visuals, lorenz_data)
    image = Image.alpha_composite(image.convert("RGBA"), fade_visuals(visuals))

    draw = ImageDraw.Draw(image, "RGBA")
    serif = ImageFont.truetype("/System/Library/Fonts/Supplemental/Iowan Old Style.ttc", 80 * SCALE)
    sans = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22 * SCALE)
    draw.text(point(58, 252), "Bernardo Rivas", font=serif, fill=(*INK, 255), anchor="la")
    draw.text(point(63, 357), "Mathematics · nonlinear dynamical systems", font=sans, fill=(*NAVY, 255), anchor="la")

    image = image.convert("RGB").resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    image.save(OUTPUT, quality=90, optimize=True, progressive=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
