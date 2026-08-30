#!/usr/bin/env python3

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og-dynamics-2026.jpg"
WIDTH, HEIGHT, SCALE = 1200, 630, 2

PAPER = (250, 249, 245)
INK = (24, 28, 34)
NAVY = (23, 61, 99)
GRAPH = (113, 136, 163)
GOLD = (135, 89, 31)


def point(x: float, y: float) -> tuple[int, int]:
    return round(x * SCALE), round(y * SCALE)


def scaled_box(box: tuple[float, float, float, float]) -> tuple[int, int, int, int]:
    return tuple(round(value * SCALE) for value in box)


def arrow(draw: ImageDraw.ImageDraw, start: tuple[float, float], end: tuple[float, float], fill, width: int = 1) -> None:
    x0, y0 = start
    x1, y1 = end
    draw.line([point(x0, y0), point(x1, y1)], fill=fill, width=width * SCALE)
    angle = math.atan2(y1 - y0, x1 - x0)
    length = 7
    wing = 0.55
    left = (x1 - length * math.cos(angle - wing), y1 - length * math.sin(angle - wing))
    right = (x1 - length * math.cos(angle + wing), y1 - length * math.sin(angle + wing))
    draw.polygon([point(x1, y1), point(*left), point(*right)], fill=fill)


def draw_lorenz(layer: Image.Image, data: dict) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    trajectory = np.asarray(data["traj"], dtype=float)
    x_min, z_min = trajectory.min(axis=0)
    x_max, z_max = trajectory.max(axis=0)
    left, top, right, bottom = 630, 55, 1175, 610
    scale = min((right - left) / (x_max - x_min), (bottom - top) / (z_max - z_min))
    x_offset = (left + right - (x_max - x_min) * scale) / 2
    z_offset = (top + bottom - (z_max - z_min) * scale) / 2

    def project(sample) -> tuple[int, int]:
        x, z = sample
        return point(x_offset + (x - x_min) * scale, bottom - z_offset + top - (z - z_min) * scale)

    projected = [project(sample) for sample in trajectory]
    draw.line(projected, fill=(*GRAPH, 72), width=1 * SCALE, joint="curve")

    frame = next(
        frame for frame in data["frames"]
        if sum(death - birth > 1.5 for birth, death in frame["h1"]) >= 2
    )
    segment = projected[frame["i0"]:frame["i1"]]
    draw.line(segment, fill=(*NAVY, 150), width=2 * SCALE, joint="curve")
    if segment:
        x, y = segment[-1]
        radius = 4 * SCALE
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*GOLD, 210))


def draw_persistence(layer: Image.Image, data: dict) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    left, top, side = 925, 45, 225
    right, bottom = left + side, top + side
    axis_max = data["meta"]["axisMax"]
    frame = next(
        frame for frame in data["frames"]
        if sum(death - birth > 1.5 for birth, death in frame["h1"]) >= 2
    )
    draw.rounded_rectangle(scaled_box((left - 18, top - 18, right + 18, bottom + 18)), radius=8 * SCALE, fill=(*PAPER, 205), outline=(*GRAPH, 65), width=SCALE)
    draw.line([point(left, bottom), point(right, bottom)], fill=(*NAVY, 105), width=SCALE)
    draw.line([point(left, bottom), point(left, top)], fill=(*NAVY, 105), width=SCALE)
    draw.polygon([point(left, bottom), point(right, top), point(right, bottom)], fill=(*GRAPH, 22))
    draw.line([point(left, bottom), point(right, top)], fill=(*GRAPH, 90), width=SCALE)
    for birth, death in frame["h1"]:
        x = left + side * birth / axis_max
        y = bottom - side * death / axis_max
        radius = 3.2 if death - birth > 1.5 else 2
        draw.ellipse(scaled_box((x - radius, y - radius, x + radius, y + radius)), fill=(*NAVY, 165))


