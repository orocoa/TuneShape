# Perspective Text Scroll · 透视滚动文字

**English** · [简体中文](README.zh-CN.md)

Text advances on a tilted 3D plane, with perspective widening the nearer lines.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-28) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-28/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-28/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Scrolling advances text with the source fixed 30 degree tilt, 200px perspective and 10px depth. Edit text, typography, projection and travel. Source lyrics are replaced with original TuneShape copy. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Text content: "IDEAS TAKE SHAPE IN MOTION. A SMALL SHIFT CAN CHANGE THE WAY WE SEE. MAKE ROOM FOR EXPERIMENTS, FIND THE RHYTHM IN SIMPLE THINGS, AND LET EACH DETAIL CONNECT TO THE NEXT. EXPLORE WHAT MOVES YOU. CREATE SOMETHING THAT FEELS ALIVE."；Font size: 60；Line height: 1；Font weight: 700；Letter spacing: -3；3D tilt: 30；Perspective: 200；Vertical travel: 487；Depth: 10；Scroll length: 3；Scroll smoothing: 0.15；Initial scroll position: 0；Background: "#f1f1f1"；Text colour: "#ff5800"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 900 × 600; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

Text advances on a tilted 3D plane, with perspective widening the nearer lines. Native controls retain their current local state after the demonstration ends.

## Repeated input and interruption

Leaving the catalog with focus outside, going offscreen and switching to the background stop the demonstration. Manual input, live selection and playback progress never replace the saved defaults.

## Motion notes 7

The controls, preview, JSON, Motion adapter, prompt project and HTML export use this same saved settings object and renderer. Catalog cards always show project defaults.

## Reduced motion

No automatic demonstration; transitions settle immediately. Native text input, buttons, selection and keyboard controls remain available.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
