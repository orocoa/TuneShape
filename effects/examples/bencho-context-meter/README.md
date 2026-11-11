# Context Meter · 上下文计量

**English** · [简体中文](README.zh-CN.md)

Category usage forms a bar or dot field, with reversible compaction.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/bencho-context-meter) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/bencho-context-meter/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/bencho-context-meter/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Motion notes 1

Style Bar, colour Colour, capacity 200K. 5 editable categories. Compact reduces chat to at most 30.4K; Undo restores it.

## Interaction

Use native click, drag and keyboard controls. The catalog play icon starts a demonstration.

## States and motion

Start from the configured appearance. File completion and confirmation briefly hold before reset; menus close after selection and context compaction is reversible.

## Repeated input and interruption

Manual input cancels pending demonstrations. Pause freezes current state and resume continues. Leaving releases gestures; destroy clears clocks, listeners and sound.

## Motion notes 5

Response baseline 600 ms; observation speed is never saved.

## Motion notes 6

The catalog play icon starts a demonstration. Leaving and blurring, offscreen and background stop it; play again to replay. Native controls work without opening the detail page.

## Reduced motion

Automatic demonstrations and eye motion stop; dragging, selection and keyboard controls remain available with immediate results.

## Motion notes 8

Current files, progress, confirmation, menu selection, gaze and compacted state stay temporary. Only content and Customize settings are exported.

## Motion notes 9

Trusted-input sounds on, volume 35%; automatic demonstrations stay silent.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
