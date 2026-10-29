import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createStudioEffect,studioRuntime,studioSettings} from './orbit-typography-spec';
import {useLanguage} from './i18n';
import {useInspectorChange} from './useDetailPlayback';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
export default function StudioEffectsPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createStudioEffect>|null>(null),[fit,setFit]=useState(1),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const report=useNativeGalleryReplay(engine,thumbnail&&config.recipeId!=='app-orbit'&&enabled&&autoPlay&&!paused&&!reduced);
 const runtime=nativeGalleryRuntime({...studioRuntime(config),enabled,paused,reduced,speed,language,onRunning:(running:boolean)=>{report(running);callback.current?.(side,running)}},thumbnail,autoPlay),initial=useRef({config,runtime}),measure=useRef(()=>{});
 measure.current=()=>{if(!host.current||!root.current)return;const r=host.current.getBoundingClientRect();setFit(Math.max(.06,Math.min(1,(r.width-(config.recipeId==='app-orbit'?48:0))/Math.max(1,root.current.scrollWidth),(r.height-(config.recipeId==='app-orbit'?44:0))/Math.max(1,root.current.scrollHeight))))};
 useLayoutEffect(()=>{engine.current=createStudioEffect(root.current!,initial.current.config,initial.current.runtime);const o=new ResizeObserver(()=>measure.current());o.observe(host.current!);o.observe(root.current!);return()=>{o.disconnect();engine.current?.destroy();engine.current=null}},[]);
 useLayoutEffect(()=>{engine.current?.update(config,runtime);measure.current()},[config,speed,reduced,enabled,paused,language,thumbnail,autoPlay]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{if(config.recipeId!=='app-orbit'&&(JSON.stringify(studioSettings(previous))!==JSON.stringify(studioSettings(config))||previous.durationMs!==config.durationMs||previous.delayMs!==config.delayMs))engine.current?.demonstrate()});
 useLayoutEffect(()=>{if(command.seq>0&&enabled)engine.current?.demonstrate()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe={config.recipeId} data-trigger="click" data-paused={paused}><div className="history-canvas"><div style={{position:'absolute',left:'50%',top:'50%',width:'max-content',transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div></div>;
}
