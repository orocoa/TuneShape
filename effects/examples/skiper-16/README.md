# Scaling Scroll Stack · 缩放滚动叠卡

**English** · [简体中文](README.zh-CN.md)

Cards pin one by one; earlier layers shrink and retain a stepped edge.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-16) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-16/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-16/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Scroll to pin cards one by one. Defaults retain a 20px step, .1 scale decrement and .5 minimum scale. Image descriptions provide alt text without extra card captions. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Images (one URL per line): [long content; see controls, 1961 characters]；Image descriptions (matching lines): "Shape 1\nShape 2\nShape 3\nShape 4\nShape 5"；Image fit: "cover"；Card width: 500；Card height: 300；Stack spacing: 20；Scale per layer: 0.1；Minimum scale: 0.5；Range start per card: 0.25；Card corner: 32；Scroll smoothing: 0.15；Initial scroll position: 0；Background: "#f1f1f1"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 800 × 600; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

Cards pin one by one; earlier layers shrink and retain a stepped edge. Native controls retain their current local state after the demonstration ends.

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
