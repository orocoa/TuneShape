# Elastic Reel · 弹性相片卷

**English** · [简体中文](README.zh-CN.md)

Elastic image slices with pointer magnification and click-to-open images.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/elastic-reel) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/elastic-reel/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Hover or drag horizontally to magnify. Click a slice to open; click it again to close. Arrow keys and Home / End browse; Escape closes. Swipe an open image to switch. Vertical scrolling stays with the page.

## States and motion

Logical canvas 640 × 400 with 8 original artworks. Rest width 44 px; height fraction 0.5; gap 10 px; radius 12 px. Magnification 2.4×; influence 200 px; open height fraction 0.72; aspect 1. Neighbouring bars compress to fit.

## Motion notes 3

Spring response basis 800 ms; elasticity 0.35. Autoplay sweep; sweep 1.4 bars/s; cycle interval 4 s; repeat continuously.

## Motion notes 4

Bars grow from their centre. Opening blurs other bars by 2.5 px and dims them by 45%; hovering sharpens them. Detail autoplays; gallery runs on hover. Pointer hover and keyboard focus pause autoplay.

## Repeated input and interruption

Retarget from current geometry and velocity. Pause preserves spring positions, sweep position and cycle time; Play resumes. With autoplay off, hover and click remain available. Preview speed, selected image, focus and spring velocity are transient.

## Reduced motion

Disable autoplay and hover magnification; click and keyboard navigation switch immediately to the target state.

## Motion notes 7

Current version: magnification and open-size edits demonstrate the corresponding interaction.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
