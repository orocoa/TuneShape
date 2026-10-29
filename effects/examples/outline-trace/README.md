# Outline Trace · 字形描边

**English** · [简体中文](README.zh-CN.md)

Trace actual glyph contours, then reveal their fill from bottom to top.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/outline-trace) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/outline-trace/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/outline-trace/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Play once on detail entry; click, Enter, Space or Play to replay. Catalog hover demonstrates; leaving retains readable text.

## States and motion

Trace actual glyph contours, then wipe the fill upward within the glyph.

## Motion notes 3

Complete the full entrance and retain readable text; replay restarts the entrance.

## Motion notes 4

Saved settings: {"kind":"outline-trace","text":"Outline","fontSize":150,"fontWeight":800,"color":"#171717","strokeColor":"#171717","strokeWidth":2.5,"stagger":3,"fill":true,"keepStroke":false}. Typography uses a 1280×720 reference canvas with proportional preview scaling.

## Motion notes 5

Duration basis 1467 ms; delay 0 ms. Scale the full timeline so every character completes.

## Repeated input and interruption

Replay restarts the text entrance. Pause, inactive previews and background pages freeze the clock. Observation speed and progress are transient. Text and parameter edits drive previews, descriptions, Motion, JSON and exports.

## Reduced motion

Show the complete, readable text immediately. Skip entrance animation and cursor blinking while retaining content and reading layout.

## Motion notes 8

Built-in Inter ExtraBold Latin and Noto Sans SC Chinese contours: 7,738 glyphs. Fixed 800 weight. Unsupported characters are reported by the editor.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
