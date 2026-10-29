# Particle Tide · 粒子海浪

**English** · [简体中文](README.zh-CN.md)

An original ocean of particles with rolling swells and click ripples.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/particle-tide) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/particle-tide/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/particle-tide/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Hover the catalog preview; detail auto-starts. Click or press Enter / Space to create expanding ripples with illuminated crests.

## States and motion

Canvas 320 × 230; offset 0, 0 px; scale 1. Waves advance continuously without a reverse phase.

## Motion notes 3

Base clock 12000 ms; delay 0 ms; wave speed 1×. Accumulate time across repeats without resetting the sea; speed 0 holds the current frame.

## Motion notes 4

Hover the catalog preview to play; leaving restores the still poster. Detail starts automatically. Flow continuously. The pointer creates a local swell and slight parallax. Click to stack up to 12 ripples; focus and press Enter / Space for a central ripple.

## Repeated input and interruption

The toolbar pauses waves and ripple age, then resumes the same frame. Appearance and wave-speed edits preserve accumulated time. Observation speed, pointer position and active ripples are excluded from JSON.

## Reduced motion

Follow reduced motion: show a still sea with no pointer swell, click ripples or repetition.

## Motion notes 7

Background #242426; water #B9B9C2; crest #FFFFFF; density 1; particle size 1; wave height 1; wavelength 1; speed 1; interactive true; click ripples true.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
