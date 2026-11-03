# 液态交互字标 · Gooey Wordmark

[English](README.md) · **简体中文**

模糊液团逐渐凝聚成字标；鼠标在局部融化、黏连笔画，并逐字切换颜色。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/gooey-wordmark) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/gooey-wordmark/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/gooey-wordmark/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

详情入场自动播放一次；点击或按 Enter / 空格重播。移动指针只影响附近笔画，移开平滑恢复；方向键逐字体验，Escape 收回。触屏可拖动或点按文字。

## 起点与终点

同一组字形从强模糊与透明度阈值生成的液团中逐渐显现，字母以 50ms 基准错峰轻微上移；没有独立彩带、压扁、旋转或回弹。字标形成后说明文字淡入；引线不覆盖加载阶段。

## 进入与退出

入场完成后保持清晰字标。移开指针只让局部透镜与形变平滑消退，不重新运行入场；点击或播放按钮才从头重播。

## 时序

完整入场 1600 ms；延迟 0 ms。目录悬停、聚焦或手机 Preview 重播，完成后短暂停留。

## 重复操作与打断

暂停冻结入场与局部恢复；继续接续当前时钟。目录离开且失焦、离屏或后台时停止。临时指针、换色与进度不写入配置。

## 内容与参数

文字 "tuneshape"；字号 210px；形变强度 1；交互范围 100px；网格 true；标注 true。1280 × 720 参考画布，等比适配。

## 配色与文案

字形颜色 #9864c7；背景 #f1f1f1；字重 600；辅文「Shape the way things move.」。网格、标签与辅文按实际背景明暗切换，默认与网站预览共用 #f1f1f1。

## 减少动态效果

直接显示完整可读字标、网格与标注，关闭液态入场、指针融化和目录循环。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
