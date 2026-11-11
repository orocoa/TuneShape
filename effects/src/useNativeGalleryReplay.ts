import {useContext,useEffect,useRef} from 'react';
import type {RefObject} from 'react';
import {createNativeGalleryReplay} from './native-gallery-playback';
import {CatalogNativeContext} from './catalog-native-context';

export function useNativeGalleryReplay(engine:RefObject<{demonstrate:()=>void;settle?:()=>void}|null>,active:boolean,dwell=500){
 const controlled=useContext(CatalogNativeContext)!==null;
 const delay=useRef(dwell);delay.current=dwell;
 const controller=useRef<ReturnType<typeof createNativeGalleryReplay>|null>(null);
 if(!controller.current)controller.current=createNativeGalleryReplay({replay:()=>engine.current?.demonstrate(),settle:()=>engine.current?.settle?.(),delay:()=>delay.current});
 // Layout effects restore the engine runtime before this effect requests replay.
 useEffect(()=>{const replay=controller.current!;replay.setActive(active&&!controlled);return()=>replay.setActive(false)},[active,controlled]);
 return Object.assign(controller.current.onRunning,{cancelPending:controller.current.cancelPending});
}
