# Conic Scroll Orb

**English** · [简体中文](README.zh-CN.md) · [All examples](../../README.md)

Run `pnpm dev --open /examples/conic-scroll-orb/` from the `effects/` directory.

Scroll inside the reading area. If the pane has more than 320 px of scroll travel, the orb appears after the first 72 px and fades out when you return within 72 px of the top. One spring drives both the grayscale ring and the percentage. Click or tap the orb, or focus it and press Enter or Space, to scroll smoothly to the top of the reading area. Wheel, touch, and keyboard scrolling can interrupt the return.

With reduced motion, the return to top is instant and progress and visibility update without animation.

The standalone preview opens at 30% of the actual reading range. Play scrolls to 75%, briefly holds, then returns to 30% over about three seconds. Pause holds the current frame, Resume continues from it, and Replay starts a new run at 30%. Reading input takes over at any time. With reduced motion, Play and Replay set the reading position to 30% immediately.

Parse the [default preset](config.json) with `parseHistory` and render it using [HistoryPreview](../../src/HistoryPreview.tsx). Pass the host's playback and reduced-motion state. The preset uses the standard playback fields. `serializeHistoryMotion` exports the [implementation specification](../../src/conic-scroll-orb-spec.ts).
