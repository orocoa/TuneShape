# Glyph Decode Wall · 文字解码墙

**English** · [简体中文](README.zh-CN.md)

Glyph Decode Wall · 2600 ms · 原创实现

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/glyph-wall) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/glyph-wall/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Hover the catalog preview to scan; detail previews start automatically. Hover or focus a decoded word to clear nearby noise and hold the clock. Click blank canvas or Shuffle to restart with another deterministic arrangement. The detail toolbar pauses and resumes the same forward cycle without a reverse return.

## States and motion

[data-part="wall"] / glyphPhase: 0 → 1; [data-part="root"] / x: 0 → 0; [data-part="root"] / y: 0 → 0; [data-part="root"] / scale: 1 → 1.

## Motion notes 3

Scan 2600 ms; hold 5000 ms; dissolve 650 ms; rest 800 ms. Full cycle 9050 ms. Initial delay 0 ms.

## Motion notes 4

Scan the glyph grid and decode words as the band reaches them. Hold the readable words, dissolve and rest. Focus clears nearby noise and dims other words while holding the clock. Repeat the full cycle; shuffle follows the saved setting.

## Repeated input and interruption

Pause preserves scan phase, noise and decode progress; Play resumes the same clock. Hover or keyboard focus holds the clock until leaving or blurring. Clicking blank canvas restarts a new layout; parameter edits restart from the new settings. Actions do not queue. Seed, focus and observation speed are transient and excluded from JSON.

## Reduced motion

Show all words immediately; no scan, scramble, delay or loop.

## Motion notes 7

Words "HELLO|TUNESHAPE|EXPLORE|CREATE|IDEA|OROCOA"; layout scatter; direction down; charset letters; font 14 px; density 0.7; base noise opacity 0.1; scramble 12 Hz; decode span 0.5; scan band half-width ratio 0.09; shuffle true; word color #171717; noise color #777777.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
