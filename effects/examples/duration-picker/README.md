# Duration Picker · 时长选择器

**English** · [简体中文](README.zh-CN.md)

A compact duration input that springs apart to edit and joins on confirmation.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/duration-picker) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/duration-picker/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click the pencil to open and focus hours; edit hours and minutes, then click the check or press Enter to confirm. Escape restores the last confirmed value and closes. Tab moves between fields.

## States and motion

Initial content 7 h / 25 min; ranges 0–24 hours and 0–60 minutes. Initially closed. Segments merge into a pill when closed and separate by 8px when open. Height 48px; radius setting 12px, capped at half the height.

## Motion notes 3

Response basis 450 ms, analytical damped spring with bounce 0.12. Duration controls pacing rather than an exact settling time. Gap, inner corners, input widths, gentle sway and pencil-to-check morph move together.

## Motion notes 4

Negative, fractional or over-limit input is immediately truncated and clamped, with a brief shake. Empty fields stay editable and confirm as zero. Editing is enabled. Theme light.

## Repeated input and interruption

Rapid clicks preserve spring position and velocity. Pause, background tabs and inactive previews freeze all clocks. Resume continues. Changes to gap, bounce or duration demonstrate one cycle. Inspector content updates immediately and is saved; direct preview input, confirmations, focus, progress and observation speed are transient and excluded from JSON.

## Reduced motion

State changes settle instantly; bounce, sway, correction shake and automatic demo closing are disabled. Input, confirmation, cancellation and limits remain functional.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
