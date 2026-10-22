# Lightning Island · 交互动效 / Interaction effects

Implement with React and TypeScript using [InteractionEffects.tsx](../../src/lightning-island/InteractionEffects.tsx), its [scoped stylesheet](../../src/lightning-island/interaction-effects.css), [useEffectTrack.ts](../../src/lightning-island/useEffectTrack.ts) and the [validated extension loader](../../src/lightning-island/interaction-effects.ts). See [the guide](../../docs/lightning-island.md) for source attribution, reuse boundaries and the optional composition.

## Scope and configuration

Render three compact cards titled 轮廓高亮, 状态提示 and 完成反馈, with one small preview area per card. Use a transparent inline SVG outline, a status chip and a simple completion card. Keep the cream, ink, coral and yellow palette; use one dark preview to show the glow. Stack the cards on narrow screens. No image assets, building illustrations, characters, scene decoration or service calls are needed.

This is the separate `kind: "lightning-island-effects"` extension, even though its own `schemaVersion` is 1. Its filter properties, keyframe tracks and infinite loops are **not supported by the basic TuneShape configuration editor**. Load and validate it with the extension module; export it through a read-only textarea and JSON download. Do not instruct users to paste it into the basic editor or replace the basic `config.json`.

## Interaction contract

- Default to the cafe highlight preset. A native icon button supports hover, keyboard focus-visible and a toggled selected state; any one keeps the highlight active. Focus or selection uses the preset's focus filter; hover alone uses its hover filter. A second activation clears selection. Touch input must not leave a synthetic hover latched on. Expose aria-label and aria-pressed, and keep a visible keyboard focus outline.
- Use the cafe floating-label behavior for all three presets: a 100 ms linear opacity transition and a separate 100 ms, 4 px translation with steps(2, end). Retarget both label tracks and the outline from their current computed values when interrupted. The label says 查看详情.
- Provide native 空闲, 处理中 and 已完成 buttons with aria-pressed. The status chip exposes data-phase=idle, baking or ready and a persistent role=status text. Idle cancels the previous loop and restores the baseline; processing uses oven.baking, completed uses oven.ready and the 完成 label uses oven.ding. Do not draw an oven.
- 播放完成反馈 updates a persistent aria-live count and restarts the bounce, heart, sparkles and bubble tracks together. Cancel each previous track before replacing it; do not stack or queue feedback. Use a plain check mark, a 12 px CSS heart and the six source radial-gradient sparkle points. The bubble says 完成啦. This demonstrates a completed UI action and performs no feeding or game action.
- Export LiveSignal for the composition's LIVE button. It uses the live loop during normal playback and stays steadily visible with opacity 1 under reduced motion.
- Keep the event card, LIVE drawer and update dialog in the separate composition, collapsed by default. Their three basic motion configurations remain unchanged and are documented in their own Prompts.

## Motion and playback contract

The JSON retains the original outline highlight filters, durations and easing; the processing/completed loops and feeding-feedback keyframe timings are extracted from Lightning Island CSS. The cafe label behavior is deliberately shared across presets. Neutral rest filters use zero-strength shadows to interpolate consistently on the simple shapes. This is an adaptation to reusable UI, not a literal export of the original scene or every original component.

Use native Web Animations for the extension tracks. Put the track easing on each keyframe segment and set the overall animation easing to linear, preserving CSS keyframe timing semantics. Pass infinite iterations as Infinity. Honor the sparkle delay and all keyframe offsets; do not replace the timelines with timers or unrelated CSS animations.

Pause freezes the active animation clocks and disables demonstration inputs. Changing paused alone must not recreate or restart a track. A blur caused by disabling an input must not discard its frozen highlight target. Resume continues the same animation; the external reset remounts the demonstration. Document hiding pauses the native tracks and returning resumes them only when the user has not paused.

Live reduced-motion changes cancel finite tracks to their final frame and show status loops at the middle emphasis frame. Completion status and counters remain visible even though the decorative finite tracks end at opacity 0. LIVE stays at opacity 1. Turning reduced motion off restores loops, but does not replay completed finite tracks. Unmount cancels all animations and removes visibility listeners. Stable track identity and scalar trigger dependencies prevent rerenders from restarting animations.

## Exact configuration

