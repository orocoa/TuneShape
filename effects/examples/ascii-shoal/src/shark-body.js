/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 drewdi
 * Copyright (c) 2026 KAI-NEX and TuneShape contributors
 *
 * Articulated spine constraints and longitudinal body proportions adapted from
 * stackedlol/ascii-sharks (a0074c16a106f0abc665fe9712ca445f8f98ad8e).
 * See ../THIRD_PARTY_NOTICES.md. Rasterization and host integration are TuneShape's.
 */
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const angleDelta = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
export const SHARK_JOINTS = 20;

// Coordinates are normalized to the host, so sampling edits never move a joint.
export function createSharkSpine(x, y, heading, length, width, height) {
  const nodes = new Float64Array(SHARK_JOINTS * 2);
  for (let i = 0; i < SHARK_JOINTS; i++) {
    const distance = length * i / (SHARK_JOINTS - 1);
    nodes[i * 2] = (x - Math.cos(heading) * distance) / width;
    nodes[i * 2 + 1] = (y - Math.sin(heading) * distance) / height;
  }
  return nodes;
}

export function followSharkSpine(nodes, x, y, heading, length, width, height) {
  nodes[0] = x / width;
  nodes[1] = y / height;
  let backward = heading + Math.PI;
  const segment = length / (SHARK_JOINTS - 1);
  for (let i = 1; i < SHARK_JOINTS; i++) {
    const px = nodes[i * 2 - 2] * width, py = nodes[i * 2 - 1] * height;
    const trailing = Math.atan2(nodes[i * 2 + 1] * height - py, nodes[i * 2] * width - px);
    backward += clamp(angleDelta(trailing, backward), -0.14, 0.14);
    nodes[i * 2] = (px + Math.cos(backward) * segment) / width;
    nodes[i * 2 + 1] = (py + Math.sin(backward) * segment) / height;
  }
}

// Rounded snout, broad shoulders, long taper, and a narrow caudal peduncle.
function halfWidth(s) {
  if (s < 0.13) return 0.09 * Math.pow(Math.sin(s / 0.13 * Math.PI / 2), 0.95);
  if (s < 0.3) { const q = (s - 0.13) / 0.17; return 0.09 + 0.014 * q * q * (3 - 2 * q); }
  if (s < 0.86) return 0.016 + 0.088 * Math.pow(1 - (s - 0.3) / 0.56, 1.25);
  return 0.016 - 0.01 * (s - 0.86) / 0.14;
}

export function prepareSharkBody(pose, width, height) {
  const length = pose.size * 0.94, nodes = pose.spine ?? createSharkSpine(
    pose.x + Math.cos(pose.angle) * pose.size * 0.47,
    pose.y + Math.sin(pose.angle) * pose.size * 0.47,
    pose.angle, length, width, height);
  const points = [];
  for (let i = 0; i < SHARK_JOINTS; i++) {
    const a = Math.max(0, i - 1), b = Math.min(SHARK_JOINTS - 1, i + 1);
    const tx = (nodes[a * 2] - nodes[b * 2]) * width;
    const ty = (nodes[a * 2 + 1] - nodes[b * 2 + 1]) * height;
    const d = Math.hypot(tx, ty) || 1, s = i / (SHARK_JOINTS - 1);
    const wave = length * (0.002 + 0.046 * s ** 1.8) * Math.sin(pose.tailPhase - s * 5.2);
    points.push({ x: nodes[i * 2] * width - ty / d * wave,
      y: nodes[i * 2 + 1] * height + tx / d * wave, radius: halfWidth(s) * length, s });
  }
  const at = s => {
    const k = clamp(s, 0, 1) * (SHARK_JOINTS - 1), i = Math.min(SHARK_JOINTS - 2, Math.floor(k)), u = k - i;
    const a = points[i], b = points[i + 1], d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u,
      fx: (a.x - b.x) / d, fy: (a.y - b.y) / d };
  };
  const polygons = [], bank = clamp((pose.curvature ?? 0) * 0.38, -0.25, 0.25);
  for (const side of [-1, 1]) {
    const root = at(0.3), span = length * 0.245 * (1 - bank * side);
    const tip = { x: root.x - root.fx * length * 0.2 - root.fy * span * side,
      y: root.y - root.fy * length * 0.2 + root.fx * span * side };
    const rear = at(0.45), front = at(0.21);
    // Concave trailing edge makes the pectoral a swept sickle, not a triangle.
    polygons.push([front, tip,
      { x: root.x - root.fx * length * 0.16 - root.fy * span * side * 0.42,
        y: root.y - root.fy * length * 0.16 + root.fx * span * side * 0.42 }, rear]);
    const hip = at(0.65), back = at(0.76);
    polygons.push([hip, { x: hip.x - hip.fx * length * 0.12 - hip.fy * length * 0.087 * side,
      y: hip.y - hip.fy * length * 0.12 + hip.fx * length * 0.087 * side }, back]);
  }
  const tail = at(1), tailPoint = (back, side) => ({
    x: tail.x - tail.fx * back * length - tail.fy * side * length,
    y: tail.y - tail.fy * back * length + tail.fx * side * length,
  });
  polygons.push([at(0.9), tailPoint(0.21, -0.13), tailPoint(0.09, -0.035),
    tailPoint(0.045, 0), tailPoint(0.14, 0.085), tailPoint(0.03, 0.016), at(0.96)]);
  return { points, polygons, length };
}

