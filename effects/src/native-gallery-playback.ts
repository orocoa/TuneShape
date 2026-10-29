import type {NativeEffectRuntime} from './native-effect-tools';

/** Gallery presentation never changes the saved loop or the user's reduced-motion preference. */
export function nativeGalleryRuntime(runtime:NativeEffectRuntime,managed:boolean,autoPlay:boolean):NativeEffectRuntime{
 return {...runtime,enabled:runtime.enabled&&(!managed||autoPlay||runtime.reduced)};
}

/** Repeat finite entrances from actual completion, without modifying the saved animation. */
export function createNativeGalleryReplay({replay,settle,delay=()=>500,schedule=(fn,ms)=>setTimeout(fn,ms),cancel=handle=>clearTimeout(handle)}:{
 replay:()=>void;settle:()=>void;delay?:()=>number;
 schedule?:(fn:()=>void,ms:number)=>ReturnType<typeof setTimeout>;
 cancel?:(handle:ReturnType<typeof setTimeout>)=>void;
}){
 let active=false,pending:ReturnType<typeof setTimeout>|undefined;
 function clear(){if(pending!==undefined)cancel(pending);pending=undefined}
 return {
  setActive(next:boolean){if(active===next)return;active=next;clear();if(active)replay();else settle()},
  onRunning(running:boolean){clear();if(active&&!running)pending=schedule(()=>{pending=undefined;if(active)replay()},delay())},
 };
}
