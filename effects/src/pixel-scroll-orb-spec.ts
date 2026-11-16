import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {
  orbDigits, orbMinimumTravel, orbParticleFade, orbParticles, orbRevealOffset, orbSegments, orbSize,
} from './pixel-scroll-orb';

export function pixelScrollOrbDescription(config: HistoryConfig, language: 'zh' | 'en' = 'zh'): Description {
  const en = language === 'en';
  return {
    title: en ? 'Pixel Scroll Orb' : '像素滚动球',
    summary: en ? 'A 56 px pixel orb tracks the reading panel and returns it to the top.'
      : '56 像素球体跟随阅读区滚动，点按返回顶部。',
    sections: [
      {label: en ? 'Activation' : '触发方式', text: en
        ? 'Scroll the panel with the wheel, touch or keyboard. The orb appears when travel exceeds 320 px and position exceeds 72 px. Click, Enter or Space returns the panel to the top.'
        : '用滚轮、触屏或键盘滚动阅读区。可滚动距离超过 320 像素且当前位置超过 72 像素时显示球体。点击、Enter 或空格返回顶部。'},
      {label: en ? 'Start and end' : '起点与终点', text: en
        ? 'Progress starts at 00 with an unlit ring. At the bottom it reads 100 and all 24 segments are lit.'
        : '顶部进度为 00，环形未点亮。到达底部时显示 100，24 段全部点亮。'},
      {label: en ? 'Timing' : '时序', text: en
        ? `Return to top takes ${config.durationMs} ms. Play scrolls to 65% and back.`
        : `返回顶部用时 ${config.durationMs} ms。播放会滚动到 65% 后返回。`},
      {label: en ? 'Entry and exit' : '进入与退出', text: en
        ? 'The orb immediately hides at or below the reveal threshold. Focus returns to the reading pane when a focused orb hides.'
        : '回到显示阈值或以下时立即隐藏。隐藏前若球体有焦点，焦点会回到阅读区。'},
      {label: en ? 'Repeat and interruption' : '重复操作与打断', text: en
        ? 'Direct input interrupts scripted scrolling. Hover staggers seven particles. Each cycle varies its start position and square size, then drifts outward as it fades. Leaving stops the particles.'
        : '直接操作可中断程序滚动。悬停时七颗粒子错峰出现，每轮微调起点和像素尺寸，向外轻漂并渐隐。移开后停止。'},
      {label: en ? 'Reduced motion' : '减少动态效果', text: en
        ? 'Progress follows manual scroll. Return to top is instant, and hover particles stay hidden.'
        : '进度仍跟随手动滚动，返回顶部即时完成，悬停粒子保持隐藏。'},
      {label: en ? 'Implementation' : '来源', text: 'src/PixelScrollOrbPreview.tsx'},
    ],
  };
}

export function pixelScrollOrbMotion(config: HistoryConfig) {
  return {
    component: 'Pixel Scroll Orb',
    terminology: {id: 'pixel-scroll-orb', englishTerm: 'Pixel Scroll Orb'},
    forward: [],
    reverse: [],
    policies: {
      repeat: 0,
      reduceMotion: 'Keep native progress. Jump to top instantly and suppress hover particles.',
      observationSpeed: 'Runtime only, applied to the Motion scroll and particle clocks.',
    },
    adapters: {
      pixelScrollOrb: {
        size: orbSize,
        inset: 20,
        segments: orbSegments,
        digits: orbDigits,
        particles: orbParticles,
        particleFade: orbParticleFade,
        minimumTravelExclusive: orbMinimumTravel,
        revealOffsetExclusive: orbRevealOffset,
        returnToTop: {durationMs: config.durationMs, easing: config.easing},
        demo: {fraction: .65, delayMs: config.delayMs},
        usage: 'Render a local scroll pane and overlay the button. Measure the pane on scroll and resize. Use rounded scroll percent for the digits and round(percent * 24 / 100) for the ring. Keep focus in the pane when its button hides. Animate scrollTop and hover particles with Motion. At each particle cycle start, sample a square size of 2, 3, or 4 px, with smaller squares more common. Offset the anchor center by 2–4 px along the tangent in either direction and 0–2 px outward. Keep that size and origin throughout the rise. Apply quadratic ease-out to the rise and 2–3 px of sideways drift. Manual scroll position, focus, and hover are transient.',
      },
    },
  };
}
