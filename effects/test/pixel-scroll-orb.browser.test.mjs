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

test('Pixel Scroll Orb uses the real scroll pane, playback and teardown', {
  skip: chromePath ? false : 'Set TUNESHAPE_TEST_CHROME to run Chromium regression',
  timeout: 45000,
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
    const open = async () => {
      await send('Page.navigate', {url: `http://127.0.0.1:${address.port}/examples/pixel-scroll-orb/`});
      await until(() => page(() => Boolean(document.querySelector('.pixel-scroll-pane'))), 'render the example', 15000);
    };
    const read = () => page(() => {
      const pane = document.querySelector('.pixel-scroll-pane');
      const orb = pane.querySelector('.pixel-scroll-orb');
      return {
        top: pane.scrollTop, max: pane.scrollHeight - pane.clientHeight, hidden: orb.hidden, inert: orb.inert,
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
    const hover = async () => {
      const point = await page(() => {
        const rect = document.querySelector('.pixel-scroll-orb').getBoundingClientRect();
        return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
      });
      await send('Input.dispatchMouseEvent', {type: 'mouseMoved', ...point});
    };
    const particlesVisible = () => page(() => [...document.querySelectorAll('.pixel-scroll-particles rect')]
      .some(particle => Number(getComputedStyle(particle).opacity) > 0));
    const reachesTop = () => until(async () => {
      const state = await read();
      return state.top === 0 && state.hidden && state.inert;
    }, 'return to the reading pane top');

    await send('Emulation.setDeviceMetricsOverride', {width: 1024, height: 768, deviceScaleFactor: 1, mobile: false});
    await open();
    assert.equal((await read()).hidden, true);
    await scroll(72);
    await until(async () => {
      const {max, label} = await read();
      return label.endsWith(` ${Math.round(7200 / max)}%`);
    }, 'measure at 72px');
    assert.equal((await read()).hidden, true);
    await scroll(73);
    await until(async () => !(await read()).hidden, 'show at 73px');
    assert.equal((await read()).inert, false);
    await toolbar('Replay');
    await reachesTop();

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

    await toolbar('Play');
    await until(async () => (await read()).top > 90, 'Play starts the demo');
    await toolbar('Pause');
    await until(async () => (await read()).paused, 'render the paused state');
    // An animation frame already queued when Pause was clicked can still paint.
    await page(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const pausedAt = (await read()).top;
    assert.ok(pausedAt > 0);
    await sleep(125);
    assert.equal((await read()).top, pausedAt);
    await toolbar('Play');
    await reachesTop();

    await toolbar('Replay');
    await until(async () => (await read()).top > 90, 'Replay restarts the active command');
    await focus('.pixel-scroll-pane');
    await key('End', 'End', 35);
    await sleep(850);
    assert.equal((await read()).top, (await read()).max, 'manual scrolling interrupts the demo');

    await hover();
    await until(particlesVisible, 'hover starts the particle clocks');
    await page(() => {
      const pane = document.querySelector('.pixel-scroll-pane');
      const particles = pane.querySelector('.pixel-scroll-particles');
      window.orbTeardown = {pane, particles, scrollRemoved: 0, visibilityRemoved: 0, observerDisconnected: 0};
      const removeScroll = pane.removeEventListener;
      pane.removeEventListener = function (type, ...args) {
        if (type === 'scroll') window.orbTeardown.scrollRemoved++;
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
    await toolbar('Replay');
    await until(() => page(() => !window.orbTeardown.pane.isConnected), 'Replay unmounts the old preview');
    await sleep(150);
    const cleanup = await page(() => {
      const {particles, scrollRemoved, visibilityRemoved, observerDisconnected} = window.orbTeardown;
      return {
        scrollRemoved, visibilityRemoved, observerDisconnected,
        particleStyles: [...particles.querySelectorAll('rect')].some(particle => particle.style.opacity || particle.style.transform),
      };
    });
    assert.deepEqual(cleanup, {scrollRemoved: 1, visibilityRemoved: 2, observerDisconnected: 1, particleStyles: false});

    await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'reduce'}]});
    await open();
    await toolbar('Play');
    const reduced = await read();
    assert.equal(reduced.top, Math.round(reduced.max * .65));
    await until(async () => !(await read()).hidden, 'show reduced-motion progress');
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
