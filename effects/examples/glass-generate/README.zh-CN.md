# 玻璃生成按钮 · Glass Generate Button

[English](README.md) · **简体中文**

透明胶囊按钮，带移动描边、反光扫动与按压倾转。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/glass-generate) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/glass-generate/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/glass-generate/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 起点与终点

文案「Generate」，字号 16px，内边距 1.5em / 0.875em。背景 #f1f1f1，玻璃 #ffffff，文字 #323232。

## 触发方式

悬停或聚焦时移动反光，点击、Enter 或空格按压。目录悬停、聚焦或手机 Preview 演示一次悬停、按下与松开；直接操作优先。预览仅记录点击，不调用生成服务。

## 时序

响应 400 ms，曲线 cubic-bezier(.25,1,.5,1)；反光移动与角度使用 500 ms，轮廓角度使用 ease 曲线。

## 进入与退出

悬停缩放至 0.975，背景模糊从 2px 变为 0.01em，反光由 0% 移至 25%。按下时倾转 25°，反光移至 50% / 15%；松开恢复。触屏按原效果固定反光角度。

## 重复操作与打断

原生 CSS 过渡从当前画面接续。工具栏暂停冻结过渡与演示时钟，继续保留进度；后台、离屏与不活动预览停止。观察倍速不进入配置。

## 减少动态效果

跳过自动演示和过渡，悬停、按下与聚焦状态直接到位；原生按钮继续可用。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
