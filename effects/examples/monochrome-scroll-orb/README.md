# Monochrome Scroll Orb

**English** · [简体中文](README.zh-CN.md) · [All examples](../../README.md)

From the `effects/` directory, run `pnpm dev --open /examples/monochrome-scroll-orb/`.

Scroll inside the reading pane with the wheel, touch, or keyboard. With more than 320 px of scroll travel, the orb fades in past 80 px and fades out at 40 px or less. One spring drives the clockwise arc and the integer in the center. Hover increases track contrast. Light and Dark switch the grayscale palette.

Click or tap the orb, or focus it and press Enter or Space, to scroll the pane back to the top. Manual input can interrupt the browser's smooth scroll. Play demonstrates a scroll to 65% and back. Pause freezes the demo and its progress display. Replay restarts from the top. With reduced motion, progress, visibility and hover contrast update immediately. Play jumps to the sample position and the orb returns to the top instantly.

The [default JSON](config.json) saves the theme. To embed the effect, parse the preset with `parseHistory` and pass it to [HistoryPreview](../../src/HistoryPreview.tsx) with the host's playback and reduced-motion state. `serializeHistoryMotion` returns the [motion specification](../../src/monochrome-scroll-orb-spec.ts) as data.
