import type {HistoryConfig} from './history-model';
import type {Description} from './model';
import {
  defaultGradientRail, gradientRailDemo, gradientRailGeometry, gradientRailPalette,
  gradientRailPress, gradientRailSpring,
} from './gradient-scroll-rail';

export function gradientRailDescription(config: HistoryConfig, language: 'zh' | 'en' = 'zh'): Description {
  const en = language === 'en';
  const {direction, maxWidth, sigma} = {...defaultGradientRail, ...config.gradientScrollRail};
  const {count, barHeight, gap, restWidth, height} = gradientRailGeometry;
  const {stiffness, damping, mass} = gradientRailSpring;
  const {delayMs, tolerance} = gradientRailPress;
  return {
    title: en ? 'Gradient Scroll Rail' : '渐变滚动轨',
    summary: en ? 'A grayscale reading rail that arches on press and hold.' : '长按展开弧形、拖动定位的灰阶阅读轨。',
    sections: [
      {label: en ? 'Activation' : '触发方式', text: en
        ? 'Bind the rail to one pane. Keep its clickable zone wider than the resting bars.'
        : '将轨道绑定到单一阅读区，点击区域宽于静止短条。'},
      {label: en ? 'Structure' : '起点与终点', text: en
        ? `Render ${count} right-aligned gray bars (${barHeight} px tall with ${gap} px gaps) at ${restWidth} px resting width. Keep the unfilled bars light at 0%, progressively darken filled bars. Fill in the ${direction} direction. Hover leaves the bars at rest.`
        : `绘制 ${count} 根右对齐灰阶短条，每根高 ${barHeight} 像素、间距 ${gap} 像素、静止宽 ${restWidth} 像素。0% 时显示浅灰未填充条，已填充短条随进度加深。当前方向为 ${direction}。悬停时维持原状。`},
      {label: en ? 'Timing' : '时序', text: en
        ? 'Animate shape with the two springs while reading position responds immediately to a drag.'
        : '形变使用两个弹簧，拖动时阅读位置即时响应。'},
      {label: en ? 'Hold and drag' : '进入与退出', text: en
        ? `Grow bars leftward with a continuous Gaussian. Width equals restWidth + (maxWidth − restWidth) × strength × exp(−(index − center)² / (2 × sigma²)). Use maxWidth ${maxWidth} px and sigma ${sigma} in bar units. Share one center and one strength spring (stiffness ${stiffness}, damping ${damping}, mass ${mass}). Hold still for ${delayMs} ms to open in place or move vertically past ${tolerance} px to start dragging from the press position. Drag by relative Y over ${height} px and reverse the sign for bottom-to-top; release around the last center.`
        : `用连续高斯曲线向左展开，宽度为 restWidth + (maxWidth − restWidth) × strength × exp(−(index − center)² / (2 × sigma²))。最大宽度 ${maxWidth} 像素，sigma 为 ${sigma}（短条索引单位）。中心和强度各用同参数弹簧，刚度 ${stiffness}、阻尼 ${damping}、质量 ${mass}。原地按 ${delayMs} 毫秒展开，或纵向移动超过 ${tolerance} 像素后从按下处拖动。以相对 Y 除以 ${height} 像素计算拖动，反向翻转符号；松手后在最后中心收束。`},
      {label: en ? 'Input and interruption' : '重复操作与打断', text: en
        ? 'Click to scroll smoothly to the position, mirrored for reverse. Manual input interrupts a seek; clear timers and capture on cancel, blur or unmount. Arrow keys step by 2.5%, Page Up and Page Down by 10%, and Home and End go to the reading boundaries.'
        : '单击平滑定位，反向时镜像。手动输入可打断定位，取消、失焦或卸载时清理定时器和指针捕获。方向键步进 2.5%，Page Up 和 Page Down 步进 10%，Home 和 End 跳到首尾。'},
      {label: en ? 'Reduced motion' : '减少动态效果', text: en
        ? 'Click and width changes are immediate. Drag always moves the pane immediately.'
        : '单击定位和宽度变化即时完成。拖动始终即时移动阅读区。'},
      {label: en ? 'Implementation' : '来源', text: en
        ? 'src/GradientScrollRailPreview.tsx'
        : 'src/GradientScrollRailPreview.tsx'},
    ],
  };
}

export function gradientRailMotion(config: HistoryConfig) {
  const settings = {...defaultGradientRail, ...config.gradientScrollRail};
  return {
    component: 'Gradient Scroll Rail',
    terminology: {id: 'gradient-scroll-rail', englishTerm: 'Gradient Scroll Rail'},
    forward: [], reverse: [],
    policies: {repeat: 0, reduceMotion: 'Scroll instantly on click, update the center and strength immediately, and jump to the demo sample.'},
    adapters: {
      gradientScrollRail: {
        settings,
        geometry: {...gradientRailGeometry, maxWidth: settings.maxWidth, sigma: settings.sigma},
        palette: gradientRailPalette,
        press: gradientRailPress,
        spring: gradientRailSpring,
        demo: {fraction: gradientRailDemo.fraction, legMs: config.durationMs, delayMs: config.delayMs},
        usage: 'Bind the rail to one scrollable pane. Paint fill in the configured direction from normalized scroll progress. Keep physical bar indices in top-to-bottom order and their right edges fixed. Apply 8 + (maxWidth - 8) × A × exp(-(i-c)² / (2×sigma²)) to each bar, with one shared center and strength. A click maps its Y along the visible bars to absolute progress, mirrored for reverse. Scroll there using native smooth scrolling unless reduced motion is enabled. A new click replaces the target, and manual input can interrupt it. Start drag when vertical movement exceeds the tolerance and use the press Y as its origin. A stationary hold uses its activation Y as the origin. Add relative Y divided by rail height for top-to-bottom and subtract it for reverse. Clamp and scroll instantly during drag. On release, settle strength to zero around the last center. Clear timers and capture on cancel, blur, or unmount.',
      },
    },
  };
}
