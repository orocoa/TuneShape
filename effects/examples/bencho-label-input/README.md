# Floating Label Input · 浮动标签输入

**English** · [简体中文](README.zh-CN.md)

The label lifts into a measured notch in the outline on focus.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/bencho-label-input) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/bencho-label-input/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/bencho-label-input/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## States and motion

An empty field labelled “Email”. Input and passwords are temporary and never saved.

## Interaction

Preserves the original public component geometry and gesture thresholds. Use pointer, touch and keyboard; slider controls retain native slider semantics.

## Motion notes 3

Response baseline 600 ms (source 600ms). Observation speed applies to motion and auto intervals, and is never serialized.

## Motion notes 4

Hover, focus or mobile Preview demonstrates the catalog. Leaving and blurring, offscreen and background stop it. Reentry replays; editor content never changes catalog defaults.

## Repeated input and interruption

Manual input cancels pending demonstrations. Pause freezes current clocks and resume continues them. Disable releases old gestures and audio; destroy removes frames, timers, listeners and audio nodes.

## Reduced motion

Reduced motion disables automatic demonstrations and floating. Manual choice, dragging, keyboard and real input remain available with immediate results.

## Motion notes 7

Interaction sound on, volume 35%. MIT Bencho synthesis is unlocked only by real input. Auto demonstrations, imports and page load stay silent. Slider cues are rate limited; pause, mute, background and destroy stop audio.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
