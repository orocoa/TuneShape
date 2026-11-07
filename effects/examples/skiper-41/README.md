# Progressive Blur · 渐进模糊阅读

**English** · [简体中文](README.zh-CN.md)

A scrollable reading surface with gradient backdrop blur at both edges.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-41) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-41/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-41/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Scroll with wheel, touch or PageDown. Blur amount is in pixels; overlay height controls its reach. Choose top, bottom or both, and edit reading content, paragraph count and line height independently. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Reading text: [long content; see controls, 1273 characters]；Scroll hint: "Scroll down to see the effect"；Paragraph count: 10；Font size: 16；Line height: 1.5；Blur amount: 4；Blur height: 150；Blur position: "both"；Background: "#f5f4f3"；Text color: "#939292"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 540 × 600; saved scale 1, offset (0, 0).

## Motion notes 4

The blur is a static CSS overlay. Native scrolling determines the reveal; demonstration delay 0 ms. The common duration field does not change the blur.

## Motion notes 5

A scrollable reading surface with gradient backdrop blur at both edges. Native controls retain their current local state after the demonstration ends.

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
