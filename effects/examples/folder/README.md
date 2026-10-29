# Folder · 文件夹

**English** · [简体中文](README.zh-CN.md)

Folder · 640 ms · Ariadne

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/folder) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/folder/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/folder/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Enter the actual component to play; leave to exit. Card whitespace does not trigger it. Keyboard focus and blur behave the same way. The detail toolbar plays both sides from initial to final and back once; loading effects follow their loop setting. Pause holds the current display and resumes from the same progress.

## States and motion

[data-part="paper"] / y: 7 → -7; [data-part="paper"] / rotateX: 0 → -7; [data-part="front"] / rotateX: 0 → -30; [data-part="front"] / y: 0 → 8; [data-part="paper"] / scale: 0.98 → 0.98; [data-part="paper"] / z: -1 → -1; [data-part="paper2"] / y: 7 → -16; [data-part="paper2"] / rotateX: 0 → -7; [data-part="paper2"] / scale: 0.98 → 0.96; [data-part="paper2"] / z: -2 → -2; [data-part="paper3"] / y: 7 → -26; [data-part="paper3"] / rotateX: 0 → -7; [data-part="paper3"] / scale: 0.98 → 0.94; [data-part="paper3"] / z: -3 → -3; [data-part="front"] / boxShadow: 0px 8px 20px #2222220e → 0px 14px 30px #2222221a; [data-part="root"] / x: 0 → 0; [data-part="root"] / y: 0 → 0; [data-part="root"] / scale: 1 → 1.

## Motion notes 3

Total duration 640 ms; trigger delay 0 ms; cubic-bezier(0.16, 1, 0.3, 1). Each track follows its configured start / span and times.

## Motion notes 4

Enter using the forward keyframes. Exit reverses keyframes, phase order and time points. Hold the final state without repeating.

## Repeated input and interruption

Stop the previous trajectory, use the current display as the first frame, and move to the latest target. Actions do not queue. Each new loop cycle starts at the cycle’s configured start.

## Reduced motion

Follow prefers-reduced-motion: skip delay, loops and animation and show the target state immediately. Preview speed is observation state and is never saved in the configuration.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
