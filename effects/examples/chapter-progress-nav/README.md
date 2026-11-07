# Chapter Progress Navigation · 章节进度导航

**English** · [简体中文](README.zh-CN.md)

Equal chapter labels, real scroll progress, and an interruptible direct transition.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/chapter-progress-nav) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/chapter-progress-nav/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/chapter-progress-nav/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## States and motion

There are 3 chapters: Overview / Process / Details. Initially “Overview”. Narrow layouts use each chapter’s short label.

## Interaction

Real scrolling updates chapter lines. Click the full label row to jump to a stable reading position. Tab, Enter, Space and arrow keys are supported; rails accept no input.

## Motion notes 3

Each line uses actual chapter anchors and scroll position. The last chapter ends at the scroll container’s bottom. Scrolling back reverses the line; chapters are never permanently marked read. Rails are outside the link row and accept no click, drag or focus.

## Motion notes 4

A click fades out for 140 ms, commits the scroll position once, then fades in for 230 ms (370 ms total). It skips the intervening scroll journey. The catalog demonstration also moves the actual scroll container; line progress is never simulated by a timer.

## Motion notes 5

Navigation stays outside the content layer. A single scroll commit skips the intervening chapters. Completion and interruption remove the mask and restore content interaction. The active chapter changes when its reading position is actually reached.

## Repeated input and interruption

The latest click replaces the old target without queuing. Wheel, touch, pointer and scrolling keys cancel the transition and restore interaction. Pause and background freeze transition time; resume continues it. Leaving a card clears its demo and restores the configured beginning. Manual reading suppresses automatic replay until re-entry.

## Motion notes 7

Theme auto; accent #2447d8. Type 14px desktop / 13px narrow; weight 350; click rows 44px; line 1px. Gap 28px, inset 32px, rail gap 7px, demo section minimum height 480px and top inset 24px.

## Reduced motion

Tab focuses chapter links; Enter / Space activates. Left/right arrows and Home / End move link focus. Keyboard navigation transfers focus to the destination heading. Reduced motion jumps immediately and retains scrolling and controls. Navigation stays outside the content transition layer, with no duplicated header, brand area, blocks or dots.

## Motion notes 9

Preview, description, JSON, Motion parameters, offline HTML and the runnable project share one configuration and DOM engine. Supports 1–6 chapters. Selection, scroll, focus and demo time are transient. connect binds a real scroll container or window; resolve maps IDs to sections; target optionally supplies stable reading coordinates for complex scenes. An external surface enables fading; keep navigation outside it. Without a surface, bound navigation jumps directly. Call refresh after layout changes. This entry adds no image or video media exporter.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
