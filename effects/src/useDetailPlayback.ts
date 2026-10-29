import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';

export type PreviewCommand={seq:number;active:boolean;restart?:boolean;demo?:boolean};
export type PlaybackControl={speed:number;pause:()=>void;play:()=>void;stop:()=>void;state?:string;animations?:{state?:string}[]};

/** Demonstrate an inspector edit after the renderer has received its new settings.
 * The caller scopes this to the adjusted detail preview; transport and gallery
 * changes do not count as configuration edits. Paused previews stay paused. */
export function useInspectorChange<T>(value:T,enabled:boolean,onChange:(previous:T)=>void){
 const previous=useRef(value);
 useLayoutEffect(()=>{
  const old=previous.current;previous.current=value;
  if(old!==value&&enabled)onChange(old);
 },[value,enabled,onChange]);
}

/** Pause the actual Motion clocks, including procedural tracks and delayed phases. */
export function usePreviewClock<C extends PlaybackControl>(controls:{current:C[]},speed:number,enabled=true,paused=false){
 const suspended=useRef(new Set<C>()),settings=useRef({speed,enabled,paused});
 settings.current={speed,enabled,paused};
 const register=useCallback((control:C)=>{
  control.speed=settings.current.speed;
  if(!settings.current.enabled||settings.current.paused||document.hidden){control.pause();suspended.current.add(control)}
  controls.current.push(control);return control;
 },[controls]);
 const clear=useCallback(()=>{controls.current.forEach(control=>control.stop());controls.current=[];suspended.current.clear()},[controls]);
 const forget=useCallback((control:C)=>{suspended.current.delete(control);controls.current=controls.current.filter(item=>item!==control)},[controls]);
 useLayoutEffect(()=>{
  const sync=()=>controls.current.forEach(control=>{
   control.speed=settings.current.speed;
   if(settings.current.enabled&&!settings.current.paused&&!document.hidden){if(suspended.current.delete(control))control.play()}
   else if(Array.isArray(control.animations)?control.animations.some(child=>child?.state==='running'):control.state==='running'){control.pause();suspended.current.add(control)}
  });
  sync();document.addEventListener('visibilitychange',sync);return()=>document.removeEventListener('visibilitychange',sync);
 },[controls,speed,enabled,paused]);
 return {register,clear,forget};
}

/** Both comparison sides finish independently; the toolbar stays active until both return. */
export function useDetailPlayback(identity:string,autoPlay=false){
 const sequence=useRef(0);
 const [session,setSession]=useState({identity,seq:0,paused:false,running:{} as Record<string,boolean>});
 useEffect(()=>{setSession({identity,seq:autoPlay?++sequence.current:0,paused:false,running:autoPlay?{before:true,after:true}:{}})},[identity,autoPlay]);
 const report=useCallback((side:string,running:boolean)=>setSession(previous=>{
  if(previous.identity!==identity||previous.running[side]===running)return previous;
  return {...previous,running:{...previous.running,[side]:running}};
 }),[identity]);
 const toggle=()=>setSession(previous=>{
  if(previous.identity===identity&&Object.values(previous.running).some(Boolean))return {...previous,paused:!previous.paused};
  return {identity,seq:++sequence.current,paused:false,running:{before:true,after:true}};
 });
 const current=session.identity===identity?session:{seq:0,paused:false,running:{}};
 return {command:{seq:current.seq,active:current.seq>0,restart:true,demo:current.seq>0} satisfies PreviewCommand,paused:current.paused,playing:!current.paused&&Object.values(current.running).some(Boolean),report,toggle};
}
