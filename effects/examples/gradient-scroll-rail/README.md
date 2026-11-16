# Gradient Scroll Rail

**English** · [简体中文](README.zh-CN.md) · [All examples](../../README.md)

Run `pnpm dev --open /examples/gradient-scroll-rail/` from the `effects/` directory.

The rail starts empty. Scroll inside the reading area to fill it from light to dark gray. Filled bars deepen as you read. Click the right-side rail to scroll smoothly to that position. Press and drag vertically to move through the article, or hold still for 240 ms to open the arc in place. Choose **Top to bottom** or **Bottom to top** to set the fill and pointer direction.

Dragging moves relative to the press position, or to the position where a stationary hold activated. Releasing settles the arc in place. Tab to the rail and use arrow keys or Page Up and Page Down to move in reading order. Home and End go to the reading boundaries. Play scrolls to 65% and back, Pause holds the reading position, and Replay starts at the top. With reduced motion, clicks and shape changes are immediate and Play jumps to 65%.

The [default preset](config.json) stores direction in `gradientScrollRail.direction`. Parse it with `parseHistory` and pass the result and the host's playback and reduced-motion state to [HistoryPreview](../../src/HistoryPreview.tsx). `serializeHistoryMotion` exports the [implementation specification](../../src/gradient-scroll-rail-spec.ts).
