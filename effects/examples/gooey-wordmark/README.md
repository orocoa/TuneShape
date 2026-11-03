# Gooey Wordmark · 液态交互字标

**English** · [简体中文](README.zh-CN.md)

A blurred liquid mass resolves into readable type. The pointer melts nearby strokes and changes each touched letter’s hue.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/gooey-wordmark) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/gooey-wordmark/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/gooey-wordmark/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Play once on detail entry. Click or press Enter / Space to replay. Move the pointer to melt nearby strokes and change the touched letter’s hue. Arrow keys explore letters; Escape clears the lens. Touch and drag are supported.

## States and motion

The same glyphs resolve from a strongly blurred, alpha-thresholded liquid mass. Letters rise slightly with a 50ms basis stagger. No surrogate ribbon, squash, rotation or bounce. The caption follows; leader lines stay hidden during loading.

## Motion notes 3

Keep the readable wordmark after the entrance. Pointer leave fades the local lens and deformation without replaying the entrance; click or Play explicitly restarts it.

## Motion notes 4

Full entrance 1600 ms; delay 0 ms. Catalog hover, keyboard focus and mobile Preview repeat after a readable dwell.

## Repeated input and interruption

Pause freezes the entrance and pointer recovery; resume continues the clock. Inactive, offscreen and background catalog cards stop. Pointer position, colour mutations and progress stay out of saved configuration.

## Motion notes 6

Text "tuneshape"; type size 210px; melt intensity 1; interaction radius 100px; grid true; annotations true. Proportionally fit a 1280 × 720 reference canvas.

## Reduced motion

Show the readable final wordmark and annotations; disable the entrance, pointer melting and catalog repetition.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
