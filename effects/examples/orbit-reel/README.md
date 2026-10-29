# Orbit Reel · 卡片转轮

**English** · [简体中文](README.zh-CN.md)

A rotating ring of cards opens into a navigable arc.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/orbit-reel) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/orbit-reel/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/orbit-reel/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Detail auto-starts; hover the catalog preview to play. Click a card to open the arc; click the centered card again to enlarge it, then click again to restore. Click blank space, All cards or Escape to return to the ring.

## States and motion

Initial view ring; 18 cards repeat six original artworks in whole sets. The ring is centered; the arc apex sits at 42% of the canvas height.

## Motion notes 3

View changes and snapping take 700 ms with cubic ease-out. Ring speed 8°/s; arc autoplay interval 3.5s. Observation speed affects the runtime clock only.

## Motion notes 4

Card hover and keyboard focus hold automatic motion. Drag the ring or drag the arc sideways; release to snap to a card. Buttons and arrow keys navigate. Vertical scroll stays with the page; horizontal or Shift-wheel navigates.

## Repeated input and interruption

Rapid actions retarget the current position without queuing. Pause freezes rotation, flips and transitions; Play resumes. Repeat automatic motion. Current view, selection, drag and observation speed are not serialized.

## Reduced motion

Disable automatic spin, autoplay and flips; manual view changes and navigation settle instantly.

## Motion notes 7

Count 18; spin 8; interval 3.5; arc 1; aspect 0.8; radius 0.07; gap 0.18; autoplay true; tilt true; flip wave true; pause on hover true; back #171717; background #F1F1F1.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
