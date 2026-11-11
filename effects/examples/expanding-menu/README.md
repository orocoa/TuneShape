# Expanding Icon Menu · 图标展开菜单

**English** · [简体中文](README.zh-CN.md)

An icon dock that reveals each label with a sliding highlight on hover or focus.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/expanding-menu) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/expanding-menu/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/expanding-menu/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Motion notes 1

Icons stay on the left. Width, label and highlight reveal together, then collapse with the same curve after pointer leave and blur.

## States and motion

Items: Home / Games / Chat / Search / Profile. Width 70→130px; height 50px; icons 28px.

## Interaction

Hover or Tab to expand; leaving both pointer and focus collapses. Arrow keys and Home / End move focus, Enter / Space select, Escape collapses. Tap to expand and select on touch. Preview never navigates.

## Motion notes 4

Each expansion/collapse takes 200 ms with ease-in cubic-bezier(.42,0,1,1). Width, text and highlight share progress; interrupted transitions continue from their current pose.

## Motion notes 5

Background #f1f1f1, menu #ffffff, highlight #eeeeee, ink #242424. Outer radius 15px, item radius 8px, shadow opacity 0.075.

## Repeated input and interruption

Catalog hover, focus or Preview demonstrates the items. Leave and blur, offscreen or background stop it; reenter to replay. Native interaction takes priority. Detail pause freezes progress, resume continues in place. Observation speed changes only the clock.

## Reduced motion

No automatic demo. Hover, focus, tap and keyboard reveal the corresponding label instantly.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
