# 液态玻璃 Logo · Liquid Glass Logo

[English](README.md) · **简体中文**

液滴聚合成折射玻璃图标，玻璃与波纹消退后保留正常大小的 Logo；默认使用统一的 #f1f1f1 灰色画布。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/liquid-glass-logo) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/liquid-glass-logo/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/liquid-glass-logo/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

详情自动显形；目录悬停、聚焦或 Preview 开始，离开且失焦、离屏或后台停止。点击、Enter 或空格重播；方向键以 0.1 基准秒定位，Home 起点，End / Escape 终态。

## 起点与终点

从短暂蓄势进入圆形液滴，再长成厚倒角的圆角玻璃；Logo 中央保持可读，边缘沿曲面拉伸、折射并产生色散；最后玻璃、倒角回声、焦散和波纹完全消失，Logo 保持 1 倍终态比例。黑底不自动把 Logo 放大。

## Logo

图标尺寸 (logoSize)：256px；Logo 比例 (logoScale)：0.72；终态 Logo 比例 (finalLogoScale)：1；Logo 浮雕 (logoRelief)：1。

## 玻璃

光学深度 (depth)：2.9；色散 (dispersion)：1；双层倒角 (relief)：1；焦散 (caustics)：1；高光 (highlights)：1；回声边缘染色 (echoTint)：0.5；内壁聚焦 (innerWallFocus)：0；光线扩散 (bloom)：0.55。

## 运动

液滴强度 (dropStrength)：1；波纹衰减 (decay)：1.4s；动画速度 (speed)：1×；循环停留 (loopDelay)：1.6s。

## 背景

背景水平偏移 (backgroundX)：0%；背景垂直偏移 (backgroundY)：0%；背景缩放 (backgroundScale)：1×；背景覆盖强度 (backgroundTintOpacity)：0。

## 性能

预览像素比上限 (maxDpr)：2。

## 配色与内容

Logo 颜色 #09111b，底板 #f1f1f1，背景底色 #f1f1f1。使用所选 Logo 颜色和浮雕；底板开启。上传 Logo 无；背景图片 无。

## 参数关系

光学深度决定随时间连续恢复的放大和弯折，色散分离边缘颜色，双层倒角增加内折射面；焦散控制肩部聚光，高光控制反射轮廓，扩散柔化亮边。回声染色在冷色微光与底板颜色之间插值，内壁聚焦从完整轮廓变成两角亮弧。背景图片按 cover 铺满，可偏移、缩放并覆盖染色；有背景图时底板通透。

## 时序

基准显形时长 1800 ms，显形延迟 0 ms；速度 1×，实际显形约 1.800s。基准时间轴约 0.12s 起形，0.27–0.49s 从圆滴过渡到图标，约 1.5s 玻璃消退，1.8s 完成整轮；静态取帧范围 0–2.4s，额外 0.6s 为终态停留；速度和观察倍速改变时间推进，不改寻址时刻的基准单位。单次显形后停止。

## 进入与退出

当前允许播放。颜色、图片和材质编辑会更新真实画面；视频模式的非暂停编辑重播显形，图片模式定位到 0.9s。图库有限演示使用共享重播控制器和阅读停顿，不改已保存的 loop。

## 重复操作与打断

暂停冻结序列，恢复保留当前进度；重播回到液滴起点。图片取帧、键盘寻址和工具栏观察状态不修改材质。配置、预览、描述、Motion、JSON、离线 HTML 与复刻工程共用同一份设置。上传图像在本地转成内嵌像素，原文件不变；SVG 转为栅格图，不依赖外部链接。

## 导出设置

类型 video，格式 MP4，比例 16:9，分辨率 1080p，对应 1920 × 1080px；目标 60 fps。图片取基准 0.9s，视频从头录制一轮及终态停留，约 2.400s。预览与导出共用 700px 宽参考场景，分辨率仅改变输出像素；JPEG 与视频将透明区域合成黑色。导出使用点击时的配置快照。

## 减少动态效果

直接显示终态 Logo，跳过自动显形和循环；原生定位和图片读取仍可用，手动定位立即显示对应的静态帧，重播回到终态，不自动反复播放。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
