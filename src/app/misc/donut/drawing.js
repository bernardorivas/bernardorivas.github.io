export const torusSize = { width: 560, height: 352 };
export const squareSize = { width: 288, height: 277 };
export const duration = 7500;
export const palettes = {
  a: { line: "#0865a7", edge: "#6c9bc0" },
  b: { line: "#b44322", edge: "#cb8a74" },
};

const turn = 2 * Math.PI;
const majorRadius = 1.46;
const tubeRadius = 0.64;
const torusScale = 107;
const tilt = 53 * Math.PI / 180;
const sinTilt = Math.sin(tilt);
const cosTilt = Math.cos(tilt);
const loopU = 0.93;
const loopV = 1.03;
const samples = 180;
const squareHalfSide = 100;

function torusPoint(u, v) {
  const radius = majorRadius + tubeRadius * Math.cos(v);
  const y = radius * Math.sin(u);
  const z = tubeRadius * Math.sin(v);
  return {
    x: torusSize.width / 2 + torusScale * radius * Math.cos(u),
    y: 172 + torusScale * (cosTilt * y - sinTilt * z),
    depth: sinTilt * y + cosTilt * z,
  };
}

function squarePoint(u, v) {
  return {
    x: squareSize.width / 2 + squareHalfSide * (u - loopU) / Math.PI,
    y: squareSize.height / 2 - squareHalfSide * (v - loopV) / Math.PI,
  };
}

function meshFaces() {
  const faces = [];
  const columns = 104;
  const rows = 60;
  const du = turn / columns;
  const dv = turn / rows;

  for (let j = 0; j < rows; j++) {
    const v = j * dv;
    const tubeSide = Math.cos(v + dv / 2);
    const nz = Math.sin(v + dv / 2);
    for (let i = 0; i < columns; i++) {
      const u = i * du;
      const nx = tubeSide * Math.cos(u + du / 2);
      const ny = tubeSide * Math.sin(u + du / 2);
      const facing = sinTilt * ny + cosTilt * nz;
      if (facing < -0.025) continue;

      const points = [torusPoint(u, v), torusPoint(u + du, v), torusPoint(u + du, v + dv), torusPoint(u, v + dv)];
      const diffuse = Math.max(0, -0.38 * nx - 0.16 * ny + 0.91 * nz);
      const highlight = Math.max(0, -0.22 * nx + 0.37 * ny + 0.90 * nz) ** 14;
      const light = 0.20 + 0.68 * diffuse + 0.11 * highlight + 0.11 * (1 - Math.max(0, facing));
      const color = `rgb(${Math.round(41 + 179 * light)}, ${Math.round(62 + 169 * light)}, ${Math.round(86 + 155 * light)})`;
      faces.push({
        points,
        color,
        depth: points.reduce((sum, p) => sum + p.depth, 0) / 4,
        maxDepth: Math.max(...points.map((p) => p.depth)),
        minX: Math.min(...points.map((p) => p.x)),
        maxX: Math.max(...points.map((p) => p.x)),
        minY: Math.min(...points.map((p) => p.y)),
        maxY: Math.max(...points.map((p) => p.y)),
      });
    }
  }
  return faces.sort((a, b) => a.depth - b.depth);
}

function triangleDepth(p, a, b, c) {
  const ux = b.x - a.x;
  const uy = b.y - a.y;
  const vx = c.x - a.x;
  const vy = c.y - a.y;
  const px = p.x - a.x;
  const py = p.y - a.y;
  const det = ux * vy - uy * vx;
  if (Math.abs(det) < 1e-6) return -Infinity;
  const s = (px * vy - py * vx) / det;
  const t = (ux * py - uy * px) / det;
  if (s < 0 || t < 0 || s + t > 1) return -Infinity;
  return a.depth + s * (b.depth - a.depth) + t * (c.depth - a.depth);
}

function isVisible(point, faces) {
  // Compare the loop point with the frontmost surface at the same screen position.
  const limit = point.depth + 0.016;
  return !faces.some(({ points: [a, b, c, d], minX, maxX, minY, maxY, maxDepth }) => (
    maxDepth > limit && point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
    && (triangleDepth(point, a, b, c) > limit || triangleDepth(point, a, c, d) > limit)
  ));
}

function sampleLoop(axis, faces) {
  return Array.from({ length: samples + 1 }, (_, i) => {
    const angle = turn * (i / samples - 0.5);
    const u = loopU + (axis === "a" ? angle : 0);
    const v = loopV + (axis === "b" ? angle : 0);
    const point = torusPoint(u, v);
    return { torus: { ...point, visible: isVisible(point, faces) }, square: squarePoint(u, v) };
  });
}

function prepareCanvas(canvas, { width, height }) {
  const density = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);
  const context = canvas.getContext("2d");
  context?.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  return context;
}

function layer(size, draw) {
  const canvas = document.createElement("canvas");
  const context = prepareCanvas(canvas, size);
  draw(context);
  return canvas;
}

