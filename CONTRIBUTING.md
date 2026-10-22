# Contributing to TuneShape

[Project documentation](README.md) · [中文项目文档](README.zh-CN.md) · [Website](https://kai-nex.com/tuneshape/)

Thank you for helping improve the public examples. Issues and pull requests may be written in English or Chinese.

## Scope

Contributions can improve the button, tabs, and in-page dialog examples, their configuration validation, accessibility, tests, documentation, and matching Prompts, or the standalone ASCII Shoal example in `examples/ascii-shoal/`. The complete online editor is maintained separately from this repository.

## Report a bug

Open an [issue](https://github.com/orocoa/TuneShape/issues) with:

- The example and steps needed to reproduce the problem.
- The expected and actual behavior.
- A minimal configuration JSON, when relevant.
- Browser, operating system, Node.js, and pnpm versions.
- A screenshot or recording when it helps explain the problem.

Use sample data and include only material you have permission to share.

## Submit a change

1. Fork the repository and create a branch for a focused change.
2. Install dependencies with `pnpm install --frozen-lockfile`.
3. Follow the existing React and TypeScript conventions.
4. Keep interaction rules, configuration snapshots, and Prompts consistent when behavior changes.
5. Run `pnpm test` and `pnpm build`.
6. For interaction or layout changes, check the affected pointer and keyboard paths, mobile layout, pause/resume, and reduced motion in a browser.
7. Open a pull request describing the problem, resulting behavior, and verification performed.

For ASCII Shoal-only changes, run `node --test test/*.test.mjs` and `npm run build` from `examples/ascii-shoal/`; no dependency installation is needed. Follow that example's dependency-free JavaScript conventions and verify density, playback, pointer behavior, offscreen/hidden suspension, and reduced motion.

The root build command includes TypeScript checks. Automated tests cover configuration and interaction contracts; browser checks are still needed for visual and input behavior. Documentation-only changes should be checked for accurate instructions and working links.

Maintainers refresh `SOURCE_MANIFEST.json` and archive checksums when publishing a snapshot. Avoid unrelated changes to the lockfile or generated build output.

## 中文说明

欢迎使用中文提交 Issue 或 Pull Request。贡献范围包括三个基础示例、配置校验、无障碍交互、测试、文档和配套 Prompt，以及 `examples/ascii-shoal/` 中的独立 ASCII 鱼群示例。

反馈问题时，请提供复现步骤、预期与实际结果、相关配置，以及浏览器和运行环境版本。使用示例数据，并确认有权公开所附素材。

提交改动前，请执行 `pnpm test` 和 `pnpm build`。修改交互或布局时，还需在浏览器中检查相关的指针、键盘、手机布局、暂停继续和减少动态效果。修改行为时，同步维护配置、说明与 Prompt；仅修改文档时，核对命令和链接即可。

只修改 ASCII 鱼群时，在 `examples/ascii-shoal/` 执行 `node --test test/*.test.mjs` 和 `npm run build`，无需安装依赖；并检查密度、播放、指针交互、离屏或隐藏暂停，以及减少动态效果。

发布快照的文件清单与压缩包校验信息由维护者更新。请在 Pull Request 中说明解决的问题、改动后的行为与实际完成的验证。

## License

Contributions are made under the repository's [MIT License](LICENSE).
