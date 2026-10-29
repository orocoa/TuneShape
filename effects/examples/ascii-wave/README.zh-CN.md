# ASCII 波形动画 · ASCII Wave Animation

[English](README.md) · **简体中文**

ASCII 波形动画 · 4000 ms · Ariadne

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/ascii-wave) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/ascii-wave/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/ascii-wave/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

指针进入字符画区域时流动，移动指针产生局部扰动，离开停止并清除扰动；键盘聚焦可播放。 详情页自动流动；暂停冻结累计相位，继续接续当前进度，不演示反向返回。

## 起点与终点

字符画的波形相位：0 → 6.283185307；整体的横向位移：0 → 0；整体的纵向位移：0 → 0；整体的缩放：1 → 1。

## 时序

总时长 4000 ms，统一触发延迟 0 ms，三次贝塞尔曲线 cubic-bezier(0, 0, 1, 1)。各轨道按配置中的 start / span 和 times 分阶段运行。

## 进入与退出

进入字符画区域后按流场运行，离开冻结当前相位并清除指针扰动。区域内持续流动。

## 重复操作与打断

再次进入区域或点击播放按钮，从配置的初始相位重新开始；在区域内修改流场参数时保留当前相位，不排队。循环回绕通过累计相位保持连续。

## 减少动态效果

遵循系统 prefers-reduced-motion，跳过延迟、循环和动画，直接呈现目标帧。观察倍速只修改 Motion 控制器 speed，不写入配置。

## 字符画设置

字符 "cyslap"；字符不透明度系数 77%；字号 6.8 px；字符密度 110%；时钟倍率 2.8×；流场旋转角度 65°；扭曲 2；波形紧密度 0.4；颜色 #212121；指针扰动强度 1×，影响半径 100 px。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
