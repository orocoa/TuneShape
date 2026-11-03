import {useLayoutEffect,useRef,useState} from 'react';
import type {HistoryPreviewProps} from './HistoryPreview';
import {createChromaticButton,defaultChromaticButton} from './chromatic-button';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
import {useInspectorChange} from './useDetailPlayback';
import {useLanguage} from './i18n';
export default function ChromaticButtonPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createChromaticButton>|null>(null),[fit,setFit]=useState(1),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const replay=useNativeGalleryReplay(engine,thumbnail&&autoPlay&&enabled&&!paused&&!reduced&&speed>0);
 const settings=config.chromaticButton??defaultChromaticButton,runtime=nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,delayMs:config.delayMs,onRunning:(value:boolean)=>{callback.current?.(side,value);if(thumbnail)replay(value)}},thumbnail,autoPlay),initial=useRef({settings,runtime});
 const measure=useRef(()=>{});measure.current=()=>{if(!host.current)return;const b=host.current.getBoundingClientRect();setFit(Math.max(.1,Math.min(1,(b.width-12)/(520*config.scale),(b.height-12)/(260*config.scale))))};
 useLayoutEffect(()=>{engine.current=createChromaticButton(root.current!,initial.current.settings,initial.current.runtime);const observer=new ResizeObserver(()=>measure.current());observer.observe(host.current!);measure.current();return()=>{observer.disconnect();engine.current?.destroy();engine.current=null}},[]);
 useLayoutEffect(()=>{engine.current?.update(settings,runtime);measure.current()},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.delayMs,config.scale]);
 useInspectorChange(config,side==='after'&&!thumbnail&&enabled&&!paused,previous=>{const old=previous.chromaticButton;if(old&&(['entrance','entranceSpeed','entranceBlur','entranceDistance','entranceScale'] as const).some(k=>old[k]!==settings[k]))engine.current?.demonstrate()});
 useLayoutEffect(()=>{if(command.seq>0&&enabled)engine.current?.demonstrate()},[command.seq]);
 return <div ref={host} className="history-demo" data-history-preview={side} data-recipe="chromatic-button" data-trigger="loading" data-paused={paused}><div className="history-canvas"><div style={{position:'absolute',left:'50%',top:'50%',width:520,height:260,transform:`translate(-50%,-50%) scale(${fit})`}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div></div>
}
