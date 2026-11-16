# 单色滚动球

[English](README.md) · **简体中文** · [全部示例](../../README.zh-CN.md)

在 `effects/` 目录下运行 `pnpm dev --open /examples/monochrome-scroll-orb/`。

在阅读区内使用滚轮、触屏或键盘滚动。可滚动距离超过 320 像素时，滚过 80 像素淡入，回到 40 像素以内淡出。顺时针圆弧与中央整数共用同一个弹簧。悬停会增强底轨对比度，浅色和深色按钮可切换灰阶主题。

点按球体，或聚焦后按 Enter 或空格，即可回到阅读区顶部。手动操作可打断浏览器的平滑滚动。播放会滚到 65% 后返回，暂停会冻结演示和进度显示，重播从顶部开始。开启「减少动态效果」时，进度、显隐和悬停对比度即时更新，播放跳到示例位置，点按球体即时返回顶部。

[默认 JSON](config.json) 保存主题设置。在 TuneShape 内复用时，用 `parseHistory` 读取配置，再将结果连同宿主的播放状态与减少动态效果设置传给 [HistoryPreview](../../src/HistoryPreview.tsx)。`serializeHistoryMotion` 可导出[动效规格](../../src/monochrome-scroll-orb-spec.ts)数据。
