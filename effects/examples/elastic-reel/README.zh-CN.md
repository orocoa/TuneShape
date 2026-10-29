# 弹性相片卷 · Elastic Reel

[English](README.md) · **简体中文**

窄幅图像随指针联动放大，点击弹性展开为完整画面。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/elastic-reel) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/elastic-reel/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/elastic-reel/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

悬停或横向拖动联动放大；点击切片展开，再次点击收起；方向键、Home / End 切换，Escape 收起。打开后左右滑动切换相片，纵向滚动保留给页面。

## 起点与终点

逻辑画布 640 × 400，8 张原创抽象插画。切片宽 44px，高为画布的 0.5；间距 10px，圆角 12px。悬停放大 2.4 倍，联动范围 200px；展开高度比例 0.72，宽高比 1。空间不足时压缩侧边切片。

## 时序

弹簧响应基准 800 ms，弹性 0.35。自动播放 sweep；扫动 1.4 格/秒，轮播间隔 4 秒；持续循环。

## 进入与退出

切片围绕中心伸展。相片展开时邻项虚化 2.5px、淡化 45%；悬停邻项恢复清晰。详情自动播放，目录仅在悬停时运行；指针或键盘聚焦时暂停自动播放。

## 重复操作与打断

新目标从当前尺寸和速度接续，不重置弹簧。工具栏暂停并保留几何、扫动位置及轮播计时，继续后接续；关闭自动播放后仍可手动悬停和展开。观察倍速、当前相片、焦点和弹簧速度不写入配置。

## 减少动态效果

关闭自动播放与悬停放大，点击和键盘直接切换到展开或收起的静态终态。

## 版本

当前版本：调节放大或展开参数时，自动演示对应交互。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)
