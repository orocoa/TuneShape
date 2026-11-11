# Wake Slider · 尾波滑杆

**English** · [简体中文](README.zh-CN.md)

A bar slider leaves a rising wake behind a fast drag.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/bencho-wake-slider) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/bencho-wake-slider/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/bencho-wake-slider/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## States and motion

36 bars with initial value 50. Dragged values stay temporary and never overwrite configuration.

## Interaction

Press and drag to adjust the value; faster drags produce a taller wake that decays after release. Hover, focus and playback never change the value. Arrow keys, Home and End adjust only the value.

## Motion notes 3

Response baseline 600 ms (source 600ms). Observation speed applies to motion and auto intervals, and is never serialized.

## Motion notes 4

Catalog cards stay idle. Only manual dragging creates a wake. Offscreen and background pause it; reentry never changes the value. Editor content never changes catalog defaults.

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
