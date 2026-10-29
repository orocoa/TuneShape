import type {Track} from './history-model';
import {evaluateBezier} from './easing';

export const yinYangHover = {
 target:'.demo-yin-yang',
 rest:'0 0 20px rgba(0, 0, 0, 0.15)',
 hover:'0 0 30px rgba(0, 0, 0, 0.2)',
 transition:{duration:.3,ease:[.25,.1,.25,1]},
 cssEasing:'ease',
};

// Preserve the source's ease-in-out pulse while the shared cycle clock stays linear.
const times=Array.from({length:41},(_,i)=>i/40);
const scales=times.map(time=>Number((1+.1*evaluateBezier(time<=.5?time*2:2-time*2,[.42,0,.58,1])).toFixed(6)));
export const yinYangTracks:Track[]=[
 {part:'face',property:'rotate',values:[0,-360],times:[0,1],start:0,span:1},
 ...[0,1].map(i=>({part:'dot'+i,property:'scale',values:[...scales],times:[...times],start:0,span:1})),
];
