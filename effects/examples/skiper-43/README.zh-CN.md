# Vercel 图标提示栏 · Vercel Tooltip

[English](README.md) · **简体中文**

黑色胶囊图标栏，共享气泡跟随悬停项目并显示快捷键。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/skiper-43) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/skiper-43/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-43/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

悬停或聚焦图标，提示气泡随当前项目移动；左右方向键、Home/End 移动焦点。图标名称与快捷键逐行对应，通知点序号从 0 开始；气泡距离、胶囊间距和配色可调。目录悬停、聚焦和手机 Preview 共用演示，标题进入编辑器。

## 参数与内容

图标名称（每行一个）: "Comment\nInbox\nFeature Flags\nDraft Mode\nShare\nMenu"；快捷键（与名称逐行对应）: "C\n\n\n\n\n⌘ K"；通知标记序号（从0开始）: "1,5"；图标大小: 20；图标间距: 12；胶囊内边距: 14；胶囊圆角: 30；气泡距离: 8；胶囊颜色: "#000000"；图标与文字颜色: "#ffffff"；通知标记颜色: "#00a6f4"

## 起点与终点

初始画面使用以上保存内容。逻辑画布 380 × 260，整体缩放 1，位置偏移 (0, 0)。

## 时序

响应基准 500 ms，演示延迟 0 ms。观察倍速仅用于预览。

## 进入与退出

黑色胶囊图标栏，共享气泡跟随悬停项目并显示快捷键。 演示停止后保留组件的当前交互状态。

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
