# 尾波滑杆 · Wake Slider

[English](README.md) · **简体中文**

无滑块的细条数值轨道，快速滑过的条留下弹起尾波。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/bencho-wake-slider) · [动效说明与默认参数](https://tuneshape.kai-nex.com/effects/bencho-wake-slider/) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/bencho-wake-slider/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 起点与终点

36 根细条，初始值 50；拖动数值是当前预览的临时状态，不改写配置。

## 触发方式

按住并拖动调整数值，拖得越快尾波越高；松开后自然回落。悬停、聚焦和播放不自动改值；方向键、Home / End 只调整数值。

## 时序

响应基准 600 ms，源基准 600ms。观察倍速统一作用于动效与自动间隔，不写入 JSON；配置保留实际曲线与物理响应。

## 进入与退出

目录保持待机，只在主动拖动时产生尾波。离屏及后台暂停；再次进入不自动改值。编辑内容不影响目录默认配置。

## 重复操作与打断

手动操作取消等待重播；暂停冻结当前时钟，继续后接续。禁用时释放旧拖动和声音，销毁清理帧、计时器、监听与音频。

## 减少动态效果

减少动态时不自动演示或漂浮，选择、拖动、键盘和真实输入仍可用，结果直接呈现。

## 声音

交互声音开启，音量 35%。使用 Bencho MIT 合成音色；仅真实用户操作后启用音频，目录自动演示、导入和页面加载不发声。滑动声音限频，暂停、静音、后台和销毁停止音频。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
