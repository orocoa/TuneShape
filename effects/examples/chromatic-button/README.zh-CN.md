# 流彩按钮 · Chromatic Button

[English](README.md) · **简体中文**

带球面反射、整体换色与真实按钮交互的流彩材质。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/chromatic-button) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/chromatic-button/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/chromatic-button/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

详情自动播放；目录悬停、聚焦或 Preview 开始，离开且失焦、离屏和后台停止。按钮支持点击、Enter 和空格；消息输入仅作本地演示，不发送网络请求。

## 起点与终点

以种子 7、相位 0 生成可复现起点。流速 0.7，连续流动；流速为零保留当前画面。调整颜色和形状保留累计时间；修改相位或种子重设构图。

## 配色

模式 spectrum，起始颜色 #b126ff，第二颜色 #ff177c（当前未使用），第三颜色 #35d3ff（当前未使用）。固定模式保持色相，双色和三色改变整个材质的色调，完整色谱有空间色彩变化；反射继续移动。

## 材质

圆角比例 (borderRadius) 50%；边缘羽化 (feather) 100；实际投影角 (projectionScale) 174.7°；材质亮度 (intensity) 1.4；静态颗粒 (grain) 0.105。圆角按短边百分比计算，实际投影角直接保存为 174.7°，面部为 174°；圆角编辑会同步修改投影角，导入后不会再次隐式换算。

## 时序

入场 blur-up，基准 700 ms，倍速 1×；模糊上升时长 700ms，模糊 10px、上升 20px；缩放入场 600ms，从 65% 到 100%；延迟 0ms。无入场时相关参数不参与绘制。

## 进入与退出

悬停方式 brighten。提亮模式增加亮度并上浮 2px；流动模式推动反射构图；跟随模式用弹簧让按钮移动、伸展并跟随指针打光。焦点仍在按钮中时保留效果；失焦且移开后恢复。禁用时不响应。

## 重复操作与打断

工具栏暂停冻结材质、入场和弹簧时钟，恢复后从当前相位继续。重播恢复种子和相位指定的起点；修改入场参数自动重播。目录有限入场复用共享重播控制器，持续流动不被定时器打断。

## 减少动态效果

跳过入场和自动流动，显示静态材质。原生按钮、输入与键盘继续可操作，悬停提亮立即到位；关闭弹性移动与拉伸。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
