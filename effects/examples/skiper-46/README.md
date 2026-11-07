# Next.js Gooey Menu · 黏连状态菜单

**English** · [简体中文](README.zh-CN.md)

A black circular mark and three-row status tooltip expand through a gooey SVG filter.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-46) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-46/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-46/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Hover/focus the circular button, click to toggle and press Escape to close. Edit framework, version, error and route content. Blur changes the goo connection; lift and panel width change its geometry. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Framework: "Next.js"；Version: "v13.4.8"；Error label: "Errors"；Error count: "3"；Route label: "Route"；Route value: "Static"；Button diameter: 40；Panel width: 200；Goo blur: 4.4；Expansion distance: 50；Background: "#ffffff"；Menu color: "#000000"；Text color: "#ffffff"；Error color: "#fb2c36"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 440 × 380; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

A black circular mark and three-row status tooltip expand through a gooey SVG filter. Native controls retain their current local state after the demonstration ends.

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
