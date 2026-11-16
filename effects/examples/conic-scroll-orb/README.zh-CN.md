# 环形渐变滚动球

[English](README.md) · **简体中文** · [全部示例](../../README.zh-CN.md)

在 `effects/` 目录运行 `pnpm dev --open /examples/conic-scroll-orb/`。

在阅读区内滚动。可滚动距离超过 320 像素时，滚过 72 像素后球体淡入，回到距顶部 72 像素以内时淡出。灰阶圆环和百分比由同一个弹簧驱动。点击球体，或聚焦后按 Enter、空格，即可平滑返回阅读区顶部。滚轮、触屏和键盘滚动均可打断返回过程。

开启「减少动态效果」时，返回顶部、进度和显隐均即时更新。

独立预览从实际阅读区的 30% 开始。播放在约三秒内滚到 75%，短暂停留后回到 30%。暂停保留当前画面，继续从原位置播放，重播从 30% 重新开始。滚动、点击或拖动可以随时接管演示。开启「减少动态效果」时，播放和重播会即时定位到 30%。

使用 `parseHistory` 解析[默认配置](config.json)，通过 [HistoryPreview](../../src/HistoryPreview.tsx) 传入配置、播放状态和减少动态效果选项。默认配置使用通用的播放字段。`serializeHistoryMotion` 可导出[实现规格](../../src/conic-scroll-orb-spec.ts)。
