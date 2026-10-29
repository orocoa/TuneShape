import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createHoverPreview,defaultHoverPreview} from './hover-preview';
import {hoverPreviewContent,hoverPreviewItems} from './hover-preview-art';
import {useInspectorChange} from './useDetailPlayback';

export default function HoverImagePreview({config,speed,reduced,command,side,enabled=true,paused=false,onRunningChange}:HistoryPreviewProps){
 const host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createHoverPreview>|null>(null),[fit,setFit]=useState(.5);
 const callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.hoverPreview??defaultHoverPreview,runtime={enabled,paused,reduced,speed,enterMs:config.durationMs,onRunning:(running:boolean)=>callback.current?.(side,running)},initial=useRef({settings,runtime});
 useLayoutEffect(()=>{
  engine.current=createHoverPreview(root.current!,initial.current.settings,hoverPreviewContent,hoverPreviewItems,initial.current.runtime);
  const observer=new ResizeObserver(([e])=>setFit(Math.max(.1,Math.min(1,(e.contentRect.width-12)/640,(e.contentRect.height-12)/440))));observer.observe(host.current!);
  return()=>{observer.disconnect();engine.current?.destroy();engine.current=null};
 },[]);
 useLayoutEffect(()=>engine.current?.update(settings,runtime),[settings,speed,reduced,enabled,paused,config.durationMs]);
 useInspectorChange(config,side==='after'&&enabled&&!paused,()=>engine.current?.replay({x:.65,y:-.4}));
 useLayoutEffect(()=>{if(command.seq>0)engine.current?.replay()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="hover-preview" data-paused={paused}>
  <div className="history-canvas"><div className="hover-preview-fit" style={{transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} className="hover-preview" data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>
 </div>;
}
