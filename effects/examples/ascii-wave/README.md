# ASCII Wave Animation · ASCII 波形动画

**English** · [简体中文](README.zh-CN.md)

ASCII Wave Animation · 4000 ms · Ariadne

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/ascii-wave) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/ascii-wave/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/ascii-wave/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Enter the ASCII canvas to run the flow. Pointer movement creates local disturbances. Leaving freezes the phase and clears pointer energy; keyboard focus also plays. Detail previews flow automatically. Pause freezes accumulated phase; Play resumes the same phase, without a reverse return.

## States and motion

[data-part="ascii"] / asciiPhase: 0 → 6.283185307; [data-part="root"] / x: 0 → 0; [data-part="root"] / y: 0 → 0; [data-part="root"] / scale: 1 → 1.

## Motion notes 3

Total duration 4000 ms; trigger delay 0 ms; cubic-bezier(0, 0, 1, 1). Each track follows its configured start / span and times.

## Motion notes 4

Run the flow field while inside; leaving freezes the current phase and clears disturbances. Flow continuously while inside.

## Repeated input and interruption

Re-entering or replaying starts at the configured phase. Editing the flow while inside preserves the current phase. Accumulated phase makes loop wrapping continuous. Actions do not queue.

## Reduced motion

Follow prefers-reduced-motion: skip delay, loops and animation and show the target state immediately. Preview speed is observation state and is never saved in the configuration.

## Motion notes 7

Characters "cyslap"; glyph opacity multiplier 77%; font size 6.8 px; density 110%; speed 2.8×; field rotation 65°; twist 2; wave compactness 0.4; color #212121; pointer strength 1×; radius 100 px.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
