# 手指敲击 · Finger Tapping

[English](README.md) · **简体中文**

手指敲击 · 1200 ms · Uiverse.io · Pradeepsaranbishnoi

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/finger-tap) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/finger-tap/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/finger-tap/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

列表中指针进入预览区域后播放，按配置的循环选项重复，离开即停止；详情中自动播放加载效果；播放期间按钮显示暂停，暂停后保留当前画面，再次播放从暂停处继续。 详情页自动按配置播放完整周期；暂停保持当前画面，继续从同一进度接续，不反向返回。

## 起点与终点

手指 1的旋转角度：10 → 10（含 4 个关键帧）；手指 1的缩放：0.4 → 0.4；手指 2的旋转角度：10 → 10（含 5 个关键帧）；手指 2的缩放：0.6 → 0.6；手指 3的旋转角度：10 → 10（含 5 个关键帧）；手指 3的缩放：0.8 → 0.8；手指 4的旋转角度：10 → 10（含 5 个关键帧）；手指 4的缩放：1 → 1；整体的横向位移：0 → 0；整体的纵向位移：0 → 0；整体的缩放：1 → 1。

## 时序

总时长 1200 ms，统一触发延迟 0 ms，三次贝塞尔曲线 cubic-bezier(0.42, 0, 0.58, 1)。各轨道按配置中的 start / span 和 times 分阶段运行。

## 进入与退出

四指在同一周期内错峰敲击，手掌和拇指保持不动。暂停保留当前角度，再次播放接续当前周期。按配置持续重复整个敲击周期。

## 重复操作与打断

暂停保持当前周期进度，继续接续；修改参数时按新配置从完整周期起点重播，不排队。

## 减少动态效果

遵循系统 prefers-reduced-motion，跳过延迟、循环和动画，直接呈现目标帧。观察倍速只修改 Motion 控制器 speed，不写入配置。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
