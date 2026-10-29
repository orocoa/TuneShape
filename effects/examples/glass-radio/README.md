# Glass Segmented Radio Control · 玻璃分段单选

**English** · [简体中文](README.zh-CN.md)

Glass Segmented Radio Control · 500 ms · Uiverse.io · chase2k25

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/glass-radio) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/glass-radio/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click or use arrow keys and Space to select Silver, Gold or Platinum. Selecting the current option does not replay. Hover does not switch. The toolbar demonstrates Silver → Gold → Platinum → Silver, with pause and resume preserving progress. The detail toolbar plays both sides from initial to final and back once; loading effects follow their loop setting. Pause holds the current display and resumes from the same progress.

## States and motion

[data-part="glider"] / x: 0% → 100%; [data-part="finish0"] / opacity: 1 → 0; [data-part="finish1"] / opacity: 0 → 1; [data-part="finish2"] / opacity: 0 → 0; [data-part="label0"] / color: #303640 → #68717d; [data-part="label1"] / color: #68717d → #303640; [data-part="label2"] / color: #68717d → #68717d; [data-part="root"] / x: 0 → 0; [data-part="root"] / y: 0 → 0; [data-part="root"] / scale: 1 → 1.

## Motion notes 3

Glider duration 500 ms; trigger delay 0 ms; Spring; bounce 0.24. Duration controls pacing, not an exact settling time. Finish crossfade 400 ms and label colors 300 ms, both with ease-in-out.

## Motion notes 4

Move the glider to the selected segment while metallic finish layers crossfade and labels change color. Retain the selected finish after completion. Selecting the current option does not replay; selection never loops automatically.

## Repeated input and interruption

Use native radio inputs with unique names and IDs for each preview. Selection and focus are transient state and are excluded from JSON. Rapid changes stop old controllers and retarget from current displayed values to the latest selection without queuing. The toolbar pauses and resumes the current clocks.

## Reduced motion

Follow prefers-reduced-motion: skip delay, loops and animation and show the target state immediately. Preview speed is observation state and is never saved in the configuration.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
