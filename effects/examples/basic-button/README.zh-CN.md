# 按钮按压反馈 · Button Press Feedback

[English](README.md) · **简体中文**

按钮按压反馈，使用时长型弹簧；420 ms / 回弹 0.25。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/basic-button) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/basic-button/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

指针、空格键或 Enter 键按下时进入按压态；松开或取消按压时返回静止态。键盘焦点离开时也恢复静止态。 详情页播放按钮演示一次初态到终态再返回初态；暂停保持当前画面，再次播放继续。

## 起点与终点

静止态：横向 0 px、纵向 0 px、缩放 1 倍（100%）、不透明度 100%。按压态：横向 0 px、纵向 2 px、缩放 0.92 倍（92%）、不透明度 100%。

## 时序与专业术语

每次转向目标前延迟 0 ms；使用时长型弹簧（spring），时长参数 duration = 420 ms、回弹 bounce = 0.25。时长用于控制弹簧节奏，不承诺精确落稳时刻；回弹越大，越容易越过目标后返回。

## 进入与退出

按下从静止态转向按压态，释放从当前值返回静止态；两个方向使用相同的动画参数。

## 重复操作与打断

重复操作时采用重定向（retarget）：从当前显示值转向最新目标，不排队、不自动重复。每条新弹簧轨迹的初速度 velocity 固定为 0，不继承上一条轨迹的速度。

## 减少动态效果

遵循系统 prefers-reduced-motion 时，跳过延迟和动画，立即到达目标终态；不执行位移、缩放或淡变过程。观察倍速只改变观察方式，不修改配置和导出参数。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
