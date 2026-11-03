# 流动等高线 · Topographic Flow

[English](README.md) · **简体中文**

持续演变的等高线地图，可叠加高程配色、测绘虚线和五种指针形变。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/topographic-flow) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/topographic-flow/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/topographic-flow/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

详情自动流动；目录悬停、聚焦或 Preview 开始，离开且失焦、离屏或后台停止。移动鼠标或触屏拖动塑造局部地形；方向键移动影响位置，Home 居中，Escape 清除，Enter / 空格重播。

## 起点与终点

按容器的 CSS 像素生成地形，尺度 480px，密度 5，种子 42。颜色和外观调整保留累计进度；重播恢复同一种子的起始地形。

## 地形

地形尺度 (scale)：480px；等高线密度 (density)：5；地形扭曲 (distortion)：2.4；地形种子 (seed)：42。

## 等高线

线条宽度 (lineWidth)：1px；线条不透明度 (opacity)：1；虚线长度 (dashLength)：7px；虚线间隔 (dashGap)：8px。

## 配色

渐变扩散 (gradientDiffusion)：0；颗粒强度 (grain)：0。

## 运动

流动速度 (speed)：1.5。

## 鼠标

鼠标影响强度 (hoverStrength)：0.6；鼠标影响半径 (hoverRadius)：200px；鼠标跟随时间 (hoverFollow)：0.16s；鼠标恢复时间 (hoverFade)：0.8s。

## 配色与线型

线型 solid，普通线 #000000，每第四层 #000000，高程渐变关闭，背景 #ffffff；渐变颜色保留在配置中但不参与绘制。

## 时序

入场淡入 800 ms，延迟 0 ms。流速 1.5，连续流动；工具栏暂停冻结当前画面，再次播放从当前相位继续。

## 进入与退出

鼠标效果开启，模式 rings，方向 push。进入和移动按 0.16s 跟随，移开按 0.8s 恢复；关闭鼠标效果立即清除局部形变。

## 参数关系

尺度改变山谷大小，密度改变高程间距，两者独立。混合模式只把每第四层绘成虚线；虚线长度和留白沿连接曲线测量。渐变替代纯色背景，扩散只柔化颜色；颗粒固定在屏幕，并作用于线条。关闭渐变或鼠标时保留其参数，相关控件明确隐藏。

## 重复操作与打断

设置、中文说明、Motion 数据、JSON、离线 HTML 和复刻工程共享同一份地形配置。鼠标位置、键盘位置、跟随进度、流动相位、观察倍速与暂停按钮状态属于临时运行状态，不写入配置。

## 减少动态效果

显示清晰静态地形，跳过入场与自动流动；指针与键盘交互立即到位，不自动回弹。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
