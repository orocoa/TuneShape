# Chromatic Button · 流彩按钮

**English** · [简体中文](README.zh-CN.md)

A tactile chromatic button with projected reflections, whole-material colour flow and native interactions.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/chromatic-button) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/chromatic-button/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/chromatic-button/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Detail auto-starts. Catalog hover, focus or Preview runs the effect; leave and blur, offscreen and background stop it. Native buttons support click, Enter and Space. Message input is a local demo with no network submission.

## States and motion

Seed 7 and phase 0 define the start. Speed 0.7; continuous flow. Zero speed preserves the current composition. Appearance edits preserve time; phase/seed changes reset composition.

## Motion notes 3

Mode spectrum; starting colour #b126ff; second #ff177c (inactive); third #35d3ff (inactive). Fixed mode retains hue; two/three colours change the whole tint over time. Full spectrum varies spatially. Reflections continue moving.

## Motion notes 4

Corner radius (borderRadius) 50%; Feather (feather) 100; Applied projection angle (projectionScale) 174.7°; Brightness (intensity) 1.4; Stationary grain (grain) 0.105. Radius uses the shorter side. Applied projection is stored directly as 174.7°; face 174°. Radius edits update that angle; imported values are used directly without hidden conversion.

## Motion notes 5

Entrance blur-up, base duration 700 ms, speed 1×. Blur + rise takes 700ms with 10px blur and 20px rise. Zoom takes 600ms from 65% to 100%. Delay 0ms. Inactive entrance parameters are retained but not rendered.

## Motion notes 6

Hover mode brighten. Brighten increases light and lifts 2px. Flow shifts reflected composition. Follow pointer moves and stretches the button with a spring and a pointer light. Retain feedback while focused; leave and blur restore it. Disabled buttons do not react.

## Repeated input and interruption

Toolbar pause freezes material, entrance and spring clocks; resume continues without jumping. Replay restores the seeded phase. Entrance edits replay automatically. Finite catalog entrances reuse the shared replay controller; continuous flow is not interrupted by a timer.

## Reduced motion

Skip entrance and automatic flow, show a still material. Native input/buttons and keyboard remain usable. Brightness feedback settles immediately; elastic translation and stretch are disabled.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
