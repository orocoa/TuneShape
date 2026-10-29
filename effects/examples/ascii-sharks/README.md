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

Fill the host. Character sampling density 1×, font scale 0.9×; 4 sharks at 1× size, fish density 1×.

## Motion notes 3

Single-pass duration 12000 ms, delay 0 ms; simulation speed 1×; continuous playback. Speed 0 and Pause hold the current frame. Observation speed is runtime-only.

## Motion notes 4

Leaving with no focus, scrolling offscreen and switching to a background tab stop the preview. Re-entry can replay. The background does not reverse.

## Motion notes 5

Sparse 0.6×, balanced 1× and fine 1.6× presets, with continuous adjustment from 0.5–2×. Density sets grid sampling; font scale sets glyph size within cells. Background grid opacity 0.04; wake opacity 0.

## Repeated input and interruption

Appearance comes from one configuration. Fish positions, elapsed time and gallery state are transient. Play resumes a pause; a new demonstration restarts.

## Reduced motion

Follow the system preference: render a still frame without automatic loops.

## Motion notes 8

Background #fafaf9; ink #252a24; glyph opacity 0.9; autonomous paths are unaffected by pointer input.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
