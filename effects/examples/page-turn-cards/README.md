# Page Turn Cards · 翻页卡片

**English** · [简体中文](README.zh-CN.md)

Independent rigid cards turn on opposing side pivots, with a narrow projected gap and soft light.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/page-turn-cards) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/page-turn-cards/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/page-turn-cards/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## States and motion

There are 6 grayscale cards: 1 / 2 / 3 / 4 / 5 / 6. Initially “1”. Fixed #f1f1f1 background, white labels and continuous superellipse corners.

## Interaction

Drag horizontally, use arrow keys, previous/next buttons or pagination dots. Catalog hover, keyboard focus or mobile Preview demonstrates one turn. Manual interaction suppresses demonstration replay until re-entry. Controls do not open the editor.

## Motion notes 3

Full baseline turn 600 ms with cubic-bezier(.42,0,.58,1). Release settles according to remaining distance. Observation speed changes runtime only. There is no additional autoplay clock.

## Motion notes 4

Reference card 280 × 336px; label 48px. Fits the canvas proportionally with a 10% inset; 32px reference corners use superellipse(2) and scale with the card. Perspective 2.8× card width, maximum angle 100°, retreat .10× width. Light loss .18 and side difference .018. Projected 3–6px gap grows and recedes continuously; the two surfaces remain independent.

## Repeated input and interruption

Adjacent turns can be regrabbed. Far jumps show only their two endpoint cards and briefly block regrabbing. Repeated selection retains the last intent. Pause, disable, offscreen, background and rebuilding settle the current turn and cancel queued requests; canceled requests do not replay on resume.

## Reduced motion

Reduced motion disables automatic demonstrations and programmatic selection lands immediately; direct dragging still follows the gesture. Tab can focus the region, buttons and named pagination points. Left/right arrows switch cards; focus remains visible.

## Motion notes 7

Supports 1–8 cards. Gray values, labels, reference dimensions, label size, initial card and duration share one configuration across description, JSON, Motion, preview, offline HTML and runnable project. Uses the same renderer, CSS and vendored Swiper. Runtime selection and queue are not saved. No images, portfolio text, private fonts or source-site interfaces. This entry adds no image or video exporter.

## Motion notes 8

Outgoing and incoming cards turn on their own side pivots with a small timing offset. Only the selected card remains after landing. No shared fold or intermediate-card flash.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
