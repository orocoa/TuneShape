# Flip Words · 词语翻替

**English** · [简体中文](README.zh-CN.md)

Flip Words · editable content and live parameters

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/flip-words) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/flip-words/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Detail previews advance in order; click text or Play for the next item. Repeat the cycle. Catalog hover demonstrates. Index-based iteration supports repeated words.

## States and motion

Prefix "Build", words ["beautiful","modern","interactive","creative"], suffix "websites with TuneShape"; font 36px, text #737373, word #171717. Exit moves (40, -40)px, scales to 2, blurs 8px.

## Motion notes 3

Base transition 500 ms, character stagger 50 ms and 300ms at word spaces. Each character enters over 40% of the base duration; transitions last until the last letter finishes, followed by 3000 ms hold. Words use their natural width; the suffix occupies the next line.

## Motion notes 4

The old word moves up, grows, blurs and fades out while the next word enters character by character from below.

## Repeated input and interruption

Pause, inactive previews and hidden pages freeze clocks; resume continues. Content and parameters drive preview, descriptions, Motion, JSON and exports. Focus, typed input, live selection, progress and observation speed remain transient.

## Reduced motion

Reduced motion presents readable text or target states immediately, retains native input/menu/keyboard behavior and disables automatic repetition.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
