import assert from 'node:assert/strict';
import test from 'node:test';
import { defaults, normalizeOptions, computeLayout, createScene, sampleScene, sampleSharkMask, createAsciiShoal } from '../src/ascii-shoal.js';

test('validation bounds numerical settings and rejects unusable glyphs and colors', () => {
  const value = normalizeOptions({ density: 99, glyphScale: NaN, speed: -1, sharkCount: 2.8, fishDensity: Infinity, seed: 4.9, characters: '\n\t ', backgroundColor: 'url(https://example.invalid/image)', inkColor: '#ABC' });
  assert.equal(value.density, 2);
  assert.equal(value.glyphScale, defaults.glyphScale);
  assert.equal(value.speed, 0);
  assert.equal(value.sharkCount, 3);
  assert.equal(value.fishDensity, defaults.fishDensity);
  assert.equal(value.seed, 4);
  assert.equal(value.characters, defaults.characters);
  assert.equal(value.backgroundColor, defaults.backgroundColor);
  assert.equal(value.inkColor, '#ABC');
  assert.equal(Array.from(normalizeOptions({ characters: '🐟'.repeat(40) }).characters).length, 32);
});

test('sampling density changes cell count; glyph scale changes only typography', () => {
  const sparse = computeLayout(640, 400, 0.5, 0.6, 3);
  const dense = computeLayout(640, 400, 2, 0.6, 3);
  const largeGlyphs = computeLayout(640, 400, 0.5, 1.3, 3);
  assert.ok(dense.cells > sparse.cells * 3);
  assert.equal(largeGlyphs.cells, sparse.cells);
  assert.equal(largeGlyphs.cellWidth, sparse.cellWidth);
  assert.ok(largeGlyphs.fontSize > sparse.fontSize * 2);
  assert.ok(sparse.dpr <= 2);
  for (const [w, h] of [[7680, 4320], [1, 16000], [16000, 1], [Infinity, -10]]) {
    const layout = computeLayout(w, h, 2, 1.3, 4);
    assert.ok(layout.cells <= 48000);
    assert.ok(layout.width * layout.height * layout.dpr ** 2 <= 6000001);
    assert.ok(layout.cellWidth > 0 && Number.isFinite(layout.fontSize));
  }
  for (const [width, height] of [[1440, 960], [390, 844]]) {
    const baseline = computeLayout(width, height, 1);
    const fine = computeLayout(width, height, 1.6);
    assert.ok(fine.cells > baseline.cells * 2, `fine grid is materially denser at ${width}×${height}`);
    assert.ok(fine.cellWidth < baseline.cellWidth * 0.7);
  }
});

test('the same seed reproduces geometry, while different seeds produce different routes', () => {
  assert.deepEqual(createScene(7), createScene(7));
  assert.notDeepEqual(createScene(7), createScene(8));
  const scene = createScene(7);
  assert.ok(Object.isFrozen(scene.sharks[0]));
  const poses = sampleScene(scene, 17, 1000, 600);
  assert.equal(poses.sharks.length, 4);
  assert.equal(poses.fish.length, 42);
  for (const shark of poses.sharks) {
    // The authored nose-to-tail envelope is about 1.07 local units.
    assert.ok(shark.size * 1.07 / 600 >= 0.3 && shark.size * 1.07 / 600 <= 0.45);
  }
});

test('density, glyph size and color never alter poses; count changes preserve existing creatures', () => {
  const scene = createScene(-931);
  const a = sampleScene(scene, 8.25, 970, 620, { density: 0.5, glyphScale: 0.6 });
  const b = sampleScene(scene, 8.25, 970, 620, { density: 2, glyphScale: 1.3, inkColor: '#ffffff' });
  assert.deepEqual(a, b);
  const more = sampleScene(scene, 8.25, 970, 620, { sharkCount: 6, fishDensity: 2 });
  assert.deepEqual(more.sharks.slice(0, 4), a.sharks);
  assert.deepEqual(more.fish.slice(0, 42), a.fish);
});

test('the authored mask contains body and extended paired fins and deforms the tail smoothly', () => {
  assert.ok(sampleSharkMask(0.25, 0) > 0.99);
  assert.ok(sampleSharkMask(-0.07, 0.19) > 0.8);
  assert.ok(sampleSharkMask(-0.07, -0.19) > 0.8);
  assert.equal(sampleSharkMask(0.8, 0.5), 0);
  assert.equal(sampleSharkMask(NaN, 0), 0);
  let tailDifference = 0, headDifference = 0;
  for (let x = -0.7; x <= 0.5; x += 0.015) {
    for (let y = -0.3; y <= 0.3; y += 0.015) {
      const a = sampleSharkMask(x, y, 0);
      const b = sampleSharkMask(x, y, Math.PI / 2);
      assert.ok(a >= 0 && a <= 1 && Number.isFinite(a));
      if (x < -0.3) tailDifference += Math.abs(a - b);
      if (x > 0.15) headDifference += Math.abs(a - b);
    }
  }
  assert.ok(tailDifference > 10);
  assert.equal(headDifference, 0);
});

test('routes remain continuous, and pointer avoidance moves a nearby shark away', () => {
  const scene = createScene(17);
  const a = sampleScene(scene, 10, 900, 600);
  const b = sampleScene(scene, 10.001, 900, 600);
  a.sharks.forEach((shark, i) => assert.ok(Math.hypot(shark.x - b.sharks[i].x, shark.y - b.sharks[i].y) < 0.1));
  const pointer = { x: a.sharks[0].x - 25, y: a.sharks[0].y, energy: 1 };
  const avoided = sampleScene(scene, 10, 900, 600, defaults, pointer);
  assert.ok(avoided.sharks[0].x > a.sharks[0].x);
  const disabled = sampleScene(scene, 10, 900, 600, { interactive: false }, pointer);
  assert.deepEqual(disabled, a);
});

