# Vertical Scroll Gauge

**English** · [简体中文](README.zh-CN.md) · [All examples](../../README.md)

From the `effects/` directory, run `pnpm dev --open /examples/vertical-scroll-gauge/`.

Scroll inside the reading area, click the gauge to scroll smoothly to that position, or drag to follow the pointer immediately. Choose **Top to bottom** or **Bottom to top** to change where the fill starts and how the pointer maps to the track. Reading progress is always 0% at the top of the article and 100% at the bottom. The fill and label position share a spring. The number shows the current reading percentage.

Tab to the gauge to focus it. Arrow keys change reading progress by 2.5 percentage points and Page Up and Page Down by 10. Home and End jump to the reading boundaries in either direction. Manual input can interrupt a smooth scroll. With reduced motion, clicks scroll instantly and the gauge follows the pane immediately.

The standalone preview opens at 30% of the actual reading range. Play scrolls to 75%, briefly holds, then returns to 30% over about three seconds. Pause holds the current frame, Resume continues from it, and Replay starts a new run at 30%. Reading input takes over at any time. With reduced motion, Play and Replay set the reading position to 30% immediately.

The [default preset](config.json) stores the direction as `verticalScrollGauge.direction`. Parse the preset with `parseHistory` and render it with [HistoryPreview](../../src/HistoryPreview.tsx), passing the host's playback and reduced-motion state. `serializeHistoryMotion` exports the [implementation specification](../../src/vertical-scroll-gauge-spec.ts).
