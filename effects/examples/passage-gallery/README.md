# Passage Gallery · 穿行图库

**English** · [简体中文](README.zh-CN.md)

A tiled image tunnel with continuous travel, pointer look and photos that open out of the walls.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/passage-gallery) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/passage-gallery/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/passage-gallery/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Motion notes 1

Images: 8 original TuneShape abstract artworks. Local PNG, JPEG and WebP processing with editable titles. Custom images are embedded in JSON and offline exports without a remote image service.

## Motion notes 2

Floor/ceiling lanes 5; wall rows follow the scene aspect ratio. Gap 0.1, radius 0.06, photo fill 0.3, accent fill 0.06, line opacity 0.12. Seed 0 gives a stable layout.

## Motion notes 3

Accent #5227ff → #ff9ffc; background #fafafa; fog 1, vertical FOV 72°, pointer look 1, hover highlighting 1. Independent subdivided Canvas projection and high-speed trails; material and motion blur differ from the Pro shaders.

## States and motion

The initial pose is a seeded four-sided image tunnel. Travel continuously recycles cells ahead. An opened photo stays centered; closing resumes travel.

## Motion notes 5

Cruise 0.6 cells/second; negative reverses and zero is still. Hold boost 10×, trails 1. Cruise on. The common duration field does not change travel speed. Toolbar pause freezes all runtime motion and resume preserves position.

## Motion notes 6

A photo flies from its wall to a centered full-image view, at most 66% of the scene height, with space reserved for readable captions and controls. Click again or Escape returns the selected image to its wall. Wheel travel closes it before moving on.

## Interaction

Interaction on. Mouse drags vertically; touch drags horizontally while native vertical page scrolling remains available. Arrow keys travel, Home resets. Wheel travel on. Click / Enter opens photos; click again or Escape closes. Captions on.

## Motion notes 8

While focused, previous/next buttons, arrows and horizontal touch swipes cycle through the image content. Turning captions off keeps navigation available. Compact cards show position, with the full title in accessible names and tooltips. Rapid changes continue from the current frame with a crossfade; closing returns to the newly selected image’s wall. Escape also works on HUD buttons and restores gallery focus. These continuous-browsing controls extend the public demo.

## Repeated input and interruption

Catalog cruises only on hover, focus or Preview; leaving and blurring, offscreen and background states stop it. An open photo pauses cruise and closing resumes it. Selection, position, pointer, boost and trails are runtime only.

## Reduced motion

No automatic cruise, boost, inertia or trails. Manual drag, wheel and arrow keys position directly; photos open and close instantly.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
