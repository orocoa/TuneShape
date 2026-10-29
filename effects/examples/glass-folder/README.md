# Glass Folder · 磨砂文件夹

**English** · [简体中文](README.zh-CN.md)

A frosted flap tilts forward as document cards fan out and lift.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/glass-folder) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/glass-folder/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/glass-folder/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Hover or keyboard focus gently fans the papers. Click or Enter / Space toggles full opening. Mouse leave, blur, outside click or Escape closes the folder; touch taps toggle it and outside taps close it.

## States and motion

Name “” (blank hides it); 3 documents: Notes / Draft / Ideas. Color white; size md (1×); initially open false. Lift 175px; half-spread 68px.

## Motion notes 3

Spring response basis 800 ms, with a small overshoot and a 6% response-time stagger between papers. Closing has no added delay. Observation speed changes the runtime clock without altering saved timing.

## Motion notes 4

The resting flap tilts 15°; hover lift 20px. Full opening tilts the flap 55° and fans the papers by 16° on either side. Folder name, document titles and summaries use real text; empty summaries leave paper rules visible.

## Repeated input and interruption

Repeated clicks retarget current positions and velocities. Pause, background and inactive previews freeze springs, stagger delays and demo age and resume in place. Play demonstrates one peek, open and return. Size, color and content update immediately; geometry edits trigger a demonstration. Runtime hover, focus, open state and observation speed are excluded from JSON.

## Reduced motion

Settle instantly into the current interaction state without stagger or timed demonstrations. Click, focus and touch remain available.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
