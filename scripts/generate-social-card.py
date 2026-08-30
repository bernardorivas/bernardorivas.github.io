#!/usr/bin/env python3

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-lorenz-smooth-2026.jpg"
WIDTH, HEIGHT, SCALE = 1200, 630, 4

PAPER = (250, 249, 245)
INK = (24, 28, 34)
NAVY = (23, 61, 99)


def point(x: float, y: float) -> tuple[int, int]:
    return round(x * SCALE), round(y * SCALE)


def smooth_polyline(points: np.ndarray, subdivisions: int = 4) -> np.ndarray:
    tangents = np.empty_like(points)
    tangents[0] = points[1] - points[0]
    tangents[-1] = points[-1] - points[-2]
    tangents[1:-1] = (points[2:] - points[:-2]) / 2

    u = np.linspace(0, 1, subdivisions, endpoint=False)[:, None]
    h00 = 2 * u**3 - 3 * u**2 + 1
    h10 = u**3 - 2 * u**2 + u
    h01 = -2 * u**3 + 3 * u**2
    h11 = u**3 - u**2
    segments = [
        h00 * points[i] + h10 * tangents[i] + h01 * points[i + 1] + h11 * tangents[i + 1]
        for i in range(len(points) - 1)
    ]
    return np.vstack([*segments, points[-1:]])


def draw_lorenz(layer: Image.Image, data: dict) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    trajectory = np.asarray(data["traj"], dtype=float)
    x_min, z_min = trajectory.min(axis=0)
    x_max, z_max = trajectory.max(axis=0)
    left, top, right, bottom = 610, 48, 1178, 612
    scale = min((right - left) / (x_max - x_min), (bottom - top) / (z_max - z_min))
    x_offset = (left + right - (x_max - x_min) * scale) / 2
    z_offset = (top + bottom - (z_max - z_min) * scale) / 2

    def project(sample) -> tuple[float, float]:
        x, z = sample
        return x_offset + (x - x_min) * scale, bottom - z_offset + top - (z - z_min) * scale

    projected = np.asarray([project(sample) for sample in trajectory])
    smoothed = smooth_polyline(projected)
    draw.line([point(x, y) for x, y in smoothed], fill=(*NAVY, 92), width=SCALE, joint="curve")


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
    image = Image.alpha_composite(image.convert("RGBA"), fade_visuals(visuals))

    draw = ImageDraw.Draw(image, "RGBA")
    serif = ImageFont.truetype("/System/Library/Fonts/Supplemental/Iowan Old Style.ttc", 80 * SCALE)
    sans = ImageFont.truetype("/System/Library/Fonts/Avenir Next.ttc", 27 * SCALE, index=5)
    name = "Bernardo Rivas"
    subtitle = "Postdoc - Mathematics"
    name_x, name_y = 58, 252
    name_center = name_x + draw.textlength(name, font=serif) / (2 * SCALE)
    draw.text(point(name_x, name_y), name, font=serif, fill=(*INK, 255), anchor="la")
    draw.text(point(name_center, 359), subtitle, font=sans, fill=(*NAVY, 255), anchor="ma")

    image = image.convert("RGB").resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    image.save(OUTPUT, quality=90, optimize=True, progressive=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
