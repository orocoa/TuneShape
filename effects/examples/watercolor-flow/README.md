# Watercolor Flow · 细度水彩融合

**English** · [简体中文](README.zh-CN.md)

Two pigments drift and blend through an original flowing noise field.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/watercolor-flow) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/watercolor-flow/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Hover the catalog preview to play; detail auto-starts. With cursor interaction enabled, pointer movement or keyboard focus warps nearby pigment.

## States and motion

Canvas 320 × 230; offset 0, 0 px; scale 1. The pigment field evolves continuously without reversing.

## Motion notes 3

Linear base clock 12000 ms; delay 0 ms; flow speed 0.6×. Accumulate time across repeats so the texture never jumps to the first frame.

## Motion notes 4

Flow continuously. Leaving a catalog card restores the still poster; leaving the surface clears the local warp. Cursor interaction is disabled.

## Repeated input and interruption

Pause holds the texture; Play resumes the same clock. Color, appearance and speed edits preserve elapsed time. Observation speed and pointer position are excluded from JSON.

## Reduced motion

Respect reduced motion: render a still watercolor frame with no animation or pointer warp.

## Motion notes 7

Colors #0A0A0A / #E0E0E0; speed 0.6; scale 0.6; warp speed 0.08; opacity 1; additive RGB offset 0.15; cursor interaction false; cursor intensity 1.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
