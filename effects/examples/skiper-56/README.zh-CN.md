# 粒子消散输入 · Devouring Details Sign In

[English](README.md) · **简体中文**

极简下划线输入框，提交时文字从右向左化为粒子消散。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/skiper-56) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/skiper-56/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-56/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

输入文字后按 Enter 或点击箭头，文字化为粒子消散并清空。占位文字与默认输入分开保存；字号、输入宽度、粒子大小和散开幅度改变实际画面，响应基准改变消散节奏。目录悬停、聚焦和手机 Preview 共用演示，标题进入编辑器。

## 参数与内容

输入占位文字: "orocoa@kai-nex.com"；默认输入内容: ""；提交按钮文字: "→"；输入字号: 52；输入框宽度: 550；粒子大小: 1；消散幅度: 26；背景色: "#f5f4f3"；输入颜色: "#000000"；占位颜色: "#808080"

## 起点与终点

初始画面使用以上保存内容。逻辑画布 620 × 300，整体缩放 1，位置偏移 (0, 0)。

## 时序

响应基准 500 ms，演示延迟 0 ms。观察倍速仅用于预览。

## 进入与退出

极简下划线输入框，提交时文字从右向左化为粒子消散。 演示停止后保留组件的当前交互状态。

## 重复操作与打断

离开目录且失焦、滚出可视区和切换后台会停止演示。实际输入、当前选择与播放进度不覆盖保存的默认值。

## 参数与导出

控件、预览、JSON、Motion 适配器、复刻工程和 HTML 导出共用同一设置对象与渲染器。目录卡片始终显示项目默认预设。

## 减少动态效果

不自动演示，过渡直接呈现目标状态；保留真实输入、按钮、选择和键盘操作。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
