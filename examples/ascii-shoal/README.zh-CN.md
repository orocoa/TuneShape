# ASCII Shoal · 字符鱼群

TuneShape 的独立 Canvas 背景示例。用自己编写的鱼身、鱼鳍、摆尾与游动路径生成连续形状，再像 ASCII 波形一样采样成字符网格。密度改变精细度，不改变鱼的数量和当前游动进度。

[English](README.md) · [实现与来源记录](IMPLEMENTATION.md) · [MIT 许可证](LICENSE)

## 本地运行

需要 Node.js 22 或更新版本，无需安装依赖：

```sh
cd examples/ascii-shoal
npm run dev
```

打开终端显示的地址，默认端口为 5188。端口被占用时，macOS/Linux 可使用 `PORT=5298 npm run dev`。演示包括稀疏／均衡／细密预设、字符尺寸、速度、鱼群数量、配色、暂停接续、重新播放与 PNG 保存。

```sh
npm test
npm run build
```

`dist/` 可直接放到静态托管服务；`dist/offline.html` 可双击离线运行。渲染器没有运行时依赖，不读取远程字体、贴图或脚本。

## 接入页面

复制 `src/ascii-shoal.js` 和 `LICENSE`，给宿主元素明确的宽高，调用 `createAsciiShoal(host, options, runtime)`。完整接入代码和参数表见 [英文说明](README.md#use-as-a-background)。装饰背景使用 `aria-hidden="true"`，把页面内容放在上层。

- `density`：0.5–2；稀疏 0.6、均衡 1、细密 1.6。
- `glyphScale`：独立控制字形大小，不改变采样间距。
- `sharkCount`、`sharkScale`、`fishDensity`：数量、大小和小鱼数量；小鱼密度为 0 时不显示小鱼。
- `speed`：0–3；0 保留静态画面。
- `backgroundColor`、`inkColor`、`opacity`、`gridOpacity`、`wakeOpacity`：颜色与绘制强度。
- `characters`、`seed`：自定义字符序列与可重复场景种子。

`update()` 接受局部设置；`play()` 接续，`pause()` 暂停，`restart()` 重播，`destroy()` 清理。运行时可传入 `enabled`、`paused`、`reduced`、`speed`、`durationMs`、`delayMs`、`loop`、`onRunning`。系统减少动态效果可通过 `matchMedia` 同步给 `reduced`；后台或离开可视区会停止请求动画帧。

采用解析形状与周期路径，没有捕食或群体寻路模拟。目标帧率为 30 fps，并限制采样格数量和画布像素面积；大屏下密度可能触及性能上限。

这份示例是独立实现，之前本地适配的第三方代码和参考视频均不包含在公开包中。来源记录见 [IMPLEMENTATION.md](IMPLEMENTATION.md)。现阶段发布在 GitHub 仓库，未发布到 npm。MIT，版权 2026 KAI-NEX and TuneShape contributors。
