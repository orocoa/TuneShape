# 像素滚动球

[English](README.md) · **简体中文** · [全部示例](../../README.zh-CN.md)

在 `effects/` 目录执行：

```sh
pnpm install --frozen-lockfile
pnpm dev --open /examples/pixel-scroll-orb/
```

在阅读区内使用滚轮、触屏或键盘滚动。可滚动距离超过 320 像素且阅读位置超过 72 像素时，像素球显示。24 段环形进度和中央数字随实际位置更新。悬停时七颗像素粒子陆续出现，每次的起点和大小都有轻微变化。

点按球体，或聚焦后按 Enter 或空格，即可返回阅读区顶部。经过显示阈值时，球体会淡入或淡出。如果开始淡出时球体仍有焦点，焦点会立即回到阅读区。开启「减少动态效果」时，显隐和返回顶部即时完成，粒子保持隐藏。

独立预览从实际阅读区的 30% 开始。播放在约三秒内滚到 75%，短暂停留后回到 30%。暂停保留当前画面，继续从原位置播放，重播从 30% 重新开始。滚动、点击或拖动可以随时接管演示。开启「减少动态效果」时，播放和重播会即时定位到 30%。

[默认配置](config.json)沿用项目的动效配置格式，返回顶部默认用时 400 毫秒。进度、焦点和悬停由实时输入决定。环形坐标、粒子时序和播放策略见[实现规格](../../src/pixel-scroll-orb-spec.ts)。

在 TuneShape 内复用时，用 [history-model.ts](../../src/history-model.ts) 的 `parseHistory` 读取示例 JSON，再通过 `config` 传给 [HistoryPreview](../../src/HistoryPreview.tsx)。单个预览可传入 `side="after"`、`speed={1}`、宿主的 `reduced` 设置和空闲命令 `command={{seq: 0, active: false}}`。预览会自行导入样式并绑定自己的阅读区。`serializeHistory` 导出配置 JSON，`serializeHistoryMotion` 导出动效规格数据。在编辑器外运行时，可使用此目录的 React 示例入口及其构建产物。

将环境变量 `TUNESHAPE_TEST_CHROME` 设为本机 Chrome 或 Chromium 可执行文件的路径后，`pnpm test` 会运行浏览器回归。
