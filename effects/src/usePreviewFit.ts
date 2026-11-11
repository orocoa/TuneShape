import {useLayoutEffect,useRef,useState} from 'react';
import type {RefObject} from 'react';

/** Fit fixed-size native scenes using their existing 12px inset and zoom. */
export function usePreviewFit(
  host:RefObject<HTMLElement|null>,
  width:number,
  height:number,
  minimum=.1,
  zoom=1,
) {
  const [fit,setFit]=useState(1);
  const measure=useRef(()=>{});
  measure.current=()=>{
    if(!host.current)return;
    const box=host.current.getBoundingClientRect();
    setFit(Math.max(minimum,Math.min(1,(box.width-12)/width,(box.height-12)/height)*zoom));
  };
  useLayoutEffect(()=>{
    const observer=new ResizeObserver(()=>measure.current());
    observer.observe(host.current!);
    return ()=>observer.disconnect();
  },[host]);
  useLayoutEffect(()=>measure.current(),[host,width,height,minimum,zoom]);
  return fit;
}
