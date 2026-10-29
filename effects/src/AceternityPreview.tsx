import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {aceternityRuntime,aceternitySettings,createAceternityEffect} from './aceternity-spec';
import {useLanguage} from './i18n';
import {useInspectorChange} from './useDetailPlayback';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
export default function AceternityPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createAceternityEffect>|null>(null),[fit,setFit]=useState(1),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const automatic=['encrypted-text','flip-words'].includes(config.recipeId),report=useNativeGalleryReplay(engine,thumbnail&&automatic&&enabled&&autoPlay&&!paused&&!reduced,config.recipeId==='flip-words'?config.flipWords?.holdMs??3000:500);
 const sidebar=config.recipeId==='expandable-sidebar',runtime=nativeGalleryRuntime({...aceternityRuntime(config),enabled,paused,reduced,speed,language,onRunning:(running:boolean)=>{report(running);callback.current?.(side,running)}},thumbnail&&automatic,autoPlay),initial=useRef({config,runtime});
 const measure=useRef(()=>{});measure.current=()=>{if(!host.current||!root.current||sidebar)return;const box=host.current.getBoundingClientRect();setFit(Math.max(.1,Math.min(1,(box.width-40)/Math.max(1,root.current.scrollWidth*config.scale),(box.height-40)/Math.max(1,root.current.scrollHeight*config.scale))))};
 useLayoutEffect(()=>{engine.current=createAceternityEffect(root.current!,initial.current.config,initial.current.runtime);const observer=new ResizeObserver(()=>measure.current());observer.observe(host.current!);observer.observe(root.current!);return()=>{observer.disconnect();engine.current?.destroy();engine.current=null}},[]);
 useLayoutEffect(()=>{engine.current?.update(config,runtime);measure.current()},[config,speed,reduced,enabled,paused,language,thumbnail,autoPlay]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{
  const old=aceternitySettings(previous) as unknown as Record<string,unknown>,next=aceternitySettings(config) as unknown as Record<string,unknown>;
  const keys=config.recipeId==='encrypted-text'?['text','charset','flipDelayMs']:config.recipeId==='gooey-input'?['collapsedWidth','expandedWidth','expandedOffset','blur','height','bounce']:config.recipeId==='expandable-sidebar'?['expandedWidth','collapsedWidth']:['words','staggerMs','blur','exitX','exitY','exitScale'];
  if(previous.durationMs!==config.durationMs||keys.some(key=>JSON.stringify(old[key])!==JSON.stringify(next[key])))engine.current?.demonstrate();
 });
 useLayoutEffect(()=>{if(command.seq>0&&enabled)engine.current?.demonstrate()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe={config.recipeId} data-trigger={sidebar?'hover':'click'} data-paused={paused}><div className="history-canvas"><div style={sidebar?{position:'absolute',inset:16,transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}:{position:'absolute',left:'50%',top:'50%',width:'max-content',maxWidth:540,transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} data-part="root" style={sidebar?{height:'100%',width:'100%'}:{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div></div>;
}
