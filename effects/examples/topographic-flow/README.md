# Topographic Flow · 流动等高线

**English** · [简体中文](README.zh-CN.md)

An evolving contour map with elevation colours, survey dashes and five pointer deformation modes.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/topographic-flow) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/topographic-flow/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/topographic-flow/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Detail auto-starts. Hover, focus or Preview runs catalog cards; leave, blur, offscreen and background stop them. Pointer and touch movement reshape terrain. Arrow keys position the effect, Home centres, Escape clears, Enter/Space replays.

## States and motion

Terrain uses the container CSS pixels: scale 480px, density 5, seed 42. Appearance edits preserve accumulated time; replay restores the same seed at time zero.

## Motion notes 3

Terrain scale (scale): 480px; Contour density (density): 5; Terrain distortion (distortion): 2.4; Terrain seed (seed): 42.

## Motion notes 4

Line width (lineWidth): 1px; Line opacity (opacity): 1; Dash length (dashLength): 7px; Dash gap (dashGap): 8px.

## Motion notes 5

Gradient diffusion (gradientDiffusion): 0; Grain (grain): 0.

## Motion notes 6

Flow speed (speed): 1.5.

## Motion notes 7

Pointer strength (hoverStrength): 0.6; Pointer radius (hoverRadius): 200px; Pointer follow (hoverFollow): 0.16s; Pointer fade (hoverFade): 0.8s.

## Motion notes 8

Style solid; regular ink #000000; every fourth level #000000. Elevation gradient disabled; background #f1f1f1. Saved gradient stops are inactive.

## Motion notes 9

Entrance fades over 800 ms after 0 ms. Speed 1.5; flow is continuous. Toolbar pause freezes the current frame; resume continues its phase.

## Motion notes 10

Pointer effect enabled; mode rings; direction push. Entry and movement follow over 0.16s, leave recovers over 0.8s. Disabling the effect clears deformation.

## Motion notes 11

Scale changes landform size and density changes elevation spacing independently. Mixed mode dashes every fourth level. Dash/gap lengths follow connected curves. Elevation gradients replace the solid background; diffusion softens colour only. Grain is fixed to the screen and also textures ink. Inactive gradient and pointer settings are retained and dependent controls are hidden.

## Repeated input and interruption

Settings, descriptions, Motion data, JSON, offline HTML and replay projects share the same terrain configuration. Pointer/keyboard positions, follow progress, phase, observation speed and toolbar transport are transient and never serialized.

## Reduced motion

Show a still terrain, skip entrance and automatic flow, and settle pointer/keyboard changes immediately without animated recovery.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
