# Gradient Scroll Rail

**English** · [简体中文](README.zh-CN.md) · [All examples](../../README.md)

Run `pnpm dev --open /examples/gradient-scroll-rail/` from the `effects/` directory.

The light-gray rail stays visible at the top. Scroll inside the reading area to fill it from light to dark gray. Filled bars deepen as you read. Click the right-side rail to scroll smoothly to that position. Press and drag vertically to move through the article, or hold still for 240 ms to open the arc in place. Choose **Top to bottom** or **Bottom to top** to set the fill and pointer direction.

Dragging moves relative to the press position, or to the position where a stationary hold activated. Releasing settles the arc in place. Tab to the rail and use arrow keys or Page Up and Page Down to move in reading order. Home and End go to the reading boundaries. With reduced motion, clicks and shape changes are immediate.

The standalone preview opens at 30% of the actual reading range. Play scrolls to 75%, briefly holds, then returns to 30% over about three seconds. Pause holds the current frame, Resume continues from it, and Replay starts a new run at 30%. Reading input takes over at any time. With reduced motion, Play and Replay set the reading position to 30% immediately.

The preset saves `gradientScrollRail.direction` (top-to-bottom), `maxWidth` (36 px), and `sigma` (2.5 bar indices). The controls apply immediately. Use Restore defaults or Import JSON, or copy the current JSON, Motion specification, or implementation prompt. Older schemaVersion 2 presets use the defaults for omitted fields.

Parse the [default preset](config.json) with `parseHistory` and pass the result and the host's playback and reduced-motion state to [HistoryPreview](../../src/HistoryPreview.tsx). `serializeHistoryMotion` exports the [implementation specification](../../src/gradient-scroll-rail-spec.ts).
