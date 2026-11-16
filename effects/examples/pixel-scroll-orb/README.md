# Pixel Scroll Orb

**English** · [简体中文](README.zh-CN.md) · [All examples](../../README.md)

Run from the `effects/` directory.

```sh
pnpm install --frozen-lockfile
pnpm dev --open /examples/pixel-scroll-orb/
```

Scroll inside the reading panel with the wheel, touch, or the keyboard. The orb appears when the panel can scroll more than 320 px and the reading position passes 72 px. Its 24 segments and pixel digits follow the actual position. On hover, seven pixel particles appear in succession, varying slightly in size and starting position each time.

Click or tap the orb, or activate it with Enter or Space, to return the panel to the top. Focus moves back to the reading panel if the focused orb hides. With reduced motion, the return is instant and the particles stay hidden.

The preview toolbar plays a single scroll to 65% and back. Pause freezes scripted motion. Wheel, touch and scrolling keys interrupt the demonstration and keep the reading position under your control. Under reduced motion, Play jumps to the sample position.

[Configuration](config.json) uses the shared recipe format. The default return takes 400 ms. Progress, focus and hover come from live input. See the [implementation specification](../../src/pixel-scroll-orb-spec.ts) for the pixel geometry, particle timings and motion policies.