// A small clock/event fixture tests scheduling and cleanup; it does not simulate
// browser rendering. Actual Canvas appearance belongs to the browser QA suite.
function browserFixture() {
  const callbacks = new Map(), listeners = new Map(), hostListeners = new Map();
  let nextId = 1, now = 0, observerCallback, removed = false, paintCount = 0;
  const context = { setTransform() {}, fillRect() { paintCount++; }, fillText() {} };
  const canvas = {
    style: {}, dataset: {}, setAttribute() {}, getContext() { return context; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 320, height: 230 }; },
    remove() { removed = true; },
  };
  const win = {
    devicePixelRatio: 2,
    requestAnimationFrame(callback) { const id = nextId++; callbacks.set(id, callback); return id; },
    cancelAnimationFrame(id) { callbacks.delete(id); },
    addEventListener() {}, removeEventListener() {},
    ResizeObserver: class { observe() {} disconnect() {} },
    IntersectionObserver: class { constructor(callback) { observerCallback = callback; } observe() {} disconnect() {} },
  };
  const doc = {
    defaultView: win, hidden: false, createElement() { return canvas; },
    addEventListener(name, callback) { listeners.set(name, callback); },
    removeEventListener(name) { listeners.delete(name); },
  };
  const host = {
    ownerDocument: doc, dataset: {}, appendChild() {},
    getBoundingClientRect: canvas.getBoundingClientRect,
    addEventListener(name, callback) { hostListeners.set(name, callback); },
    removeEventListener(name) { hostListeners.delete(name); },
  };
  return {
    host, doc, callbacks, listeners, hostListeners,
    step(ms = 40) { now += ms; const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach((callback) => callback(now)); },
    visible(value) { observerCallback([{ target: host, isIntersecting: value }]); },
    hidden(value) { doc.hidden = value; listeners.get('visibilitychange')(); },
    get removed() { return removed; }, get paintCount() { return paintCount; },
  };
}

test('pause, offscreen, hidden and reduced modes stop scheduling and preserve phase', () => {
  const env = browserFixture(), reports = [];
  const engine = createAsciiShoal(env.host, {}, { onRunning: (value) => reports.push(value) });
  const initial = engine.getState().positions;
  env.step(); env.step(); env.step();
  assert.ok(engine.getState().time > 0);
  assert.notDeepEqual(engine.getState().positions, initial);
  engine.pause();
  const paused = engine.getState();
  assert.equal(env.callbacks.size, 0);
  env.step(3000);
  assert.equal(engine.getState().time, paused.time);
  assert.equal(reports.at(-1), true, 'logical session survives pause for toolbar resume');
  engine.update({ density: 2, inkColor: '#112233' });
  assert.deepEqual(engine.getState().positions, paused.positions);
  assert.equal(engine.getState().time, paused.time);
  engine.play(); env.step(); env.step();
  assert.ok(engine.getState().time > paused.time);
  env.visible(false);
  assert.equal(env.callbacks.size, 0);
  env.visible(true);
  assert.equal(env.callbacks.size, 1);
  env.hidden(true);
  assert.equal(env.callbacks.size, 0);
  env.hidden(false);
  assert.equal(env.callbacks.size, 1);
  engine.update({}, { reduced: true });
  assert.equal(env.callbacks.size, 0);
  assert.equal(reports.at(-1), false);
  assert.ok(engine.getState().positions.length > 0);
  engine.destroy();
  assert.equal(env.callbacks.size, 0);
  assert.equal(env.listeners.size, 0);
  assert.equal(env.hostListeners.size, 0);
  assert.ok(env.removed);
});

test('restart is seed-repeatable; runtime delay and finite completion are respected', () => {
  const env = browserFixture(), reports = [];
  const engine = createAsciiShoal(env.host, { gridOpacity: 0 }, { delayMs: 100, durationMs: 120, loop: false, onRunning: (value) => reports.push(value) });
  const initial = engine.getState().positions;
  env.step(); env.step(); env.step();
  assert.equal(engine.getState().time, 0);
  env.step();
  assert.ok(engine.getState().time > 0);
  env.step(); env.step(); env.step();
  assert.equal(engine.getState().completed, true);
  assert.equal(engine.getState().elapsed, 220);
  assert.ok(Math.abs(engine.getState().time - 0.12) < 1e-8);
  assert.equal(env.callbacks.size, 0);
  assert.equal(reports.at(-1), false);
  engine.restart();
  assert.equal(engine.getState().time, 0);
  assert.equal(engine.getState().elapsed, 0);
  assert.deepEqual(engine.getState().positions, initial);
  assert.equal(reports.at(-1), true);
  engine.destroy();
});

test('rendering is capped to 30fps while zero speed and disabled runtime do not schedule', () => {
  const env = browserFixture();
  const engine = createAsciiShoal(env.host, { gridOpacity: 0 });
  const start = engine.getState().frame;
  for (let i = 0; i < 120; i++) env.step(1000 / 120);
  assert.ok(engine.getState().frame - start <= 30);
  engine.update({ speed: 0 });
  assert.equal(env.callbacks.size, 0);
  engine.update({ speed: 1 }, { enabled: false });
  assert.equal(env.callbacks.size, 0);
  engine.update({}, { enabled: true, paused: true });
  assert.equal(env.callbacks.size, 0);
  engine.update({}, { paused: false });
  assert.equal(env.callbacks.size, 1);
  engine.destroy();
});
