# 漂浮转盘轮播 · Floating Ring Carousel

[English](README.md) · **简体中文**

图片沿连续转盘前后交错，拖动、惯性归位与下压倾斜各自独立。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/bencho-carousel) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/bencho-carousel/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/bencho-carousel/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 起点与终点

使用 5 张可替换的站内灰阶几何图片。初始值 50，背景 #f1f1f1、前景 #242424。

## 触发方式

转盘位置不取模，正弦决定横向位置，余弦共同决定远近缩放和绘制次序；源四次出场曲线接续拖动，倾斜压向指针而非抬起。

## 时序

响应基准 600 ms，源基准 600ms。观察倍速统一作用于动效与自动间隔，不写入 JSON；配置保留实际曲线与物理响应。

## 进入与退出

目录悬停、聚焦或手机 Preview 演示。移开且失焦、离屏和后台停止；再次进入可重播，编辑内容不改变目录默认配置。

## 重复操作与打断

手动操作取消等待重播；暂停冻结当前时钟，继续后接续。禁用时释放旧拖动和声音，销毁清理帧、计时器、监听与音频。

## 减少动态效果

减少动态时不自动演示或漂浮，选择、拖动、键盘和真实输入仍可用，结果直接呈现。

## 声音

交互声音开启，音量 35%。使用 Bencho MIT 合成音色；仅真实用户操作后启用音频，目录自动演示、导入和页面加载不发声。滑动声音限频，暂停、静音、后台和销毁停止音频。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
