# Hover Preview · 文字悬停图片

**English** · [简体中文](README.zh-CN.md)

Inline words reveal a floating image that follows the pointer.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/hover-preview) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/hover-preview/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Hover github, orocoa or star to reveal its image; pointer movement shifts and tilts it. Tab reveals, arrow keys switch words, Escape dismisses. Tap to pin; tap again or outside to close.

## States and motion

Images enter from opacity 0 and scale 0.94 to opacity 1 and scale 1. Preferred position above; text is centered; rotated bounds stay inside the canvas and images scale down to fit the space beside the paragraph.

## Motion notes 3

Enter 200 ms, exit 150 ms, with a fixed cubic Bezier ease-out. Pointer following uses a short transition of up to 160 ms. Observation speed only changes runtime clocks.

## Motion notes 4

Leaving or blurring the word fades and shrinks the image from its current pose. A tapped preview remains until dismissed. The image does not intercept pointer events.

## Repeated input and interruption

Rapid changes retarget the latest word without queuing. The toolbar demonstrates orocoa entering, holding for 800 ms and leaving. Pause preserves both animation and demo progress; Play resumes. Hover, taps, focus and observation speed are not serialized.

## Reduced motion

Show and dismiss instantly with no tilt or animation; keyboard, taps and image content remain available.

## Motion notes 7

Position above; size 200px; aspect 1; rotation 12°; offset 15px; radius 12px; shadow true; target padding 4px.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

The public demo uses authored generic avatar/icon artwork in place of personal or brand assets.
