# 局部字符扰动与恢复 · Local Text Scramble and Recovery

[English](README.md) · **简体中文**

局部字符扰动与恢复 · 200 ms · 个人网站

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/text-scramble) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/text-scramble/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

指针在文字区域内移到哪里，只扰动附近字符；停住或移开后各字符独立恢复，其他文字保持可读。卡片空白处不触发；Enter / 空格演示一次局部扰动。 播放按钮复位后，在调整前后相同位置演示一次局部扰动。

## 起点与终点

字符的字符归位进度：0 → 1；字符的纵向位移：0 → 0；整体的横向位移：0 → 0；整体的纵向位移：0 → 0；整体的缩放：1 → 1。

## 时序

总时长 200 ms，统一触发延迟 0 ms，三次贝塞尔曲线 cubic-bezier(0, 0, 1, 1)。各轨道按配置中的 start / span 和 times 分阶段运行。

## 进入与退出

仅指针附近字符出现扰动，文字不移动；停住或离开后，已触及字符按各自恢复进度归位。未触及字符始终可读；不会自动逐字揭示整行。

## 重复操作与打断

移动指针只刷新命中字符的恢复轨迹；已离开的字符独立恢复，不影响其他文字。指针位置、局部进度与字符序列为临时状态，不写入 JSON；播放按钮每次清空旧轨迹，演示相同位置。

## 减少动态效果

遵循系统 prefers-reduced-motion，跳过延迟、循环和动画，直接呈现目标帧。观察倍速只修改 Motion 控制器 speed，不写入配置。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
