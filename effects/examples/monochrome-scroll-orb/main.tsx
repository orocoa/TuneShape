import {mountScrollingPreview} from '../../demo/scrolling-preview';
import {defaultMonochromeOrb} from '../../src/monochrome-scroll-orb';
import preset from './config.json';

const themes = [
  {theme: 'light', label: {zh: '浅色', en: 'Light'}},
  {theme: 'dark', label: {zh: '深色', en: 'Dark'}},
] as const;

mountScrollingPreview(preset, themes.map(({theme, label}) => ({
  label,
  selected: config => (config.monochromeScrollOrb?.theme ?? defaultMonochromeOrb.theme) === theme,
  select: config => ({...config, monochromeScrollOrb: {...config.monochromeScrollOrb, theme}}),
})));
