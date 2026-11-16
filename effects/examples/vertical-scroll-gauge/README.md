# Vertical Scroll Gauge

**English** · [简体中文](README.zh-CN.md) · [All examples](../../README.md)

From the `effects/` directory, run `pnpm dev --open /examples/vertical-scroll-gauge/`.

Scroll inside the reading area or press and drag the gauge. Choose **Top to bottom** or **Bottom to top** to change where the fill starts and how the pointer maps to the track. Reading progress is always 0% at the top of the article and 100% at the bottom. The fill and label position share a spring. The number shows the current reading percentage.

Tab to the gauge to focus it. Arrow keys change reading progress by 2.5 percentage points and Page Up and Page Down by 10. Home and End jump to the reading boundaries in either direction. Play scrolls to 65% and back, Pause holds the demonstration, and Replay starts a fresh demonstration at the top. Manual input takes over from playback. While dragging or with reduced motion, the gauge follows the pane immediately. With reduced motion, Play jumps to the sample position.

The [default preset](config.json) stores the direction as `verticalScrollGauge.direction`. Parse the preset with `parseHistory` and render it with [HistoryPreview](../../src/HistoryPreview.tsx), passing the host's playback and reduced-motion state. `serializeHistoryMotion` exports the [implementation specification](../../src/vertical-scroll-gauge-spec.ts).
