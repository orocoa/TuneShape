# Rig Assembly · 机械臂拼接

**English** · [简体中文](README.zh-CN.md)

Two arms bring image panels into place, assembling the picture from top to bottom.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/reelfolio-rig) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/reelfolio-rig/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/reelfolio-rig/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## States and motion

6 configurable images, starting at 1. Background #f1f1f1, ink #242424. Independent Canvas implementation with no external media.

## Interaction

Click, Enter, Space or arrow keys switch images. Hover, focus or mobile Preview demonstrates a complete sequence.

## Motion notes 3

Presentation 3600 ms, followed by a 900 ms reading hold. Duration, hold and observation speed share one frame clock. Observation speed is never saved.

## Motion notes 4

Alternating image panels arrive from both sides; arms withdraw after assembly.

## Repeated input and interruption

A new selection starts from the current image. Pause freezes elapsed time; resume continues. Leaving and blurring, offscreen and background stop catalog demonstrations. Destroy releases frames, observers and listeners.

## Reduced motion

Reduced motion disables demonstrations and reveals the completed image directly. Manual selection, touch and keyboard remain available.

## Motion notes 7

Preserves the main composition and motion sequence using 2D Canvas and drawn arms. No original 3D rig model is used. Images and gray styling follow TuneShape.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
