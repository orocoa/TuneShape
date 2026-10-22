# TuneShape — UI Motion Examples

**English** · [简体中文](README.zh-CN.md)

[![Basic examples CI](https://github.com/orocoa/TuneShape/actions/workflows/ci.yml/badge.svg)](https://github.com/orocoa/TuneShape/actions/workflows/ci.yml) · [MIT License](LICENSE)

TuneShape by [orocoa](https://github.com/orocoa) provides three basic UI motion examples for React, TypeScript, and Motion, plus a standalone Canvas ASCII Shoal background. The basic examples cover button press feedback, tab transitions, and an in-page dialog, each with runnable source, a validated JSON configuration, and a matching implementation prompt.

**[Try the online UI motion editor](https://tuneshape.kai-nex.com/)** · [Run the 3 basic examples](#quick-start) · [ASCII Shoal](examples/ascii-shoal/)

[About TuneShape](https://tuneshape.kai-nex.com/en/about/) · [中文项目介绍](https://tuneshape.kai-nex.com/about/) · [Interactive examples](https://tuneshape.kai-nex.com/effects/) · [Usage guides (Chinese)](https://tuneshape.kai-nex.com/guides/)

[Releases](https://github.com/orocoa/TuneShape/releases) · [Report an issue](https://github.com/orocoa/TuneShape/issues) · [Contributing](CONTRIBUTING.md)

![Button press feedback (TuneShape basic example)](docs/preview-button-press.gif)

Captured from this repository's basic example: hold the button, then release to return to its resting state.

## Overview

TuneShape is a browser-based tool for exploring and adjusting UI motion. The online editor provides the full collection, interactive parameter controls, configuration import and export, and reusable motion specifications.

This repository publishes three self-contained basic examples and a standalone ASCII Shoal background. The basic examples use the same basic interaction renderer as the online editor, with system fonts and a minimal demo layout. ASCII Shoal is a dependency-free Canvas module with its own demo and tests. The complete website, editor panels, catalog, startup animation, and other effect implementations are maintained separately.

## Project name and links

The project name is **TuneShape**. If you searched for **TurnShape** while looking for this UI motion tool, use the website above and this `orocoa/TuneShape` repository to confirm the project. The repository publishes selected runnable examples; the full online editor is maintained separately.

## Examples

| Example | Interaction | Configuration | Prompt |
| --- | --- | --- | --- |
| Button press feedback | Press and release with a pointer, Space, or Enter | [button.json](configs/button.json) | [button.md](prompts/button.md) |
| Tab transitions | Switch panels with a pointer or arrow keys; Home and End are supported | [tabs.json](configs/tabs.json) | [tabs.md](prompts/tabs.md) |
| In-page dialog | Open, close, or dismiss with Escape; focus returns to the trigger | [modal.json](configs/modal.json) | [modal.md](prompts/modal.md) |

The dialog demonstrates an entrance and exit inside the preview area. It uses `aria-modal="false"` and does not trap focus across the application.

## ASCII Shoal background

[`examples/ascii-shoal/`](examples/ascii-shoal/) is a standalone JavaScript Canvas background with swimming silhouettes, small fish, configurable ASCII sampling density, glyph size, palette, and playback. It has no runtime dependencies and does not require the React examples to be installed.

The implementation uses newly authored shapes and motion paths, applying the grid-and-character approach used by TuneShape's ASCII wave effect. Its source and implementation notes are included in the example. See the [example README](examples/ascii-shoal/README.md) for local preview, embedding, configuration, and lifecycle controls.

```sh
cd examples/ascii-shoal
node --test test/*.test.mjs
npm run build
```

The build writes the standalone demo to `examples/ascii-shoal/dist/`. The root commands below continue to operate on the three React examples.

## Quick start

### Requirements

- Node.js **22.12 or later**. CI runs on Node.js 24.
- pnpm **11.x**. Use the exact version declared in [`package.json`](package.json) under `packageManager`.

### Install and run

```sh
git clone https://github.com/orocoa/TuneShape.git
cd TuneShape
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. If you downloaded a release ZIP, extract it and run the last two commands from the directory containing `package.json`.

Package installation requires access to the package registry. Once dependencies are installed, the examples run locally without an account, API key, database, or connection to the TuneShape website.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local development server |
| `pnpm test` | Run configuration, validation, and interaction-contract tests |
| `pnpm build` | Run TypeScript checks and create the static production build in `dist/` |
| `pnpm preview` | Preview an existing production build locally |

Build before running `pnpm preview`. Deploy the contents of `dist/` to a static web host.

## Configure an example

Select `button`, `tabs`, or `modal` in the demo to load its defaults. To apply an exact configuration:

1. Open **Edit the exact configuration**.
2. Paste a complete configuration from `configs/` or a schema version 1 export from the online editor.
3. Select **Apply configuration**.

The configuration includes the component type, so applying it selects the corresponding example. You can also edit [`config.json`](config.json) before starting or building to set the initial example. Selecting another example in the navigation loads that example's defaults.

Supported settings include tween and spring transitions, delay, easing, transform values, and physical spring parameters. Invalid or incompatible configurations are rejected with a validation message. The playback control supports pause and resume; the examples respond to live `prefers-reduced-motion` changes.

## Reproduce an example with its Prompt

Each file in [`prompts/`](prompts/) contains the interaction rules, exact JSON configuration, and Motion state and transition contract for the corresponding example in [`configs/`](configs/).

1. Choose the matching configuration and Prompt from the table above.
2. Use the Prompt together with this repository's implementation and supporting modules.
3. Apply the Prompt's **Exact configuration** to the demo or save it as `config.json`.
4. Run `pnpm test` and `pnpm build`.
5. Check pointer and keyboard input, repeated input, animation interruption, pause/resume, and reduced motion in the browser.

The included source and validated configuration define the reference behavior. AI-generated implementations should be checked against that contract; natural-language input alone does not guarantee identical generated code. The examples reproduce the basic interaction and parameters using the simplified styling in this package.

## Source guide

| Path | Responsibility |
| --- | --- |
| [`src/main.tsx`](src/main.tsx) | Demo navigation, JSON editor, and playback controls |
| [`src/Preview.tsx`](src/Preview.tsx) | Button, tabs, and dialog rendering and interaction |
| [`src/model.ts`](src/model.ts) | Configuration validation, state mapping, and Motion specifications |
| [`src/easing.ts`](src/easing.ts) | Easing validation and evaluation |
| [`src/useDetailPlayback.ts`](src/useDetailPlayback.ts) | Playback state and animation-clock control |
| [`src/usePrefersReducedMotion.ts`](src/usePrefersReducedMotion.ts) | Live system motion-preference handling |
| [`src/model.test.ts`](src/model.test.ts) | Configuration round trips, boundaries, and interaction contracts |
| [`src/style.css`](src/style.css) | System-font demo styling and responsive layout |
| `configs/` / `prompts/` | Matching configuration snapshots and implementation Prompts |

## Release integrity

GitHub release archives include `SOURCE_MANIFEST.json`, which records the exported files, byte lengths, and SHA-256 hashes. Its own hash is excluded to avoid a circular digest. Each release also provides `SHA256SUMS.txt` for its ZIP archive.

Download the ZIP and checksum file into the same directory, then verify the archive:

```sh
# macOS
shasum -a 256 -c SHA256SUMS.txt
```

```sh
# Linux
sha256sum -c SHA256SUMS.txt
```

The manifest describes the published snapshot. Local edits to a listed file will change its hash.

## Contributing

Bug reports and focused improvements to the public examples are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and verification steps. Issues and pull requests may be written in English or Chinese.

## License

The source and documentation in this repository are available under the [MIT License](LICENSE). ASCII Shoal has no runtime dependencies. React, React DOM, Motion, and development dependencies for the basic examples retain their upstream licenses.

The examples use system fonts and include no reference artwork, bundled fonts, private operational records, or deployment configuration. This repository's license applies to the files published here; website assets and other third-party materials retain their respective licenses.
