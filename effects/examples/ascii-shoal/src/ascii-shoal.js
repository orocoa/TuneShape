/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 KAI-NEX and TuneShape contributors
 *
 * ASCII Shoal — a dependency-free character renderer for TuneShape.
 * Articulated anatomy adapts MIT code by drewdi; see THIRD_PARTY_NOTICES.md.
 */
import { createSharkSpine, followSharkSpine, rasterizeSharkBody } from './shark-body.js';

export const defaults = Object.freeze({
  density: 2,
  glyphScale: 0.9,
  speed: 1.7,
  sharkCount: 4,
  sharkScale: 1,
  fishDensity: 1,
  backgroundColor: '#eeeeee',
  inkColor: '#303030',
  opacity: 0.9,
  gridOpacity: 0.04,
  wakeOpacity: 0,
  interactive: true,
  characters: '.:;=+*oO#',
  seed: 7,
});

const TAU = Math.PI * 2;
const MAX_CELLS = 48000;
const FRAME_MS = 1000 / 30;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const finite = (value, fallback, low, high) =>
  typeof value === 'number' && Number.isFinite(value) ? clamp(value, low, high) : fallback;
const smooth = (low, high, value) => {
  const t = clamp((value - low) / (high - low), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Only explicit colors are accepted: predictable Canvas output without CSS state. */
function color(value, fallback) {
  return typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
    ? value : fallback;
}

/** Public validation also makes host integrations independent of their UI controls. */
export function normalizeOptions(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const characters = typeof o.characters === 'string'
    ? Array.from(o.characters).filter((c) => !/[\s\u0000-\u001f\u007f]/u.test(c)).slice(0, 32).join('') : '';
  return {
    density: finite(o.density, defaults.density, 0.5, 2),
    glyphScale: finite(o.glyphScale, defaults.glyphScale, 0.6, 1.3),
    speed: finite(o.speed, defaults.speed, 0, 3),
    sharkCount: Math.round(finite(o.sharkCount, defaults.sharkCount, 1, 6)),
    sharkScale: finite(o.sharkScale, defaults.sharkScale, 0.5, 1.5),
    fishDensity: finite(o.fishDensity, defaults.fishDensity, 0, 2),
    backgroundColor: color(o.backgroundColor, defaults.backgroundColor),
    inkColor: color(o.inkColor, defaults.inkColor),
    opacity: finite(o.opacity, defaults.opacity, 0, 1),
    gridOpacity: finite(o.gridOpacity, defaults.gridOpacity, 0, 0.2),
    wakeOpacity: finite(o.wakeOpacity, defaults.wakeOpacity, 0, 1),
    interactive: typeof o.interactive === 'boolean' ? o.interactive : defaults.interactive,
    characters: characters || defaults.characters,
    seed: Math.trunc(finite(o.seed, defaults.seed, -2147483648, 2147483647)),
  };
}

function normalizeRuntime(input = {}) {
  return {
    enabled: input.enabled !== false,
    paused: input.paused === true,
    reduced: input.reduced === true,
    speed: finite(input.speed, 1, 0, 8),
    durationMs: finite(input.durationMs, 12000, 1, 86400000),
    delayMs: finite(input.delayMs, 0, 0, 86400000),
    loop: input.loop !== false,
    onRunning: typeof input.onRunning === 'function' ? input.onRunning : undefined,
  };
}

/** The glyph size is deliberately independent from the sampling cell size. */
export function computeLayout(width, height, density = 1, glyphScale = 0.9, dpr = 1) {
  width = finite(width, 1, 1, 16384);
  height = finite(height, 1, 1, 16384);
  density = finite(density, 1, 0.5, 2);
  glyphScale = finite(glyphScale, 0.9, 0.6, 1.3);
  const pitch = clamp(Math.min(width, height) / 67, 5.4, 11.5) / density;
  let columns = Math.max(1, Math.ceil(width / (pitch * 0.82)));
  let rows = Math.max(1, Math.ceil(height / pitch));
  if (columns * rows > MAX_CELLS) {
    const downsample = Math.sqrt(columns * rows / MAX_CELLS);
    columns = Math.max(1, Math.floor(columns / downsample));
    rows = Math.max(1, Math.floor(rows / downsample));
  }
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  return {
    width, height, columns, rows, cells: columns * rows, cellWidth, cellHeight,
    fontSize: Math.min(cellWidth * 1.48, cellHeight * 1.05) * glyphScale,
    // Keep both the device scale and the absolute backing-store area bounded.
    dpr: Math.min(finite(dpr, 1, 1, 2), Math.sqrt(6000000 / (width * height))),
  };
}

// A stateless integer mixer gives every creature its own independent seed stream.
function randomAt(seed, index) {
  let n = (seed | 0) ^ Math.imul(index + 1, 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x7feb352d);
  n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** Descriptors have no viewport, sampling density, animation time or mutable position. */
export function createScene(seed = defaults.seed) {
  seed = normalizeOptions({ seed }).seed;
  const pick = (index) => randomAt(seed, index);
  const sharks = Array.from({ length: 6 }, (_, index) => {
    const k = index * 11;
    return Object.freeze({
      id: index,
      phase: index * 2.3999632297 + pick(k) * 0.29,
      orbitX: 0.27 + pick(k + 1) * 0.14,
      orbitY: 0.25 + pick(k + 2) * 0.16,
      centerX: 0.45 + pick(k + 3) * 0.1,
      centerY: 0.44 + pick(k + 4) * 0.12,
      drift: 0.12 + pick(k + 5) * 0.045,
      direction: pick(k + 6) < 0.5 ? -1 : 1,
      size: 0.28 + pick(k + 7) * 0.115,
      tailPhase: pick(k + 8) * TAU,
      tailRate: 2.3 + pick(k + 9) * 0.9,
      tone: 0.79 + pick(k + 10) * 0.18,
    });
  });
  const schools = Array.from({ length: 3 }, (_, index) => {
    const k = 100 + index * 9;
    return Object.freeze({
      id: index, phase: pick(k) * TAU,
      orbitX: 0.22 + pick(k + 1) * 0.17,
      orbitY: 0.2 + pick(k + 2) * 0.15,
      drift: 0.065 + pick(k + 3) * 0.025,
      spread: 0.075 + pick(k + 4) * 0.025,
    });
  });
  const fish = Array.from({ length: 84 }, (_, index) => {
    const k = 160 + index * 7;
    const angle = pick(k) * TAU;
    const radius = Math.sqrt(pick(k + 1));
    return Object.freeze({
      id: index, school: index % schools.length,
      localX: Math.cos(angle) * radius,
      localY: Math.sin(angle) * radius * 0.6,
      phase: pick(k + 2) * TAU,
      size: 0.024 + pick(k + 3) * 0.018,
      pulse: 0.7 + pick(k + 4) * 0.6,
    });
  });
  return Object.freeze({ seed, sharks: Object.freeze(sharks), schools: Object.freeze(schools), fish: Object.freeze(fish) });
}

function sharkPoint(shark, time, width, height) {
  const a = shark.phase + time * shark.drift * shark.direction;
  const p = {
    x: width * (shark.centerX + shark.orbitX * Math.cos(a) + 0.045 * Math.sin(time * 0.071 + shark.phase * 2)),
    y: height * (shark.centerY + shark.orbitY * Math.sin(a) + 0.038 * Math.cos(time * 0.057 - shark.phase)),
  };
  return p;
}

function sharkPose(shark, time, width, height, settings) {
  const p = sharkPoint(shark, time, width, height);
  const next = sharkPoint(shark, time + 0.025, width, height);
  const previous = sharkPoint(shark, Math.max(0, time - 0.025), width, height);
  const angle = Math.atan2(next.y - p.y, next.x - p.x);
  const before = Math.atan2(p.y - previous.y, p.x - previous.x);
  const size = Math.min(width, height) * shark.size * settings.sharkScale;
  const speed = Math.hypot(next.x - p.x, next.y - p.y) / 0.025;
  const turn = time > 0 ? angleDelta(angle, before) / 0.025 : 0;
  return {
    id: shark.id, kind: 'shark', x: p.x, y: p.y,
    angle, size, curvature: clamp(turn * size / Math.max(speed, 1), -0.65, 0.65),
    bend: Math.sin(time * shark.tailRate + shark.tailPhase),
    tailPhase: time * shark.tailRate + shark.tailPhase, tone: shark.tone,
  };
}

function fishPose(fish, school, time, width, height) {
  const a = school.phase + time * school.drift;
  const angle = Math.atan2(height * school.orbitY * Math.cos(a + 0.32), -width * school.orbitX * Math.sin(a));
  const spread = Math.min(width, height) * school.spread;
  const localX = fish.localX * spread;
  const localY = (fish.localY + Math.sin(time * fish.pulse + fish.phase) * 0.055) * spread;
  return {
    id: fish.id, kind: 'fish',
    x: width * (0.5 + school.orbitX * Math.cos(a)) + Math.cos(angle) * localX - Math.sin(angle) * localY,
    y: height * (0.5 + school.orbitY * Math.sin(a + 0.32)) + Math.sin(angle) * localX + Math.cos(angle) * localY,
    angle: angle + Math.sin(time * fish.pulse + fish.phase) * 0.11,
    size: Math.min(width, height) * fish.size, tailPhase: time * 4.8 + fish.phase, tone: 0.57,
  };
}

/** Pure autonomous sampling. Interactive swimming needs the controller's velocity history. */
export function sampleScene(scene, time, width, height, options = defaults, _pointer = null) {
  const settings = normalizeOptions(options);
  time = finite(time, 0, 0, 1e10);
  width = finite(width, 1, 1, 16384);
  height = finite(height, 1, 1, 16384);
  return {
    sharks: scene.sharks.slice(0, settings.sharkCount).map(s => sharkPose(s, time, width, height, settings)),
    fish: scene.fish.slice(0, Math.round(settings.fishDensity * 42)).map(f => fishPose(f, scene.schools[f.school], time, width, height)),
  };
}

// Original outlines: swept pectorals, small pelvic fins and an unequal tail.
// A dorsal view foreshortens the vertical caudal fin; it is not a mirrored V.
const PECTORAL = [[0.16, 0.06], [0.085, 0.119], [-0.12, 0.235], [-0.077, 0.13], [-0.125, 0.061]];
const PELVIC = [[-0.22, 0.032], [-0.33, 0.09], [-0.305, 0.023]];
const TAIL = [[-0.414, -0.015], [-0.635, -0.125], [-0.574, -0.038], [-0.494, 0], [-0.57, 0.076], [-0.527, 0.016], [-0.414, 0.015]];
const angleDelta = (to, from) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

/** A small anterior sway grows into a rearward travelling propulsive wave.
 * Curvature is dimensionless turn-rate / forward-speed, scaled by body length.
 * This is an authored visual model informed by locomotion, not a fluid solver. */
export function sampleSharkSpine(x, phase = 0, curvature = 0) {
  const u = clamp((0.46 - x) / 1.095, 0, 1);
  const amplitude = 0.002 + 0.076 * u * u * u;
  return Math.sin(phase - u * 5.4) * amplitude + clamp(curvature, -0.65, 0.65) * u * u * 0.34;
}

function polygonDistance(x, y, polygon) {
  let distance2 = Infinity;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    const ex = b[0] - a[0], ey = b[1] - a[1];
    const u = clamp(((x - a[0]) * ex + (y - a[1]) * ey) / (ex * ex + ey * ey), 0, 1);
    const dx = x - a[0] - ex * u, dy = y - a[1] - ey * u;
    distance2 = Math.min(distance2, dx * dx + dy * dy);
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return Math.sqrt(distance2) * (inside ? -1 : 1);
}

/** Original top-down silhouette. Local units are relative to the creature's size. */
export function sampleSharkMask(x, y, phase = 0, softness = 0.012, curvature = 0) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
  y -= sampleSharkSpine(x, phase, curvature);
  // The trunk tapers to a narrow caudal peduncle; the head is not an ellipse.
  const q = clamp((x + 0.425) / 0.895, 0, 1);
  const radius = 0.018 + 0.082 * Math.pow(Math.sin(q * Math.PI), 0.9) * (0.7 + q * 0.3);
  const nose = 1 - smooth(0.79, 1, q);
  const body = x >= -0.425 && x <= 0.47 ? Math.abs(y) - radius * nose : Math.hypot(x < 0 ? x + 0.425 : x - 0.47, y);
  // Inside and outside fins gently change projected span when banking.
  const side = Math.abs(y) / (1 - clamp(curvature, -0.65, 0.65) * Math.sign(y) * 0.12);
  let distance = body;
  // Skip distant fin polygons before edge-distance sampling (important on phones).
  if (x > -0.14 && x < 0.18 && side > 0.045 && side < 0.26) distance = Math.min(distance, polygonDistance(x, side, PECTORAL));
  if (x > -0.35 && x < -0.20 && side > 0.015 && side < 0.11) distance = Math.min(distance, polygonDistance(x, side, PELVIC));
  if (x > -0.66 && x < -0.40 && Math.abs(y) < 0.15) distance = Math.min(distance, polygonDistance(x, y, TAIL));
  const aa = finite(softness, 0.012, 0.001, 0.08);
  return 1 - smooth(-aa, aa, distance);
}

function sampleFishMask(x, y, phase, softness) {
  y -= Math.sin(phase) * smooth(0.05, 0.55, -x) * 0.085;
  const body = Math.hypot((x - 0.04) / 0.43, y / 0.13) - 1;
  const tail = x < -0.28 && x > -0.59 ? Math.abs(y) - (-x - 0.27) * 0.58 : 1;
  return 1 - smooth(-softness, softness, Math.min(body * 0.13, tail));
}

function rasterize(layout, creatures, settings, field, tones) {
  field.fill(0);
  tones.fill(0);
  const { columns, rows, cellWidth, cellHeight } = layout;
  for (const creature of creatures) {
    const isShark = creature.kind === 'shark';
    if (isShark) {
      rasterizeSharkBody(creature, layout, field, tones);
      if (settings.wakeOpacity === 0) continue;
    }
    const c = Math.cos(creature.angle), s = Math.sin(creature.angle);
    const radius = creature.size * (isShark && settings.wakeOpacity > 0 ? 1.15 : 0.76);
    const x0 = Math.max(0, Math.floor((creature.x - radius) / cellWidth));
    const x1 = Math.min(columns - 1, Math.ceil((creature.x + radius) / cellWidth));
    const y0 = Math.max(0, Math.floor((creature.y - radius) / cellHeight));
    const y1 = Math.min(rows - 1, Math.ceil((creature.y + radius) / cellHeight));
    const aa = Math.min(0.075, Math.max(cellWidth, cellHeight) / creature.size * 0.43);
    for (let row = y0; row <= y1; row++) {
      for (let column = x0; column <= x1; column++) {
        const dx = (column + 0.5) * cellWidth - creature.x;
        const dy = (row + 0.5) * cellHeight - creature.y;
        const x = (dx * c + dy * s) / creature.size;
        const y = (-dx * s + dy * c) / creature.size;
        let coverage = isShark ? 0 : sampleFishMask(x, y, creature.tailPhase, aa);
        if (isShark && settings.wakeOpacity > 0 && x < -0.45 && x > -1.1) {
          const spread = 0.11 + (-x - 0.45) * 0.22;
          const ripple = Math.pow(Math.max(0, Math.cos(y / spread * Math.PI * 2 - x * 19 + creature.tailPhase)), 4);
          coverage = Math.max(coverage, Math.exp(-y * y / (spread * spread)) * (-x - 0.45) * (1.1 + x) * ripple * settings.wakeOpacity * 1.8);
        }
        const at = row * columns + column;
        if (coverage > field[at]) {
          field[at] = coverage;
          const bodyY = isShark ? y - sampleSharkSpine(x, creature.tailPhase, creature.curvature ?? 0) : y;
          const center = Math.exp(-bodyY * bodyY * 150);
          const grain = Math.sin(x * 31 + y * 17 + creature.id * 1.7) * 0.07;
          const gills = x > 0.08 && x < 0.22 ? Math.cos(x * 125) * 0.09 * (1 - center * 0.5) : 0;
          tones[at] = clamp(creature.tone - center * 0.16 + grain + gills, 0.1, 1);
        }
      }
    }
  }
}

/**
 * Mount the renderer inside an explicitly sized element.
 * Temporary pause/visibility changes stop RAF but preserve the logical session.
 */
export function createAsciiShoal(host, options = {}, runtime = {}) {
  if (!host || typeof host.appendChild !== 'function' || !host.ownerDocument) throw new TypeError('ASCII Shoal requires a host element.');
  const doc = host.ownerDocument;
  const win = doc.defaultView;
  if (!win) throw new Error('ASCII Shoal requires a browser window.');
  let settings = normalizeOptions(options);
  let control = normalizeRuntime(runtime);
  let scene = createScene(settings.seed);
  let destroyed = false, manualPaused = false, completed = false;
  let inView = true, hasSize = false, frame = 0, time = 0, elapsed = 0;
  let raf = 0, lastTick = null, lastPaint = -Infinity, logicalRunning;
  let layout = computeLayout(1, 1), field = new Float32Array(1), tones = new Float32Array(1);
  let poses = { sharks: [], fish: [] };
  // Forward-integrated steering preserves momentum; seeded paths are gentle guides.
  const swimmers = new Map();
  const pointer = { x: 0.5, y: 0.5, strength: 0 };
  const splashes = [];
  let pointerTarget = null;
  const canvas = doc.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.asciiShoal = '';
  canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
  host.appendChild(canvas);
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) {
    canvas.remove();
    throw new Error('ASCII Shoal requires a 2D canvas context.');
  }

  const canAnimate = () => !destroyed && control.enabled && !control.paused && !manualPaused && !control.reduced && !completed && inView && hasSize && !doc.hidden && settings.speed > 0 && control.speed > 0;
  const sessionActive = () => !destroyed && control.enabled && !control.reduced && !completed;

  function writeState() {
    host.dataset.running = String(canAnimate());
    host.dataset.paused = String(control.paused || manualPaused);
    host.dataset.time = time.toFixed(5);
    host.dataset.frame = String(frame);
    host.dataset.density = String(settings.density);
    host.dataset.cellWidth = layout.cellWidth.toFixed(5);
    host.dataset.cellHeight = layout.cellHeight.toFixed(5);
    host.dataset.elapsed = elapsed.toFixed(3);
    host.dataset.sharks = String(poses.sharks.length);
    host.dataset.fish = String(poses.fish.length);
    host.dataset.interactive = String(settings.interactive);
    host.dataset.pointerStrength = pointer.strength.toFixed(5);
    host.dataset.pointer = pointer.strength > 0 ? `${pointer.x.toFixed(4)},${pointer.y.toFixed(4)}` : '';
    host.dataset.splashes = JSON.stringify(splashes);
    host.dataset.spines = JSON.stringify(spineSnapshot());
    host.dataset.positions = JSON.stringify(poses.sharks.map(({ x, y, angle }) => ({
      x: Number(x.toFixed(3)), y: Number(y.toFixed(3)), angle: Number(angle.toFixed(4)),
    })));
    host.dataset.swimmers = JSON.stringify(swimmerSnapshot().map(s => ({
      ...s, x: +s.x.toFixed(3), y: +s.y.toFixed(3), angle: +s.angle.toFixed(4),
      speed: +s.speed.toFixed(3), alarm: +s.alarm.toFixed(4),
    })));
  }

  const swimmerKey = pose => `${pose.kind}:${pose.id}`;
  function spineSnapshot() {
    return poses.sharks.map(pose => {
      const nodes = swimmers.get(swimmerKey(pose))?.spine;
      return { id: pose.id, points: nodes ? Array.from(nodes, (value, i) => value * (i % 2 ? layout.height : layout.width)) : [] };
    });
  }
  function poseAt(kind, id, at) {
    return kind === 'shark' ? sharkPose(scene.sharks[id], at, layout.width, layout.height, settings)
      : fishPose(scene.fish[id], scene.schools[scene.fish[id].school], at, layout.width, layout.height);
  }
  function cruiseSpeed(pose, at) {
    const next = poseAt(pose.kind, pose.id, at + 0.025);
    return Math.hypot(next.x - pose.x, next.y - pose.y) / 0.025 * settings.speed;
  }
  function swimmerSnapshot() {
    const short = Math.min(layout.width, layout.height);
    return [...poses.sharks, ...poses.fish].map(pose => {
      const m = swimmers.get(swimmerKey(pose));
      return { id: pose.id, kind: pose.kind, x: pose.x, y: pose.y, angle: pose.angle,
        speed: m ? m.speed * short : cruiseSpeed(pose, time), alarm: m?.alarm ?? 0, pointerAlarm: m?.pointerAlarm ?? 0, tailPhase: pose.tailPhase, curvature: pose.curvature ?? 0 };
    });
  }

  function advanceSwimmers(seconds, startTime) {
    if (!(seconds > 0)) return;
    const { width, height } = layout, short = Math.min(width, height);
    const count = Math.max(1, Math.ceil(seconds / (1 / 120) - 1e-7)), dt = seconds / count;
    const angularDifference = angleDelta;
    for (let step = 0; step < count; step++) {
      advancePointer(dt);
      const at = startTime + step * dt * settings.speed;
      const base = sampleScene(scene, at, width, height, settings);
      // Read one simultaneous state per substep: neighbour response is order-independent.
      const current = [...base.sharks, ...base.fish].map(pose => {
        const state = swimmers.get(swimmerKey(pose));
        return state ? { ...pose, x: state.x * width, y: state.y * height, angle: state.angle, alarm: state.alarm, spine: state.spine } : { ...pose, alarm: 0 };
      });
      for (const pose of [...base.sharks, ...base.fish]) {
        const key = swimmerKey(pose), isFish = pose.kind === 'fish';
        let m = swimmers.get(key);
        const x = m ? m.x * width : pose.x, y = m ? m.y * height : pose.y;
        const dx = x - pointer.x * width, dy = y - pointer.y * height;
        const radius = short * (isFish ? 0.32 : 0.36), distance = Math.hypot(dx, dy);
        const threat = settings.interactive ? (1 - smooth(radius * 0.18, radius, distance)) * pointer.strength : 0;

        if (!m) {
          const cross = Math.cos(pose.angle) * -dy - Math.sin(pose.angle) * -dx;
          m = { x: x / width, y: y / height, angle: pose.angle, turn: 0,
            speed: cruiseSpeed(pose, at) / short, alarm: 0, pointerAlarm: 0, lead: 0,
            side: Math.abs(cross) > short * 0.01 ? (cross > 0 ? -1 : 1) : (pose.id % 2 ? -1 : 1),
            tail: pose.tailPhase, curvature: pose.curvature ?? 0,
            spine: isFish ? null : createSharkSpine(x + Math.cos(pose.angle) * pose.size * 0.47,
              y + Math.sin(pose.angle) * pose.size * 0.47, pose.angle, pose.size * 0.94, width, height) };
          swimmers.set(key, m);
        }
        let danger = threat, separateX = 0, separateY = 0, alignX = 0, alignY = 0, neighbours = 0;
        let centreX = 0, centreY = 0, relayedAlarm = 0;
        for (const splash of splashes) {
          const sx = x - splash.x * width, sy = y - splash.y * height, sd = Math.hypot(sx, sy);
          const impulse = (1 - smooth(short * 0.04, short * 0.46, sd)) * Math.exp(-splash.age * 3.4);
          danger = Math.max(danger, impulse);
          separateX += sx / Math.max(sd, 1) * impulse * (isFish ? 4 : 2.2);
          separateY += sy / Math.max(sd, 1) * impulse * (isFish ? 4 : 2.2);
        }
        for (const other of current) {
          if (other.kind === pose.kind && other.id === pose.id) continue;
          const ox = x - other.x, oy = y - other.y, d = Math.hypot(ox, oy);
          if (d < 0.001) continue;
          const personal = isFish ? pose.size * (1.7 + m.alarm * 1.5) : (pose.size + other.size) * 0.37;
          if (other.kind === pose.kind && d < personal) {
            const weight = 1 - d / personal;
            separateX += ox / d * weight; separateY += oy / d * weight;
          }
          if (isFish && other.kind === 'shark') {
            // React before the snout arrives; flee sideways around the body, not through it.
            let nx = x - other.x, ny = y - other.y, nearest = Infinity;
            // Perceive the curved front half, rather than only the shark's centre.
            if (other.spine) for (let k = 0; k < 10; k += 2) {
              const ax = other.spine[k * 2] * width, ay = other.spine[k * 2 + 1] * height;
              const bx = other.spine[(k + 2) * 2] * width - ax, by = other.spine[(k + 2) * 2 + 1] * height - ay;
              const along = clamp(((x - ax) * bx + (y - ay) * by) / (bx * bx + by * by || 1), 0, 1);
              const px = x - ax - bx * along, py = y - ay - by * along;
              const distance2 = px * px + py * py;
              if (distance2 < nearest) { nearest = distance2; nx = px; ny = py; }
            }
            const reach = other.size * 0.73;
            const weight = 1 - smooth(reach * 0.25, reach, Math.hypot(nx, ny));
            danger = Math.max(danger, weight * 0.65);
            separateX += nx / Math.max(1, Math.hypot(nx, ny)) * weight * 2.2;
            separateY += ny / Math.max(1, Math.hypot(nx, ny)) * weight * 2.2;
            // Split sideways around the approaching predator's flanks.
            const fx = Math.cos(other.angle), fy = Math.sin(other.angle);
            const lateral = fx * ny - fy * nx;
            const flank = lateral / Math.hypot(lateral, pose.size * 0.8);
            separateX -= fy * flank * weight * 0.9;
            separateY += fx * flank * weight * 0.9;
          }
          if (isFish && other.kind === 'fish' && d < short * 0.18 &&
              (-ox * Math.cos(m.angle) - oy * Math.sin(m.angle)) / d > -0.6) {
            relayedAlarm = Math.max(relayedAlarm, other.alarm * 0.82);
            if (scene.fish[other.id].school === scene.fish[pose.id].school) {
              alignX += Math.cos(other.angle); alignY += Math.sin(other.angle);
              centreX -= ox / short; centreY -= oy / short; neighbours++;
            }
          }
        }
        if (isFish) danger = Math.max(danger, relayedAlarm);
        const response = danger > m.alarm ? (isFish ? 0.12 : 0.24) : (isFish ? 0.7 : 1.0);
        m.alarm += (danger - m.alarm) * (1 - Math.exp(-dt / response));
        m.pointerAlarm += (threat - m.pointerAlarm) * (1 - Math.exp(-dt / (threat > m.pointerAlarm ? 0.16 : 0.7)));
        const boost = 1 + m.alarm * (isFish ? 2.1 : 1.0);
        const localTime = at + m.lead;
        const route = poseAt(pose.kind, pose.id, localTime);
        const cruise = Math.max(isFish ? 0.012 : 0.018, cruiseSpeed(route, localTime) / short);
        const previousSpeed = m.speed;
        m.speed += (cruise * boost - m.speed) * (1 - Math.exp(-dt / (isFish ? 0.14 : 0.28)));
        // Seek a point ahead on the accelerated route, never pull position back to a snapshot.
        const ahead = poseAt(pose.kind, pose.id, localTime + settings.speed * 1.05);
        const routeAngle = Math.atan2(ahead.y - y, ahead.x - x);
        const away = Math.atan2(dy || Math.sin(m.angle + m.side), dx || Math.cos(m.angle + m.side));
        const front = -(Math.cos(m.angle) * dx + Math.sin(m.angle) * dy) / Math.max(distance, 1);
        // Predator alarm must never steer a fish away from a stale cursor position.
        const avoid = m.pointerAlarm * smooth(-0.65, 0.5, front);
        let vx = Math.cos(routeAngle) * (1 - avoid) + Math.cos(away) * avoid;
        let vy = Math.sin(routeAngle) * (1 - avoid) + Math.sin(away) * avoid;
        vx += separateX * (isFish ? 1.1 : 1.65); vy += separateY * (isFish ? 1.1 : 1.65);
        if (neighbours) {
          const cohesion = (1 - m.alarm * 0.85) * 2.8;
          vx += alignX / neighbours * 0.32 + centreX / neighbours * cohesion;
          vy += alignY / neighbours * 0.32 + centreY / neighbours * cohesion;
        }
        // Soft edge steering leaves room to turn without clamping or wrapping a creature.
        const margin = short * (isFish ? 0.13 : 0.18);
        const look = isFish ? 0 : m.speed * short * 1.5;
        const edgeX = x + Math.cos(m.angle) * look, edgeY = y + Math.sin(m.angle) * look;
        vx += (Math.max(0, (margin - edgeX) / margin) - Math.max(0, (edgeX - width + margin) / margin)) * 2;
        vy += (Math.max(0, (margin - edgeY) / margin) - Math.max(0, (edgeY - height + margin) / margin)) * 2;
        let turn = angularDifference(Math.atan2(vy, vx), m.angle);
        if (avoid > 0.3 && Math.abs(turn) > 2.4) turn = m.side * Math.abs(turn);
        const maxTurn = isFish ? 3.2 : Math.min(1.3, m.speed / (pose.size / short) * 1.35);
        const targetTurn = clamp(turn * 3.4, -maxTurn, maxTurn);
        m.turn += (targetTurn - m.turn) * (1 - Math.exp(-dt / (isFish ? 0.1 : 0.2)));
        const middleAngle = m.angle + m.turn * dt * 0.5;
        const distanceStep = (previousSpeed + m.speed) * 0.5 * short * dt;
        m.x += Math.cos(middleAngle) * distanceStep / width;
        m.y += Math.sin(middleAngle) * distanceStep / height;
        m.angle += m.turn * dt;
        if (m.spine) followSharkSpine(m.spine,
          m.x * width + Math.cos(m.angle) * pose.size * 0.47,
          m.y * height + Math.sin(m.angle) * pose.size * 0.47,
          m.angle, pose.size * 0.94, width, height);
        m.lead += dt * settings.speed * (boost - 1);
        const bodyLengthsPerSecond = m.speed * short / Math.max(pose.size, 1);
        const tailRate = isFish ? 4.8 * settings.speed * (1 + m.alarm * 0.7)
          : TAU * (0.15 * settings.speed + bodyLengthsPerSecond * 1.05);
        m.tail += dt * tailRate;
        const curvature = isFish ? 0 : clamp(m.turn * pose.size / Math.max(m.speed * short, 1), -0.65, 0.65);
        m.curvature += (curvature - m.curvature) * (1 - Math.exp(-dt / 0.28));
      }
    }
  }

  function announce(force = false) {
    const active = sessionActive();
    if (force || active !== logicalRunning) {
      logicalRunning = active;
      if (control.onRunning) control.onRunning(active);
    }
  }

  function paint() {
    if (destroyed || !hasSize) return;
    const { width, height, columns, rows, cellWidth, cellHeight } = layout;
    poses = sampleScene(scene, time, width, height, settings);
    for (const group of ['sharks', 'fish']) poses[group] = poses[group].map(pose => {
      const m = swimmers.get(swimmerKey(pose));
      return m ? { ...pose, x: m.x * width, y: m.y * height, angle: m.angle,
        tailPhase: m.tail, ...(group === 'sharks' ? { bend: Math.sin(m.tail), curvature: m.curvature, spine: m.spine } : {}) } : pose;
    });
    rasterize(layout, [...poses.sharks, ...poses.fish], settings, field, tones);
    context.setTransform(layout.dpr, 0, 0, layout.dpr, 0, 0);
    context.globalAlpha = 1;
    context.fillStyle = settings.backgroundColor;
    context.fillRect(0, 0, width, height);
    context.font = `${layout.fontSize.toFixed(3)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const glyphs = Array.from(settings.characters);
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const at = row * columns + column;
        const coverage = field[at];
        const x = (column + 0.5) * cellWidth;
        const y = (row + 0.5) * cellHeight;
        if (coverage < 0.035) {
          if (settings.gridOpacity === 0 || settings.opacity === 0) continue;
          const weave = (Math.sin(column * 0.21 + row * 0.17) + Math.cos(row * 0.13 - column * 0.11) + 2) * 0.25;
          context.globalAlpha = settings.gridOpacity * settings.opacity * (0.3 + weave * 0.7);
          context.fillStyle = settings.inkColor;
          context.fillText(glyphs[Math.min(glyphs.length - 1, Math.floor(weave * Math.min(3, glyphs.length)))], x, y);
          continue;
        }
        const level = tones[at];
        context.fillStyle = settings.inkColor;
        context.globalAlpha = coverage * settings.opacity * (0.69 + level * 0.24);
        const gap = Math.min(0.65, cellWidth * 0.075);
        context.fillRect(column * cellWidth + gap / 2, row * cellHeight + gap / 2, cellWidth - gap, cellHeight - gap);
        context.fillStyle = settings.backgroundColor;
        context.globalAlpha = coverage * settings.opacity * (0.68 + level * 0.3);
        const glyph = Math.min(glyphs.length - 1, Math.floor((0.16 + level * 0.78) * glyphs.length));
        context.fillText(glyphs[glyph], x, y);
      }
    }
    // A short neutral ripple makes clicks/taps legible even between creatures.
    for (const splash of splashes) {
      const radius = Math.min(width, height) * (0.018 + splash.age * 0.24);
      context.globalAlpha = Math.exp(-splash.age * 3.5) * 0.22 * settings.opacity;
      context.strokeStyle = settings.inkColor;
      context.lineWidth = Math.max(1, cellWidth * 0.32);
      context.beginPath(); context.arc(splash.x * width, splash.y * height, radius, 0, TAU); context.stroke();
    }
    context.globalAlpha = 1;
    frame++;
    writeState();
  }

  function stopFrame() {
    if (raf) win.cancelAnimationFrame(raf);
    raf = 0;
    lastTick = null;
  }

  function sync(forceAnnouncement = false) {
    if (destroyed) return;
    if (canAnimate()) {
      if (!raf) {
        lastTick = null;
        raf = win.requestAnimationFrame(tick);
      }
    } else stopFrame();
    writeState();
    announce(forceAnnouncement);
  }

  function clearPointer(reset = false) {
    pointerTarget = null;
    if (reset) { pointer.strength = 0; splashes.length = 0; }
  }

  function pointerMove(event) {
    if (!settings.interactive || !canAnimate() || event.pointerType === 'touch') return;
    const rect = host.getBoundingClientRect();
    if (!(rect.width > 0 && rect.height > 0)) return;
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (pointer.strength === 0) { pointer.x = x; pointer.y = y; }
    pointerTarget = { x, y };
  }

  function pointerLeave() { clearPointer(); }
  function pointerDown(event) {
    if (!settings.interactive || !canAnimate() || event.button > 0 || event.isPrimary === false) return;
    const rect = host.getBoundingClientRect();
    if (!(rect.width > 0 && rect.height > 0)) return;
    const x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
    if (!Number.isFinite(x + y) || x < 0 || x > 1 || y < 0 || y > 1) return;
    splashes.push({ x, y, age: 0 });
    if (splashes.length > 3) splashes.shift();
  }
  function windowBlur() { clearPointer(true); }

  function advancePointer(dt) {
    for (let i = splashes.length - 1; i >= 0; i--) {
      splashes[i].age += dt;
      if (splashes[i].age > 1.4) splashes.splice(i, 1);
    }
    const target = pointerTarget;
    if (target) {
      const follow = 1 - Math.exp(-dt / 0.055);
      pointer.x += (target.x - pointer.x) * follow;
      pointer.y += (target.y - pointer.y) * follow;
    }
    const blend = 1 - Math.exp(-dt / (target ? 0.08 : 0.14));
    pointer.strength += ((target ? 1 : 0) - pointer.strength) * blend;
    if (!target && pointer.strength < 0.001) pointer.strength = 0;
  }

  function tick(now) {
    raf = 0;
    if (!canAnimate()) { sync(); return; }
    const dt = lastTick === null ? 0 : clamp((now - lastTick) / 1000, 0, 0.1);
    lastTick = now;
    const previousActive = Math.max(0, elapsed - control.delayMs);
    elapsed += dt * 1000 * control.speed;
    if (!control.loop && elapsed >= control.delayMs + control.durationMs) {
      elapsed = control.delayMs + control.durationMs;
      completed = true;
    }
    const active = Math.max(0, elapsed - control.delayMs);
    const swimSeconds = (active - previousActive) / 1000;
    const previousTime = time;
    time += swimSeconds * settings.speed;
    advanceSwimmers(swimSeconds, previousTime);
    if (now - lastPaint >= FRAME_MS - 0.2 || completed) {
      paint();
      lastPaint = now;
    }
    if (canAnimate()) raf = win.requestAnimationFrame(tick);
    else { stopFrame(); writeState(); announce(); }
  }

  function resize() {
    if (destroyed) return;
    const rect = host.getBoundingClientRect();
    hasSize = rect.width > 0 && rect.height > 0;
    const nextLayout = computeLayout(rect.width, rect.height, settings.density, settings.glyphScale, win.devicePixelRatio || 1);
    if (nextLayout.width !== layout.width || nextLayout.height !== layout.height) {
      const scale = Math.min(nextLayout.width, nextLayout.height) / Math.min(layout.width, layout.height);
      for (const m of swimmers.values()) if (m.spine) for (let k = 0; k < m.spine.length; k += 2) {
        m.spine[k] = m.x + (m.spine[k] - m.x) * layout.width * scale / nextLayout.width;
        m.spine[k + 1] = m.y + (m.spine[k + 1] - m.y) * layout.height * scale / nextLayout.height;
      }
    }
    layout = nextLayout;
    canvas.width = Math.max(1, Math.round(layout.width * layout.dpr));
    canvas.height = Math.max(1, Math.round(layout.height * layout.dpr));
    field = new Float32Array(layout.cells);
    tones = new Float32Array(layout.cells);
    paint();
    sync();
  }

  function visibilityChange() { if (doc.hidden) clearPointer(true); sync(); }

  doc.addEventListener('visibilitychange', visibilityChange);
  host.addEventListener('pointermove', pointerMove);
  host.addEventListener('pointerdown', pointerDown, { passive: true });
  host.addEventListener('pointerleave', pointerLeave);
  host.addEventListener('pointercancel', pointerLeave);
  win.addEventListener('blur', windowBlur);
  const resizeObserver = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(resize) : null;
  const intersectionObserver = typeof win.IntersectionObserver === 'function' ? new win.IntersectionObserver((entries) => {
    const entry = entries.find((item) => item.target === host);
    if (entry) { inView = entry.isIntersecting; if (!inView) clearPointer(true); sync(); }
  }, { threshold: 0 }) : null;
  if (resizeObserver) resizeObserver.observe(host);
  else win.addEventListener('resize', resize);
  if (intersectionObserver) intersectionObserver.observe(host);
  resize();

  return {
    update(nextOptions = {}, nextRuntime) {
      if (destroyed) return;
      const previousSeed = settings.seed;
      const previousSharkScale = settings.sharkScale;
      const previousCallback = control.onRunning;
      settings = normalizeOptions({ ...settings, ...nextOptions });
      if (previousSharkScale !== settings.sharkScale) {
        const ratio = settings.sharkScale / previousSharkScale;
        for (const m of swimmers.values()) if (m.spine) for (let k = 0; k < m.spine.length; k += 2) {
          m.spine[k] = m.x + (m.spine[k] - m.x) * ratio;
          m.spine[k + 1] = m.y + (m.spine[k + 1] - m.y) * ratio;
        }
      }
      if (nextRuntime) control = normalizeRuntime({ ...control, ...nextRuntime });
      if (!settings.interactive || control.reduced || !control.enabled) clearPointer(true);
      if (previousSeed !== settings.seed) {
        scene = createScene(settings.seed);
        swimmers.clear();
        time = 0;
        elapsed = 0;
        completed = false;
      }
      for (const key of swimmers.keys()) {
        const [kind, id] = key.split(':');
        if (+id >= (kind === 'shark' ? settings.sharkCount : Math.round(settings.fishDensity * 42))) swimmers.delete(key);
      }
      // Keep time and deterministic descriptors intact on sampling/style edits.
      resize();
      if (previousCallback !== control.onRunning) announce(true);
    },
    play() {
      if (destroyed) return;
      manualPaused = false;
      control.paused = false;
      sync();
    },
    pause() {
      if (destroyed) return;
      manualPaused = true;
      sync();
    },
    restart() {
      if (destroyed) return;
      stopFrame();
      scene = createScene(settings.seed);
      swimmers.clear();
      time = 0;
      elapsed = 0;
      frame = 0;
      completed = false;
      manualPaused = false;
      control.paused = false;
      lastPaint = -Infinity;
      clearPointer(true);
      paint();
      sync();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopFrame();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!resizeObserver) win.removeEventListener('resize', resize);
      doc.removeEventListener('visibilitychange', visibilityChange);
      host.removeEventListener('pointermove', pointerMove);
      host.removeEventListener('pointerdown', pointerDown);
      host.removeEventListener('pointerleave', pointerLeave);
      host.removeEventListener('pointercancel', pointerLeave);
      win.removeEventListener('blur', windowBlur);
      canvas.remove();
      writeState();
      announce();
    },
    getState() {
      return {
        time, elapsed, frame, running: canAnimate(), paused: control.paused || manualPaused,
        completed, destroyed, inView, reduced: control.reduced,
        density: settings.density, cellWidth: layout.cellWidth, cellHeight: layout.cellHeight,
        columns: layout.columns, rows: layout.rows,
        sharkCount: poses.sharks.length, fishCount: poses.fish.length,
        pointer: { ...pointer, active: pointerTarget !== null },
        swimmers: swimmerSnapshot(),
        spines: spineSnapshot(),
        splashes: splashes.map(splash => ({ ...splash })),
        positions: poses.sharks.map(({ x, y, angle, size }) => ({ x, y, angle, size })),
      };
    },
  };
}
