import {createContext} from 'react';
import type {RefObject} from 'react';

export type CatalogEngine={demonstrate?:()=>void;settle?:()=>void};
export type CatalogNativeState={available:boolean;playing:boolean;manualAllowed:boolean;preserveManual:boolean};
export type CatalogNativeControl={
 state:RefObject<CatalogNativeState>;
 engines:RefObject<Set<CatalogEngine>>;
 interact:()=>void;
 report:(running:boolean)=>void;
};
export const CatalogNativeContext=createContext<CatalogNativeControl|null>(null);

/** Catalog controls own transport; detail and exported renderers keep their
 * original runtimes. In a catalog, an idle manual control must remain enabled. */
export function catalogEngine<T extends {destroy:()=>void}>(instance:T,current:()=>CatalogNativeControl|null):T{
 return new Proxy(instance,{
  get(target,key,receiver){
   const original=Reflect.get(target,key,receiver);
   if(typeof original!=='function')return original;
   if(key==='update')return(...args:unknown[])=>{
    const control=current(),runtime=args.at(-1);
    if(control&&runtime&&typeof runtime==='object'&&'enabled' in runtime&&'speed' in runtime){
     const r=runtime as Record<string,unknown>,s=control.state.current;
     args[args.length-1]={...r,enabled:s.available&&(s.manualAllowed||s.playing),
      ...('gallery' in r?{gallery:false}:{}),
      onInteract:()=>{control.interact();if(typeof r.onInteract==='function')r.onInteract()},
      onRunning:(running:boolean)=>{control.report(running);if(typeof r.onRunning==='function')r.onRunning(running)}};
    }
    return Reflect.apply(original,target,args);
   };
   if(key==='settle')return()=>{
    const s=current()?.state.current;
    if(s?.available&&s.preserveManual)return;
    return Reflect.apply(original,target,[]);
   };
   return original.bind(target);
  },
 });
}
