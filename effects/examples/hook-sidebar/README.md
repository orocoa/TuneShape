# Hook Sidebar · 钩线侧栏

**English** · [简体中文](README.zh-CN.md)

A fine hooked rail marks selection while a neutral rail follows hover or focus.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/hook-sidebar) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/hook-sidebar/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click to select. Hover or Tab to another item to show the neutral hook without changing selection. Arrow keys and Home / End move focus; Enter / Space select.

## States and motion

Group label “TuneShape” (blank hides it); 7 items: Controls / Navigation / Containers / Text / Images / Indicators / Backgrounds. Initially “Controls”. Minimum row height 32px; type 14px.

## Motion notes 3

Hook response basis 360 ms, with an analytical critically damped spring retaining current position and velocity. Neutral-rail visibility response is capped at 200 ms. This controls spring response rather than an exact settling deadline.

## Motion notes 4

The #fc4c01 rail runs from list top to the selected row center. Below selection, the neutral rail extends from the selected row; above selection, only its hook is shown, avoiding overlap. Dashed rails; light theme. Row centers are remeasured after text wraps.

## Repeated input and interruption

Rapid changes retarget the current pose. Leaving both pointer and focus fades the neutral rail while retaining selection. Pause, background and inactive previews freeze the clock and resume in place. Play demonstrates one finite out-and-back. Content and appearance edits update immediately. Live selection, hover, focus and observation speed are not serialized.

## Reduced motion

Selection and focus rails settle instantly, with timed demonstrations disabled. Click and keyboard interaction remain available.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
