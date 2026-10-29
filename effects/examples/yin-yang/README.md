# Yin Yang Loader · 太极加载

**English** · [简体中文](README.zh-CN.md)

Yin Yang Loader · 3000 ms · Uiverse.io · fthisilak

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/yin-yang) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/yin-yang/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

In the catalog, enter the preview to play and leave to stop. Repetition follows the loop setting. In detail, loading effects start automatically; the toolbar pauses and resumes their current clocks. The detail toolbar pauses and resumes the same forward cycle without a reverse return.

## States and motion

[data-part="face"] / rotate: 0 → -360; [data-part="dot0"] / scale: 1 → 1 (41 keyframes); [data-part="dot1"] / scale: 1 → 1 (41 keyframes); [data-part="root"] / x: 0 → 0; [data-part="root"] / y: 0 → 0; [data-part="root"] / scale: 1 → 1.

## Motion notes 3

Total duration 3000 ms; trigger delay 0 ms; cubic-bezier(0, 0, 1, 1). Each track follows its configured start / span and times.

## Motion notes 4

Rotate at a constant speed while both dots pulse together. Hover deepens the shadow over 300 ms. Pause holds rotation and dot scale; Play resumes the same cycle. Repeat the complete rotation and pulse cycle continuously.

## Repeated input and interruption

Pause preserves cycle progress; Play resumes it. Parameter edits restart a complete cycle using the new configuration without queuing.

## Reduced motion

Follow prefers-reduced-motion: skip delay, loops and animation and show the target state immediately. Preview speed is observation state and is never saved in the configuration.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