function polygonDistance(x, y, polygon) {
  let squared = Infinity, inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j], b = polygon[i], dx = b.x - a.x, dy = b.y - a.y;
    const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    squared = Math.min(squared, (x - a.x - dx * t) ** 2 + (y - a.y - dy * t) ** 2);
    if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return Math.sqrt(squared) * (inside ? -1 : 1);
}

/** Rasterize narrow segments, rather than testing all 20 joints for every cell. */
export function rasterizeSharkBody(pose, layout, field, tones) {
  const { points, polygons, length } = prepareSharkBody(pose, layout.width, layout.height);
  const { cellWidth: cw, cellHeight: ch, columns, rows } = layout;
  const aa = Math.max(cw, ch) * 0.48;
  const region = (minX, minY, maxX, maxY, sample) => {
    const x0 = Math.max(0, Math.floor((minX - aa) / cw)), x1 = Math.min(columns - 1, Math.ceil((maxX + aa) / cw));
    const y0 = Math.max(0, Math.floor((minY - aa) / ch)), y1 = Math.min(rows - 1, Math.ceil((maxY + aa) / ch));
    for (let row = y0; row <= y1; row++) for (let col = x0; col <= x1; col++) {
      const index = row * columns + col;
      const hit = sample((col + 0.5) * cw, (row + 0.5) * ch);
      if (!hit) continue;
      const q = clamp(0.5 - hit.distance / (aa * 2), 0, 1), coverage = q * q * (3 - 2 * q);
      if (coverage > field[index] || coverage === 1 && hit.body) { field[index] = coverage; tones[index] = hit.tone; }
    }
  };
  // Fins first; the rounded body naturally covers their roots.
  for (const polygon of polygons) {
    const xs = polygon.map(p => p.x), ys = polygon.map(p => p.y);
    region(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), (x, y) => ({
      distance: polygonDistance(x, y, polygon), tone: clamp(pose.tone - 0.25, 0.1, 1),
    }));
  }
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1], dx = b.x - a.x, dy = b.y - a.y;
    const squared = dx * dx + dy * dy, radius = Math.max(a.radius, b.radius), d = Math.sqrt(squared) || 1;
    region(Math.min(a.x, b.x) - radius, Math.min(a.y, b.y) - radius,
      Math.max(a.x, b.x) + radius, Math.max(a.y, b.y) + radius, (x, y) => {
        const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / (squared || 1), 0, 1);
        const dist = Math.hypot(x - a.x - dx * t, y - a.y - dy * t);
        const width = a.radius + (b.radius - a.radius) * t;
        const s = a.s + (b.s - a.s) * t, across = dist / Math.max(width, 0.1);
        const side = (dx * (y - a.y) - dy * (x - a.x)) / d;
        let tone = pose.tone - 0.18 * across ** 2 + (dy * 0.6 - dx * 0.8) / d * side / Math.max(width, 1) * 0.08;
        if (s > 0.32 && s < 0.46 && across < 0.26) tone -= 0.23;
        if (s > 0.16 && s < 0.29 && across > 0.55) tone -= (Math.floor((s - 0.16) / 0.026) % 2) * 0.22;
        if (s > 0.085 && s < 0.13 && across > 0.62) tone -= 0.35;
        return { distance: dist - width, tone: clamp(tone, 0.1, 1), body: true };
      });
  }
  return length;
}
