# Staggered Character Reveal · 文字逐字上移揭示

**English** · [简体中文](README.zh-CN.md)

Staggered Character Reveal · 1160 ms · 个人网站

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/text-rise) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/text-rise/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/text-rise/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click, Play, Enter or Space starts an upward character reveal, followed by a fade in place. Reset below the clipping masks only after the text is invisible, then repeat according to the loop setting. Pause and resume either phase without resetting. The toolbar follows this reveal-and-fade cycle on both comparison sides.

## States and motion

[data-part="char0"] / y: 105% → 0%; [data-part="char1"] / y: 105% → 0%; [data-part="char2"] / y: 105% → 0%; [data-part="char3"] / y: 105% → 0%; [data-part="char4"] / y: 105% → 0%; [data-part="char5"] / y: 105% → 0%; [data-part="char6"] / y: 105% → 0%; [data-part="char7"] / y: 105% → 0%; [data-part="char8"] / y: 105% → 0%; [data-part="root"] / x: 0 → 0; [data-part="root"] / y: 0 → 0; [data-part="root"] / scale: 1 → 1; [data-part="root"] / opacity: 1 → 1.

## Motion notes 3

Reveal 1160 ms after a 0 ms delay; cubic-bezier(0.22, 1, 0.36, 1). Fade in place over 406 ms with gentle ease-in-out. Full cycle 1566 ms.

## Motion notes 4

Reveal characters upward in a stagger. Keep them at their final positions and fade opacity to zero over 35% of the reveal duration; reset below the masks only while invisible. Never move the visible text back down. Repeat the full reveal-and-fade cycle.

## Repeated input and interruption

A new demonstration resets while invisible. Pause holds the current character positions, opacity and phase progress; Play resumes the same phase. Never reverse the letter Y tracks.

## Reduced motion

Follow prefers-reduced-motion: skip delay, loops and animation and show the target state immediately. Preview speed is observation state and is never saved in the configuration.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
