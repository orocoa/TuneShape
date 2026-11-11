# Oliver Parallax · 多列视差画廊

**English** · [简体中文](README.zh-CN.md)

Pan an endless image canvas in any direction, or switch to the original multi-column scroll parallax.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-30) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-30/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-30/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

The default infinite canvas supports dragging, touch, wheel and arrow-key panning; Home resets the view. Images repeat beyond every edge. Adjust scale, columns, gap, momentum and parallax, or select the original vertical column mode. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Gallery mode: "canvas"；Canvas scale: 1.25；Tile aspect ratio: 1；Pan sensitivity: 1；Drag momentum: 0.7；Column stagger: 0.35；Images (one URL per line): [long content; see controls, 4056 characters]；Image descriptions (matching lines): "Shape 1\nShape 2\nShape 3\nShape 4\nShape 5\nShape 6\nShape 7\nShape 8\nShape 9"；Image fit: "natural"；Columns: 4；Gallery height: 1.75；Image gap: 2；Parallax strength: 1；Image corner: 0；Scroll smoothing: 0.15；Initial scroll position: 0；Background: "#f1f1f1"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 900 × 600; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

Pan an endless image canvas in any direction, or switch to the original multi-column scroll parallax. Native controls retain their current local state after the demonstration ends.

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
