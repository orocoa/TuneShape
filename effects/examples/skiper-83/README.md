# Integration Mention Input · 集成提及输入框

**English** · [简体中文](README.zh-CN.md)

Recognizes @yt, @google and @notion, expands integration cards and sends them with local messages.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-83) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-83/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-83/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Type @yt, @google or @notion to reveal the matching integration cards; Enter/the arrow sends locally. Edit placeholder, type size, radius and wave colours. Manual sends use the original public cue, which can be muted and keeps its original speed; automatic demos stay silent. These are local interaction demos without external integrations. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Placeholder: "Say Something..."；Input width: 512；Input font size: 24；Input radius: 29；Canvas background: "#f1f1f1"；Input background: "#f5f4f3"；Text color: "#121212"；Send button background: "#ffffff"；Wave pink: "#fc2ba3"；Wave orange: "#fc6d35"；Wave yellow: "#f9c83d"；Wave end color: "#c2d6e1"；Play sound on manual send: true；Demonstration text: "tuneshape"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 768 × 580; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

Recognizes @yt, @google and @notion, expands integration cards and sends them with local messages. Native controls retain their current local state after the demonstration ends.

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
