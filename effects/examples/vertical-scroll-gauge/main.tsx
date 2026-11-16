import {mountScrollingPreview} from '../../demo/scrolling-preview';
import {defaultVerticalGauge, verticalGaugeDirections} from '../../src/vertical-scroll-gauge';
import preset from './config.json';

const directionNames = {
  'top-to-bottom': {zh: '从上向下', en: 'Top to bottom'},
  'bottom-to-top': {zh: '从下向上', en: 'Bottom to top'},
};

mountScrollingPreview(preset, verticalGaugeDirections.map(direction => ({
  label: directionNames[direction],
  selected: config => (config.verticalScrollGauge?.direction ?? defaultVerticalGauge.direction) === direction,
  select: config => ({...config, verticalScrollGauge: {...config.verticalScrollGauge, direction}}),
})));
