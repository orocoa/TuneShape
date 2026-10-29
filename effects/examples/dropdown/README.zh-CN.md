# 下拉菜单 · Dropdown Menu

[English](README.md) · **简体中文**

下拉菜单 · 400 ms · Ariadne

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/dropdown) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/dropdown/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

点击菜单触发器展开或收起，选择菜单项后收起；悬停不自动播放。 详情页播放按钮同步演示两侧：普通动效从初态进入终态，再返回初态一次；加载类按循环配置持续播放。暂停保留当前画面，继续时从暂停进度接续。

## 起点与终点

面板的纵向位移：-7 → 0；面板的缩放：0.985 → 1；面板的不透明度：0 → 1；项目 1的纵向位移：-4 → 0；项目 1的不透明度：0 → 1；项目 2的纵向位移：-4 → 0；项目 2的不透明度：0 → 1；展开箭头的旋转角度：0 → 180；整体的横向位移：0 → 0；整体的纵向位移：0 → 0；整体的缩放：1 → 1。

## 时序

总时长 400 ms，统一触发延迟 0 ms，三次贝塞尔曲线 cubic-bezier(0.25, 0.1, 0.25, 1)。各轨道按配置中的 start / span 和 times 分阶段运行。

## 进入与退出

进入按关键帧正向运行，退出将关键帧、阶段顺序与时间点反转。完成后保留终态，不自动重复。

## 重复操作与打断

停止旧轨迹，保留当前画面作为新轨迹第一帧，转向最新目标；不排队。循环的新周期从本周期起点开始。

## 减少动态效果

遵循系统 prefers-reduced-motion，跳过延迟、循环和动画，直接呈现目标帧。观察倍速只修改 Motion 控制器 speed，不写入配置。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
