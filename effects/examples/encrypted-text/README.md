# Encrypted Text · 逐字解码

**English** · [简体中文](README.zh-CN.md)

Encrypted Text · editable content and live parameters

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/encrypted-text) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/encrypted-text/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Detail previews reveal once; click text or Play to replay. Catalog hover demonstrates and leaving restores readable text. Enter/Space replays the focused text.

## States and motion

Text "Lorem ipsum"; charset "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?", noise #999999 → text #171717, font 16px. Whitespace and Unicode code points are preserved; noise never changes glyph-cell widths.

## Motion notes 3

Reveal 550 ms total, 50 ms per code point, noise updates 50 ms, delay 0 ms. Retain original text on completion. This visual effect provides no data encryption.

## Motion notes 4

Unrevealed characters change until their turn to settle. Completion retains the source; replay restarts the reveal.

## Repeated input and interruption

Pause, inactive previews and hidden pages freeze clocks; resume continues. Content and parameters drive preview, descriptions, Motion, JSON and exports. Focus, typed input, live selection, progress and observation speed remain transient.

## Reduced motion

Reduced motion presents readable text or target states immediately, retains native input/menu/keyboard behavior and disables automatic repetition.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
