# 渐进模糊阅读 · Progressive Blur

[English](README.md) · **简体中文**

文字滚经上下渐进模糊遮罩，阅读区中部保持清晰。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/skiper-41) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/skiper-41/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-41/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

在阅读区滚轮、拖动或用 PageDown 滚动，文字经过上下遮罩时逐渐模糊。模糊强度使用像素，区域高度控制遮罩范围；位置可选顶部、底部或上下，阅读内容、段数与行高独立保存。目录悬停、聚焦和手机 Preview 共用演示，标题进入编辑器。

## 参数与内容

阅读文字: [长内容见控件，1273 characters]；滚动提示: "Scroll down to see the effect"；段落数量: 10；阅读字号: 16；行高倍数: 1.5；模糊强度: 4；模糊区域高度: 150；模糊位置: "both"；背景色: "#f5f4f3"；文字颜色: "#939292"

## 起点与终点

初始画面使用以上保存内容。逻辑画布 540 × 600，整体缩放 1，位置偏移 (0, 0)。

## 时序

模糊为静态 CSS 遮罩，实际滚动决定文字露出；演示延迟 0 ms。通用时长字段不改变模糊效果。

## 进入与退出

文字滚经上下渐进模糊遮罩，阅读区中部保持清晰。 演示停止后保留组件的当前交互状态。

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
