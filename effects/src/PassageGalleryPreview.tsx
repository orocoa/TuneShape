import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './preview-types';
import {createPassageGallery,defaultPassageGallery} from './passage-gallery';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeEngine} from './useNativeEngine';
import {useFluidPreviewFit} from './useFluidPreviewFit';
import {useLanguage} from './i18n';
export default function PassageGalleryPreview({config,speed,reduced,command,side,enabled=true,thumbnail=false,autoPlay=false,paused=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createPassageGallery>|null>(null),callback=useRef(onRunningChange);callback.current=onRunningChange;
 const settings=config.passageGallery??defaultPassageGallery,runtime={...nativeGalleryRuntime({enabled,paused,reduced,speed,language,durationMs:config.durationMs,onRunning:value=>callback.current?.(side,value)},thumbnail,autoPlay),interactive:enabled},scene=useFluidPreviewFit(host,config.scale);
 useNativeEngine(engine,()=>createPassageGallery(root.current!,settings,runtime));
 useLayoutEffect(()=>{engine.current?.update(settings,runtime)},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,scene.height,scene.fit]);
 useLayoutEffect(()=>{if(thumbnail&&(!autoPlay||!enabled))engine.current?.settle()},[thumbnail,autoPlay,enabled]);
 useLayoutEffect(()=>{if(command.seq>0&&enabled&&!reduced)engine.current?.demonstrate()},[command.seq,enabled,reduced]);
 return <div className="history-demo" data-history-preview={side} data-recipe="passage-gallery" data-trigger="loading" data-paused={paused}><div ref={host} className="history-canvas" style={{background:settings.backgroundColor}}><div style={{position:'absolute',left:'50%',top:'50%',width:720,height:scene.height,transform:`translate(-50%,-50%) scale(${scene.fit})`}}><div ref={root} data-part="root" style={{transform:`translate(${config.offsetX}px,${config.offsetY}px)`}}/></div></div></div>;
}
