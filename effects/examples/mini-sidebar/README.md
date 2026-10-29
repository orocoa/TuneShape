# Page Navigation · 页面导航

**English** · [简体中文](README.zh-CN.md)

Page Navigation · 400 ms · Ariadne

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/mini-sidebar) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/mini-sidebar/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/mini-sidebar/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Browse the motion catalog categories in a single level. Hover shows the nearest name; click directly selects a category without adding rows. Arrow keys and Home/End move focus within the same level. Leaving smoothly retracts marks and fades the label while retaining selection. The detail toolbar plays both sides from initial to final and back once; loading effects follow their loop setting. Pause holds the current display and resumes from the same progress.

## States and motion

Single-level categories. Maximum navigation reach 38 px. Overall size 100% applies at rest and while expanded, including marks, spacing and the label.

## Motion notes 3

Demonstration and retraction duration 400 ms; trigger delay 0 ms; cubic-bezier(0.4, 0, 0.2, 1). Hover expansion uses a fixed-response analytical critically damped spring. Duration and easing configure demonstration tracks and leave retraction.

## Motion notes 4

Browse the motion catalog categories in a single level. Hover shows the nearest name; click directly selects a category without adding rows. Arrow keys and Home/End move focus within the same level. Leaving smoothly retracts marks and fades the label while retaining selection.

## Repeated input and interruption

Pointer, focus and selection are transient and excluded from JSON. The reach setting scales line lengths; overall size scales the entire single-level navigation at rest and while expanded. One continuous field clock preserves velocity when the pointer changes direction; leaving returns from the current frame using the configured duration and curve.

## Reduced motion

Follow prefers-reduced-motion: skip delay, loops and animation and show the target state immediately. Preview speed is observation state and is never saved in the configuration.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
