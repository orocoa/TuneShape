# 液态图片轮播 · Liquid Image Carousel

[English](README.md) · **简体中文**

固定卡片中的图片从左右按钮位置展开液态覆盖，边界起伏并带局部折射。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/liquid-carousel) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/liquid-carousel/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/liquid-carousel/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

点击左右箭头切换；方向键、Home / End 和横向滑动可操作。切换保持在当前页面。

## 起点与终点

白框卡片高度 202px、图片宽高比 0.756、圆角 14.2px、边框 4.5px。默认第 1 张；共 6 张图片。

## 时序

单次过渡 800 ms。从点击侧的按钮位置向外扩散，连续波纹随扩散边界移动，折射集中在边缘附近，扭曲强度 0.2、边缘起伏 0.1。

## 进入与退出

下一张从右侧按钮、上一张从左侧按钮开始扩散；新旧图片在边界附近同时产生局部折射，圆角白框和切换按钮保持固定。完全覆盖后停止绘制。

## 重复操作与打断

快速连续切换会保留当前混合画面，并接续到最新图片，不排队。目录悬停、聚焦和手机 Preview 共用演示；离开后完成当前切换再停止，后台和离屏立即停止。

## 参数与导出

图片、名称、顺序、默认图片、尺寸和液态参数均写入配置。预览当前页码与观察倍速不写入 JSON。Motion、提示词工程与离线 HTML 共用同一渲染器和内嵌图片。

## 减少动态效果

关闭自动演示和液态扭曲，图片立即切换，保留按钮、触摸和键盘。WebGL 不可用时降级为不规则径向遮罩。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
