import {mountScrollingPreview} from '../../demo/scrolling-preview';
import {defaultGradientRail, gradientRailDirections} from '../../src/gradient-scroll-rail';
import preset from './config.json';

const directionNames = {
  'top-to-bottom': {zh: '从上向下', en: 'Top to bottom'},
  'bottom-to-top': {zh: '从下向上', en: 'Bottom to top'},
};

mountScrollingPreview(preset, gradientRailDirections.map(direction => ({
  label: directionNames[direction],
  selected: config => (config.gradientScrollRail?.direction ?? defaultGradientRail.direction) === direction,
  select: config => ({...config, gradientScrollRail: {direction}}),
})));
