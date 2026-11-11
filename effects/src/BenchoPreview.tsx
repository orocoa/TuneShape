import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './preview-types';
import {createBencho,type BenchRuntime} from './bencho';
import {defaultBencho,type BenchoKind} from './bencho-settings';
import {useNativeEngine} from './useNativeEngine';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
import {useLanguage} from './i18n';
export default function BenchoPreview({config,speed,reduced,command,side,enabled=true,paused=false,thumbnail=false,autoPlay=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createBencho>|null>(null),callback=useRef(onRunningChange),held=useRef(false);callback.current=onRunningChange;
 const settings=config.bencho??defaultBencho(config.recipeId.slice(7) as BenchoKind),manualWake=settings.kind==='wake-slider',replay=useNativeGalleryReplay(engine,thumbnail&&autoPlay&&enabled&&!paused&&!reduced&&settings.kind!=='carousel'&&!manualWake,1300);
 const runtime:BenchRuntime={...nativeGalleryRuntime({enabled,paused,reduced,speed,durationMs:config.durationMs,language},thumbnail&&!manualWake,autoPlay),gallery:thumbnail,onInteract:()=>{held.current=true;replay.cancelPending()},onRunning:running=>{callback.current?.(side,running);if(thumbnail&&!held.current&&!manualWake)replay(running)}};
 useNativeEngine(engine,()=>createBencho(root.current!,settings,runtime));
 useLayoutEffect(()=>{if(!autoPlay)held.current=false;engine.current?.update(settings,runtime)},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs]);
 useLayoutEffect(()=>{if(command.seq>0&&enabled){if(reduced||manualWake)callback.current?.(side,false);else engine.current?.demonstrate()}},[command.seq,enabled,reduced,manualWake]);
 return <div className="history-demo" data-history-preview={side} data-recipe={config.recipeId} data-trigger="click" data-paused={paused} style={{background:settings.background}}><div className="history-canvas" style={{height:thumbnail?'100%':440,background:settings.background,width:'100%'}}><div ref={root} data-part="root" style={{width:'100%',height:'100%',transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>;
}
