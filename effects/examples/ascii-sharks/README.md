# ASCII Sharks · ASCII 鲨鱼群

**English** · [简体中文](README.zh-CN.md)

Top-down sharks and small fish drawn on a configurable character grid.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/ascii-sharks) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/ascii-sharks/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/ascii-sharks/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Catalog hover, keyboard focus and mobile Preview start playback. Detail auto-starts; the toolbar pauses and resumes.

## States and motion

Fill the host. Character sampling density 2×, font scale 0.9×; 4 sharks at 1× size, fish density 1×.

## Motion notes 3

Single-pass duration 12000 ms, delay 0 ms; simulation speed 1.7×; continuous playback. Speed 0 and Pause hold the current frame. Observation speed is runtime-only.

## Motion notes 4

Leaving with no focus, scrolling offscreen and switching to a background tab stop the preview. Re-entry can replay. The background does not reverse.

## Motion notes 5

Sparse 0.6×, balanced 1×, fine 1.6× and high-density 2× presets, with continuous adjustment from 0.5–2×. Density sets grid sampling; font scale sets glyph size within cells. Background grid opacity 0.04; wake opacity 0.

## Repeated input and interruption

Appearance comes from one configuration. Fish positions, elapsed time and gallery state are transient. Play resumes a pause; a new demonstration restarts.

## Motion notes 7

Twenty constrained joints follow the head’s actual trajectory. A speed-linked propulsive wave runs along that articulated spine, with subtle fin banking. Fish relay alarm, split around a shark’s flanks and regroup as danger fades.

## Reduced motion

Follow the system preference: render a still frame without automatic loops.

## Motion notes 9

Background #eeeeee; ink #303030; glyph opacity 0.9; pointer disturbance enabled: nearby creatures accelerate and steer away, with faster reactions for small fish and more inertia for sharks; leaving gradually restores cruise speed without pulling positions back.

## Motion notes 10

Nearby creatures avoid a hovering pointer. Click or tap creates a local ripple and scattering impulse; sharks retain turning inertia. Touch movement does not act as hover or prevent page scrolling. Disabled interaction, pause and reduced motion accept no new disturbance.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
