# Waving Tilt Card · 倾斜挥手卡片

**English** · [简体中文](README.zh-CN.md)

A gradient profile card with fifteen tilt zones and a waving hand.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/waving-card) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/waving-card/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/waving-card/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## States and motion

Title “Hi, I'm orocoa”; description “Passionate about creating, beautiful and functional websites”. Width 240px, padding 24px, radius 8px. Name casing is preserved.

## Interaction

Hover reveals the waving hand; five columns by three rows set the tilt. Focus reveals the hand, arrows move between zones, Enter / Space demonstrate, Escape resets and blurs. Touch or Preview demonstrates. Interacting with the card does not navigate; the catalog title opens the editor.

## Motion notes 3

Card transition 300 ms ease-in-out; hand opacity and size 200 ms; wave half-cycle 350 ms linear, alternating.

## Motion notes 4

Horizontal angles [−20, −10, 0, 10, 20]°, vertical [15, 0, −15]°. Hand rotates from 0° to 25°. Leave and blur restore the neutral card and hide the hand.

## Repeated input and interruption

Zone changes retarget native CSS transitions without queuing. Toolbar pause freezes tilt, hand and demo clocks; resume preserves progress. Catalog demos visit four corners and the center, then return to rest. Leave, offscreen and background stop playback. Runtime state is not serialized.

## Reduced motion

No automatic demos, waving or transitions. Pointer and arrow input set angles instantly; focus or touch shows a static hand.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
