# 肥皂泡控件 · Soap Bubble UI

[English](README.md) · **简体中文**

带流动干涉色膜、玻璃折射和指针反射的原生交互控件。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/soap-bubble) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/soap-bubble/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/soap-bubble/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

目录悬停、聚焦或 Preview 开始流动；离开且失焦、离屏或后台时停止。原生按钮可按下，搜索框可输入，开关可切换，滑块可拖动或用方向键调整；菜单支持方向键、Enter 和 Escape。

## 起点与终点

薄膜在当前静态相位等待，激活后持续流动；按压时表面鼓起，松开恢复。

## 进入与退出

菜单从圆形触发器展开为面板，退出时回到触发器；快速操作保持当前进度。

## 内容与默认状态

控件缩放 1×，圆角 40px，背景 plain，可操作。预览 showcase，浅色背景，主按钮「Continue」，搜索提示「Search」，菜单「Select chats / Read all」，Volume 默认 40，开关默认开启。

## 运动

晃动强度 (wobble)：0.4；薄膜流速 (speed)：1；纹理种子 (seed)：7；点击散开效果 (pop)：droplets；冻结薄膜 (paused)：false。

## 透明与折射

重叠透视 (seeThrough)：0.3；重叠弯曲 (seeThroughBend)：0.3；折射强度 (refraction)：0.15；底色不透明度 (opacity)：0；油膜不透明度 (oilOpacity)：1。

## 薄膜材质

液态玻璃 (glass)：0.95；油膜色彩强度 (iridescence)：0.5；油膜纹路大小 (filmScale)：4.85；油膜覆盖率 (oilCoverage)：0.73；边缘油膜宽度 (oilEdge)：18；边缘油膜衰减 (oilEdgeFade)：2.33；中央清澈度 (clearCenter)：0.57；薄膜厚度 (thickness)：480；重力排水 (drainage)：0.35；涡流强度 (swirl)：0.5；反射亮度 (reflectivity)：1.3；色散强度 (dispersion)：1；玻璃边缘宽度 (bevel)：14。

## 薄膜配色

油膜调色方式 (soapPalette)：natural；材质底色 (tint)：auto；油膜滤色 (soapColor)：auto；薄膜暗部色 (soapShadeColor)：auto；薄膜高光色 (soapHighlightColor)：auto；底部阴影色 (bottomShadeColor)：#ffffff；红粉色带 (soapPaletteRed)：#ff6685；金黄色带 (soapPaletteGold)：#f6d365；绿色色带 (soapPaletteGreen)：#83e8a9；青色色带 (soapPaletteCyan)：#60dce9；蓝色色带 (soapPaletteBlue)：#7799ff；紫色色带 (soapPaletteViolet)：#c084fc。

## 环境反射

环境映像 (mirage)：0.7；映像范围 (reach)：2；指针视差 (tilt)：1；顶部高光长度 (topLength)：1；顶部高光渐隐 (topFade)：0.4；顶部高光末端 (topTail)：1；光照环境 (environment)：auto；内部倒影形状 (windowTwinShape)：mirror；显示内部倒影 (windowTwin)：false；显示主光反射 (keyLight)：true；显示底部阴影 (bottomShade)：false。

## 窗光与闪点

窗光大小 (windowSize)：0.75；窗光宽度 (windowWidth)：0.8；窗光起点厚度 (windowHead)：0.7；窗光末端厚度 (windowTail)：0.6；窗光亮度 (windowIntensity)：0.85；窗光渐隐 (windowGradient)：0.96；窗光长度 (windowLength)：1.3；窗光内边距 (windowMargin)：0.85；窗光弯曲 (windowBend)：0.75；闪点大小 (glintSize)：1.65；闪点亮度 (glintIntensity)：0；闪点沿线位置 (glintDistance)：-0.45；闪点内外位置 (glintHeight)：0.65；窗光形状 (windowStyle)：edge；闪点形状 (glintShape)：auto；显示窗光 (windowLight)：false。

## 渲染与背景

渲染像素比上限 (maxDpr)：2。

## 参数关系

油膜不透明度独立于底色不透明度；中央清澈度清除中部色膜，边缘油膜宽度只影响大控件；色散需要液态玻璃，窗光与闪点需要启用窗光，六色色带需要自定义调色。重叠透视和弯曲可打开菜单观察。

## 时序

菜单响应基准 500 ms；晃动 0.4，薄膜流速 1。薄膜持续流动。工具栏暂停冻结全部时钟，再次播放从当前相位继续。

## 重复操作与打断

连续操作转向最新状态，不排队。右侧参数与默认文字保存进 JSON；预览中的输入、开关值、菜单、滑块值、焦点和观察倍速属于临时状态。配置、中文说明、Motion 参数、离线 HTML 与工程导出读取同一份设置。

## 减少动态效果

薄膜保持静态，不自动晃动或播放点击散开；菜单立即到位，原生搜索、开关、滑块和键盘操作保留。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
