# Liquid Image Carousel · 液态图片轮播

**English** · [简体中文](README.zh-CN.md)

A fixed image card with a liquid edge reveal, local refraction and bottom arrow / capsule navigation.

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

Autoplay advances when the bottom progress bar fills. Selecting an arrow or dot restarts the timer and continues autoplay. Left/Right keys, Home/End and horizontal swipes also work. Selection stays on this page.

## States and motion

A 202px card, 0.756 image aspect, 14.2px corners and 4.5px white border. Default image 1 of 6.

## Motion notes 3

Each transition lasts 1600 ms. An organic radial reveal grows from the corresponding image edge; coherent ripples follow the edge, with refraction confined to the moving front. Distortion 0.2, edge variation 0.1.

## Motion notes 4

Next reveals from the right image edge; previous reveals from the left. Both images refract locally near the moving boundary. The rounded white frame stays fixed. The active bottom dot expands into a capsule and shows progress during automatic demos. Painting stops after full coverage.

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
