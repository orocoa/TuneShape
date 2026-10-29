export type NativeEffectRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;delayMs?:number;loop?:boolean;language:'zh'|'en';onRunning?:(running:boolean)=>void;onChange?:(value:unknown)=>void};
/** Small authored DOM/clock primitives, shared by live previews and exported engines. */
export function nativeEffectTools(){
 function clock(initial:NativeEffectRuntime,tick:(dt:number)=>boolean,host:HTMLElement){
  let runtime=initial,frame=0,last=0,active=false,dead=false;
  const allowed=()=>!dead&&runtime.enabled&&!runtime.paused&&!runtime.reduced&&runtime.speed>0&&!document.hidden;
  const report=(value:boolean)=>{if(active===value)return;active=value;host.dataset.running=String(value);runtime.onRunning?.(value)};
  function cancel(){if(frame)cancelAnimationFrame(frame);frame=0;last=0}
  function request(){if(!frame&&active&&allowed())frame=requestAnimationFrame(run)}
  function run(now:number){frame=0;if(!allowed())return;const dt=last?Math.min(64,now-last)*runtime.speed:0;last=now;if(tick(dt))request();else{last=0;report(false)}}
  function visibility(){cancel();request()}
  document.addEventListener('visibilitychange',visibility);host.dataset.running='false';
  return {wake(){report(true);request()},sleep(){cancel();report(false)},update(next:NativeEffectRuntime){runtime=next;cancel();host.dataset.paused=String(next.paused||!next.enabled);request()},destroy(){dead=true;cancel();report(false);document.removeEventListener('visibilitychange',visibility)}};
 }
 function element<K extends keyof HTMLElementTagNameMap>(tag:K,cls='',text?:string){const node=document.createElement(tag);node.className=cls;if(text!==undefined)node.textContent=text;return node}
 function install(host:HTMLElement,cls:string,css:string){host.classList.add(cls);const style=element('style');style.textContent=css;host.appendChild(style);return style}
 function icon(name:'menu'|'close'|'search'|'grid'|'person'|'settings'|'logout'){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','20');svg.setAttribute('height','20');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
  const paths={menu:'M4 6h16M4 12h16M4 18h16',close:'m6 6 12 12M6 18 18 6',search:'M16 16l5 5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',settings:'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',logout:'M9 3H3v18h6M10 12h11M17 8l4 4-4 4'};
  const path=document.createElementNS(ns,'path');path.setAttribute('d',paths[name]);svg.appendChild(path);return svg;
 }
 const clamp=(value:number,min=0,max=1)=>Math.max(min,Math.min(max,value));
 const ease=(p:number)=>1-Math.pow(1-clamp(p),3);
 function spring(position:number,velocity:number,target:number,dt:number,duration:number,bounce:number){const w=10/Math.max(.08,duration/1000),z=1-bounce*.85,t=dt/1000,y=position-target;if(z>.9999){const b=velocity+w*y,e=Math.exp(-w*t);return {position:target+(y+b*t)*e,velocity:(velocity-w*b*t)*e}}const a=z*w,d=w*Math.sqrt(1-z*z),b=(velocity+a*y)/d,e=Math.exp(-a*t),c=Math.cos(d*t),s=Math.sin(d*t);return {position:target+e*(y*c+b*s),velocity:e*((-a*y+b*d)*c+(-a*b-y*d)*s)}}
 return {clock,element,install,icon,clamp,ease,spring};
}
export const nativeToolsCode=`const tools=((__name)=>(${nativeEffectTools.toString()}))((fn)=>fn)();`;
