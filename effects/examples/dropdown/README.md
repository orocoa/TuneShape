# Dropdown Menu · 下拉菜单

**English** · [简体中文](README.zh-CN.md)

Dropdown Menu · 400 ms · Ariadne

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/dropdown) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/dropdown/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click the trigger to open or close; selecting a menu item closes it. Hover does not play it. The detail toolbar plays both sides from initial to final and back once; loading effects follow their loop setting. Pause holds the current display and resumes from the same progress.

## States and motion

[data-part="panel"] / y: -7 → 0; [data-part="panel"] / scale: 0.985 → 1; [data-part="panel"] / opacity: 0 → 1; [data-part="item0"] / y: -4 → 0; [data-part="item0"] / opacity: 0 → 1; [data-part="item1"] / y: -4 → 0; [data-part="item1"] / opacity: 0 → 1; [data-part="chevron"] / rotate: 0 → 180; [data-part="root"] / x: 0 → 0; [data-part="root"] / y: 0 → 0; [data-part="root"] / scale: 1 → 1.

## Motion notes 3

Total duration 400 ms; trigger delay 0 ms; cubic-bezier(0.25, 0.1, 0.25, 1). Each track follows its configured start / span and times.

## Motion notes 4

Enter using the forward keyframes. Exit reverses keyframes, phase order and time points. Hold the final state without repeating.

## Repeated input and interruption

Stop the previous trajectory, use the current display as the first frame, and move to the latest target. Actions do not queue. Each new loop cycle starts at the cycle’s configured start.

## Reduced motion

Follow prefers-reduced-motion: skip delay, loops and animation and show the target state immediately. Preview speed is observation state and is never saved in the configuration.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
