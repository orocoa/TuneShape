import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {
  defaultPixelScrollOrb, orbDigits, orbMinimumTravel, orbParticleFade, orbParticles, orbSegments, orbSize, orbVisibilityMs,
} from './pixel-scroll-orb';

export function pixelScrollOrbDescription(config: HistoryConfig, language: 'zh' | 'en' = 'zh'): Description {
  const en = language === 'en';
  const {revealOffset, particlesEnabled} = {...defaultPixelScrollOrb, ...config.pixelScrollOrb};
  const easing = JSON.stringify(config.easing);
  return {
    title: en ? 'Pixel Scroll Orb' : '像素滚动球',
    summary: en ? 'A 56 px pixel orb tracks the reading panel and returns it to the top.' : '56 像素球体跟随阅读区滚动，点按返回顶部。',
    sections: [
      {label: en ? 'Activation' : '触发方式', text: en
        ? 'Use wheel, touch or reading keys in the pane. Provide a focusable button with a progress label.'
        : '用滚轮、触屏或阅读键滚动。提供带进度标签的可聚焦按钮。'},
      {label: en ? 'Structure' : '起点与终点', text: en
        ? 'Render a 56 px SVG orb inset 20 px from the bottom and right. Center crisp pixel digits and light 24 short segments clockwise from 12 o’clock. Use rgba(248, 250, 252, .94) for digits and lit segments and rgba(226, 232, 240, .28) for the unlit segments. Show 00 at the top and 100 with all segments lit at the bottom.'
        : '绘制 56 像素 SVG，距底部和右侧各 20 像素。像素数字居中，24 段环从 12 点顺时针点亮。数字和点亮段使用 rgba(248, 250, 252, .94)，未点亮段使用 rgba(226, 232, 240, .28)。顶部显示 00，底部显示 100 且全环点亮。'},
      {label: en ? 'Timing' : '时序', text: en
        ? 'Progress follows real scroll immediately; set digits and lit segment count from the rounded percentage.'
        : '进度即时跟随滚动，用舍入百分比更新数字和点亮段数。'},
      {label: en ? 'Visibility' : '进入与退出', text: en
        ? `Show only when scroll travel exceeds ${orbMinimumTravel} px and scrollTop exceeds ${revealOffset} px. Fade in over ${orbVisibilityMs.enter} ms and out over ${orbVisibilityMs.exit} ms. Disable input and return focus to the reading pane as fade-out starts.`
        : `滚动距离超过 ${orbMinimumTravel} 像素且 scrollTop 超过 ${revealOffset} 像素时显示。淡入 ${orbVisibilityMs.enter} 毫秒、淡出 ${orbVisibilityMs.exit} 毫秒，淡出开始时禁用按钮并交还焦点。`},
      {label: en ? 'Input and interruption' : '重复操作与打断', text: en
        ? `Click, Enter or Space returns the pane to the top using Motion over ${config.durationMs} ms with easing ${easing}. Wheel, touch and scrolling keys can interrupt that motion.`
        : `点击、Enter 或空格用 Motion 在 ${config.durationMs} 毫秒内回到顶部，缓动为 ${easing}。滚轮、触屏和滚动键可打断。`},
      {label: en ? 'Particles and reduced motion' : '减少动态效果', text: en
        ? `Particles are currently ${particlesEnabled ? 'on' : 'off'}. When enabled, fine-pointer hover staggers seven 2–4 px pixels with varied origins, outward drift and fading. Stop them on leave or disable. Reduced motion hides particles and updates visibility and return to top instantly.`
        : `粒子当前${particlesEnabled ? '开启' : '关闭'}。启用时，精细指针悬停错峰显示七颗 2–4 像素粒子，起点有变化，向外轻漂并渐隐。移开或关闭时停止。减少动态效果时隐藏粒子，显隐和回顶即时完成。`},
      {label: en ? 'Implementation' : '来源', text: en
        ? 'src/PixelScrollOrbPreview.tsx'
        : 'src/PixelScrollOrbPreview.tsx'},
    ],
  };
}

export function pixelScrollOrbMotion(config: HistoryConfig) {
  const settings = {...defaultPixelScrollOrb, ...config.pixelScrollOrb};
  return {
    component: 'Pixel Scroll Orb',
    terminology: {id: 'pixel-scroll-orb', englishTerm: 'Pixel Scroll Orb'},
    forward: [],
    reverse: [],
    policies: {
      repeat: 0,
      reduceMotion: 'Keep native progress. Update visibility and return to the top instantly, and suppress hover particles.',
      observationSpeed: 'Runtime only, applied to the Motion scroll and particle clocks.',
    },
    adapters: {
      pixelScrollOrb: {
        settings,
        size: orbSize,
        inset: 20,
        segments: orbSegments,
        digits: orbDigits,
        particles: orbParticles,
        particleFade: orbParticleFade,
        minimumTravelExclusive: orbMinimumTravel,
        revealOffsetExclusive: settings.revealOffset,
        visibilityFadeMs: orbVisibilityMs,
        returnToTop: {durationMs: config.durationMs, easing: config.easing},
        demo: {fraction: .65, delayMs: config.delayMs},
        usage: 'Render a local scroll pane and overlay the button. Measure the pane on scroll and resize. Use rounded scroll percent for the digits and round(percent * 24 / 100) for the ring. Keep focus in the pane when its button hides. Animate scrollTop and enabled hover particles with Motion; stop active particle clocks when disabled. At each particle cycle start, sample a square size of 2, 3, or 4 px, with smaller squares more common. Offset the anchor center by 2–4 px along the tangent in either direction and 0–2 px outward. Keep that size and origin throughout the rise. Apply quadratic ease-out to the rise and 2–3 px of sideways drift. Manual scroll position, focus, and hover are transient.',
      },
    },
  };
}
