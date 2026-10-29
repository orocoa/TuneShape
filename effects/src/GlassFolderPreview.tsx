import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createGlassFolder,defaultGlassFolder} from './glass-folder';
import {useLanguage} from './i18n';
import {useInspectorChange} from './useDetailPlayback';
export default function GlassFolderPreview({config,speed,reduced,command,side,enabled=true,paused=false,thumbnail=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),root=useRef<HTMLDivElement>(null),api=useRef<ReturnType<typeof createGlassFolder>|null>(null),settings=config.glassFolder??defaultGlassFolder,callback=useRef(onRunningChange);callback.current=onRunningChange;
 const runtime={enabled,paused,reduced,speed,durationMs:config.durationMs,language,compact:thumbnail,onRunning:(running:boolean)=>callback.current?.(side,running)},initial=useRef({settings,runtime});
 useLayoutEffect(()=>{api.current=createGlassFolder(root.current!,initial.current.settings,initial.current.runtime);return()=>{api.current?.destroy();api.current=null}},[]);
 useLayoutEffect(()=>api.current?.update(settings,runtime),[settings,speed,reduced,enabled,paused,thumbnail,language,config.durationMs]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{if(previous.durationMs!==config.durationMs||(['lift','spread','hoverLift','tilt','fanAngle'] as const).some(key=>previous.glassFolder?.[key]!==settings[key]))api.current?.demonstrate()});
 useLayoutEffect(()=>{if(command.seq>0)api.current?.demonstrate()},[command.seq]);
 return <div className="history-demo" data-history-preview={side} data-recipe="glass-folder" data-trigger="hover" data-paused={paused}><div className="history-canvas" style={{height:thumbnail?'100%':480,cursor:'default'}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>;
}
