# ASCII Shoal

A small, dependency-free Canvas background from TuneShape. Original procedural shark silhouettes and small schools of fish are sampled onto a character grid. Change the sampling density without restarting the scene or changing the number of fish.

[简体中文](README.zh-CN.md) · [Implementation and provenance](IMPLEMENTATION.md) · [MIT License](LICENSE)

## Run

Requires Node.js 22 or later. No package installation is needed.

```sh
cd examples/ascii-shoal
npm run dev
```

Open the local URL printed by the server (port 5188 by default). If that port is occupied, use `PORT=5298 npm run dev` on macOS/Linux. The demo has density presets, independent glyph size, speed, colors, population controls, pause/resume, restart, and PNG export.

```sh
npm test
npm run build
```

`dist/` is a static website. `dist/offline.html` is a self-contained demo that can be opened directly, without a server or network connection. No fonts, textures, packages, or remote scripts are loaded by the renderer.

## Use as a background

Copy `src/ascii-shoal.js` and its `LICENSE` into your project:

```html
<div id="background" style="position:fixed;inset:0;z-index:-1"></div>
<script type="module">
  import {createAsciiShoal} from './ascii-shoal.js';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const shoal = createAsciiShoal(document.querySelector('#background'), {
    density: 1,
    glyphScale: 0.9,
    sharkCount: 4,
    fishDensity: 1,
  }, {reduced: motion.matches});
  motion.addEventListener('change', () => shoal.update({}, {reduced: motion.matches}));
  // Call shoal.destroy() when the host is removed (for example on SPA unmount).
</script>
```

Give the host an explicit size and place your content above it. For decorative backgrounds, mark the host `aria-hidden="true"`. Pointer response follows pointer movement received by the host; content that covers it keeps its normal interactions.

## Settings

| Option | Default | Range / meaning |
| --- | --- | --- |
| `density` | `1` | `0.5–2`; sparse `0.6`, balanced `1`, fine `1.6` |
| `glyphScale` | `0.9` | `0.6–1.3`; glyph size within each cell |
| `speed` | `1` | `0–3`; zero freezes animation |
| `sharkCount` | `4` | `1–6` |
| `sharkScale` | `1` | `0.5–1.5` |
| `fishDensity` | `1` | `0–2`; zero removes the small fish |
| `backgroundColor` | `#fafaf7` | Three- or six-digit hex |
| `inkColor` | `#30362f` | Three- or six-digit hex |
| `opacity` | `0.9` | `0–1` |
| `gridOpacity` | `0.04` | `0–0.2` |
| `wakeOpacity` | `0` | `0–1` |
| `interactive` | `true` | Pointer avoidance |
| `characters` | `.:;=+*oO#` | Up to 32 non-whitespace glyphs, ordered light to dense |
| `seed` | `7` | Signed 32-bit integer; repeatable scene |

Values are normalized to supported ranges. `update(partialOptions, partialRuntime)` changes only supplied fields. Density and glyph size preserve elapsed time and positions. Changing the seed creates a different repeatable scene.

The optional runtime accepts `enabled`, `paused`, `reduced`, `speed`, `durationMs`, `delayMs`, `loop`, and `onRunning`. Playback loops by default. With `loop:false`, it stops at the configured duration after the initial delay. System reduced motion can be passed explicitly as shown above. The engine also suspends rendering while the document is hidden or the host is outside the viewport.

`play()` resumes, `pause()` freezes, `restart()` resets the clock, `getState()` returns a diagnostic snapshot, and `destroy()` removes observers/listeners and the canvas. The callback describes the playback session; temporary visibility/pause suspension does not signal finite completion. `getState().running` reports whether frames are currently scheduled.

## How it is drawn

The rendering approach follows TuneShape's ASCII Wave: sample a continuous field on a regular grid, then map each sample to glyph and opacity. This module authors a different field using analytic bodies, fin polygons, tail oscillation, and seeded periodic paths. It does not run a predator or flocking simulation. The renderer targets 30 fps, bounds the number of grid cells, and caps the canvas backing-store size; at large viewport sizes, density may reach that sampling cap.

This source is a new implementation, separate from an earlier local third-party adaptation. That earlier code and its media are not included in this example. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for the scope of the provenance record.

The example is published in this repository; it is not an npm registry release. MIT, copyright 2026 KAI-NEX and TuneShape contributors.
