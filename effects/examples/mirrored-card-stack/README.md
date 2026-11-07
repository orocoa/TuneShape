# Mirrored Card Stack · 镜像抽出卡片

**English** · [简体中文](README.zh-CN.md)

The current top card extracts on either side, changes layer, and slips back into the stack.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/mirrored-card-stack) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/mirrored-card-stack/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/mirrored-card-stack/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## States and motion

There are 6 numbered gray cards: 1 / 2 / 3 / 4 / 5 / 6. Initially “1”. #f1f1f1 background, white labels and straight corners; no portfolio photos, project titles, private fonts or case routes.

## Interaction

Drag horizontally, use arrow keys, previous/next buttons or pagination points. Both directions extract the current top card before changing its layer and reinserting it. Previous/next retain explicit directions, including with only two cards.

## Motion notes 3

Adjacent controlled selection has a 980 ms baseline. The original baseline is 980 ms; longer plans add 160 ms per additional card, up to four additions, before the same clock scaling. Buttons use a quintic trajectory and release uses the original analytic spring. Observation speed scales that controller’s time step; it adds no second RAF and is not saved.

## Motion notes 4

Reference card 280 × 350px; reference label 36px, scaled proportionally to the canvas. Extraction peak .90× card width, 12° and .84 scale, with the handoff around .58. C2 path joins, light perspective, fixed light and layer occlusion are retained. The card host keeps overflow:visible.

## Motion notes 5

A short extraction starts from the displayed pose, passes its peak, enters the nearest receiving layer and returns to rest. Both directions move the original top card. This entry retains the specified mirrored mode rather than returning a bottom card in reverse.

## Repeated input and interruption

Short flicks retain input velocity and inertial settling. Controlled retargeting continues from the current position and aligned velocity. Regrabbing retains the complete displayed pose, then allows a small reversal to continue. Pause, disable, offscreen and background cancel old input/work and settle; canceled work does not restart.

## Reduced motion

Reduced motion lands programmatic selection directly and stops catalog demonstrations. Direct dragging still follows the gesture. The focusable region supports left/right keys; buttons and pagination points have individual names. Cards are not connected to case navigation.

## Motion notes 8

Labels, gray values, initial card, reference dimensions, label size and duration for 1–8 cards share one configuration. Gray cards are generated locally as SVG; preview, JSON, Motion, offline HTML and runnable project use the same controller, path, material and Swiper dependencies. Selection, observation speed, focus and gestures are transient. Visible Skiper UI attribution and full notices are retained. No extra image or video exporter is added.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
