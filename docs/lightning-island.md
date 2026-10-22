# Lightning Island / 闪电岛 UI

A community example by [OXOOOOX](https://github.com/OXOOOOX), adapted from their Lightning Island interface using [TuneShape](https://github.com/orocoa/TuneShape)'s source + validated configuration + implementation Prompt workflow.

Three compact cards demonstrate outline highlights, status signals and completion feedback. The layout uses simple SVG and CSS shapes, without image assets or a game scene. The event card, LIVE drawer and update dialog remain available in a composition that is collapsed by default.

## Run / 运行

**[Open the public demo / 打开在线演示](https://lightning-island-ui.liiiillliii.chatgpt.site/#lightning-island)** — hosted by the contributor, with no sign-in or installation required. The link opens the interaction cards directly; **Basic examples** switches to the original examples.

To run locally:

```sh
git clone https://github.com/OXOOOOX/TuneShape.git
cd TuneShape
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Vite, then choose **闪电岛 · Lightning Island**, or append `/#lightning-island`. The original button, tabs and dialog examples remain at `/#basic`.

## Try the interactions / 体验交互

1. Hover or Tab to the outline icon, or tap it to hold the highlight. Tap again to release the held state. Compare the three glow presets; the floating label follows the active state.
2. Switch between idle, processing and completed status. Processing and completed states have different loops; idle restores the static chip.
3. Play completion feedback: a small bounce, heart, sparkles and text bubble. Repeated activation restarts the feedback without stacking animations; the completion count remains visible.
4. Pause and resume an animation, then reset. System reduced-motion changes apply live.
5. Expand the composition example to complete a fictional daily event, inspect its new LIVE entry, collapse the event card, and open the update dialog. Escape closes the top open layer and restores focus where appropriate.

所有任务、动态和公告都是虚构演示数据。此示例不连接闪电岛服务，不加载居民资料、照片、地图、字体文件或其他美术资源；所有状态只保存在本页内存中。

## Source, configuration and Prompt / 源码、配置与提示词

| UI | Configuration | Prompt |
| --- | --- | --- |
| 轮廓高亮、状态提示、完成反馈 / Interaction effects | [interaction-effects.json](../configs/lightning-island/interaction-effects.json) | [interaction-effects.md](../prompts/lightning-island/interaction-effects.md) |
| 今日事件卡 / Event button | [event-button.json](../configs/lightning-island/event-button.json) | [event-button.md](../prompts/lightning-island/event-button.md) |
| LIVE 动态抽屉 / Activity drawer | [live-drawer.json](../configs/lightning-island/live-drawer.json) | [live-drawer.md](../prompts/lightning-island/live-drawer.md) |
| 更新弹窗 / Update dialog | [update-board.json](../configs/lightning-island/update-board.json) | [update-board.md](../prompts/lightning-island/update-board.md) |

The interaction cards live in [InteractionEffects.tsx](../src/lightning-island/InteractionEffects.tsx), with [scoped CSS](../src/lightning-island/interaction-effects.css), a [configuration validator](../src/lightning-island/interaction-effects.ts) and the native Web Animations hook [useEffectTrack.ts](../src/lightning-island/useEffectTrack.ts). The extension also supplies the LIVE dot loop.

**The `kind: "lightning-island-effects"` JSON is a separate extension format.** It describes filter and keyframe tracks for this source. The basic **Edit the exact configuration** editor does not support that format, including its filters and infinite loops. Download it from the interaction section and use it with the extension modules; no new dependency is required.

The composition lives in [IslandExamples.tsx](../src/lightning-island/IslandExamples.tsx), with [style.css](../src/lightning-island/style.css) and [configs.ts](../src/lightning-island/configs.ts). Its three original JSON files are complete basic **schemaVersion 1** motion documents and remain compatible with the basic editor. They use `usePose`, `statesFor` / `transitionFor` and the existing Motion playback clock. Applying one to a basic example reproduces its motion parameters, not the island layout.

The drawer uses `modal` motion transforms but is a disclosure region. The update dialog stays inside the preview, uses `aria-modal="false"`, and does not trap application focus. The `update-board` filename is retained for compatibility.

## Adaptation / 提取方式

Cream `#fff8e8`, ink `#172536`, coral `#ef5650`, yellow `#ffc928`, thick borders and hard shadows retain Lightning Island's visual vocabulary. A transparent SVG outline, a status chip and a completion card replace buildings, furniture and character artwork. Scene decoration, the wooden sign and flower illustration are omitted.

| Extracted effect | Source timing retained |
| --- | --- |
| Building / furniture / cafe outline glow | 120 / 160 / 140 ms; source highlight filters and easing |
| Cafe floating label, shared by all three presets | 100 ms opacity; 4 px translation with `steps(2, end)` |
| Processing / completed status and completion label | 900 / 700 / 700 ms stepped loops |
| Feeding feedback adapted to a completed UI action | 550 ms bounce; 2200 ms heart; 2100 ms sparkles after 350 ms; 2200 ms bubble |
| LIVE dot | 1100 ms stepped loop |

The extension retains the source durations, keyframe stops and easing for those effects. Neutral rest filters use zero-strength shadows for consistent interpolation on the simple icon and chip. The cafe label behavior is shared across presets. These are explicit adaptations, not a literal export of the original scene or each original component. The completion message and shapes are generic UI feedback; they do not perform feeding or game actions. The six sparkle positions and CSS heart retain the source visual primitives without loading artwork.

Web Animations applies easing on **each keyframe segment**, with the overall animation easing set to `linear`, matching the source CSS keyframe behavior. Outline and label changes retarget from their currently displayed values. Pause freezes the actual clocks and disables new demo inputs; resume continues them. Hidden pages pause the native tracks. Reduced motion cancels finite tracks to their final state, shows status loops as a static emphasis, and keeps LIVE steadily visible. Status text and completion counts still update; turning reduced motion off restores looping tracks without replaying completed finite feedback.

The composition keeps its documented TuneShape adaptations: one 180 ms tween for drawer transforms and opacity, and a 160 ms smooth dialog tween in place of the original stepped entrance. Game rules, rewards, accounts, storage and network calls are omitted.

Carry over the supporting modules and scoped stylesheets when reusing the components. In a Next.js App Router application, put the interactive entry behind a `'use client'` boundary. The original Lightning Island project is not included in this package.

## Verify and contribute / 验证与交流

```sh
pnpm test
pnpm build
```

Configuration tests compare the exact JSON in each Prompt with its runtime preset and validate the extension separately from the basic schema. In a browser, check hover plus focus, touch toggling, repeated completion feedback, status changes, pause/resume, live reduced motion, page visibility, reset and a mobile viewport. Also check Space/Enter, Escape, interrupted open/close transitions and focus restoration in the composition. A successful build alone does not establish browser behavior.

Focused feedback on interaction timing, the extension contract and accessibility is welcome. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) for upstream contributions. This is a community example, not the full TuneShape editor or an official integration endorsement.

The extracted UI code and accompanying documentation are contributed under this repository's [MIT license](../LICENSE). TuneShape's attribution is preserved. This contribution does not relicense or publish the rest of the Lightning Island project.
