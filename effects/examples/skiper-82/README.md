# Rainbow Send Input · 彩虹发送输入框

**English** · [简体中文](README.zh-CN.md)

A compact message input with a rainbow send wave, rotating arrow and local message stack.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-82) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-82/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-82/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Enter a message and press Enter or the arrow to show a local bubble and colour wave. Four colours drive that same wave; response duration controls the send transition. Manual sends use the original public cue and can be muted; automatic demos stay silent and the cue keeps its original speed. Edit the local demo reply and delay, in milliseconds (1000 is one second); changing settings cancels pending old replies and the next send uses current content. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Placeholder: "Send Message"；Input width: 512；Input font size: 16；Input radius: 24；Canvas background: "#f1f1f1"；Input background: "#ffffff"；Button background: "#f5f4f3"；Text color: "#000000"；Wave pink: "#fc2ba3"；Wave orange: "#fc6d35"；Wave yellow: "#f9c83d"；Wave blue: "#144ec5"；Play sound on manual send: true；Local demo reply: "Lock in vro 😵"；Demo reply delay: 1000；Demonstration text: "A little more color"

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 768 × 500; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

A compact message input with a rainbow send wave, rotating arrow and local message stack. Native controls retain their current local state after the demonstration ends.

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
