# Vercel Command Search · 变形命令搜索

**English** · [简体中文](README.zh-CN.md)

A compact search trigger morphs into a grouped command panel with filtering, arrow-key selection and Escape.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-92) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-92/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-92/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click Find… or press F while the component is focused. Filter by typing, select with arrows, confirm locally with Enter and close with Escape. Edit each command group line by line; panel width and list height are independent. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Search placeholder: "Find..."；Open shortcut: "F"；Suggested commands (one per line): "Calendar\nSearch Emoji\nCalculator\nDocuments\nImages\nMusic"；Settings commands (one per line): "Profile\nBilling\nSettings\nNotifications\nMessages\nSecurity"；Help commands (one per line): "FAQ\nContact Support"；Documentation commands (one per line): "Documentation\nTutorials"；Panel width: 384；List maximum height: 300；Background: "#f5f4f3"；Panel color: "#f5f4f3"；Text color: "#121212"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 660 × 820; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

A compact search trigger morphs into a grouped command panel with filtering, arrow-key selection and Escape. Native controls retain their current local state after the demonstration ends.

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
