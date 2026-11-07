# Elastic Video Player · 弹性拖动视频播放器

**English** · [简体中文](README.zh-CN.md)

A portrait video with an elastic scrubber, hover time marker and animated playback feedback.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/skiper-91) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/skiper-91/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-91/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click the video to play/pause. Drag the scrubber, use arrows for five-second steps and Home/End for endpoints. Replace video/poster, tune height, radii, track thickness and stretch. Response duration changes UI rebound, not media length. Volume is 0–1; video duration comes from the current media. Catalog hover, focus and mobile Preview share a demonstration; the title opens the editor.

## Motion notes 2

Video URL / data URI: "/video/skiper-91.mp4"；Poster URL (optional): ""；Video height: 500；Video corner radius: 32；Panel corner radius: 50；Scrubber width: 400；Progress bar thickness: 6；Edge stretch distance: 24；Canvas background: "#f1f1f1"；Panel color: "#f1f1f1"；Track color: "#f5f5f5"；Progress color: "#404040"；Hover marker color: "#f97316"；Show playback time: true；Start muted: true；Volume: 0.8；Loop video: false

## States and motion

The configured initial state uses the saved content above. Logical preview canvas 768 × 720; saved scale 1, offset (0, 0).

## Motion notes 4

Response basis 500 ms, delay 0 ms. Observation speed is runtime only.

## Motion notes 5

A portrait video with an elastic scrubber, hover time marker and animated playback feedback. Native controls retain their current local state after the demonstration ends.

## Repeated input and interruption

Leaving the catalog with focus outside, going offscreen and switching to the background stop the demonstration. Manual input, live selection and playback progress never replace the saved defaults.

## Motion notes 7

The controls, preview, JSON, Motion adapter, prompt project and HTML export use this same saved settings object and renderer. Catalog cards always show project defaults.

## Reduced motion

No automatic demonstration; transitions settle immediately. Native text input, buttons, selection and keyboard controls remain available.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
