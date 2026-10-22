# ASCII Shoal implementation and provenance

This module was newly authored for TuneShape. Its author read only the user-owned `src/ascii-wave.ts` as a conceptual rendering reference, plus this workspace's `AGENTS.md` and `docs/ADDING_UI.md` integration rules. The author did not read external implementations, GitHub source, archived outputs, or another agent's reference research. No third-party source, font, texture, mesh, image, network request, or runtime dependency is included.

The relationship to the existing ASCII wave is conceptual: evaluate a continuous field on a character grid, then turn field values into glyphs. The aquatic geometry, scalar masks, creature descriptors, motion routes, character ramp, shading, avoidance behavior, and renderer lifecycle in this folder were independently written.

## Geometry and rendering

A shark is a local analytic body profile combined with three hand-authored fin polygons, mirrored across the body's centerline. A smooth oscillator bends progressively more of the rear body and tail. This is a flat, top-down silhouette, not a projection of a 3D mesh. The authored extent occupies approximately 34–42% of the shorter viewport dimension at default scale. Fish use a smaller analytic body and tapered tail.

Each character cell samples the soft silhouette masks. Coverage controls a small ink-colored rectangle; the interior glyph uses the background color, so light-paper mode produces pale glyphs on darker cells. A mild center stripe, gill variation and spatial tone variation provide form without raster assets. The faint open-water character pattern is static. Optional wakes are a small trailing analytic ripple field and are off by default.

Sampling density changes the character grid. Glyph scale changes only font size inside that grid. Neither parameter enters creature descriptors, swimming positions, animation time or pointer avoidance. The renderer bounds its grid to 48,000 cells, device pixel ratio to 2, and backing-store area to 6 million pixels. Density 1.6 gives more than twice the sample count of density 1 at 1440×960 and 390×844. At very large viewport sizes the cell-count limit intentionally caps the effect of further density increases. Hex RGB colors (`#RGB` and `#RRGGBB`) are supported.

## Motion and interaction

A deterministic integer mixer generates immutable creature descriptors from one seed. Every shark follows its own continuous, gently perturbed elliptical route. Small fish follow three independent school routes with stable loose offsets and low-amplitude oscillation. There are no predators, pursuit rules, pairwise forces, integration of creature velocity, or mutable population simulation.

The pointer contributes a smooth radial displacement around its location. Its position and energy ease in and out. This produces avoidance without modifying the underlying seeded routes. Disabling interaction removes this displacement; reduced-motion mode renders a clear static scene and ignores pointer movement.

## Lifecycle contract

`createAsciiShoal(host, options, runtime)` mounts one `aria-hidden` canvas inside an explicitly sized host and returns `update`, `play`, `pause`, `restart`, `destroy`, and `getState`.

- `pause` and temporary runtime pause preserve phase. `play` resumes that phase. Color, density, glyph scale and count edits preserve phase and existing creatures' descriptors.
- `restart` resets elapsed time, phase and pointer influence to the same seeded starting scene. Changing the seed starts a new scene at phase zero.
- Runtime `enabled`, `paused`, `reduced`, `speed`, `durationMs`, `delayMs`, `loop`, and `onRunning` are supported. Default duration is 12,000 ms, delay is zero and looping is enabled. For finite playback the active duration follows the initial delay.
- `getState().elapsed` is active runtime time in milliseconds including delay; `time` is animated phase in seconds after delay and both speed multipliers. Offscreen, background and paused intervals advance neither clock.
- `onRunning` reports the logical session. Temporary pause, invisibility and speed zero do not terminate that session. Disabled, reduced-motion, completed and destroyed states report `false`. This allows an enclosing toolbar to preserve its Resume state.
- Actual RAF activity is separately reported by `getState().running` and `host.dataset.running`. The renderer stops requesting RAF when paused, hidden, offscreen, disabled, reduced, complete, zero-speed or zero-sized. Rendering is capped at 30 frames per second.
- `host.dataset` also contains `paused`, `time`, `frame`, `density`, `cellWidth`, `cellHeight`, `elapsed`, `sharks`, `fish` and serialized shark `positions` for real browser QA. The renderer installs no keyboard handlers, focusable nodes, scrolling prevention or pointer capture.
- `destroy` cancels RAF, disconnects observers, removes listeners and removes only its own canvas. The host and surrounding application remain intact.

## Validation boundary

`test/ascii-shoal.test.mjs` checks parameter normalization, sampling and raster bounds, deterministic descriptors, density-invariant poses, count stability, continuous paths, mask geometry, tail deformation, pointer displacement, pause/resume, offscreen/background/reduced stops, finite playback, seeded restart, frame caps and cleanup. Its small fake clock/canvas fixture validates scheduling, not browser rendering or appearance. The TuneShape integration must separately verify actual gallery cards, detail controls, mobile Preview/Stop, reduced motion and exported output in a real browser.
