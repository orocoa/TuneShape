# Smooth Caret Input · 平滑光标输入框

**English** · [简体中文](README.zh-CN.md)

A spring-driven caret follows native text selection, beside a regular input for comparison.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-106) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-106/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-106/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Type, click to position the caret or use arrow keys; the lower field is the native-caret comparison. Higher stiffness follows faster, higher damping reduces bounce and higher mass adds inertia. Font size, field width and password mode also change caret measurement. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Smooth input placeholder: "smooth input"；Regular input placeholder: "normal input"；Initial text: ""；Input type: "text"；Font size: 24；Field width: 420；Spring stiffness: 500；Damping: 30；Mass: 0.5；Background: "#f5f4f3"；Field background: "#fcfcfc"；Text color: "#121212"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 520 × 360; saved scale 1, offset (0, 0).

## Motion notes 4

Caret timing follows stiffness 500, damping 30 and mass 0.5; demonstration delay 0 ms. The common duration field does not control this physical spring.

## Motion notes 5

A spring-driven caret follows native text selection, beside a regular input for comparison. Native controls retain their current local state after the demonstration ends.

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
