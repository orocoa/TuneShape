# Vercel Tooltip · Vercel 图标提示栏

**English** · [简体中文](README.zh-CN.md)

A dark icon toolbar with a shared moving tooltip and keyboard hints.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-43) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-43/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-43/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Hover/focus icons to move the shared tooltip. Left/Right, Home and End move focus. Match labels and shortcuts by line; badge indices are zero based. Tune tooltip distance, toolbar spacing and colours. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Icon labels (one per line): "Comment\nInbox\nFeature Flags\nDraft Mode\nShare\nMenu"；Shortcuts (matching lines): "C\n\n\n\n\n⌘ K"；Badge indices (zero based): "1,5"；Icon size: 20；Icon gap: 12；Toolbar padding: 14；Toolbar radius: 30；Tooltip offset: 8；Toolbar color: "#000000"；Icon and text color: "#ffffff"；Badge color: "#00a6f4"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 380 × 260; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

A dark icon toolbar with a shared moving tooltip and keyboard hints. Native controls retain their current local state after the demonstration ends.

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