```json
{
  "schemaVersion": 1,
  "kind": "lightning-island-effects",
  "highlights": [
    {"id":"building","label":"建筑白光","durationMs":120,"easing":"ease","rest":"brightness(1) saturate(1) drop-shadow(0 0 0px rgba(255,255,255,0))","hover":"brightness(1.05) saturate(1.05) drop-shadow(0 0 10px rgba(255,255,255,0.45))","focus":"brightness(1.12) saturate(1.08) drop-shadow(0 0 13px rgba(255,255,255,0.65))"},
    {"id":"furniture","label":"家具青黄双光","durationMs":160,"easing":"ease","rest":"brightness(1) saturate(1) drop-shadow(0 0 0px rgba(109,224,255,0)) drop-shadow(0 0 0px rgba(255,201,40,0))","hover":"brightness(1.12) saturate(1.22) drop-shadow(0 0 8px rgba(109,224,255,0.65)) drop-shadow(0 0 6px rgba(255,201,40,0.42))","focus":"brightness(1.12) saturate(1.22) drop-shadow(0 0 8px rgba(109,224,255,0.65)) drop-shadow(0 0 6px rgba(255,201,40,0.42))"},
    { "id": "cafe", "label": "咖啡厅金青双光", "durationMs": 140, "easing": "linear", "rest": "brightness(1) saturate(1) drop-shadow(0 0 0px rgba(255,214,92,0)) drop-shadow(0 0 0px rgba(100,221,255,0))", "hover": "brightness(1.12) saturate(1.18) drop-shadow(0 0 7px rgba(255,214,92,0.82)) drop-shadow(0 0 4px rgba(100,221,255,0.62))", "focus": "brightness(1.12) saturate(1.18) drop-shadow(0 0 7px rgba(255,214,92,0.82)) drop-shadow(0 0 4px rgba(100,221,255,0.62))" }
  ],
  "label": { "durationMs": 100, "fromY": 4, "steps": 2 },
  "oven": {
    "baking": { "durationMs": 900, "easing": "steps(2, end)", "iterations": "infinite", "keyframes": [
      { "offset": 0, "filter": "brightness(1) saturate(1) drop-shadow(0 0 0px rgba(255,128,48,0))" },
      { "offset": 0.5, "filter": "brightness(1.18) saturate(1.12) drop-shadow(0 0 7px rgba(255,128,48,0.82))" },
      { "offset": 1, "filter": "brightness(1) saturate(1) drop-shadow(0 0 0px rgba(255,128,48,0))" }
    ] },
    "ready": { "durationMs": 700, "easing": "steps(2, end)", "iterations": "infinite", "keyframes": [
      { "offset": 0, "filter": "brightness(1) saturate(1) drop-shadow(0 0 0px rgba(255,222,95,0))", "transform": "translateY(0)" },
      { "offset": 0.5, "filter": "brightness(1.25) saturate(1.2) drop-shadow(0 0 8px rgba(255,222,95,0.92))", "transform": "translateY(-2px)" },
      { "offset": 1, "filter": "brightness(1) saturate(1) drop-shadow(0 0 0px rgba(255,222,95,0))", "transform": "translateY(0)" }
    ] },
    "ding": { "durationMs": 700, "easing": "steps(2, end)", "iterations": "infinite", "keyframes": [
      { "offset": 0, "transform": "translateY(0) rotate(0deg)" },
      { "offset": 0.5, "transform": "translateY(-3px) rotate(-2deg)" },
      { "offset": 1, "transform": "translateY(0) rotate(0deg)" }
    ] }
  },
  "feeding": {
    "bounce": { "durationMs": 550, "easing": "cubic-bezier(0.22, 0.61, 0.36, 1)", "keyframes": [
      { "offset": 0, "transform": "translateY(0)" },
      { "offset": 0.45, "transform": "translateY(-8px)" },
      { "offset": 1, "transform": "translateY(0)" }
    ] },
    "heart": { "durationMs": 2200, "easing": "cubic-bezier(0.16, 1, 0.3, 1)", "keyframes": [
      { "offset": 0, "opacity": 0, "transform": "rotate(45deg) scale(0.4) translate(-2px, 10px)" },
      { "offset": 0.14, "opacity": 1, "transform": "rotate(45deg) scale(1) translate(0, 0)" },
      { "offset": 0.78, "opacity": 1, "transform": "rotate(45deg) scale(1.05) translate(0, -12px)" },
      { "offset": 1, "opacity": 0, "transform": "rotate(45deg) scale(0.8) translate(4px, -24px)" }
    ] },
    "sparkles": { "durationMs": 2100, "delayMs": 350, "easing": "linear", "keyframes": [
      { "offset": 0, "opacity": 0 },
      { "offset": 0.18, "opacity": 0.3 },
      { "offset": 0.5, "opacity": 0.06 },
      { "offset": 0.7, "opacity": 0.06 },
      { "offset": 1, "opacity": 0 }
    ] },
    "bubble": { "durationMs": 2200, "easing": "linear", "keyframes": [
      { "offset": 0, "opacity": 0, "transform": "translate(-50%, 6px) scale(0.84)" },
      { "offset": 0.18, "opacity": 1, "transform": "translate(-50%, 0) scale(1)" },
      { "offset": 0.78, "opacity": 1, "transform": "translate(-50%, -2px) scale(1)" },
      { "offset": 1, "opacity": 0, "transform": "translate(-50%, -10px) scale(0.88)" }
    ] }
  },
  "live": { "durationMs": 1100, "easing": "steps(2, end)", "iterations": "infinite", "keyframes": [
    { "offset": 0, "opacity": 1 },
    { "offset": 0.5, "opacity": 0.25 },
    { "offset": 1, "opacity": 1 }
  ] }
}
```

## Verify

Run `pnpm test` and `pnpm build`. The configuration test compares the entire JSON above with the runtime extension. Also confirm that the basic editor rejects this separate format rather than silently accepting unsupported tracks.

In a browser, verify all three presets, hover and focus together, touch selection and deselection, status transitions back to idle, rapid repeated feedback, pause in mid-animation, resume without a jump, page visibility, live reduced-motion toggles, reset and a narrow viewport. Check that old tracks are canceled and no interaction depends on a loaded image. Keep the basic examples and their JSON editor working unchanged.
