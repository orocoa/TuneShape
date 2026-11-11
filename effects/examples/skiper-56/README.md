# Devouring Details Sign In · 粒子消散输入

**English** · [简体中文](README.zh-CN.md)

An underlined input whose text disintegrates into particles when submitted.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-56) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-56/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-56/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Type and press Enter/the arrow to dissolve the text into particles and clear it. Placeholder and initial value are separate settings. Type size, input width, particle size and scatter affect the rendering; response duration sets its pace. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Placeholder: "orocoa@kai-nex.com"；Default value: ""；Submit label: "→"；Input font size: 52；Input width: 550；Particle size: 1；Particle scatter: 26；Background: "#f5f4f3"；Input color: "#000000"；Placeholder color: "#808080"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 620 × 300; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

An underlined input whose text disintegrates into particles when submitted. Native controls retain their current local state after the demonstration ends.

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
