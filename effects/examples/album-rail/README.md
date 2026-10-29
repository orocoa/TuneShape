# Album Rail · 唱片轨道

**English** · [简体中文](README.zh-CN.md)

A fan of album sleeves, with records that slide out and spin.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/album-rail) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/album-rail/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/album-rail/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Detail autoplays; the gallery runs on hover. Click a side sleeve to center it. Hover the center sleeve to peek at its record; click it or the spin button to pull the record out. Click again or Escape to return it.

## States and motion

Logical canvas 640 × 420 with 12 covers. Height fraction 0.62; aspect 1; spread 0.58; stack 0.5; fan 6°; turn 22°; depth 0.5; 3 neighbours per side; radius 14 px.

## Motion notes 3

Snap and extraction response basis 650 ms, using separately calibrated analytical springs: slight overshoot for snapping/extraction and a faster critical return. Preserve the current velocity. At this setting, 90% travel takes about 448 ms for switching, 310 ms for extraction and 272 ms for return. Counterclockwise record speed 33 rpm (198°/s); autoplay interval 4s.

## Motion notes 4

Hover reveals a narrow record rim without moving the fan. Playback exposes about half the record while the fan moves left smoothly. The label spins at the configured rpm beneath stable groove lighting; autoplay waits while a record is out. Arrow keys, Home / End, navigation buttons and the draggable ruler browse covers. Horizontal drags snap with momentum. Mouse wheel over the rail browses covers; vertical touch gestures keep native page scrolling.

## Repeated input and interruption

Switching retracts the old record while the fan returns continuously; title and artist fade completely around the midpoint before the incoming caption slides in. Rapid actions retarget the current position and velocity without queuing. Toolbar pause freezes snapping, extraction, spin and autoplay age; Play resumes. Hover, keyboard focus and dragging hold autoplay. Wrap at the ends. Current album, record angle, drag and preview speed remain transient.

## Reduced motion

Disable autoplay, spin and hover peeking. Click and keyboard still navigate and extract records; changes settle instantly.

## Motion notes 7

Vinyl true; autoplay true; album accent true; fixed accent #5227ff; background #f1f1f1. Neighbour dimming and soft shadows use fixed renderer defaults.

## Motion notes 8

Twelve original fictional TuneShape sleeves.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
