# 文字悬停图片 · Hover Preview

[English](README.md) · **简体中文**

文字悬停时浮出图片，随指针轻微偏移和倾斜。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/hover-preview) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/hover-preview/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/hover-preview/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

悬停 github、orocoa 或 star 显示对应图片；移动指针带动图片。Tab 聚焦显示，方向键切换词语，Escape 关闭；触屏点按显示，再次点按或点空白关闭。

## 起点与终点

图片从不透明度 0、缩放 0.94 进入到不透明度 1、缩放 1。首选位置 above；文字居中排布；旋转后的图片限制在画布边界内，并在文字侧边空间不足时等比缩小。

## 时序

进入 200 ms，退出 150 ms，固定三次贝塞尔缓出；指针跟随使用最多 160ms 的短过渡。观察倍速只改变运行时钟。

## 进入与退出

文字离开或失焦后，图片从当前画面淡出并缩回。点按固定的图片保留到再次操作；图片本身不接收指针，不会遮断文字悬停。

## 重复操作与打断

快速切换直接转向最新词语，不排队。工具栏演示 orocoa 的进入、停留 800ms 和退出；暂停保留实际动画与演示进度，继续时接续。悬停、点按、焦点与观察倍速不写入 JSON。

## 减少动态效果

直接显示或关闭图片，取消倾斜与动画；键盘、点按及图片内容保持可用。

## 图片预览设置

位置 above；大小 200px；比例 1；倾斜 12°；跟随 15px；圆角 12px；阴影 true；触发留白 4px。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

公开示例使用原创通用头像与图标替代个人头像和品牌图形。
