# 变形命令搜索 · Vercel Command Search

[English](README.md) · **简体中文**

紧凑搜索入口变形成分组命令面板，可搜索、方向键选择、Esc 收起。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/skiper-92) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/skiper-92/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-92/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

点击 Find… 或在组件聚焦时按 F 展开；输入筛选，方向键选择，Enter 本地确认，Escape 关闭。四组命令逐行编辑，面板宽度与列表高度独立调节。目录悬停、聚焦和手机 Preview 共用演示，标题进入编辑器。

## 参数与内容

搜索占位文字: "Find..."；打开快捷键: "F"；建议命令（每行一项）: "Calendar\nSearch Emoji\nCalculator\nDocuments\nImages\nMusic"；设置命令（每行一项）: "Profile\nBilling\nSettings\nNotifications\nMessages\nSecurity"；帮助命令（每行一项）: "FAQ\nContact Support"；文档命令（每行一项）: "Documentation\nTutorials"；展开面板宽度: 384；命令列表最大高度: 300；背景颜色: "#f5f4f3"；面板颜色: "#f5f4f3"；文字颜色: "#121212"

## 起点与终点

初始画面使用以上保存内容。逻辑画布 660 × 820，整体缩放 1，位置偏移 (0, 0)。

## 时序

响应基准 500 ms，演示延迟 0 ms。观察倍速仅用于预览。

## 进入与退出

紧凑搜索入口变形成分组命令面板，可搜索、方向键选择、Esc 收起。 演示停止后保留组件的当前交互状态。

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
