# 渐变滚动轨

[English](README.md) · **简体中文** · [全部示例](../../README.zh-CN.md)

在 `effects/` 目录运行 `pnpm dev --open /examples/gradient-scroll-rail/`。

浅灰色轨道常驻显示。在阅读区内滚动后，短条从浅灰向深灰填充，已点亮的短条也会随进度加深。右侧出现手形光标时，单击可平滑滚到对应位置，按住并上下移动可直接拖动，原地按住 240 毫秒可先展开弧形。选择**从上向下**或**从下向上**来设定填充与指针操作方向。

直接拖动以按下位置为起点，原地长按则以成立时的指针位置为起点。松手后弧形在原位收束。按 Tab 聚焦轨道，再用方向键、Page Up 和 Page Down 按阅读顺序移动，Home 和 End 分别跳到首尾。开启「减少动态效果」时，单击和形变即时更新。

独立预览从实际阅读区的 30% 开始。播放在约三秒内滚到 75%，短暂停留后回到 30%。暂停保留当前画面，继续从原位置播放，重播从 30% 重新开始。滚动、点击或拖动可以随时接管演示。开启「减少动态效果」时，播放和重播会即时定位到 30%。

配置保存 `gradientScrollRail.direction`（默认从上向下）、`maxWidth`（36 像素）和 `sigma`（2.5 根短条）。 调参即时生效，可恢复默认值、导入 JSON，也可复制当前 JSON、Motion 规格或实现 Prompt。旧版 schemaVersion 2 配置省略的新字段使用默认值。

用 `parseHistory` 解析[默认配置](config.json)后，连同播放状态和减少动态效果选项传入 [HistoryPreview](../../src/HistoryPreview.tsx)。`serializeHistoryMotion` 可导出[实现规格](../../src/gradient-scroll-rail-spec.ts)。
