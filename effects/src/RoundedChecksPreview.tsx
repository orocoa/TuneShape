import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createRoundedChecks,defaultRoundedChecks} from './rounded-checks';
import {checksRuntime} from './rounded-checks-spec';
import {useLanguage} from './i18n';
import {useInspectorChange} from './useDetailPlayback';
export default function RoundedChecksPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createRoundedChecks>|null>(null),[fit,setFit]=useState(1),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.roundedChecks??defaultRoundedChecks,runtime={...checksRuntime(config),enabled,paused,reduced,speed,language,onRunning:(running:boolean)=>callback.current?.(side,running)},initial=useRef({settings,runtime});
 const measure=useRef(()=>{});measure.current=()=>{if(!host.current||!root.current)return;const box=host.current.getBoundingClientRect(),content=root.current;setFit(Math.max(.1,Math.min(1,(box.width-32)/Math.max(1,content.scrollWidth*config.scale),(box.height-32)/Math.max(1,content.scrollHeight*config.scale))))};
 useLayoutEffect(()=>{
  engine.current=createRoundedChecks(root.current!,initial.current.settings,initial.current.runtime);
  const observer=new ResizeObserver(()=>measure.current());observer.observe(host.current!);observer.observe(root.current!);
  return()=>{observer.disconnect();engine.current?.destroy();engine.current=null};
 },[]);
 useLayoutEffect(()=>measure.current(),[config.scale]);
 useLayoutEffect(()=>engine.current?.update(settings,runtime),[settings,speed,reduced,enabled,paused,language,config.durationMs,config.delayMs,config.easing,config.interruption,config.scale]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{if(previous.durationMs!==config.durationMs||JSON.stringify(previous.easing)!==JSON.stringify(config.easing))engine.current?.demonstrate()});
 useLayoutEffect(()=>{if(command.seq>0)engine.current?.demonstrate()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="rounded-checks" data-trigger="click" data-paused={paused}><div className="history-canvas"><div style={{position:'absolute',left:'50%',top:'50%',transform:`translate(-50%,-50%) scale(${fit})`,width:'max-content',maxWidth:400}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div></div>;
}
