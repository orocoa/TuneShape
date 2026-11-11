import './bencho-ui-catalog.css';
import {useLayoutEffect,useRef} from 'react';
import type {HistoryPreviewProps} from './preview-types';
import {createBenchoUi,type BenchoUiRuntime} from './bencho-ui';
import {defaultBenchoUi,type BenchoUiKind} from './bencho-ui-settings';
import {useNativeEngine} from './useNativeEngine';
import {nativeGalleryRuntime} from './native-gallery-playback';
import {useNativeGalleryReplay} from './useNativeGalleryReplay';
import {useLanguage} from './i18n';
export default function BenchoUiPreview({config,speed,reduced,command,side,enabled=true,paused=false,thumbnail=false,autoPlay=false,onRunningChange}:HistoryPreviewProps){
 const language=useLanguage(),root=useRef<HTMLDivElement>(null),engine=useRef<ReturnType<typeof createBenchoUi>|null>(null),callback=useRef(onRunningChange),held=useRef(false);callback.current=onRunningChange;
 const settings=config.benchoUi??defaultBenchoUi(config.recipeId.slice(7) as BenchoUiKind),manualInteraction=settings.kind==='upload-dropzone'||settings.kind==='slide-confirm',replay=useNativeGalleryReplay(engine,thumbnail&&autoPlay&&enabled&&!paused&&!reduced&&settings.kind!=='eye-tracker'&&!manualInteraction,1500);
 const runtime:BenchoUiRuntime={...nativeGalleryRuntime({enabled,paused,reduced,speed,durationMs:config.durationMs,language},thumbnail&&!manualInteraction,autoPlay),gallery:thumbnail,onInteract:()=>{held.current=true;replay.cancelPending()},onRunning:running=>{callback.current?.(side,running);if(thumbnail&&!held.current&&!manualInteraction)replay(running)}};
 useNativeEngine(engine,()=>createBenchoUi(root.current!,settings,runtime));
 useLayoutEffect(()=>{if(!autoPlay)held.current=false;engine.current?.update(settings,runtime)},[settings,speed,reduced,enabled,paused,language,thumbnail,autoPlay,config.durationMs]);
 useLayoutEffect(()=>{if(command.seq>0&&enabled){if(reduced||manualInteraction)callback.current?.(side,false);else engine.current?.demonstrate()}},[command.seq,enabled,reduced,manualInteraction]);
 return <div className="history-demo" data-history-preview={side} data-recipe={config.recipeId} data-trigger="click" data-paused={paused} style={{background:settings.background}}><div className="history-canvas" style={{height:thumbnail?'100%':440,background:settings.background,width:'100%'}}><div ref={root} data-part="root" style={{width:'100%',height:'100%',transform:`translate(${config.offsetX}px,${config.offsetY}px) scale(${config.scale})`}}/></div></div>;
}
