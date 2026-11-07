# 集成提及输入框 · Integration Mention Input

[English](README.md) · **简体中文**

识别 @yt、@google、@notion，展开集成卡片并随消息发送；保持本地演示。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/skiper-83) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/skiper-83/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/skiper-83/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

输入 @yt、@google 或 @notion 显示对应集成卡片，Enter 或箭头本地发送。三个卡片名称、输入提示、字号、圆角和光带颜色均可修改；手动发送使用可关闭的原站提示音，自动演示静音；提示音保持原速。这里展示交互，不调用外部集成。目录悬停、聚焦和手机 Preview 共用演示，标题进入编辑器。

## 参数与内容

输入提示: "Type shit.."；输入区宽度: 512；输入文字大小: 24；输入区圆角: 29；画布背景: "#f1f1f1"；输入区底色: "#f5f4f3"；文字颜色: "#121212"；发送按钮底色: "#ffffff"；@yt 卡片名称: "Youtube Analyzer"；@google 卡片名称: "Google Search"；@notion 卡片名称: "Notion"；光带粉色: "#fc2ba3"；光带橙色: "#fc6d35"；光带黄色: "#f9c83d"；光带末端颜色: "#c2d6e1"；手动发送时播放提示音: true；演示输入内容: "Find @yt about design"

## 起点与终点

初始画面使用以上保存内容。逻辑画布 768 × 580，整体缩放 1，位置偏移 (0, 0)。

## 时序

响应基准 500 ms，演示延迟 0 ms。观察倍速仅用于预览。

## 进入与退出

识别 @yt、@google、@notion，展开集成卡片并随消息发送；保持本地演示。 演示停止后保留组件的当前交互状态。

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