def draw_good_pair(layer: Image.Image) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    center_x, center_y = 585, 125
    outer = []
    collar = []
    inner = []
    for theta in np.linspace(0, 2 * math.pi, 240):
        wobble = 1 + 0.08 * math.sin(3 * theta) - 0.04 * math.cos(5 * theta)
        outer.append(point(center_x + 125 * wobble * math.cos(theta), center_y + 70 * wobble * math.sin(theta)))
        collar.append(point(center_x - 28 + 63 * math.cos(theta), center_y + 8 + 38 * math.sin(theta)))
        inner.append(point(center_x - 32 + 43 * math.cos(theta), center_y + 10 + 24 * math.sin(theta)))
    draw.line(outer + [outer[0]], fill=(*NAVY, 72), width=2 * SCALE, joint="curve")
    draw.polygon(collar, fill=(*GRAPH, 20))
    draw.line(collar + [collar[0]], fill=(*GRAPH, 70), width=SCALE, joint="curve")
    draw.polygon(inner, fill=(*GOLD, 38))
    draw.line(inner + [inner[0]], fill=(*GOLD, 95), width=2 * SCALE, joint="curve")
    for start, end in [((665, 102), (625, 120)), ((655, 155), (612, 146)), ((530, 73), (548, 103))]:
        arrow(draw, start, end, (*GRAPH, 75))


def draw_morse_graph(layer: Image.Image) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    nodes = [(665, 420), (610, 495), (720, 495), (665, 570)]
    for start, end in [(nodes[0], nodes[1]), (nodes[0], nodes[2]), (nodes[1], nodes[3]), (nodes[2], nodes[3])]:
        dx, dy = end[0] - start[0], end[1] - start[1]
        length = math.hypot(dx, dy)
        unit_x, unit_y = dx / length, dy / length
        arrow(draw, (start[0] + 16 * unit_x, start[1] + 16 * unit_y), (end[0] - 18 * unit_x, end[1] - 18 * unit_y), (*NAVY, 85))
    for index, (x, y) in enumerate(nodes):
        radius = 14
        fill = (*GOLD, 60) if index in (0, 3) else (*GRAPH, 45)
        draw.ellipse(scaled_box((x - radius, y - radius, x + radius, y + radius)), fill=fill, outline=(*NAVY, 105), width=SCALE)


def draw_bifurcation(layer: Image.Image) -> None:
    draw = ImageDraw.Draw(layer, "RGBA")
    left, top, right, bottom = 850, 350, 1180, 605
    parameters = np.linspace(3.0, 4.0, 420)
    state = np.full_like(parameters, 0.517)
    for _ in range(500):
        state = parameters * state * (1 - state)
    for _ in range(60):
        state = parameters * state * (1 - state)
        for parameter, value in zip(parameters, state):
            x = left + (parameter - 3.0) * (right - left)
            y = bottom - value * (bottom - top)
            draw.point(point(x, y), fill=(*NAVY, 34))


def fade_visuals(layer: Image.Image) -> Image.Image:
    alpha = np.asarray(layer.getchannel("A"), dtype=np.float32)
    x = np.linspace(0, 1, layer.width, dtype=np.float32)
    start = 0.30
    finish = 0.55
    horizontal = np.clip((x - start) / (finish - start), 0, 1)
    alpha *= horizontal[np.newaxis, :]
    layer.putalpha(Image.fromarray(alpha.astype(np.uint8), mode="L"))
    return layer


def main() -> None:
    with (ROOT / "src" / "data" / "lorenz-ph.json").open() as handle:
        lorenz_data = json.load(handle)

    image = Image.new("RGB", (WIDTH * SCALE, HEIGHT * SCALE), PAPER)
    visuals = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw_good_pair(visuals)
    draw_lorenz(visuals, lorenz_data)
    draw_persistence(visuals, lorenz_data)
    draw_morse_graph(visuals)
    draw_bifurcation(visuals)
    image = Image.alpha_composite(image.convert("RGBA"), fade_visuals(visuals))

    draw = ImageDraw.Draw(image, "RGBA")
    serif = ImageFont.truetype("/System/Library/Fonts/Supplemental/Iowan Old Style.ttc", 76 * SCALE)
    sans = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 23 * SCALE)
    draw.text(point(58, 250), "Bernardo Rivas", font=serif, fill=(*INK, 255), anchor="la")
    draw.text(point(63, 350), "Mathematics · nonlinear dynamical systems", font=sans, fill=(*NAVY, 255), anchor="la")

    image = image.convert("RGB").resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    image.save(OUTPUT, quality=90, optimize=True, progressive=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
