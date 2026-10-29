# 选择器 · Selector

[English](README.md) · **简体中文**

直列滚轮，中心清晰，远处渐隐虚化；拖动后带惯性吸附到最近选项。

[在线调整此动效](https://tuneshape.kai-nex.com/#/effect/coffee-selector) · [全部开源动效](../../README.zh-CN.md)

## 本地运行

从仓库根目录执行。各示例使用公开的共享渲染源码，完整网页编辑器不是运行依赖。

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/coffee-selector/
```

使用 `config.json` 调整配置；点击 Play / Pause / Replay 验证播放与打断。构建全部示例：`pnpm build`。

## 触发方式

点击展开。滚轮、上下拖动或方向键切换；点击选项或 Enter 确认并收起，Escape 撤回，Home / End 跳到首尾。点击外部确认当前项。

## 起点与终点

收起为单行，展开宽 280px，行高 48px，圆角 24px，字号 16px；所有选项保持同一条竖直基线。

## 时序

展开与吸附使用解析弹簧，关闭沿用相同响应时长平滑收拢；响应时长 460 ms，回弹 0.12。演示延迟 0 ms；滚轮停止 140ms 后吸附，拖动释放按速度预测终点。

## 进入与退出

中心选项保持锐利；第二行距离的模糊强度约 2.4px，可见度 22%。选项循环滚动，松手后自动吸附。

## 重复操作与打断

连续输入接续当前运动。目录演示在实际操作后让出控制，移开且失焦后平滑收起并停止；收起中再次移入会接续当前画面展开。离屏或后台时立即停止。预览内的选择不写入 JSON；右侧默认选项会保存。

## 减少动态效果

关闭自动演示与惯性动画，选择立即到位，保留点击、滚轮、触摸和键盘操作。

## 咖啡豆推荐

Geisha — 瑰夏：巴拿马 Geisha 以细致的花香、茉莉与桃子般香气著称，适合优先探索花香方向。
https://varieties.worldcoffeeresearch.org/varieties/geisha-panama

Bourbon — 波旁：经典阿拉比卡品种，高海拔条件下有很好的杯测品质潜力，适合与其他品种对照品尝。
https://varieties.worldcoffeeresearch.org/varieties/bourbon

SL28 — SL28：常见于肯尼亚等非洲产区，具有很高的杯测品质潜力，适合探索肯尼亚咖啡。
https://varieties.worldcoffeeresearch.org/varieties/sl28

Typica — 铁皮卡：重要的传统阿拉比卡品种，适合与波旁进行品种对照。
https://varieties.worldcoffeeresearch.org/varieties/typica

Pacamara — 帕卡马拉：由 Pacas 与 Maragogipe 杂交而来，豆粒大，主要种植于萨尔瓦多，具有很高的品质潜力。
https://varieties.worldcoffeeresearch.org/varieties/pacamara

以上为品种选择建议；实际风味取决于产地、处理、烘焙与具体批次。资料核对：2026-10-22。

## 源码、配置与许可

- [config.json](config.json)
- [共享渲染源码](../../src/HistoryPreview.tsx)
- [基础渲染源码](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [第三方与字体许可](../../THIRD_PARTY_NOTICES.txt)

[此动效来源与署名](SOURCE_NOTICE.txt)
