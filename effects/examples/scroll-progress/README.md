# Scroll Progress · 阅读进度胶囊

**English** · [简体中文](README.zh-CN.md)

Hover the current chapter pill to open navigation, then click a chapter to jump.

[Open this effect in the editor](https://tuneshape.kai-nex.com/#/effect/scroll-progress) · [All open-source effects](../../README.md)

## Run locally

Run from the repository root. Each example uses the public shared renderer; the website editor is not a runtime dependency.

```sh
cd effects
pnpm install --frozen-lockfile
pnpm dev --open /examples/scroll-progress/
```

Edit `config.json` to adjust the configuration. Use Play / Pause / Replay to check playback and interruption. Build all examples with `pnpm build`.

## Interaction

Scroll the reading panel to update the ring and chapter label. Hover the current chapter pill to open chapters without moving keyboard focus; leaving the pill and expanded menu closes it, while moving within the menu keeps it open. Click a chapter to scroll and close. Touch or keyboard activation still opens the pill and focuses the current chapter. Outside click or Escape closes it; arrows and Home / End move focus; Enter / Space select.

## States and motion

Initial preview progress 0%; initially open false. Article title “Attention Is All You Need”; 4 chapters, rendered in this order: 1. “Introduction” (id introduction), body “The 2017 paper introduced the Transformer, a model first tested on machine translation. It replaces recurrent and convolutional layers with attention, allowing more of the training computation to run in parallel.”; 2. “Self-Attention” (id self-attention), body “Each token creates a query, a key and a value. The query is compared with keys to assign attention weights. A weighted combination of values gives that token information from relevant parts of the sequence.”; 3. “Multi-Head Attention” (id multi-head-attention), body “Several attention heads work in parallel, learning different relationships between tokens. Their outputs are combined into one representation. Positional encodings add information about token order, which attention alone does not provide.”; 4. “The Transformer” (id transformer), body “An encoder builds representations of the input. A decoder uses those representations and earlier output tokens to predict the next token. A mask hides future output tokens during training. Both stacks also contain feed-forward layers. The paper demonstrated strong translation results with less sequential computation.”. Edit the article title, chapter labels and body text, and add, remove or reorder chapters. These contents are saved in the configuration.

## Motion notes 3

Expansion and navigation response basis 500 ms, using an analytical spring that preserves position and velocity. Ring response is capped at 450 ms, layer blending at 240 ms, and label crossfade at 220 ms. Chapter rows enter with a 6% response-time stagger.

## Motion notes 4

The collapsed pill measures the current chapter label and expands into a rounded menu. Labels and dots fade and move in sequence. Chapter anchor offset 120px; bottom inset 24px; type 14px; accent #222222; theme light. Long labels wrap and trigger remeasurement.

## Repeated input and interruption

Rapid navigation retargets the current pose. A clicked chapter remains pinned until the next wheel, touch or scroll-key input. Pause, background and inactive previews freeze motion and programmatic scrolling and resume in place. The toolbar demonstrates one open, jump and return. Live reading position, open state, focus and observation speed are not serialized.

## Reduced motion

Ring, expansion and chapter jumps settle instantly; timed demonstrations are disabled. Real scrolling, chapter selection and keyboard interaction remain available.

## Source, configuration, and license

- [config.json](config.json)
- [Shared renderer source](../../src/HistoryPreview.tsx)
- [Basic renderer source](../../src/Preview.tsx)
- [MIT](../../LICENSE) · [Third-party and font notices](../../THIRD_PARTY_NOTICES.txt)
