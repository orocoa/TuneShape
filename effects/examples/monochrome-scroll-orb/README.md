# Monochrome Scroll Orb

**English** · [简体中文](README.zh-CN.md) · [All examples](../../README.md)

From the `effects/` directory, run `pnpm dev --open /examples/monochrome-scroll-orb/`.

Scroll inside the reading pane with the wheel, touch, or keyboard. With more than 320 px of scroll travel, the orb fades in past 80 px and fades out at 40 px or less. One spring drives the clockwise arc and the integer in the center. Hover increases track contrast. Light and Dark switch the grayscale palette.

Click or tap the orb, or focus it and press Enter or Space, to scroll the pane back to the top. Manual input can interrupt the browser's smooth scroll. With reduced motion, progress, visibility and hover contrast update immediately, and the orb returns to the top instantly.

The standalone preview opens at 30% of the actual reading range. Play scrolls to 75%, briefly holds, then returns to 30% over about three seconds. Pause holds the current frame, Resume continues from it, and Replay starts a new run at 30%. Reading input takes over at any time. With reduced motion, Play and Replay set the reading position to 30% immediately.

The preset saves `monochromeScrollOrb.theme` (light), `stiffness` (210), and `damping` (25). The controls apply immediately. Use Restore defaults or Import JSON, or copy the current JSON, Motion specification, or implementation prompt. Older schemaVersion 2 presets use the defaults for omitted fields.

To embed the effect, parse the [default preset](config.json) with `parseHistory` and pass it to [HistoryPreview](../../src/HistoryPreview.tsx) with the host's playback and reduced-motion state. `serializeHistoryMotion` returns the [motion specification](../../src/monochrome-scroll-orb-spec.ts) as data.
