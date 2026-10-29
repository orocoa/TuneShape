# Typewriter · 打字机

**English** · [简体中文](README.zh-CN.md)

Typewriter · 3000 ms · Uiverse.io · Nawsome

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/typewriter) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/typewriter/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/typewriter/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

In the catalog, enter the preview to play and leave to stop. Repetition follows the loop setting. In detail, loading effects start automatically; the toolbar pauses and resumes their current clocks. The detail toolbar pauses and resumes the same forward cycle without a reverse return.

## States and motion

[data-part="machine"] / y: 0 → 0 (6 keyframes); [data-part="carriage"] / x: 14 → 14 (106 keyframes); [data-part="paper"] / y: 46 → 46 (12 keyframes); [data-part="key0"] / y: 0 → 0 (5 keyframes); [data-part="key1"] / y: 0 → 0 (5 keyframes); [data-part="key2"] / y: 0 → 0 (5 keyframes); [data-part="key3"] / y: 0 → 0 (5 keyframes); [data-part="key4"] / y: 0 → 0; [data-part="key5"] / y: 0 → 0 (5 keyframes); [data-part="key6"] / y: 0 → 0 (5 keyframes); [data-part="key7"] / y: 0 → 0 (5 keyframes); [data-part="key8"] / y: 0 → 0 (5 keyframes); [data-part="key9"] / y: 0 → 0 (5 keyframes); [data-part="key10"] / y: 0 → 0 (5 keyframes); [data-part="key11"] / y: 0 → 0 (5 keyframes); [data-part="root"] / x: 0 → 0; [data-part="root"] / y: 0 → 0; [data-part="root"] / scale: 1 → 1.

## Motion notes 3

Total duration 3000 ms; trigger delay 0 ms; cubic-bezier(0, 0, 1, 1). Each track follows its configured start / span and times.

## Motion notes 4

Keys press in sequence as the paper advances in steps. At the end of each cycle the carriage returns, the paper resets and the body bounces gently. Pause holds all parts at their current progress; Play resumes the same cycle. Repeat the full typing cycle continuously.

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
