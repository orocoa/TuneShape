import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {
  conicOrbDemo, conicOrbGeometry, conicOrbSpringFor, conicOrbVisibility, defaultConicScrollOrb,
} from './conic-scroll-orb';

export function conicOrbDescription(language: 'zh' | 'en' = 'zh', config?: HistoryConfig): Description {
  const en = language === 'en';
  const {size, startAngle, coreInset} = conicOrbGeometry;
  const revealOffset = config?.conicScrollOrb?.revealOffset ?? defaultConicScrollOrb.revealOffset;
  const {stiffness, damping, mass} = conicOrbSpringFor(config?.conicScrollOrb);
  return {
    title: en ? 'Conic Scroll Orb' : '环形渐变滚动球',
    summary: en ? 'A grayscale scroll indicator that returns the reading pane to the top.' : '显示滚动进度并支持回顶的灰阶进度球。',
    sections: [
      {label: en ? 'Activation' : '触发方式', text: en
        ? 'Make the orb a focusable button for click, Enter and Space. Report reading progress in the accessible label.'
        : '球体使用可聚焦按钮，支持点击、Enter 和空格，并在无障碍标签中报告进度。'},
      {label: en ? 'Structure' : '起点与终点', text: en
        ? `Use a ${size} px orb with a conic gradient from ${startAngle}° (#C8C8C8 progress, #454545 track), a ${coreInset} px inset core shaded from #252525 to #303030, #E0E0E0 digits and a soft shadow. Drive the ring and integer percentage from the same clamped 0–100 value.`
        : `球体直径 ${size} 像素，外环从 ${startAngle}° 顺时针填充（进度 #C8C8C8、底轨 #454545），灰阶内圆内缩 ${coreInset} 像素，内圆从 #252525 到 #303030，文字 #E0E0E0，并加柔和阴影。圆环和整数百分比共用同一个 0–100 显示值。`},
      {label: en ? 'Timing' : '时序', text: en
        ? 'Retarget the spring from its current displayed value on scroll and after a damping change.'
        : '滚动和修改阻尼时，从当前显示值重新追踪目标。'},
      {label: en ? 'Visibility and spring' : '进入与退出', text: en
        ? `Show when travel exceeds 320 px and scrollTop exceeds ${revealOffset} px. Fade over 180 ms to opacity 0.78 at rest and 0.93 on hover. Follow real progress with stiffness ${stiffness}, damping ${damping}, mass ${mass}. Restore focus to the pane when hiding.`
        : `滚动距离超过 320 像素且 scrollTop 超过 ${revealOffset} 像素时显示。透明度过渡为 180 毫秒，常态 0.78、悬停 0.93。用刚度 ${stiffness}、阻尼 ${damping}、质量 ${mass} 的弹簧跟随实际进度。隐藏时交还焦点。`},
      {label: en ? 'Repeat and interruption' : '重复操作与打断', text: en
        ? 'Use a new scroll target when manual input takes over and cancel the previous smooth return.'
        : '手动输入接管时取消先前的平滑回顶，跟随新的滚动目标。'},
      {label: en ? 'Input and reduced motion' : '减少动态效果', text: en
        ? 'Click, Enter or Space returns the pane to the top via native smooth scroll; manual scrolling interrupts. Reduced motion updates progress, visibility and return to top instantly.'
        : '点击、Enter 或空格用原生平滑滚动回顶，手动滚动可打断。减少动态效果时进度、显隐和回顶即时更新。'},
      {label: en ? 'Implementation' : '来源', text: en
        ? 'src/ConicScrollOrbPreview.tsx'
        : 'src/ConicScrollOrbPreview.tsx'},
    ],
  };
}

export function conicOrbMotion(config: HistoryConfig) {
  const settings = {...defaultConicScrollOrb, ...config.conicScrollOrb};
  return {
    component: 'Conic Scroll Orb',
    terminology: {id: 'conic-scroll-orb', englishTerm: 'Conic Scroll Orb'},
    forward: [], reverse: [],
    policies: {repeat: 0, reduceMotion: 'Update progress and opacity immediately and return to top instantly. Play jumps to the sample position.'},
    adapters: {
      conicScrollOrb: {
        settings,
        geometry: conicOrbGeometry,
        spring: conicOrbSpringFor(config.conicScrollOrb),
        visibility: {...conicOrbVisibility, revealOffset: settings.revealOffset},
        returnToTop: 'native smooth scroll on the bound pane',
        demo: {fraction: conicOrbDemo.fraction, legMs: config.durationMs, delayMs: config.delayMs},
        usage: 'Measure only the bound pane. Divide its scrollTop by scrollHeight minus clientHeight, or use zero when there is no travel. Retarget one spring from actual scroll on each update and clamp its display to 0–100. Use that percentage for the conic stop and round it for the label. On button activation, use native smooth scrolling to bring the pane to scrollTop 0. Allow manual input to interrupt the return. Use an instant scroll and skip the spring and transitions with reduced motion.',
      },
    },
  };
}
