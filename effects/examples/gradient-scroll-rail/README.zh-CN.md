# 渐变滚动轨

[English](README.md) · **简体中文** · [全部示例](../../README.zh-CN.md)

在 `effects/` 目录运行 `pnpm dev --open /examples/gradient-scroll-rail/`。

浅灰色轨道常驻显示。在阅读区内滚动后，短条从浅灰向深灰填充，已点亮的短条也会随进度加深。右侧出现手形光标时，单击可平滑滚到对应位置，按住并上下移动可直接拖动，原地按住 240 毫秒可先展开弧形。选择**从上向下**或**从下向上**来设定填充与指针操作方向。

直接拖动以按下位置为起点，原地长按则以成立时的指针位置为起点。松手后弧形在原位收束。按 Tab 聚焦轨道，再用方向键、Page Up 和 Page Down 按阅读顺序移动，Home 和 End 分别跳到首尾。播放演示滚到 65% 再返回，暂停保持阅读位置，重播从顶部开始。减少动态效果模式下，单击和形变即时更新，播放直接跳到 65%。

[默认配置](config.json)通过 `gradientScrollRail.direction` 保存方向。用 `parseHistory` 解析后，连同播放状态和减少动态效果选项传入 [HistoryPreview](../../src/HistoryPreview.tsx)。`serializeHistoryMotion` 可导出[实现规格](../../src/gradient-scroll-rail-spec.ts)。
