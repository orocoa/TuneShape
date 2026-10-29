import type {Track} from './history-model';
import {evaluateBezier} from './easing';

// Uiverse.io / Nawsome: original CSS retained in outputs/typewriter-20261017.
// Bake the carriage's CSS `ease` into samples, keeping every part on one linear clock.
const carriageStops = [[0,14],[.05,14],[.15,6],[.3,6],[.4,0],[.55,0],[.65,-4],[.7,-4],[.8,-12],[.89,-12],[1,14]];
const motionTrack = (part:string,property:string,values:number[],times:number[]):Track => ({part,property,values,times,start:0,span:1});
const carriageTimes:number[] = [0], carriageValues:number[] = [14];
for(let i=1;i<carriageStops.length;i++){
 const [start,from]=carriageStops[i-1], [end,to]=carriageStops[i];
 const steps=from===to?1:20;
 for(let step=1;step<=steps;step++){
  const progress=step/steps;
  carriageTimes.push(Number((start+(end-start)*progress).toFixed(6)));
  carriageValues.push(Number((from+(to-from)*evaluateBezier(progress,[.25,.1,.25,1])).toFixed(5)));
 }
}

export const typewriterKeys = [
 {x:15,y:0,peak:.09},{x:30,y:0,peak:.54},{x:45,y:0,peak:.72},
 {x:60,y:0,peak:.18},{x:75,y:0,peak:null},{x:90,y:0,peak:.45},
 {x:22,y:10,peak:.27},{x:37,y:10,peak:.81},{x:52,y:10,peak:.36},
 {x:60,y:10,peak:.36},{x:68,y:10,peak:.36},{x:83,y:10,peak:.63},
];

export const typewriterTracks:Track[] = [
 motionTrack('machine','y',[0,0,-4,0,2,0],[0,.85,.89,.92,.95,1]),
 motionTrack('carriage','x',carriageValues,carriageTimes),
 motionTrack('paper','y',[46,46,34,34,22,22,10,10,0,0,46,46],[0,.05,.2,.3,.4,.55,.65,.7,.8,.85,.92,1]),
 ...typewriterKeys.map(({peak},i)=>peak===null
  ? motionTrack('key'+i,'y',[0,0],[0,1])
  : motionTrack('key'+i,'y',[0,0,2,0,0],[0,peak===.09?.05:Number((peak-.06).toFixed(2)),peak,Number((peak+.03).toFixed(2)),1])),
];
