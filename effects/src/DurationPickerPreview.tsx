import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createDurationPicker,defaultDuration} from './duration-picker';
import {useLanguage} from './i18n';
import {useInspectorChange} from './useDetailPlayback';

export default function DurationPickerPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createDurationPicker>|null>(null),[fit,setFit]=useState(1);
 const callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.durationPicker??defaultDuration,runtime={enabled,paused,reduced,speed,durationMs:config.durationMs,language,onRunning:(running:boolean)=>callback.current?.(side,running)};
 const initial=useRef({settings,runtime});
 useLayoutEffect(()=>{
  engine.current=createDurationPicker(root.current!,initial.current.settings,initial.current.runtime);
  const observer=new ResizeObserver(()=>{
   const box=host.current!.getBoundingClientRect(),width=Math.max(320,root.current!.scrollWidth+40);
   setFit(Math.max(.1,Math.min(1,(box.width-16)/width,(box.height-16)/160)));
  });observer.observe(host.current!);observer.observe(root.current!);
  return()=>{observer.disconnect();engine.current?.destroy();engine.current=null};
 },[]);
 useLayoutEffect(()=>engine.current?.update(settings,runtime),[settings,speed,reduced,enabled,paused,language,config.durationMs]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{
  const old=previous.durationPicker??defaultDuration;
  if(previous.durationMs!==config.durationMs||(['gap','bounce','maxHours','maxMinutes','radius'] as const).some(key=>old[key]!==settings[key]))engine.current?.demonstrate();
 });
 useLayoutEffect(()=>{if(command.seq>0)engine.current?.demonstrate()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="duration-picker" data-trigger="click" data-paused={paused}>
  <div className="history-canvas"><div style={{position:'absolute',left:'50%',top:'50%',transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>
 </div>;
}
