# Glyph Anatomy · 字形构建

**English** · [简体中文](README.zh-CN.md)

Glyph Anatomy

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/glyph-anatomy) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/glyph-anatomy/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/glyph-anatomy/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Play once on detail entry; click, Enter, Space or Play to replay. Catalog hover demonstrates; leaving retains readable text.

## States and motion

Font metric guides appear; anchors and cubic handles construct the contours before fill.

## Motion notes 3

Complete the full entrance and retain readable text; replay restarts the entrance.

## Motion notes 4

Saved settings: {"kind":"glyph-anatomy","text":"Glyph","fontSize":200,"fontWeight":800,"color":"#171717","guideColor":"#737373","guides":true,"keepPoints":false}. Typography uses a 1280×720 reference canvas with proportional preview scaling.

## Motion notes 5

Duration basis 2200 ms; delay 0 ms. Scale the full timeline so every character completes.

## Repeated input and interruption

Replay restarts. Pause, inactive previews and background pages freeze the clock. Live angles, selection, observation speed and progress are transient. Settings drive previews, descriptions, Motion, JSON and exports.

## Reduced motion

Show complete text and a static orbit. Keep focus/keyboard selection without automatic motion.

## Motion notes 8

Built-in Inter ExtraBold Latin and Noto Sans SC Chinese contours: 7,738 glyphs. Fixed 800 weight. Unsupported characters are reported by the editor.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