function drawTorus(ctx, faces) {
  ctx.save();
  ctx.translate(280, 321);
  ctx.scale(190, 24);
  const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  shadow.addColorStop(0, "#233a5345");
  shadow.addColorStop(1, "#233a5300");
  ctx.fillStyle = shadow;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();

  ctx.lineWidth = 0.7;
  ctx.lineJoin = "round";
  for (const { points, color } of faces) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (const { x, y } of points.slice(1)) ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.fill();
    ctx.stroke();
  }
}

function drawSquare(ctx) {
  const { x: left, y: top } = squarePoint(loopU - Math.PI, loopV + Math.PI);
  const { x: right, y: bottom } = squarePoint(loopU + Math.PI, loopV - Math.PI);
  const { x: middleX, y: middleY } = squarePoint(loopU, loopV);

  ctx.fillStyle = "#fcfdfe";
  ctx.fillRect(left, top, right - left, bottom - top);
  ctx.beginPath();
  ctx.moveTo(left, middleY);
  ctx.lineTo(right, middleY);
  ctx.moveTo(middleX, bottom);
  ctx.lineTo(middleX, top);
  ctx.strokeStyle = "#d9e0e6";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 2;
  ctx.strokeStyle = palettes.b.edge;
  for (const y of [top, bottom]) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.moveTo(middleX + 46, y - 5);
    ctx.lineTo(middleX + 52, y);
    ctx.lineTo(middleX + 46, y + 5);
    ctx.stroke();
  }
  ctx.strokeStyle = palettes.a.edge;
  for (const x of [left, right]) {
    ctx.beginPath();
    ctx.moveTo(x, bottom);
    ctx.lineTo(x, top);
    for (const y of [middleY - 44, middleY - 51]) {
      ctx.moveTo(x - 5, y + 6);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 5, y + 6);
    }
    ctx.stroke();
  }
}

function drawTrace(ctx, points, progress, color, isHidden = false) {
  if (progress === 0) return;
  const end = samples * progress;
  let onPath = false;
  ctx.beginPath();
  for (let i = 0; i < end; i++) {
    const start = points[i];
    const next = points[i + 1];
    if ((start.visible === false) !== isHidden) {
      onPath = false;
      continue;
    }
    const portion = Math.min(1, end - i);
    if (!onPath) ctx.moveTo(start.x, start.y);
    ctx.lineTo(start.x + portion * (next.x - start.x), start.y + portion * (next.y - start.y));
    onPath = true;
  }

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (isHidden) {
    ctx.setLineDash([5, 6]);
    ctx.globalAlpha = 0.78;
  }
  ctx.lineWidth = isHidden ? 5.0 : 7.0;
  ctx.strokeStyle = "#fcfdfe";
  ctx.stroke();
  ctx.lineWidth = isHidden ? 2.4 : 4.2;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();

  if (progress < 1) {
    const i = Math.floor(end);
    const start = points[i];
    const next = points[i + 1];
    if ((start.visible === false) === isHidden) {
      const x = start.x + (end - i) * (next.x - start.x);
      const y = start.y + (end - i) * (next.y - start.y);
      ctx.save();
      ctx.globalAlpha = isHidden ? 0.78 : 1;
      ctx.beginPath();
      ctx.arc(x, y, isHidden ? 4.0 : 5.8, 0, turn);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = "#fcfdfe";
      ctx.stroke();
      ctx.restore();
    }
  }
}

export function createDrawing(torus, square) {
  const torusCtx = prepareCanvas(torus, torusSize);
  const squareCtx = prepareCanvas(square, squareSize);
  if (!torusCtx || !squareCtx) return null;

  const faces = meshFaces();
  const torusLayer = layer(torusSize, (ctx) => drawTorus(ctx, faces));
  const squareLayer = layer(squareSize, drawSquare);
  const loops = [
    { points: sampleLoop("a", faces), start: 250, end: 2850, color: palettes.a.line },
    { points: sampleLoop("b", faces), start: 3300, end: 6000, color: palettes.b.line },
  ].map(({ points, ...loop }) => ({
    ...loop,
    torusPoints: points.map((point) => point.torus),
    squarePoints: points.map((point) => point.square),
  }));

  return (time) => {
    torusCtx.clearRect(0, 0, torusSize.width, torusSize.height);
    torusCtx.drawImage(torusLayer, 0, 0, torusSize.width, torusSize.height);
    squareCtx.clearRect(0, 0, squareSize.width, squareSize.height);
    squareCtx.drawImage(squareLayer, 0, 0, squareSize.width, squareSize.height);
    const traces = loops.map((loop) => ({ ...loop, progress: Math.max(0, Math.min(1, (time - loop.start) / (loop.end - loop.start))) }));
    for (const { torusPoints, progress, color } of traces) drawTrace(torusCtx, torusPoints, progress, color, true);
    for (const { torusPoints, squarePoints, progress, color } of traces) {
      drawTrace(torusCtx, torusPoints, progress, color);
      drawTrace(squareCtx, squarePoints, progress, color);
    }
  };
}
