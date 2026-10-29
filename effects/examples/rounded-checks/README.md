# Rounded Checkboxes · 圆角复选框

**English** · [简体中文](README.zh-CN.md)

Independent native checkboxes with a soft fill and checkmark transition.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/rounded-checks) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/rounded-checks/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click a checkbox or its label; Tab focuses and Space toggles. Each item is independent. The toolbar toggles the first item and restores it once.

## States and motion

Checked: Daily summary email; Checked: Weekly performance digest; Unchecked: Product release notes. Box 20px plus a 1.5px border, radius 8px, row gap 14px, label gap 12px, font 15px.

## Motion notes 3

Fill, border and checkmark scale: 220 ms; checkmark opacity: 180 ms; delay: 0 ms; curve: cubic-bezier(0.22,1,0.36,1).

## Motion notes 4

Unchecked fill #ffffff, border #e3e8ee; checked fill #929292, mark #ffffff, scale 0.6 → 1 and opacity 0 → 1. Unchecking reverses the transition. Text #737373. Touch and keyboard supported.

## Repeated input and interruption

Rapid toggles target the latest state without a queue. Pause, hidden pages and inactive previews freeze clocks; resume continues. Inspector defaults are saved; preview selections, focus and observation speed are transient.

## Reduced motion

Transitions settle immediately. Multi-select, touch, focus rings and native disabled semantics remain. Play toggles the first item instantly without a timed return.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
