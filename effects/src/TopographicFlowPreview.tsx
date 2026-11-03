import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createTopographicFlow,defaultTopographicFlow} from './topographic-flow';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useInspectorChange} from './useDetailPlayback';
import {useLanguage} from './i18n';
export default function TopographicFlowPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createTopographicFlow>|null>(null),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.topographicFlow??defaultTopographicFlow,runtime=nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,delayMs:config.delayMs,onRunning:(value:boolean)=>callback.current?.(side,value)},thumbnail,autoPlay),initial=useRef({settings,runtime});
 useLayoutEffect(()=>{engine.current=createTopographicFlow(root.current!,initial.current.settings,initial.current.runtime);return()=>{engine.current?.destroy();engine.current=null}},[]);
 useLayoutEffect(()=>engine.current?.update(settings,runtime),[settings,enabled,paused,reduced,speed,language,thumbnail,autoPlay,config.durationMs,config.delayMs]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{if(previous.durationMs!==config.durationMs||!previous.topographicFlow?.animateEntrance&&settings.animateEntrance)engine.current?.demonstrate()});
 useLayoutEffect(()=>{if(command.seq>0&&enabled)engine.current?.demonstrate()},[command.seq]);
 return <div className="history-demo" data-history-preview={side} data-recipe="topographic-flow" data-trigger="loading" data-paused={paused}><div className="history-canvas" style={{width:'100%'}}><div ref={root} data-part="root" style={{width:'100%',height:'100%',transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>
}
