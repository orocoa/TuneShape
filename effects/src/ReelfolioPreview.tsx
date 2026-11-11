import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './preview-types';
import {createReelfolio,type ReelfolioRuntime} from './reelfolio';
import {defaultReelfolio,type ReelfolioKind} from './reelfolio-settings';
import {useNativeEngine} from './useNativeEngine';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
import {useLanguage} from './i18n';
export default function ReelfolioPreview({config,speed,reduced,command,side,enabled=true,paused=false,thumbnail=false,autoPlay=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createReelfolio>|null>(null),callback=useRef(onRunningChange),held=useRef(false);callback.current=onRunningChange;
 const settings=config.reelfolio??defaultReelfolio(config.recipeId.slice(10) as ReelfolioKind),replay=useNativeGalleryReplay(engine,thumbnail&&autoPlay&&enabled&&!paused&&!reduced,1000);
 const runtime:ReelfolioRuntime={...nativeGalleryRuntime({enabled,paused,reduced,speed,durationMs:config.durationMs,language},thumbnail,autoPlay),onInteract:()=>{held.current=true;replay.cancelPending()},onRunning:running=>{callback.current?.(side,running);if(thumbnail&&!held.current)replay(running)}};
 useNativeEngine(engine,()=>createReelfolio(root.current!,settings,runtime));
 useLayoutEffect(()=>{if(!autoPlay)held.current=false;engine.current?.update(settings,runtime)},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs]);
 useLayoutEffect(()=>{if(command.seq>0&&enabled){if(reduced)callback.current?.(side,false);else engine.current?.demonstrate()}},[command.seq,enabled,reduced]);
 return <div className="history-demo" data-history-preview={side} data-recipe={config.recipeId} data-trigger="click" data-paused={paused} style={{background:settings.background}}><div className="history-canvas" style={{height:thumbnail?'100%':440,background:settings.background,width:'100%'}}><div ref={root} data-part="root" style={{width:'100%',height:'100%',transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>;
}
