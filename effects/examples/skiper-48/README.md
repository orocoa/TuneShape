# Card Swipe Carousel · 卡片堆叠滑动轮播

**English** · [简体中文](README.zh-CN.md)

Drag a stack of geometric image cards, with depth and rotation on the cards behind, and snap on release.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-48) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-48/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-48/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Defaults reuse six original monochrome geometric images from this site. Drag horizontally or use arrows, Home and End. Enter one image per line. Card dimensions use pixels, offset uses percent, rotation uses degrees and depth uses pixels. Initial slide is zero based; autoplay interval is milliseconds. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Image URLs (one per line): [long content; see controls, 2387 characters]；Initial slide: 0；Corner radius: 24；Canvas background: "#f5f4f3"；Loop navigation: true；Autoplay: false；Autoplay interval (ms): 1000；Show navigation: false；Card width: 260；Card height: 330；Stack offset (%): 8；Rotation per card: 2；Depth per card: 100；Show pagination: false

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 900 × 600; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 300 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

Drag a stack of geometric image cards, with depth and rotation on the cards behind, and snap on release. Native controls retain their current local state after the demonstration ends.

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
