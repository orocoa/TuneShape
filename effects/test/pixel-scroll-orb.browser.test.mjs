import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {basename, dirname, join, resolve} from 'node:path';
import test from 'node:test';
import {setTimeout as sleep} from 'node:timers/promises';
import {createServer} from 'vite';

const chromePath = process.env.TUNESHAPE_TEST_CHROME;

async function until(check, description, timeout = 4000) {
  const deadline = Date.now() + timeout;
  do {
    const value = await check();
    if (value) return value;
    await sleep(20);
  } while (Date.now() < deadline);
  assert.fail(description);
}

async function connect(url) {
  const socket = new WebSocket(url);
  await once(socket, 'open');
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', ({data}) => {
    const response = JSON.parse(data);
    const reply = pending.get(response.id);
    if (!reply) return;
    pending.delete(response.id);
    if (response.error) reply.reject(new Error(response.error.message));
    else reply.resolve(response.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, {resolve, reject});
    socket.send(JSON.stringify({id, method, params}));
  });
  const page = async (fn, ...args) => {
    const response = await send('Runtime.evaluate', {
      expression: `(${fn})(...${JSON.stringify(args)})`,
      returnByValue: true,
      awaitPromise: true,
    });
    assert.equal(response.exceptionDetails, undefined, response.exceptionDetails?.exception?.description);
    return response.result.value;
  };
  return {socket, send, page};
}

function previewState() {
  const pane = document.querySelector('.reuse-demo [role="region"]');
  if (!pane) return;
  const indicator = pane.querySelector('.pixel-scroll-orb, .monochrome-orb, .conic-scroll-orb, [role="slider"]');
  const fill = pane.querySelector('.vertical-gauge-fill');
  const conic = pane.querySelector('.conic-orb-number');
  const mono = pane.querySelector('.monochrome-orb-number');
  const bars = pane.querySelectorAll('.gradient-rail-bar');
  const shade = bar => Number(getComputedStyle(bar).backgroundColor.match(/\d+/)[0]);
  const button = document.querySelector('.reuse-toolbar button');
  const visible = !indicator.hidden && getComputedStyle(indicator).visibility === 'visible'
    && Number(getComputedStyle(indicator).opacity) >= .78;
  const percentage = fill ? parseFloat(fill.style.height) : bars.length ? Number(indicator.getAttribute('aria-valuenow'))
    : conic ? parseFloat(conic.textContent) : mono ? Number(mono.textContent)
    : Number(indicator.getAttribute('aria-label').match(/(\d+)%$/)[1]);
  return {
    position: pane.scrollTop / (pane.scrollHeight - pane.clientHeight), percentage, visible,
    direction: indicator.dataset.direction, labelTop: parseFloat(pane.querySelector('.vertical-gauge-percent')?.style.top),
    shades: bars.length ? [shade(bars[0]), shade(bars[bars.length - 1])] : null,
    transport: button.textContent.trim(),
  };
}

