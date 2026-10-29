# Finger Tapping · 手指敲击

**English** · [简体中文](README.zh-CN.md)

Finger Tapping · 1200 ms · Uiverse.io · Pradeepsaranbishnoi

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/finger-tap) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/finger-tap/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

In the catalog, enter the preview to play and leave to stop. Repetition follows the loop setting. In detail, loading effects start automatically; the toolbar pauses and resumes their current clocks. The detail toolbar pauses and resumes the same forward cycle without a reverse return.

## States and motion

[data-part="finger0"] / rotate: 10 → 10 (4 keyframes); [data-part="finger0"] / scale: 0.4 → 0.4; [data-part="finger1"] / rotate: 10 → 10 (5 keyframes); [data-part="finger1"] / scale: 0.6 → 0.6; [data-part="finger2"] / rotate: 10 → 10 (5 keyframes); [data-part="finger2"] / scale: 0.8 → 0.8; [data-part="finger3"] / rotate: 10 → 10 (5 keyframes); [data-part="finger3"] / scale: 1 → 1; [data-part="root"] / x: 0 → 0; [data-part="root"] / y: 0 → 0; [data-part="root"] / scale: 1 → 1.

## Motion notes 3

Total duration 1200 ms; trigger delay 0 ms; cubic-bezier(0.42, 0, 0.58, 1). Each track follows its configured start / span and times.

## Motion notes 4

Four fingers tap at staggered phases of the same cycle; the palm and thumb stay still. Pause holds their current angles, and Play resumes the current cycle. Repeat the configured cycle continuously.

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
