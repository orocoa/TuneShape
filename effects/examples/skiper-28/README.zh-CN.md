# 透视滚动文字 · Perspective Text Scroll

[English](README.md) · **简体中文**

文字沿固定三维倾角向上推进，透视投影让近处字形向两侧展开。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/skiper-28) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/skiper-28/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-28/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

滚动改变文字纵向位置，保留固定 30° 三维倾角、200px 透视距离和 10px 纵深。可调整文字、字号、行高、字距、投影和行程；未使用原站歌词。目录悬停、聚焦和手机 Preview 共用演示，标题进入编辑器。

## 参数与内容

文字内容: "IDEAS TAKE SHAPE IN MOTION. A SMALL SHIFT CAN CHANGE THE WAY WE SEE. MAKE ROOM FOR EXPERIMENTS, FIND THE RHYTHM IN SIMPLE THINGS, AND LET EACH DETAIL CONNECT TO THE NEXT. EXPLORE WHAT MOVES YOU. CREATE SOMETHING THAT FEELS ALIVE."；文字字号: 60；行高: 1；文字字重: 700；字距: -3；三维倾角: 30；透视距离: 200；纵向行程: 487；纵深位置: 10；滚动长度倍数: 3；滚动跟随延迟: 0.15；初始滚动位置: 0；背景色: "#f1f1f1"；文字颜色: "#ff5800"

## 起点与终点

初始画面使用以上保存内容。逻辑画布 900 × 600，整体缩放 1，位置偏移 (0, 0)。

## 时序

响应基准 500 ms，演示延迟 0 ms。观察倍速仅用于预览。

## 进入与退出

文字沿固定三维倾角向上推进，透视投影让近处字形向两侧展开。 演示停止后保留组件的当前交互状态。

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
