# 黏性搜索输入 · Gooey Input

[English](README.md) · **简体中文**

黏性搜索输入 · 可编辑内容与实时参数

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/gooey-input) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/gooey-input/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

点击搜索胶囊展开并聚焦输入；空值离焦时收合，已有文字时保留展开。点击分离的图标按钮或 Escape 清空收合，Enter 在组件内确认输入；不请求远程搜索。

## 起点与终点

占位文字 "Search..."，默认内容 ""。宽 115px → 200px，展开偏移 50px，高度 40px，黏性模糊 5px；底色 #929292、文字色 #ffffff。

## 时序

弹簧响应基准 400 ms，回弹 0.25；保留当前运动位置与速度后转向。滤镜只作用于背景表面，文字、焦点环和按钮保持清晰。

## 进入与退出

展开时胶囊拉长并移向一侧，分离的图标浮出；收合时返回初始位置并清空临时输入。

## 重复操作与打断

暂停、预览隐藏和页面进入后台时冻结当前时钟，继续从当前进度接续。更改内容和常用参数同步预览、说明、Motion、JSON 与导出。焦点、实际输入、当前选择、播放进度和观察倍速不写入配置。

## 减少动态效果

系统要求减少动态效果时直接呈现可读文字或目标状态，保留原生输入、菜单、焦点与键盘操作，不自动循环。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
