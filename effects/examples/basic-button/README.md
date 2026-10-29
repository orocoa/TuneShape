# Button Press Feedback · 按钮按压反馈

**English** · [简体中文](README.zh-CN.md)

Button Press Feedback · Duration spring · 420 ms / bounce 0.25

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/basic-button) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/basic-button/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Pointer down, Space or Enter enters the pressed state. Releasing, cancelling or moving keyboard focus away returns to rest. The detail toolbar demonstrates initial to final and back once. Pause holds the current display; Play resumes from the same progress.

## States and motion

Rest: x 0 px, y 0 px, scale 1 (100%), opacity 100%. Pressed: x 0 px, y 2 px, scale 0.92 (92%), opacity 100%.

## Motion notes 3

Delay 0 ms before each target change. Duration spring: duration 420 ms, bounce 0.25. Duration controls pacing, not an exact settling time. More bounce produces more overshoot.

## Motion notes 4

Press moves from rest to pressed. Release returns from the current values to rest. Both directions use the same animation parameters.

## Repeated input and interruption

Retarget from the currently displayed values to the latest target. Actions do not queue or repeat automatically. Each new spring starts with velocity 0; it does not inherit the previous velocity.

## Reduced motion

Follow prefers-reduced-motion: skip delay, loops and animation and show the target state immediately. Preview speed is observation state and is never saved in the configuration.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
