import {Children,cloneElement,forwardRef,isValidElement,useLayoutEffect,useRef} from 'react';
import type {ReactElement} from 'react';
import {useUiBench} from './context';
import type {UiContext} from './context';

/** Only the small value/binding API used by the pinned MIT blocks. Timelines
 * use the shared clock; DOM transitions use pausable native animations. */
export class BenchValue{
 private value:number;private listeners=new Set<()=>void>();animation?:{stop:()=>void};
 constructor(value:number){this.value=value}
 get(){return this.value}
 set(value:number){if(value===this.value)return;this.value=value;this.listeners.forEach(fn=>fn())}
 onChange(fn:()=>void){this.listeners.add(fn);return()=>{this.listeners.delete(fn)}}
 stop(){this.animation?.stop();this.animation=undefined}
}
export function useMotionValue(value:number){const ref=useRef<BenchValue|null>(null);return ref.current??(ref.current=new BenchValue(value))}
export function useTransform(input:BenchValue,fn:(value:number)=>number):BenchValue;
export function useTransform(input:BenchValue[],fn:(values:number[])=>number):BenchValue;
export function useTransform(input:BenchValue,range:number[],output:number[]):BenchValue;
export function useTransform(input:BenchValue|BenchValue[],fn:any,output?:number[]){
 const sources=Array.isArray(input)?input:[input],compute=()=>typeof fn==='function'?fn(Array.isArray(input)?sources.map(x=>x.get()):sources[0].get()):mapRange(sources[0].get(),fn,output!);
 const latest=useRef(compute);latest.current=compute;const value=useMotionValue(compute());
 useLayoutEffect(()=>{const update=()=>value.set(latest.current());const cleanups=sources.map(s=>s.onChange(update));update();return()=>cleanups.forEach(clean=>clean())},sources);
 useLayoutEffect(()=>value.set(latest.current()));return value;
}
function mapRange(value:number,range:number[],out:number[]){let i=0;while(i<range.length-2&&value>range[i+1])i++;const t=Math.max(0,Math.min(1,(value-range[i])/Math.max(1e-8,range[i+1]-range[i])));return out[i]+(out[i+1]-out[i])*t}
export type Transition={type?:string;stiffness?:number;damping?:number;mass?:number;duration?:number;delay?:number;ease?:string|number[];times?:number[]};
export function springProgress(t:number,k=420,c=30,m=.5){
 const w=Math.sqrt(k/m),z=c/(2*Math.sqrt(k*m));
 if(z<.999){const d=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(d*t)+z*w/d*Math.sin(d*t))}
 if(z<=1.001)return 1-Math.exp(-w*t)*(1+w*t);
 const s=Math.sqrt(c*c-4*m*k),a=(-c+s)/(2*m),b=(-c-s)/(2*m);return 1-(b*Math.exp(a*t)-a*Math.exp(b*t))/(b-a);
}
function duration(t:Transition){return t.duration??(t.type==='spring'?Math.max(.2,Math.min(1.8,10/Math.max(8,(t.damping??30)/(2*(t.mass??.5))))):.3)}
function bezier(x:number,p:number[]){let a=0,b=1;for(let i=0;i<13;i++){const t=(a+b)/2,u=1-t,v=3*u*u*t*p[0]+3*u*t*t*p[2]+t*t*t;if(v<x)a=t;else b=t}const t=(a+b)/2,u=1-t;return 3*u*u*t*p[1]+3*u*t*t*p[3]+t*t*t}
function ease(t:number,transition:Transition){if(transition.type==='spring')return springProgress(t*duration(transition),transition.stiffness,transition.damping,transition.mass);if(Array.isArray(transition.ease))return bezier(t,transition.ease);if(transition.ease==='linear')return t;return 1-Math.pow(1-t,3)}
export function createValueAnimator(bench:UiContext){return (value:BenchValue,target:number|number[],transition:Transition={})=>{
 value.stop();const values=Array.isArray(target)?target:[value.get(),target],final=values.at(-1)!,start=bench.clock.performance.now()+(transition.delay??0)*1000,ms=duration(transition)*1000,times=transition.times??values.map((_,i)=>i/(values.length-1));let raf=0,stopped=false;
 const control={stop(){stopped=true;bench.clock.cancel(raf)}};value.animation=control;
 if(bench.runtime.reduced){value.set(final);return control}
 const tick=(now:number)=>{if(stopped)return;const progress=Math.max(0,Math.min(1,(now-start)/ms));let n=0;while(n<times.length-2&&progress>times[n+1])n++;const local=Math.max(0,Math.min(1,(progress-times[n])/Math.max(.00001,times[n+1]-times[n])));value.set(values[n]+(values[n+1]-values[n])*ease(local,transition));if(progress<1)raf=bench.clock.request(tick);else{value.set(final);value.animation=undefined}};
 raf=bench.clock.request(tick);return control;
}}
const transforms=new Set(['x','y','scale','scaleX','scaleY','rotate']);
const unitless=new Set(['opacity','zIndex','fontWeight','flexGrow','flexShrink']);
function transform(data:Record<string,any>){return `translate(${typeof data.x==='string'?data.x:(data.x??0)+'px'},${typeof data.y==='string'?data.y:(data.y??0)+'px'}) rotate(${data.rotate??0}deg) scale(${data.scale??1}) scaleX(${data.scaleX??1}) scaleY(${data.scaleY??1})`}
function css(data:Record<string,any>){const out:Record<string,any>={};for(const [k,v]of Object.entries(data))if(!transforms.has(k)&&k!=='transition')out[k]=typeof v==='number'&&!unitless.has(k)&&!k.startsWith('--')?v+'px':v;if(Object.keys(data).some(k=>transforms.has(k)))out.transform=transform(data);return out}
function assign(node:HTMLElement,values:Record<string,any>){for(const [key,value]of Object.entries(css(values))){if(key.startsWith('--'))node.style.setProperty(key,String(value));else (node.style as any)[key]=value}}
export type Controls={start:(definition:Record<string,any>)=>Promise<void>;stop:()=>void;connect:(fn:(definition:Record<string,any>)=>Promise<void>)=>()=>void};
export function useAnimationControls():Controls{
 const handler=useRef<((d:Record<string,any>)=>Promise<void>)|undefined>(undefined),controls=useRef<Controls|null>(null);
 return controls.current??(controls.current={start:d=>handler.current?.(d)??Promise.resolve(),stop(){void handler.current?.({})},connect(fn){handler.current=fn;return()=>{handler.current=undefined}}});
}
function motionTag(tag:string){return forwardRef<HTMLElement,any>(function ManagedMotion({style={},initial,animate,transition={},exit,onAnimationComplete,...props},ref){
 const bench=useUiBench(),node=useRef<HTMLElement|null>(null),animations=useRef<Animation[]>([]),first=useRef(true),latest=useRef({style,transition,onAnimationComplete});latest.current={style,transition,onAnimationComplete};
 const resolve=()=>Object.fromEntries(Object.entries(latest.current.style).map(([k,v])=>[k,v instanceof BenchValue?v.get():v]));
 const run=(definition:Record<string,any>,given:Transition=latest.current.transition)=>{
  const el=node.current;if(!el)return Promise.resolve();const {transition:own,...targets}=definition;const t:Transition=own??given;
  const target=Object.fromEntries(Object.entries(targets).map(([k,v])=>[k,Array.isArray(v)?v.at(-1):v]));
  const before=getComputedStyle(el),start:Record<string,any>={};for(const key of Object.keys(css(target)))start[key]=(before as any)[key];
  animations.current.forEach(a=>a.cancel());animations.current=[];assign(el,target);
  if(bench.runtime.reduced||!bench.runtime.enabled||bench.runtime.paused||document.hidden||!Object.keys(target).length||first.current&&initial===false)return Promise.resolve();
  const count=Math.max(2,...Object.values(targets).filter(Array.isArray).map(v=>v.length));let frames:Keyframe[];
  if(count>2)frames=Array.from({length:count},(_,i)=>css(Object.fromEntries(Object.entries(targets).map(([k,v])=>[k,Array.isArray(v)?v[Math.min(i,v.length-1)]:v]))));
  else frames=[start,css(target)];
  const easing=t.type==='spring'?`linear(${Array.from({length:41},(_,i)=>springProgress(i/40*duration(t),t.stiffness,t.damping,t.mass).toFixed(5)).join(',')})`:Array.isArray(t.ease)?`cubic-bezier(${t.ease.join(',')})`:t.ease==='linear'?'linear':'cubic-bezier(.22,1,.36,1)';
  const a=el.animate(frames,{duration:duration(t)*1000,delay:(t.delay??0)*1000,easing,fill:'both'});animations.current.push(a);a.playbackRate=bench.runtime.speed*600/bench.runtime.durationMs;if(!bench.runtime.enabled||bench.runtime.paused||document.hidden)a.pause();bench.activity((duration(t)+(t.delay??0))*1000);bench.sync();
  return a.finished.then(()=>{a.cancel();latest.current.onAnimationComplete?.()},()=>{});
 };
 useLayoutEffect(()=>{const values=Object.values(style).filter(v=>v instanceof BenchValue) as BenchValue[],paint=()=>{if(node.current)assign(node.current,resolve())};const cleanups=values.map(v=>v.onChange(paint));paint();return()=>cleanups.forEach(clean=>clean())},[...Object.values(style).filter(v=>v instanceof BenchValue)]);
 const signature=animate&&typeof animate.connect!=='function'?JSON.stringify(animate):'';
 useLayoutEffect(()=>{
  if(animate&&typeof animate.connect==='function'){first.current=false;return animate.connect((d:Record<string,any>)=>run(d))}
  if(animate){if(first.current){if(initial&&typeof initial==='object')assign(node.current!,initial);else{assign(node.current!,animate);first.current=false;return}}void run(animate)}first.current=false;
 },[signature]);
 useLayoutEffect(()=>()=>animations.current.forEach(a=>a.cancel()),[]);
 const normalStyle=css(Object.fromEntries(Object.entries(style).filter(([,v])=>!(v instanceof BenchValue))));
 const Component=tag as any;return <Component {...props} style={normalStyle} ref={(el:HTMLElement|null)=>{node.current=el;if(typeof ref==='function')ref(el);else if(ref)ref.current=el}}/>;
 })}
export const motion={div:motionTag('div'),span:motionTag('span'),button:motionTag('button'),i:motionTag('i')};
/** The pinned meter only needs one keyed digit per clipped wheel. Retain its
 * incoming blur/settle; the wheel clips the outgoing value as it is replaced. */
export function AnimatePresence({children}:any){return <>{Children.map(children,(child:any)=>isValidElement(child)?cloneElement(child as ReactElement<any>):child)}</>}
