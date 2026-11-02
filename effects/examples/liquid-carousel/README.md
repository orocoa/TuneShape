# Liquid Image Carousel · 液态图片轮播

**English** · [简体中文](README.zh-CN.md)

A fixed image card with an organic liquid reveal and local refraction originating at the navigation buttons.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/liquid-carousel) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/liquid-carousel/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/liquid-carousel/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Use the arrow buttons, Left/Right keys, Home/End or horizontal swipes. Selection stays on this page.

## States and motion

A 202px card, 0.756 image aspect, 14.2px corners and 4.5px white border. Default image 1 of 6.

## Motion notes 3

Each transition lasts 800 ms. An organic radial reveal grows from the clicked button; coherent ripples follow the edge, with refraction confined to the moving front. Distortion 0.2, edge variation 0.1.

## Motion notes 4

Next reveals from the right button; previous reveals from the left. Both images refract locally near the moving boundary. The rounded white frame and navigation controls stay fixed. Painting stops after full coverage.

## Repeated input and interruption

Rapid navigation snapshots the current mixed frame and retargets the latest image without a queue. Hover, focus and mobile Preview share gallery demos. Leaving finishes the current transition and sleeps; background and offscreen states stop immediately.

## Motion notes 6

Images, titles, order, defaults, size and liquid settings are saved. Live selection and observation speed stay transient. Motion, runnable prompt projects and offline HTML share the same renderer and embedded images.

## Reduced motion

Disable automatic demos and liquid motion; retain instant selection, buttons, touch and keyboard. Without WebGL, use an organic radial canvas mask.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
