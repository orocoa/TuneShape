import {compiledTracks} from './history-model.ts';
import type {HistoryConfig} from './history-model.ts';

/** Gallery gestures repeat finite passes; the saved animation's own loop policy is untouched. */
export function galleryPass(config:HistoryConfig,reverse=false){
 return compiledTracks(config,reverse).map(track=>({...track,transition:{...track.transition,repeat:0,repeatDelay:0}}));
}
/** Historical tracks are finite tweens; include the last delayed phase in the presentation clock. */
export function galleryPassDuration(config:HistoryConfig,reverse=false){
 return Math.max(0,...galleryPass(config,reverse).map(track=>(track.transition.delay+track.transition.duration)*1000));
}
export const PREVIEW_DWELL_MS=500;
/** The authored wave's 10% phase matches the selected crest-and-ball poster. */
export function galleryPosterValue(track:ReturnType<typeof compiledTracks>[number]){
 const progress=.1,times=track.transition.times;
 let end=1;while(end<times.length-1&&times[end]<progress)end++;
 const a=track.values[end-1],b=track.values[end];
 if(typeof a!=='number'||typeof b!=='number')return a;
 const mix=(progress-times[end-1])/(times[end]-times[end-1]||1);
 return a+(b-a)*mix;
}
