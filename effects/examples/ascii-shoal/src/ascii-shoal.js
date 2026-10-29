/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 KAI-NEX and TuneShape contributors
 *
 * ASCII Shoal — an independently authored, dependency-free character renderer.
 * The shapes, paths, palette and lifecycle below are original to this module.
 */

export const defaults = Object.freeze({
  density: 1,
  glyphScale: 0.9,
  speed: 1,
  sharkCount: 4,
  sharkScale: 1,
  fishDensity: 1,
  backgroundColor: '#fafaf7',
  inkColor: '#30362f',
  opacity: 0.9,
  gridOpacity: 0.04,
  wakeOpacity: 0,
  interactive: false,
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
    interactive: false, // Retained for configuration compatibility; pointer input is ignored.
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
      drift: 0.052 + pick(k + 5) * 0.024,
      direction: pick(k + 6) < 0.5 ? -1 : 1,
      size: 0.32 + pick(k + 7) * 0.075,
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
    x: width * (shark.centerX + shark.orbitX * Math.cos(a) + 0.035 * Math.sin(2 * a + shark.phase)),
    y: height * (shark.centerY + shark.orbitY * Math.sin(a) + 0.026 * Math.cos(3 * a - shark.phase)),
  };
  return p;
}

/** Pure scene sampling: density and glyphScale cannot influence swimming paths. */
export function sampleScene(scene, time, width, height, options = defaults, _pointer = null) {
  const settings = normalizeOptions(options);
  time = finite(time, 0, 0, 1e10);
  width = finite(width, 1, 1, 16384);
  height = finite(height, 1, 1, 16384);
  const short = Math.min(width, height);
  const sharks = scene.sharks.slice(0, settings.sharkCount).map((shark) => {
    const p = sharkPoint(shark, time, width, height);
    const next = sharkPoint(shark, time + 0.025, width, height);
    return {
      id: shark.id, kind: 'shark', x: p.x, y: p.y,
      angle: Math.atan2(next.y - p.y, next.x - p.x),
      size: short * shark.size * settings.sharkScale,
      bend: Math.sin(time * shark.tailRate + shark.tailPhase),
      tailPhase: time * shark.tailRate + shark.tailPhase,
      tone: shark.tone,
    };
  });
  const centers = scene.schools.map((school) => {
    const a = school.phase + time * school.drift;
    return {
      x: width * (0.5 + school.orbitX * Math.cos(a)),
      y: height * (0.5 + school.orbitY * Math.sin(a * 1.0 + 0.32)),
      angle: Math.atan2(height * school.orbitY * Math.cos(a + 0.32), -width * school.orbitX * Math.sin(a)),
      spread: short * school.spread,
    };
  });
  const fish = scene.fish.slice(0, Math.round(settings.fishDensity * 42)).map((fish) => {
    const school = centers[fish.school];
    const a = school.angle;
    const localX = fish.localX * school.spread;
    const localY = (fish.localY + Math.sin(time * fish.pulse + fish.phase) * 0.055) * school.spread;
    const p = {
      x: school.x + Math.cos(a) * localX - Math.sin(a) * localY,
      y: school.y + Math.sin(a) * localX + Math.cos(a) * localY,
    };
    return {
      id: fish.id, kind: 'fish', x: p.x, y: p.y,
      angle: a + Math.sin(time * fish.pulse + fish.phase) * 0.11,
      size: short * fish.size, tailPhase: time * 4.8 + fish.phase, tone: 0.57,
    };
  });
  return { sharks, fish };
}

const PECTORAL = [[0.16, 0.068], [-0.13, 0.285], [-0.075, 0.065]];
const PELVIC = [[-0.19, 0.045], [-0.325, 0.13], [-0.34, 0.025]];
const TAIL = [[-0.405, 0], [-0.61, 0.17], [-0.545, 0.037], [-0.49, 0]];

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
export function sampleSharkMask(x, y, phase = 0, softness = 0.012) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
  const bend = smooth(-0.02, 0.59, -x);
  y -= Math.sin(phase + x * 5.2) * bend * bend * 0.1;
  const q = (x - 0.005) / 0.455;
  const radius = 0.126 * Math.sqrt(Math.max(0, 1 - q * q)) * (0.63 + 0.37 * smooth(-1, 0.55, q));
  const body = Math.abs(q) <= 1 ? Math.abs(y) - radius : Math.hypot(Math.abs(x - 0.005) - 0.455, y);
  const side = Math.abs(y);
  const distance = Math.min(body, polygonDistance(x, side, PECTORAL), polygonDistance(x, side, PELVIC), polygonDistance(x, side, TAIL));
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
        let coverage = isShark ? sampleSharkMask(x, y, creature.tailPhase, aa) : sampleFishMask(x, y, creature.tailPhase, aa);
        if (isShark && settings.wakeOpacity > 0 && x < -0.45 && x > -1.1) {
          const spread = 0.11 + (-x - 0.45) * 0.22;
          const ripple = Math.pow(Math.max(0, Math.cos(y / spread * Math.PI * 2 - x * 19 + creature.tailPhase)), 4);
          coverage = Math.max(coverage, Math.exp(-y * y / (spread * spread)) * (-x - 0.45) * (1.1 + x) * ripple * settings.wakeOpacity * 1.8);
        }
        const at = row * columns + column;
        if (coverage > field[at]) {
          field[at] = coverage;
          const center = Math.exp(-y * y * 65);
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
    host.dataset.positions = JSON.stringify(poses.sharks.map(({ x, y, angle }) => ({
      x: Number(x.toFixed(3)), y: Number(y.toFixed(3)), angle: Number(angle.toFixed(4)),
    })));
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
    time += (active - previousActive) / 1000 * settings.speed;
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
    layout = computeLayout(rect.width, rect.height, settings.density, settings.glyphScale, win.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(layout.width * layout.dpr));
    canvas.height = Math.max(1, Math.round(layout.height * layout.dpr));
    field = new Float32Array(layout.cells);
    tones = new Float32Array(layout.cells);
    paint();
    sync();
  }

  function visibilityChange() { sync(); }

  doc.addEventListener('visibilitychange', visibilityChange);
  const resizeObserver = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(resize) : null;
  const intersectionObserver = typeof win.IntersectionObserver === 'function' ? new win.IntersectionObserver((entries) => {
    const entry = entries.find((item) => item.target === host);
    if (entry) { inView = entry.isIntersecting; sync(); }
  }, { threshold: 0 }) : null;
  if (resizeObserver) resizeObserver.observe(host);
  else win.addEventListener('resize', resize);
  if (intersectionObserver) intersectionObserver.observe(host);
  resize();

  return {
    update(nextOptions = {}, nextRuntime) {
      if (destroyed) return;
      const previousSeed = settings.seed;
      const previousCallback = control.onRunning;
      settings = normalizeOptions({ ...settings, ...nextOptions });
      if (nextRuntime) control = normalizeRuntime({ ...control, ...nextRuntime });
      if (previousSeed !== settings.seed) {
        scene = createScene(settings.seed);
        time = 0;
        elapsed = 0;
        completed = false;
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
      time = 0;
      elapsed = 0;
      frame = 0;
      completed = false;
      manualPaused = false;
      control.paused = false;
      lastPaint = -Infinity;
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
        positions: poses.sharks.map(({ x, y, angle, size }) => ({ x, y, angle, size })),
      };
    },
  };
}
