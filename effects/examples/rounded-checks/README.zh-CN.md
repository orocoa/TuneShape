# 圆角复选框 · Rounded Checkboxes

[English](README.md) · **简体中文**

可独立勾选的偏好列表，方框填色与勾号柔和过渡。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/rounded-checks) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/rounded-checks/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/rounded-checks/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

点击方框或整行文字切换该项，Tab 聚焦后按空格勾选；各项独立，可多选。工具栏播放按钮演示首项切换后还原。

## 起点与终点

已勾选：Daily summary email；已勾选：Weekly performance digest；未勾选：Product release notes。方框 20px，边线 1.5px，圆角 8px，项间距 14px，文字间距 12px，字号 15px。

## 时序

填色、边线与勾号缩放 220 ms；勾号透明度 180 ms，延迟 0 ms。同一配置曲线 cubic-bezier(0.22,1,0.36,1)。

## 进入与退出

未选中背景 #ffffff、边线 #e3e8ee；选中填色 #929292、勾号 #ffffff，缩放 0.6 → 1、透明度 0 → 1。取消勾选反向过渡。文字色 #737373。支持触摸与键盘。

## 重复操作与打断

快速切换转向最新状态，不排队。暂停、隐藏页面和预览停用时冻结时钟，继续后接续。右侧默认勾选写入配置；预览内的实际勾选与焦点属于临时状态，观察倍速不写入 JSON。

## 减少动态效果

切换立即到位，保留多选、触摸、焦点环和禁用语义；播放按钮立即切换首项，不自动还原。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
