# 多列视差画廊 · Oliver Parallax

[English](README.md) · **简体中文**

图片在可四向拖拽的无限画布中循环排列，也可切回原版多列滚动视差。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/skiper-30) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/skiper-30/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-30/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

默认无限画布支持四向拖拽、触控、滚轮和方向键平移，Home 复位；图片在视区边缘循环补齐。画布缩放、列数、间距、惯性和视差可调，也可切回原版纵向多列视差。目录悬停、聚焦和手机 Preview 共用演示，标题进入编辑器。

## 参数与内容

画廊模式: "canvas"；画布缩放: 1.25；图片宽高比: 1；平移灵敏度: 1；拖拽惯性: 0.7；列间错位: 0.35；图片（每行一个地址）: [长内容见控件，4056 characters]；图片说明（逐行对应）: "Shape 1\nShape 2\nShape 3\nShape 4\nShape 5\nShape 6\nShape 7\nShape 8\nShape 9"；图片裁切: "natural"；列数: 4；画廊高度倍数: 1.75；图片间距: 2；视差幅度: 1；图片圆角: 0；滚动跟随延迟: 0.15；初始滚动位置: 0；背景色: "#f1f1f1"

## 起点与终点

初始画面使用以上保存内容。逻辑画布 900 × 600，整体缩放 1，位置偏移 (0, 0)。

## 时序

响应基准 500 ms，演示延迟 0 ms。观察倍速仅用于预览。

## 进入与退出

图片在可四向拖拽的无限画布中循环排列，也可切回原版多列滚动视差。 演示停止后保留组件的当前交互状态。

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
