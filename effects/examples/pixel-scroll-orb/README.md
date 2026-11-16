# Pixel Scroll Orb

**English** · [简体中文](README.zh-CN.md) · [All examples](../../README.md)

Run from the `effects/` directory.

```sh
pnpm install --frozen-lockfile
pnpm dev --open /examples/pixel-scroll-orb/
```

Scroll inside the reading panel with the wheel, touch, or the keyboard. The orb appears when the panel can scroll more than 320 px and the reading position passes 72 px. Its 24 segments and pixel digits follow the actual position. On hover, seven pixel particles appear in succession, varying slightly in size and starting position each time.

Click or tap the orb, or activate it with Enter or Space, to return the panel to the top. The orb fades in and out as it crosses the visibility threshold. If the orb has focus when it starts fading out, focus returns to the reading panel immediately. With reduced motion, visibility and the return to top are instant, and the particles stay hidden.

The standalone preview opens at 30% of the actual reading range. Play scrolls to 75%, briefly holds, then returns to 30% over about three seconds. Pause holds the current frame, Resume continues from it, and Replay starts a new run at 30%. Reading input takes over at any time. With reduced motion, Play and Replay set the reading position to 30% immediately.

[Configuration](config.json) uses the shared recipe format. The default return takes 400 ms. Progress, focus and hover come from live input. See the [implementation specification](../../src/pixel-scroll-orb-spec.ts) for the pixel geometry, particle timings and motion policies.

To embed the effect in TuneShape, parse the example JSON with `parseHistory` from [history-model.ts](../../src/history-model.ts) and pass the result as `config` to [HistoryPreview](../../src/HistoryPreview.tsx). For a single preview, use `side="after"`, `speed={1}`, the host's `reduced` preference, and `command={{seq: 0, active: false}}` to start idle. The preview imports its styles and binds to its own reading pane. `serializeHistory` exports the preset as JSON, and `serializeHistoryMotion` exports the motion specification as data. To run the effect outside the editor, use the React example entry and its build.

The browser regression runs through `pnpm test` when `TUNESHAPE_TEST_CHROME` points to a local Chrome or Chromium executable.
