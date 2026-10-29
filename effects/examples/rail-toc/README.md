# Rail TOC · 纸飞机目录

**English** · [简体中文](README.zh-CN.md)

A reading rail with a paper plane that follows the current section.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/rail-toc) · [Effect guide and default parameters](https://tuneshape.kai-nex.com/en/effects/rail-toc/) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/rail-toc/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Click headings or use arrows and Home / End. In the standalone preview, the wheel moves along the rail. Enable the linked reading preview to track real article scrolling and jump to headings on click.

## States and motion

Title “On this page”, 8 entries; initial section “Installation”. Installation / ›Prerequisites / ›Installation Steps / ›Configuration / Usage / ›Customizing Content / ››Submenu Content / Features. Indent 14px; row height 32px; type 14px; plane 16px.

## Motion notes 3

Follow response basis 520 ms, using an analytical critically damped spring that preserves position and velocity. Turning response is capped at 300 ms. Reverse travel must exceed 2px before changing direction to avoid jitter.

## Motion notes 4

The plane follows a polyline measured from row centers, turning with its tangent. Read path and nodes become solid; the remaining path stays dashed. Reading offset 96px; linked content false; accent #333333; theme light.

## Repeated input and interruption

Rapid selection retargets the current position. A clicked heading stays pinned until the next wheel, touch or scroll-key action; the final section remains reachable near the document end. Pause, background and inactive previews freeze movement, turning, demo age and programmatic scrolling. Content edits immediately update the TOC and article headings. Current click, scroll position, focus and observation speed are transient and excluded from JSON.

## Reduced motion

Plane and reading position settle instantly; timed demonstrations are disabled. Click, keyboard, real scrolling and node state remain available.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
