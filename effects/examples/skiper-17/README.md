# Rotating Scroll Stack · 旋转滚动叠卡

**English** · [简体中文](README.zh-CN.md)

The next image rises while the current card shrinks and rotates; scrolling reverses the stack.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-17) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-17/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-17/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Scroll the image surface. The incoming card rises while the current one shrinks to .7 and rotates 5 degrees. Reverse scrolling reverses the stack. Edit media, aspect ratio, scale, angle and smoothing. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Images (one URL per line): [long content; see controls, 1961 characters]；Image descriptions (matching lines): "Shape 1\nShape 2\nShape 3\nShape 4\nShape 5"；Image fit: "cover"；Maximum card width: 672；Card aspect ratio: 0.8；Viewport height ratio: 0.9；Card corner: 32；Back scale: 0.7；Back rotation: 5；Scroll per card: 1；Scroll smoothing: 0.5；Initial scroll position: 0；Background: "#f1f1f1"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 800 × 700; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

The next image rises while the current card shrinks and rotates; scrolling reverses the stack. Native controls retain their current local state after the demonstration ends.

## Repeated input and interruption

Leaving the catalog with focus outside, going offscreen and switching to the background stop the demonstration. Manual input, live selection and playback progress never replace the saved defaults.

## Motion notes 7

The controls, preview, JSON, Motion adapter, prompt project and HTML export use this same saved settings object and renderer. Catalog cards always show project defaults.

## Reduced motion

No automatic demonstration; transitions settle immediately. Native text input, buttons, selection and keyboard controls remain available.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
