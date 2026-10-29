# Local Text Scramble and Recovery · 局部字符扰动与恢复

**English** · [简体中文](README.zh-CN.md)

Local Text Scramble and Recovery · 200 ms · 个人网站

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/text-scramble) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/text-scramble/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/text-scramble/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Moving the pointer affects nearby characters only. Each touched character recovers independently when the pointer stops or leaves; other text stays readable. Card whitespace does not trigger it. Enter or Space demonstrates one local disturbance. Replay resets both sides and demonstrates the same local disturbance.

## States and motion

[data-part="scramble"] / textProgress: 0 → 1; [data-part="scramble"] / y: 0 → 0; [data-part="root"] / x: 0 → 0; [data-part="root"] / y: 0 → 0; [data-part="root"] / scale: 1 → 1.

## Motion notes 3

Total duration 200 ms; trigger delay 0 ms; cubic-bezier(0, 0, 1, 1). Each track follows its configured start / span and times.

## Motion notes 4

Only nearby characters scramble; text stays in place. Touched characters recover independently. Untouched text remains readable; there is no automatic whole-line reveal.

## Repeated input and interruption

Pointer movement updates recovery only for characters it touches. Previously touched characters recover independently. Pointer position, local progress and character sequences are temporary and excluded from JSON. Replay clears old trajectories and demonstrates the same position on both sides.

## Reduced motion

Follow prefers-reduced-motion: skip delay, loops and animation and show the target state immediately. Preview speed is observation state and is never saved in the configuration.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
