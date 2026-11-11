# AI Multi Mode Input · AI 多模式输入框

**English** · [简体中文](README.zh-CN.md)

A multiline composer with attachments, Search, DeepMind and model selection. Submission stays in the local demo.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-81) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-81/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-81/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Type a message; Enter sends locally and Shift+Enter inserts a line. Add attachments with Plus, toggle Search/DeepMind and select a saved model. The initial model must belong to the list; default toggles set the next initial state. Reply text and delay are editable local demos, with no AI call; delay uses milliseconds (1000 is one second). Changing settings cancels pending old replies; the next send uses current settings. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Placeholder: "Ask Anything"；Composer width: 744；Input font size: 16；Composer radius: 16；Canvas background: "#f1f1f1"；Input background: "#f9f8f8"；Button background: "#f9f8f8"；Text color: "#121212"；Selection color: "#0ea5e9"；Models (one per line): "GPT-4o\nClaude 3.5 Sonnet\nGemini Pro\nLlama 3.1"；Initial model: "GPT-4o"；Start with Search: false；Start with DeepMind: false；Local demo reply: "I dunnoo 😭"；Demo reply delay: 1000；Demonstration text: "Plan a studio"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 768 × 440; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

A multiline composer with attachments, Search, DeepMind and model selection. Submission stays in the local demo. Native controls retain their current local state after the demonstration ends.

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
