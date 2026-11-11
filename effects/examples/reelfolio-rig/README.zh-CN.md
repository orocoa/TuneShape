# 机械臂拼接 · Rig Assembly

[English](README.md) · **简体中文**

两侧机械臂搬运图片分块，从上到下拼接成完整画面。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/reelfolio-rig) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/reelfolio-rig/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/reelfolio-rig/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 起点与终点

6 张可配置图片，从第 1 张开始；浅灰背景 #f1f1f1、前景 #242424。独立 Canvas 实现，默认不含外站媒体。

## 触发方式

点击、Enter、空格或左右键切换。目录悬停、聚焦或手机 Preview 演示一个完整序列。

## 时序

展示基准 3600 ms，随后停留 900 ms。时长、停留与观察倍速驱动同一帧时钟；倍速不进入 JSON。

## 进入与退出

图片切成左右交错分块，由两侧机械臂依次送入；拼接完成后机械臂退出。

## 重复操作与打断

新选择从当前图片建立下一次展示；暂停冻结累计时间，继续后接续。移开失焦、离屏与后台取消目录演示；销毁释放帧、观察器与监听。

## 减少动态效果

减少动态时不自动演示，直接呈现完整图片；手动选择、触屏与键盘保持可用。

## 参考与实现差异

保留参考主要构图与动作顺序，使用 Canvas 二维绘制机械臂。Rig 未使用原站三维模型；图片与浅灰配色按 TuneShape 统一。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
