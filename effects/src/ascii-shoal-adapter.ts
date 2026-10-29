import {createAsciiShoal} from '../examples/ascii-shoal/src/ascii-shoal.js';
import type {AsciiSharksSettings} from './ascii-sharks-settings';
import type {NativeEffectRuntime} from './native-effect-tools';

/** Keeps saved TuneShape configurations compatible with the independent renderer. */
export function createAsciiSharks(host:HTMLElement,settings:AsciiSharksSettings,runtime:NativeEffectRuntime){
 const options=(s:AsciiSharksSettings)=>{const {fontScale,...rest}=s;return {...rest,glyphScale:fontScale,interactive:false}};
 const playback=(r:NativeEffectRuntime)=>({...r,paused:r.paused||!r.enabled});
 let currentRuntime=runtime;
 host.classList.add('ascii-sharks');
 const engine=createAsciiShoal(host,options(settings),playback(runtime));
 return {
  update(next:AsciiSharksSettings,nextRuntime:NativeEffectRuntime){currentRuntime=nextRuntime;engine.update(options(next),playback(nextRuntime))},
  demonstrate(){engine.restart();engine.update({},playback(currentRuntime))},
  settle(){engine.pause()},
  getValue(){return engine.getState()},
  destroy(){engine.destroy();host.classList.remove('ascii-sharks')},
 };
}
