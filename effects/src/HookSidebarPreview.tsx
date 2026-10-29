import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createHookSidebar,defaultHook} from './hook-sidebar';
import {useLanguage} from './i18n';
import {useInspectorChange} from './useDetailPlayback';

export default function HookSidebarPreview({config,speed,reduced,command,side,enabled=true,paused=false,thumbnail=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),api=useRef<ReturnType<typeof createHookSidebar>|null>(null),[height,setHeight]=useState(320),[fit,setFit]=useState(.7);
 const settings=config.hookSidebar??defaultHook,callback=useRef(onRunningChange);callback.current=onRunningChange;
 const onHeight=useRef((natural:number)=>setHeight(Math.max(320,Math.ceil(natural)))).current;
 const runtime={enabled,paused,reduced,speed,durationMs:config.durationMs,language,onRunning:(running:boolean)=>callback.current?.(side,running),onHeight};const initial=useRef({settings,runtime});
 useLayoutEffect(()=>{
  api.current=createHookSidebar(root.current!,initial.current.settings,initial.current.runtime);return()=>{api.current?.destroy();api.current=null};
 },[]);
 useLayoutEffect(()=>api.current?.update(settings,runtime),[settings,speed,reduced,enabled,paused,language,config.durationMs]);
 useLayoutEffect(()=>{
  if(!thumbnail)return;const observer=new ResizeObserver(([entry])=>setFit(Math.max(.1,Math.min(1,(entry.contentRect.width-12)/320,(entry.contentRect.height-12)/height))));observer.observe(host.current!);return()=>observer.disconnect();
 },[thumbnail,height]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{if(previous.durationMs!==config.durationMs)api.current?.demonstrate()});
 useLayoutEffect(()=>{if(command.seq>0)api.current?.demonstrate()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="hook-sidebar" data-trigger="click" data-paused={paused}>
  <div className="history-canvas" style={{height:thumbnail?'100%':height,cursor:'default'}}>
   <div style={thumbnail?{position:'absolute',width:320,height,left:'50%',top:'50%',transform:`translate(-50%,-50%) scale(${fit})`}:{width:'100%',height:'100%'}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div>
  </div>
 </div>;
}