test('Standalone scrolling previews use real progress, playback and teardown', {
  skip: chromePath ? false : 'Set TUNESHAPE_TEST_CHROME to run Chromium regression',
  timeout: 100000,
}, async t => {
  const tempRoot = resolve(tmpdir());
  const profilePrefix = 'tuneshape-orb-test-';
  const profile = await mkdtemp(join(tempRoot, profilePrefix));
  t.after(() => {
    assert.equal(dirname(profile), tempRoot);
    assert.ok(basename(profile).startsWith(profilePrefix));
    return rm(profile, {recursive: true, force: true, maxRetries: 4, retryDelay: 150});
  });
  const server = await createServer({root: resolve(import.meta.dirname, '..'), server: {host: '127.0.0.1', port: 0}});
  t.after(() => server.close());
  await server.listen();
  const address = server.httpServer.address();
  const chrome = spawn(chromePath, [
    '--headless', '--no-first-run', '--disable-background-networking', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, 'about:blank',
  ], {windowsHide: true, stdio: 'ignore'});
  let browser;
  let launchError;
  chrome.on('error', error => { launchError = error; });

  try {
    const port = await until(async () => {
      if (launchError) throw launchError;
      try { return (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split(/\r?\n/)[0]; }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }, 'Chromium debugging port');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    browser = await connect(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
    const {send, page} = browser;
    await send('Page.enable');
    await send('Page.addScriptToEvaluateOnNewDocument', {source: `{
      const read = (${previewState});
      function sample() {
        const state = read();
        if (state) window.firstPreviewFrame = {query: location.search, ...state};
        else requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    }`});
    let visit = 0;
    const open = async (id = 'pixel-scroll-orb') => {
      const query = `?visit=${++visit}`;
      await send('Page.navigate', {url: `http://127.0.0.1:${address.port}/examples/${id}/${query}`});
      await until(() => page(expected => window.firstPreviewFrame?.query === expected, query), `render ${id}`, 15000);
    };
    const read = () => page(() => {
      const pane = document.querySelector('.pixel-scroll-pane');
      const orb = pane.querySelector('.pixel-scroll-orb');
      return {
        top: pane.scrollTop, max: pane.scrollHeight - pane.clientHeight, hidden: orb.hidden, inert: orb.inert,
        opacity: Number(getComputedStyle(orb).opacity),
        label: orb.getAttribute('aria-label'), active: orb.querySelectorAll('.pixel-scroll-segment[data-active]').length,
        focused: document.activeElement === pane, outer: window.scrollY,
        paused: pane.closest('[data-recipe]').dataset.paused === 'true',
      };
    });
    const scroll = top => page(value => { document.querySelector('.pixel-scroll-pane').scrollTop = value; }, top);
    const focus = selector => page(value => document.querySelector(value).focus({preventScroll: true}), selector);
    const toolbar = label => page(text => {
      [...document.querySelectorAll('.reuse-toolbar button')].find(button => button.textContent === text).click();
    }, label);
    const key = async (key, code, virtualKey, text) => {
      const base = {key, code, windowsVirtualKeyCode: virtualKey, nativeVirtualKeyCode: virtualKey};
      await send('Input.dispatchKeyEvent', {...base, type: 'keyDown', text});
      await send('Input.dispatchKeyEvent', {...base, type: 'keyUp'});
    };
    const center = selector => page(value => {
      const rect = document.querySelector(value).getBoundingClientRect();
      return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
    }, selector);
    const mouse = (type, point, options = {}) => send('Input.dispatchMouseEvent', {type, ...point, ...options});
    const hover = async () => mouse('mouseMoved', await center('.pixel-scroll-orb'));
    const particlesVisible = () => page(() => [...document.querySelectorAll('.pixel-scroll-particles rect')]
      .some(particle => Number(getComputedStyle(particle).opacity) > 0));
    const reachesTop = () => until(async () => {
      const state = await read();
      return state.top === 0 && state.hidden && state.inert;
    }, 'return to the reading pane top');

    await send('Emulation.setDeviceMetricsOverride', {width: 1024, height: 768, deviceScaleFactor: 1, mobile: false});
    await open();
    assert.equal((await read()).hidden, false);
    await scroll(72);
    await until(async () => {
      const {max, label} = await read();
      return label.endsWith(` ${Math.round(7200 / max)}%`);
    }, 'measure at 72px');
    await until(async () => (await read()).hidden, 'hide at the 72px threshold');
    await scroll(73);
    await until(async () => {
      const {hidden, inert, opacity} = await read();
      return !hidden && !inert && opacity > 0 && opacity < 1;
    }, 'fade in at 73px');
    await until(async () => (await read()).opacity === 1, 'finish the fade-in');
    await focus('.pixel-scroll-orb');
    await scroll(72);
    await until(async () => {
      const {hidden, inert, opacity, focused} = await read();
      return !hidden && inert && focused && opacity > 0 && opacity < 1;
    }, 'fade out with input disabled and focus restored');
    await scroll(73);
    await until(async () => {
      const {hidden, inert, opacity} = await read();
      return !hidden && !inert && opacity === 1;
    }, 'reverse an interrupted fade-out');
    await page(() => { document.body.style.paddingBottom = '1500px'; window.scrollTo(0, 40); });
    await focus('.pixel-scroll-pane');
    await key('End', 'End', 35);
    await until(async () => (await read()).label.endsWith('100%'), 'real reading progress at End');
    assert.equal((await read()).active, 24);
    await focus('.pixel-scroll-orb');
    await key('Enter', 'Enter', 13, '\r');
    await reachesTop();
    assert.equal((await read()).focused, true);
    assert.equal((await read()).outer, 40);

    const ids = ['pixel-scroll-orb', 'monochrome-scroll-orb', 'vertical-scroll-gauge', 'conic-scroll-orb', 'gradient-scroll-rail'];
    const snapshot = () => page(previewState);
    const near = (value, target, tolerance = .005) => Math.abs(value - target) < tolerance;
    for (const id of ids) {
      await open(id);
      const first = await page(() => window.firstPreviewFrame);
      assert.ok(near(first.position, .30), `${id} starts at 30% real scroll: ${JSON.stringify(first)}`);
      assert.ok(first.visible && near(first.percentage, 30, 1), `${id} starts painted: ${JSON.stringify(first)}`);
      if (id === 'gradient-scroll-rail') assert.ok(first.shades[0] < first.shades[1]);
      if (first.direction) {
        await toolbar('Bottom to top');
        await until(async () => {
          const state = await snapshot();
          return state.direction === 'bottom-to-top' && near(state.position, .30)
            && (state.shades ? state.shades[0] > state.shades[1] : near(state.labelTop, 70, 1));
        }, `${id}: reverse the display while preserving reading progress`);
      }
      await toolbar('Play');
      await until(async () => (await snapshot()).position > .42, `${id}: first leg`);
      await toolbar('Pause');
      const pausedFrame = await until(async () => {
        const state = await snapshot();
        return state.transport === 'Resume' && state;
      }, `${id}: Pause enables Resume`);
      await page(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const pausedDisplay = (await snapshot()).percentage;
      await sleep(150);
      const held = await snapshot();
      assert.equal(held.position, pausedFrame.position, `${id}: Pause holds the scroll position`);
      assert.equal(held.percentage, pausedDisplay, `${id}: Pause holds the progress display`);
      await toolbar('Resume');
      await until(async () => near((await snapshot()).position, .75), `${id}: Resume completes the first leg`);
      await sleep(180);
      assert.ok(near((await snapshot()).position, .75), `${id}: dwell at 75%`);
      await until(async () => {
        const state = await snapshot();
        return state.transport === 'Play' && near(state.position, .30) && state.visible && near(state.percentage, 30, 1);
      }, `${id}: complete at 30% and keep the indicator visible`);

      await toolbar('Replay');
      await until(async () => (await snapshot()).position > .42, `${id}: Replay starts a new run`);
      await toolbar('Replay');
      await until(async () => near((await snapshot()).position, .30), `${id}: Replay also restarts an active run`);
      await until(async () => (await snapshot()).position > .37, `${id}: replay proceeds`);
      await focus('.reuse-demo [role="region"]');
      await key('End', 'End', 35);
      await until(async () => {
        const state = await snapshot();
        return near(state.position, 1) && state.transport === 'Play';
      }, `${id}: real keyboard input takes over`);

      await toolbar('Play');
      await until(async () => (await snapshot()).position > .4, `${id}: play before pointer takeover`);
      if (first.direction) {
        const start = await center('.reuse-demo [role="slider"]');
        await mouse('mousePressed', start, {button: 'left', buttons: 1, clickCount: 1});
        const end = {...start, y: start.y - 35};
        await mouse('mouseMoved', end, {button: 'left', buttons: 1});
        await mouse('mouseReleased', end, {button: 'left', buttons: 0, clickCount: 1});
        await until(async () => {
          const state = await snapshot();
          return state.transport === 'Play' && state.position > .5;
        }, `${id}: dragging the reversed indicator takes over`);
      } else {
        const orb = await center('.reuse-demo button[aria-label$="%"]');
        await mouse('mousePressed', orb, {button: 'left', buttons: 1, clickCount: 1});
        await mouse('mouseReleased', orb, {button: 'left', buttons: 0, clickCount: 1});
        if (id === 'pixel-scroll-orb') {
          await toolbar('Replay');
          await until(async () => (await snapshot()).position > .55, 'Replay replaces the in-flight return to top');
          const viewport = await center('.pixel-scroll-pane');
          await mouse('mouseMoved', viewport);
          const beforeWheel = await snapshot();
          await mouse('mouseWheel', viewport, {deltaX: 0, deltaY: 150});
          await sleep(500);
          const afterWheel = await snapshot();
          assert.ok(afterWheel.transport === 'Play' && afterWheel.position > beforeWheel.position + .05,
            `real wheel scrolling takes over: ${JSON.stringify({beforeWheel, afterWheel})}`);
        } else {
          await until(async () => {
            const state = await snapshot();
            return state.transport === 'Play' && state.position === 0;
          }, `${id}: clicking takes over and returns to top`);
        }
      }
    }

    await open();
    await page(async () => {
      const {mountScrollingPreview} = await import('/demo/scrolling-preview.tsx');
      const response = await fetch('/examples/pixel-scroll-orb/config.json');
      const config = await response.json();
      document.getElementById('root').id = 'page-root';
      document.getElementById('page-root').hidden = true;
      const fixture = document.createElement('div');
      fixture.id = 'root';
      document.body.append(fixture);
      window.fixture = mountScrollingPreview(config);
    });
    await until(() => page(() => Boolean(document.querySelector('#root .pixel-scroll-pane'))), 'mount the teardown fixture');
    await page(() => [...document.querySelectorAll('#root .reuse-toolbar button')].find(button => button.textContent === 'Play').click());
    await page(() => document.getElementById('page-root').remove());
    await hover();
    await until(particlesVisible, 'hover starts the particle clocks');
    await page(() => {
      const pane = document.querySelector('.pixel-scroll-pane');
      const particles = pane.querySelector('.pixel-scroll-particles');
      window.orbTeardown = {pane, particles, removed: [], visibilityRemoved: 0, observerDisconnected: 0, writes: 0};
      const scrollTo = pane.scrollTo;
      pane.scrollTo = function (...args) {
        window.orbTeardown.writes++;
        return scrollTo.apply(this, args);
      };
      const removeScroll = pane.removeEventListener;
      pane.removeEventListener = function (type, ...args) {
        window.orbTeardown.removed.push(type);
        return removeScroll.call(this, type, ...args);
      };
      const removeDocument = document.removeEventListener;
      document.removeEventListener = function (type, ...args) {
        if (type === 'visibilitychange') window.orbTeardown.visibilityRemoved++;
        return removeDocument.call(this, type, ...args);
      };
      const disconnect = ResizeObserver.prototype.disconnect;
      ResizeObserver.prototype.disconnect = function () {
        window.orbTeardown.observerDisconnected++;
        return disconnect.call(this);
      };
    });
    await page(() => {
      window.fixture.unmount();
      window.orbTeardown.writes = 0;
    });
    assert.equal(await page(() => window.orbTeardown.pane.isConnected), false);
    await sleep(150);
    const cleanup = await page(() => {
      const {particles, removed, visibilityRemoved, observerDisconnected, writes} = window.orbTeardown;
      return {
        removed: removed.sort(), visibilityRemoved, observerDisconnected, writes,
        particleStyles: [...particles.querySelectorAll('rect')].some(particle => particle.style.opacity || particle.style.transform),
      };
    });
    assert.deepEqual(cleanup, {removed: ['click', 'keydown', 'pointerdown', 'scroll', 'scroll', 'wheel'], visibilityRemoved: 3,
      observerDisconnected: 1, particleStyles: false, writes: 0});

    await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'reduce'}]});
    for (const id of ids) {
      await open(id);
      await focus('.reuse-demo [role="region"]');
      await key('End', 'End', 35);
      await until(async () => near((await snapshot()).position, 1), `${id}: reach End before reduced-motion Play`);
      await toolbar('Play');
      const settled = await until(async () => {
        const state = await snapshot();
        return near(state.position, .30) && state.transport === 'Play' && state;
      }, `${id}: reduced-motion Play settles immediately at 30%`);
      assert.ok(settled.visible);
    }
    await open();
    const revealed = await until(async () => {
      const state = await read();
      return !state.hidden && state;
    }, 'show reduced-motion progress');
    assert.equal(revealed.opacity, 1);
    await hover();
    await sleep(200);
    assert.equal(await particlesVisible(), false);
    await focus('.pixel-scroll-orb');
    await key(' ', 'Space', 32, ' ');
    assert.equal((await read()).top, 0, 'reduced-motion keyboard return is instant');
  } finally {
    if (browser) {
      await Promise.race([browser.send('Browser.close').catch(() => {}), sleep(500)]);
      browser.socket.close();
    }
    if (chrome.pid && chrome.exitCode === null) {
      const exited = once(chrome, 'exit');
      chrome.kill();
      await Promise.race([exited, sleep(1500)]);
    }
  }
});
