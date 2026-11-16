import type {HistoryConfig} from './history-model';
import {historyDescription} from './history-model';
import type {Language} from './i18n';
import {defaultPixelScrollOrb, pixelOrbBounds} from './pixel-scroll-orb';
import {defaultMonochromeOrb, monochromeOrbBounds} from './monochrome-scroll-orb';
import {defaultVerticalGauge, verticalGaugeBounds} from './vertical-scroll-gauge';
import {defaultConicScrollOrb, conicOrbBounds} from './conic-scroll-orb';
import {defaultGradientRail, gradientRailBounds} from './gradient-scroll-rail';

const scrollingSettings = {
  'pixel-scroll-orb': {key: 'pixelScrollOrb', defaults: defaultPixelScrollOrb, bounds: pixelOrbBounds},
  'monochrome-scroll-orb': {key: 'monochromeScrollOrb', defaults: defaultMonochromeOrb, bounds: monochromeOrbBounds},
  'vertical-scroll-gauge': {key: 'verticalScrollGauge', defaults: defaultVerticalGauge, bounds: verticalGaugeBounds},
  'conic-scroll-orb': {key: 'conicScrollOrb', defaults: defaultConicScrollOrb, bounds: conicOrbBounds},
  'gradient-scroll-rail': {key: 'gradientScrollRail', defaults: defaultGradientRail, bounds: gradientRailBounds},
} as const;

export function scrollingSettingsFor(id: string) {
  if (!Object.hasOwn(scrollingSettings, id)) throw new Error('Unknown scrolling effect');
  return scrollingSettings[id as keyof typeof scrollingSettings];
}

export function scrollingPrompt(config: HistoryConfig, language: Language = 'en') {
  const {key, defaults, bounds} = scrollingSettingsFor(config.recipeId);
  const description = historyDescription(config, language);
  const zh = language === 'zh';
  return [
    zh ? `用 React、TypeScript 和 motion/react 实现 ${description.title}（${config.recipeId}）。`
      : `Implement ${description.title} (${config.recipeId}) in React and TypeScript using motion/react.`,
    zh ? '将组件绑定到一个真实可滚动的阅读区。以 scrollTop 除以可滚动距离计算进度，无滚动空间时为 0；所有定位限定在阅读区内。卸载时清理动画和监听。'
      : 'Bind the indicator to one real scrollable pane. Derive progress from scrollTop divided by scroll travel, using zero when travel is zero. Scope seeks to the pane and clean up animations and listeners on unmount.',
    zh ? `可配置字段 ${key}。默认值 ${JSON.stringify(defaults)}。当前值 ${JSON.stringify({...defaults, ...config[key]})}。数值范围 ${JSON.stringify(bounds)}。`
      : `Configurable field ${key}. Defaults ${JSON.stringify(defaults)}. Current settings ${JSON.stringify({...defaults, ...config[key]})}. Numeric ranges ${JSON.stringify(bounds)}.`,
    ...description.sections.filter(section => section.label !== (zh ? '来源' : 'Implementation')).map(section => section.text),
  ].join('\n\n');
}
