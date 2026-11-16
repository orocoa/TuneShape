# 竖向滚动刻度

[English](README.md) · **简体中文** · [全部示例](../../README.zh-CN.md)

在 `effects/` 目录运行 `pnpm dev --open /examples/vertical-scroll-gauge/`。

可以在阅读区内滚动，也可以单击刻度平滑定位，或按住刻度即时拖动。选择**从上向下**或**从下向上**可改变填充起点和指针映射。阅读区顶部始终为 0%，底部为 100%。填充与百分比的位置共用同一个弹簧，数字反映当前阅读进度。

按 Tab 聚焦刻度。方向键每次调整 2.5 个百分点，Page Up 和 Page Down 每次调整 10 个百分点。两个方向下，Home 和 End 都分别跳到阅读区首尾。手动操作可以打断平滑滚动。开启「减少动态效果」时，单击即时定位，刻度即时跟随滚动。

独立预览从实际阅读区的 30% 开始。播放在约三秒内滚到 75%，短暂停留后回到 30%。暂停保留当前画面，继续从原位置播放，重播从 30% 重新开始。滚动、点击或拖动可以随时接管演示。开启「减少动态效果」时，播放和重播会即时定位到 30%。

配置保存 `verticalScrollGauge.direction`（默认从上向下）和 `damping`（36）。 调参即时生效，可恢复默认值、导入 JSON，也可复制当前 JSON、Motion 规格或实现 Prompt。旧版 schemaVersion 2 配置省略的新字段使用默认值。

复用时先用 `parseHistory` 解析[默认配置](config.json)，再通过 [HistoryPreview](../../src/HistoryPreview.tsx) 传入配置、播放状态和减少动态效果选项。`serializeHistoryMotion` 可导出[实现规格](../../src/vertical-scroll-gauge-spec.ts)。
