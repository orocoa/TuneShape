# Selector · 选择器

**English** · [简体中文](README.zh-CN.md)

A straight wheel with a crisp center, soft distant rows, inertial dragging and snap selection.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/coffee-selector) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/coffee-selector/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/coffee-selector/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click to expand. Scroll, drag vertically or use arrow keys. Click an option or press Enter to confirm; Escape cancels, Home/End navigate to the first/last choice. Clicking outside confirms.

## States and motion

A single row expands to 280px wide with 48px rows, 24px corners and 16px text. Every row stays in one straight column.

## Motion notes 3

Opening and snapping share an analytic spring; closing eases in and out over the same response window: 460 ms, bounce 0.12. Demo delay 0 ms. Wheel input snaps after 140ms of inactivity; drag release projects from velocity.

## Motion notes 4

The center remains crisp; distant rows use approximately 2.4px blur and 22% opacity. The list wraps and snaps after release.

## Repeated input and interruption

Repeated input retargets the current motion. Manual input takes over from gallery demos. Leaving and blur smoothly close the panel, then stop. Re-entering during closing opens from the current pose. Offscreen and background states stop immediately. Live choices stay transient; inspector defaults are saved.

## Reduced motion

Automatic demos and inertial animations are disabled. Selection settles immediately; pointer, wheel, touch and keyboard controls remain.

## Motion notes 7

Geisha — Panamanian Geisha is known for delicate floral, jasmine and peach-like aromas.
https://varieties.worldcoffeeresearch.org/varieties/geisha-panama

Bourbon — A foundational Arabica variety with very good quality potential at high altitude.
https://varieties.worldcoffeeresearch.org/varieties/bourbon

SL28 — A well-known African variety, commonly grown in Kenya, with exceptional high-altitude quality potential.
https://varieties.worldcoffeeresearch.org/varieties/sl28

Typica — A historically important Arabica variety; a useful companion to Bourbon for comparison.
https://varieties.worldcoffeeresearch.org/varieties/typica

Pacamara — A large-beaned Pacas × Maragogipe cross, primarily grown in El Salvador, with exceptional quality potential.
https://varieties.worldcoffeeresearch.org/varieties/pacamara

These are variety suggestions; actual flavor depends on origin, processing, roasting and the lot. Sources checked 2026-10-22.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)

[Effect-specific source and attribution](SOURCE_NOTICE.txt)
