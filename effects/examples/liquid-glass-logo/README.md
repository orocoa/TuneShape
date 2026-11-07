# Liquid Glass Logo · 液态玻璃 Logo

**English** · [简体中文](README.zh-CN.md)

A droplet forms a refractive glass tile, then its glass and rings dissolve into the resting logo on the shared #f1f1f1 gray surface.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/liquid-glass-logo) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/liquid-glass-logo/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/liquid-glass-logo/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Detail auto-starts. Catalog hover, focus or Preview runs the reveal; leave and blur, offscreen and background stop it. Click, Enter or Space replays. Arrow keys seek 0.1 base seconds; Home starts; End/Escape settles.

## States and motion

A brief lead-in grows into a round droplet, then a rounded glass tile with a thick curved shoulder. The centre stays readable while its edges stretch, refract and disperse. Glass, bevel echoes, caustics and rings disappear completely. The resting logo uses 1 final scale; black backgrounds do not enlarge it automatically.

## Motion notes 3

Tile size (logoSize): 256px; Logo scale (logoScale): 0.72; Final logo scale (finalLogoScale): 1; Logo relief (logoRelief): 1.

## Motion notes 4

Optical depth (depth): 2.9; Dispersion (dispersion): 1; Double bevel (relief): 1; Caustics (caustics): 1; Highlights (highlights): 1; Echo plate tint (echoTint): 0.5; Inner wall focus (innerWallFocus): 0; Light diffusion (bloom): 0.55.

## Motion notes 5

Drop strength (dropStrength): 1; Ring decay (decay): 1.4s; Animation speed (speed): 1×; Loop delay (loopDelay): 1.6s.

## Motion notes 6

Background X (backgroundX): 0%; Background Y (backgroundY): 0%; Background scale (backgroundScale): 1×; Background tint opacity (backgroundTintOpacity): 0.

## Motion notes 7

Preview pixel ratio cap (maxDpr): 2.

## Motion notes 8

Logo #09111b; plate #f1f1f1; background #f1f1f1. Use the chosen recolour and logo relief. Plate enabled. Uploaded logo: none; background: none.

## Motion notes 9

Depth controls smoothly settling magnification and bending; dispersion splits edge colours; double bevel adds an inset face. Caustics focus shoulder light, highlights control reflected contours, diffusion softens bright edges. Echo tint blends cool glints with the plate colour. Inner-wall focus changes a full contour into two corner arcs. Background images cover the frame with offset, zoom and tint; their plate becomes see-through.

## Motion notes 10

Base reveal duration 1800 ms; delay 0 ms; speed 1×; reveal about 1.800s. The base timeline starts forming around 0.12s, morphs from droplet to tile during 0.27–0.49s, clears its glass around 1.4s and completes the sequence at 1.8s; frame selection spans 0–2.4s with a 0.6s ending hold. Speed and observation speed change advancement, not base seek units. Stop after one reveal.

## Motion notes 11

Currently ready to play. Appearance, artwork and material edits update actual pixels. Unpaused video-mode edits replay; image mode seeks 0.9s. Finite catalog demos use the shared replay controller and reading dwell without changing saved loop.

## Repeated input and interruption

Pause freezes the sequence; resume retains progress; replay returns to the droplet. Frame inspection, keyboard seeks and toolbar observation do not alter material. Preview, descriptions, Motion, JSON, offline HTML and replay projects share settings. Uploads become embedded local pixels with original files preserved. SVG is rasterized without external links.

## Motion notes 13

Type video; format MP4; ratio 16:9; resolution 1080p gives 1920 × 1080px; target 60 fps. Images use base frame 0.9s. Video records one sequence and ending hold, about 2.400s. Preview and export share a 700px reference scene; resolution changes output pixels. JPEG/video flatten transparency on black. Export uses the click-time configuration snapshot.

## Reduced motion

Show the final logo immediately and skip automatic reveal and loops. Native seeking and asset loading remain available. Manual seeking shows a still selected frame; replay settles without automatic repetition.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
