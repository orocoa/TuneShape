# 倾斜挥手卡片 · Waving Tilt Card

[English](README.md) · **简体中文**

三色渐变个人卡片，随 15 个感应区域倾斜并挥手。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/waving-card) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/waving-card/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/waving-card/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 起点与终点

标题「Hi, I'm orocoa」，介绍「Passionate about creating, beautiful and functional websites」。宽 240px，内边距 24px，圆角 8px。保留名称大小写。

## 触发方式

指针进入卡片后显示挥手图标；5 列 × 3 行感应区域改变倾斜角。键盘聚焦显示图标，方向键移动区域，Enter / 空格演示，Escape 复位并失焦。手机点按或 Preview 演示。原生操作不跳转详情，标题链接进入编辑页。

## 时序

卡片过渡 300 ms ease-in-out；图标显隐与尺寸过渡 200 ms；挥手单程 350 ms linear，往返交替。

## 进入与退出

横排倾角为 [−20, −10, 0, 10, 20]°，纵排为 [15, 0, −15]°。挥手由 0° 至 25°；移开且失焦后回正并隐藏图标。

## 重复操作与打断

指针重新命中区域时从当前 CSS 过渡继续，不排队。工具栏暂停冻结倾斜、挥手与演示时钟，继续保留进度。目录自动演示依次经过四角和中心后回正；移开、离屏及后台停止。运行状态不写入配置。

## 减少动态效果

不自动演示、不挥手、不播放过渡。指针与方向键直接切换倾斜角，焦点或触屏显示静态手势。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
