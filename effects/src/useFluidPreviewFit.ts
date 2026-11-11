import {useLayoutEffect,useRef,useState} from 'react';
import type {RefObject} from 'react';

/** Keep native coordinates while filling the real preview slot at any aspect ratio. */
export function useFluidPreviewFit(host:RefObject<HTMLElement|null>,zoom=1){
 const [size,setSize]=useState({height:420,fit:1}),measure=useRef(()=>{});
 measure.current=()=>{const e=host.current;if(!e||!e.clientWidth||!e.clientHeight)return;const height=720*e.clientHeight/e.clientWidth,fit=e.clientWidth/720*zoom;setSize(old=>Math.abs(old.height-height)<.1&&Math.abs(old.fit-fit)<.0001?old:{height,fit})};
 useLayoutEffect(()=>{const observer=new ResizeObserver(()=>measure.current());observer.observe(host.current!);measure.current();return()=>observer.disconnect()},[host]);
 useLayoutEffect(()=>measure.current(),[zoom]);
 return size;
}
