# Typewriter Text · 逐字打出

**English** · [简体中文](README.zh-CN.md)

Reveal text at a fixed typing rate with a blinking block cursor.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/typewriter-text) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/typewriter-text/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/typewriter-text/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Play once on detail entry; click, Enter, Space or Play to replay. Catalog hover demonstrates; leaving retains readable text.

## States and motion

Reveal Unicode code points at a fixed rate; a deterministic block cursor blinks every 500ms.

## Motion notes 3

Complete the full entrance and retain readable text; replay restarts the entrance.

## Motion notes 4

Saved settings: {"kind":"typewriter-text","text":"Hello, World!","fontSize":72,"fontWeight":600,"color":"#171717","charsPerSecond":22,"cursor":true,"cursorColor":"#171717"}. Typography uses a 1280×720 reference canvas with proportional preview scaling.

## Motion notes 5

Duration basis 4000 ms; delay 0 ms. Type at 22 code points/second; finish all characters even when longer than the duration basis.

## Repeated input and interruption

Replay restarts the text entrance. Pause, inactive previews and background pages freeze the clock. Observation speed and progress are transient. Text and parameter edits drive previews, descriptions, Motion, JSON and exports.

## Reduced motion

Show the complete, readable text immediately. Skip entrance animation and cursor blinking while retaining content and reading layout.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
