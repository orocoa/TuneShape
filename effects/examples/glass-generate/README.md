# Glass Generate Button · 玻璃生成按钮

**English** · [简体中文](README.zh-CN.md)

A translucent pill with a moving rim, reflective sweep and a tilted press.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/glass-generate) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/glass-generate/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/glass-generate/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## States and motion

Label “Generate”; 16px type, 1.5em / 0.875em padding. Background #f1f1f1, glass #ffffff, text #323232.

## Interaction

Hover or focus shifts the reflection; click, Enter or Space presses the button. Catalog hover, focus or Preview demonstrates hover, press and release; direct input takes priority. Preview counts activations without calling a generation service.

## Motion notes 3

Response 400 ms with cubic-bezier(.25,1,.5,1). Reflective sweep and angle use 500 ms; rim angle uses ease.

## Motion notes 4

Hover scales to 0.975, changes backdrop blur from 2px to .01em and moves reflection from 0% to 25%. Press tilts 25° and moves reflection to 50% / 15%; release restores it. Touch keeps the reference’s fixed reflective angles.

## Repeated input and interruption

Native CSS transitions retarget from their current pose. Toolbar pause freezes transitions and the demo clock; resume preserves progress. Background, offscreen and inactive previews stop. Observation speed is transient.

## Reduced motion

Skip automatic demos and transitions; hover, press and focus settle instantly. Native button activation remains available.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
