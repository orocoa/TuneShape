# Card Swap · 纵深换卡

**English** · [简体中文](README.zh-CN.md)

The front card takes the back slot while the others step forward.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/bencho-card-swap) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/bencho-card-swap/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/bencho-card-swap/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## States and motion

5 replaceable monochrome geometric images. Initial value 50; background #f1f1f1, ink #242424.

## Interaction

Click or fling the front card to send it behind the stack. Horizontal spacing is 34px; vertical and depth offsets follow the original 34 / 26 / 70 proportions. Small drags settle back.

## Motion notes 3

Response baseline 600 ms (source 600ms). Auto swap uses its independent 4s interval, unaffected by response duration. Observation speed applies to motion and auto intervals, and is never serialized.

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
