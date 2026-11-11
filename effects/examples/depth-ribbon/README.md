# Depth Ribbon · 纵深图带

**English** · [简体中文](README.zh-CN.md)

A ribbon of images winding through three-dimensional space, with overview and ride cameras.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/depth-ribbon) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/depth-ribbon/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/depth-ribbon/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Motion notes 1

8 original TuneShape abstract artworks; local PNG, JPEG and WebP processing with editable titles and subtitles. Independently shuffled passes fill 72 cards, seed 0. Images and settings are embedded in JSON and offline exports.

## Motion notes 2

Path loop; tour cycle. Three closed paths use arc-length spacing. Card size 0.72, aspect 1, radius 0.12; camera offset 1, FOV 60°, fog 1. Thread #b19eef / 0.3, shadow 0.5, background #f1f1f1.

## States and motion

The initial pose shows the whole path. Cycle tours overview, dive, ride and pull back; Ride continuously follows the path; Overview slowly orbits. Idle catalog cards keep a readable overview.

## Motion notes 4

Travel 0.6 cards/second; negative reverses and zero stops travel. A cycle rides for 9 seconds, overviews for about 1.8 seconds and dives/pulls back for about 1.5 seconds each. Automatic motion on. The common duration field does not change camera timing. Toolbar pause freezes all runtime motion; resume preserves position.

## Motion notes 5

Click or Enter moves the camera toward a card and shows the complete image at its natural ratio. Focus height is at most 66% of the scene; camera distance also fits captions, controls and viewport shape. Click again or Escape resumes riding from the selected card. Wheel travel first releases focus.

## Interaction

Interaction on; mouse vertical drag, touch horizontal drag and optional wheel travel. Native vertical touch scrolling remains available. Hold the scene or Space to reveal the full path; drag while held to rotate it; release to return to riding. Manual travel takes over the camera; replay restores the selected tour.

## Motion notes 7

While focused, previous/next buttons, arrows and horizontal touch swipes cycle along the ribbon. Changes and interrupted returns retarget from the current camera. Navigation remains available with captions off. Compact cards show position, with full titles in accessible names and tooltips. Escape on HUD buttons restores gallery focus. Buttons and swipes are TuneShape additions; selection, transition progress and focus distance are not serialized.

## Repeated input and interruption

Catalog motion runs only on hover, focus or mobile Preview; leaving and blurring, offscreen and background states stop it. Re-entry can replay. Hovering a card can pause travel. Selection, camera, position and inertia are runtime only and never serialized.

## Reduced motion

A static overview replaces automatic riding, cycling and inertia. Manual drag, wheel and arrows position directly; focus and release are instant; Space still reveals the whole path.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
