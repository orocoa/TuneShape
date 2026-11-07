# Vertical Tooltip Menu · 竖向裁切提示菜单

**English** · [简体中文](README.zh-CN.md)

Three vertically stacked icons share a clipped tooltip that follows hover and keyboard focus.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-98) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-98/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-98/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Hover/focus the three icons, use Up/Down to move and Escape to hide the tooltip. Tune tooltip side and gap, item size, badge and labels. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Comment label: "Comment"；Share label: "Share"；Menu label: "Menu"；Tooltip side: "left"；Show menu badge: true；Item size: 32；Tooltip gap: 8；Background: "#f5f4f3"；Menu color: "#000000"；Text color: "#ffffff"；Badge color: "#00a6f4"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 360 × 300; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

Three vertically stacked icons share a clipped tooltip that follows hover and keyboard focus. Native controls retain their current local state after the demonstration ends.

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
