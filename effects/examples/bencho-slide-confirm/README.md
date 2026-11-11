# Slide to Confirm · 滑动确认

**English** · [简体中文](README.zh-CN.md)

Reach the end to unfurl the confirmation pill; partial drags spring back.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/bencho-slide-confirm) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/bencho-slide-confirm/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/bencho-slide-confirm/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Motion notes 1

Speed 50, width 280px, corner 28px. Only reaching the end confirms. Arrow keys adjust, End reaches the end, Enter confirms, Escape resets.

## Interaction

Drag to the end and release to confirm. Arrow keys adjust; End reaches the end, then Enter / Space confirms. Hover, focus and playback never confirm automatically.

## States and motion

Start from the configured appearance. File completion and confirmation briefly hold before reset; menus close after selection and context compaction is reversible.

## Repeated input and interruption

Manual input cancels pending demonstrations. Pause freezes current state and resume continues. Leaving releases gestures; destroy clears clocks, listeners and sound.

## Motion notes 5

Response baseline 600 ms; observation speed is never saved.

## Motion notes 6

Catalog cards stay idle until a manual drag or keyboard action. Partial and canceled drags return to the start. Offscreen and background pause progress; controls never open the detail page.

## Reduced motion

Automatic demonstrations and eye motion stop; dragging, selection and keyboard controls remain available with immediate results.

## Motion notes 8

Current files, progress, confirmation, menu selection, gaze and compacted state stay temporary. Only content and Customize settings are exported.

## Motion notes 9

Trusted-input sounds on, volume 35%; automatic demonstrations stay silent.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
