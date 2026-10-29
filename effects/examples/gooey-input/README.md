# Gooey Input · 黏性搜索输入

**English** · [简体中文](README.zh-CN.md)

Gooey Input · editable content and live parameters

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/gooey-input) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/gooey-input/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click the capsule to expand and focus. Empty blur collapses; typed content keeps it open. The detached icon or Escape clears and closes. Enter confirms locally; no remote search is performed.

## States and motion

Placeholder "Search...", default value "". Width 115px → 200px, offset 50px, height 40px, goo blur 5px; surface #929292, text #ffffff. 

## Motion notes 3

Spring response basis 400 ms, bounce 0.25; retarget from current position and velocity. Only background surfaces are filtered; text, focus rings and controls stay sharp.

## Motion notes 4

The capsule grows and shifts as its icon separates; closing returns to the initial geometry and clears transient input.

## Repeated input and interruption

Pause, inactive previews and hidden pages freeze clocks; resume continues. Content and parameters drive preview, descriptions, Motion, JSON and exports. Focus, typed input, live selection, progress and observation speed remain transient.

## Reduced motion

Reduced motion presents readable text or target states immediately, retains native input/menu/keyboard behavior and disables automatic repetition.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
