# Conic Scroll Orb

**English** · [简体中文](README.zh-CN.md) · [All examples](../../README.md)

Run `pnpm dev --open /examples/conic-scroll-orb/` from the `effects/` directory.

Scroll inside the reading area. If the pane has more than 320 px of scroll travel, the orb appears after the first 72 px and fades out when you return within 72 px of the top. One spring drives both the grayscale ring and the percentage. Click or tap the orb, or focus it and press Enter or Space, to step back by 25% of the pane's full scroll travel. Each step starts at the current reading position. Wheel, touch, and keyboard scrolling can interrupt a step.

Play moves to 65% and then back to 40%. Pause holds the demo and its progress display. Replay restarts at the top. With reduced motion, Play jumps to 65%, the quarter step is instant, and progress and visibility update without animation.

Parse the [default preset](config.json) with `parseHistory` and render it using [HistoryPreview](../../src/HistoryPreview.tsx). Pass the host's playback and reduced-motion state. The preset uses the standard playback fields. `serializeHistoryMotion` exports the [implementation specification](../../src/conic-scroll-orb-spec.ts).
