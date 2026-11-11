import {glassGenerateCss} from './glass-generate-css';
export type GlassGenerateSettings={label:string;fontSize:number;paddingX:number;paddingY:number;blur:number;hoverScale:number;pressTilt:number;backgroundColor:string;glassColor:string;inkColor:string;showGrid:boolean;gridSize:number;gridOpacity:number;disabled:boolean};
export const defaultGlassGenerate:GlassGenerateSettings={label:'Generate',fontSize:16,paddingX:1.5,paddingY:.875,blur:2,hoverScale:.975,pressTilt:25,backgroundColor:'#f1f1f1',glassColor:'#ffffff',inkColor:'#323232',showGrid:true,gridSize:30,gridOpacity:.15,disabled:false};
export const glassGenerateNumbers=[
 {key:'fontSize',zh:'按钮字号',en:'Font size',min:12,max:40,step:1,unit:'px'},
 {key:'paddingX',zh:'水平内边距',en:'Horizontal padding',min:.75,max:3,step:.025,unit:'em'},
 {key:'paddingY',zh:'垂直内边距',en:'Vertical padding',min:.4,max:1.5,step:.025,unit:'em'},
 {key:'blur',zh:'背景模糊',en:'Backdrop blur',min:0,max:8,step:.1,unit:'px'},
 {key:'hoverScale',zh:'悬停缩放',en:'Hover scale',min:.9,max:1,step:.005,unit:''},
 {key:'pressTilt',zh:'按压倾角',en:'Press tilt',min:0,max:40,step:1,unit:'°'},
 {key:'gridSize',zh:'点阵间距',en:'Dot spacing',min:12,max:60,step:1,unit:'px'},
 {key:'gridOpacity',zh:'点阵浓度',en:'Dot opacity',min:0,max:.4,step:.01,unit:''},
] as const;
export function validateGlassGenerate(value:unknown):GlassGenerateSettings{
 const keys=Object.keys(defaultGlassGenerate);
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(value,k)??{},'value')))throw Error('玻璃生成按钮字段不完整或含未知字段。');
 const s=value as GlassGenerateSettings;
 if(typeof s.label!=='string'||!s.label.trim()||Array.from(s.label).length>32||/[\u0000-\u001f\u007f-\u009f<>]/.test(s.label))throw Error('按钮文案须为 1–32 个有效字符。');
 for(const c of glassGenerateNumbers)if(typeof s[c.key]!=='number'||!Number.isFinite(s[c.key])||s[c.key]<c.min||s[c.key]>c.max||['fontSize','pressTilt','gridSize'].includes(c.key)&&!Number.isInteger(s[c.key]))throw Error('玻璃按钮数值无效：'+c.key);
 for(const key of ['backgroundColor','glassColor','inkColor'] as const)if(typeof s[key]!=='string'||!/^#[\da-f]{6}$/i.test(s[key]))throw Error('玻璃按钮颜色无效。');
 for(const key of ['showGrid','disabled'] as const)if(typeof s[key]!=='boolean')throw Error('玻璃按钮开关无效。');
 return structuredClone(s);
}
export type GlassGenerateRuntime={enabled:boolean;interactive?:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;language:'zh'|'en';onRunning?:(running:boolean)=>void;onActivate?:()=>void};
function glassGenerateEngine(css:string){
 function create(host:HTMLElement,initial:GlassGenerateSettings,initialRuntime:GlassGenerateRuntime){
  let settings=initial,runtime=initialRuntime,dead=false,raf=0,last=0,reported=false,pointer=false,focused=false,pressed=false,activations=0,demo:null|{age:number;phase:number}=null;
  const style=document.createElement('style');style.textContent=css;host.appendChild(style);host.classList.add('ugb-stage');
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('class','ugb-grid');svg.setAttribute('aria-hidden','true');
  const defs=document.createElementNS(ns,'defs'),pattern=document.createElementNS(ns,'pattern'),circle=document.createElementNS(ns,'circle'),rect=document.createElementNS(ns,'rect');
  const id='ugb-'+(globalThis.crypto?.randomUUID?.()??Math.random().toString(36).slice(2));pattern.id=id;pattern.setAttribute('patternUnits','userSpaceOnUse');circle.setAttribute('r','1');circle.setAttribute('cx','2');circle.setAttribute('cy','2');circle.setAttribute('fill','#000000');pattern.appendChild(circle);defs.appendChild(pattern);rect.setAttribute('width','100%');rect.setAttribute('height','100%');rect.setAttribute('fill',`url(#${id})`);svg.append(defs,rect);host.appendChild(svg);
  const wrap=document.createElement('div');wrap.className='ugb-wrap';const button=document.createElement('button');button.className='ugb-button';button.type='button';const label=document.createElement('span');button.appendChild(label);const shadow=document.createElement('div');shadow.className='ugb-shadow';shadow.setAttribute('aria-hidden','true');wrap.append(button,shadow);host.appendChild(wrap);
  const listeners:Array<[EventTarget,string,EventListener]>=[],listen=(node:EventTarget,type:string,fn:(e:any)=>void)=>{node.addEventListener(type,fn);listeners.push([node,type,fn])};
  const allowed=()=>runtime.enabled&&!runtime.paused&&!document.hidden&&runtime.speed>0&&!runtime.reduced;
  const interactive=()=>(runtime.enabled||runtime.interactive)&&!runtime.paused&&!document.hidden&&runtime.speed>0&&!settings.disabled;
  const animations=()=>host.getAnimations({subtree:true});
  const pending=(list:Animation[])=>list.some(a=>a.playState==='running'||a.playState==='paused'||a.pending);
  function report(value:boolean){host.dataset.running=String(value);if(reported!==value){reported=value;runtime.onRunning?.(value)}}
  function sync(list=animations()){
   for(const a of list){if(a.playState==='finished'||a.playState==='idle')continue;if(a.playbackRate!==(runtime.speed||1))a.playbackRate=runtime.speed||1;if(!allowed()){if(a.playState!=='paused')a.pause()}else if(a.playState==='paused')a.play()}
   return list;
  }
  function cancelFrame(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
  function wake(){if(dead)return;const list=sync(),work=!!demo||pending(list);report(allowed()&&work);if(!allowed()||!work){cancelFrame();return}if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
  function paint(){
   const hover=pointer||focused||!!demo&&demo.phase<3,active=pressed||demo?.phase===1;
   button.dataset.hover=String(hover);button.dataset.pressed=String(active);host.dataset.hover=String(hover);host.dataset.pressed=String(active);host.dataset.demo=String(!!demo);host.dataset.activations=String(activations);host.dataset.paused=String(runtime.paused);host.dataset.reduced=String(runtime.reduced);host.dataset.enabled=String(runtime.enabled);host.dataset.elapsed=String(Math.round(demo?.age??0));
   void button.offsetWidth;wake();
  }
  function frame(now:number){
   raf=0;if(!allowed()){wake();return}const dt=Math.max(0,now-last)*runtime.speed;last=now;
   if(demo){demo.age+=dt;const hold=runtime.durationMs*1.25+400,release=hold+Math.max(200,runtime.durationMs),leave=release+300;const phase=demo.age<hold?0:demo.age<release?1:demo.age<leave?2:3;if(phase!==demo.phase){demo.phase=phase;paint()}if(phase===3&&!pending(animations())){demo=null;host.dataset.demo='false'}host.dataset.elapsed=String(Math.round(demo?.age??0))}
   const work=!!demo||pending(sync());report(allowed()&&work);if(work&&!raf)raf=requestAnimationFrame(frame);else if(!work)last=0;
  }
  function manual(){demo=null}
  function appearance(){
   const rgb=settings.glassColor.slice(1).match(/../g)!.map(v=>parseInt(v,16)).join(',');
   const variables={'--ugb-background':settings.backgroundColor,'--ugb-font-size':settings.fontSize+'px','--ugb-ink':settings.inkColor,'--ugb-glass-rgb':rgb,'--ugb-padding-x':settings.paddingX+'em','--ugb-padding-y':settings.paddingY+'em','--ugb-hover-scale':String(settings.hoverScale),'--ugb-press-tilt':settings.pressTilt+'deg','--ugb-blur':settings.blur+'px','--ugb-duration':runtime.durationMs+'ms'};
   for(const [key,value] of Object.entries(variables))host.style.setProperty(key,value);
   button.disabled=settings.disabled;button.inert=!runtime.enabled&&!runtime.interactive;label.textContent=settings.label;svg.toggleAttribute('hidden',!settings.showGrid);pattern.setAttribute('width',String(settings.gridSize));pattern.setAttribute('height',String(settings.gridSize));circle.setAttribute('opacity',String(settings.gridOpacity));host.dataset.settings=JSON.stringify(settings);host.dataset.ready='true';host.dataset.reduced=String(runtime.reduced);
  }
  function settle(){demo=null;pointer=focused=pressed=false;host.dataset.settling='true';appearance();paint();for(const a of animations())a.cancel();void button.offsetWidth;host.dataset.settling='false';cancelFrame();report(false)}
  listen(button,'pointerenter',e=>{if(!interactive()||e.pointerType==='touch')return;manual();pointer=true;paint()});
  listen(button,'pointerleave',()=>{pointer=false;paint()});listen(button,'pointerdown',e=>{if(!interactive()||e.button!==0)return;manual();pressed=true;paint()});
  listen(document,'pointerup',()=>{if(!pressed)return;pressed=false;paint()});listen(button,'pointercancel',()=>{pressed=false;pointer=false;paint()});
  listen(button,'focus',()=>{if(!interactive())return;manual();focused=true;paint()});listen(button,'blur',()=>{focused=pressed=false;paint()});
  listen(button,'keydown',e=>{if(!interactive()||e.repeat)return;if(e.key===' '||e.key==='Enter'){manual();pressed=true;paint()}else if(e.key==='Escape'){manual();pressed=focused=false;button.blur();paint()}});
  listen(button,'keyup',e=>{if(e.key===' '||e.key==='Enter'){pressed=false;paint()}});
  listen(button,'click',()=>{if(!interactive())return;manual();button.focus({preventScroll:true});activations++;host.dataset.activations=String(activations);runtime.onActivate?.();paint()});
  listen(document,'visibilitychange',wake);appearance();settle();
  return {
   demonstrate(){if(!allowed()||settings.disabled||pointer||focused)return;demo={age:0,phase:0};pressed=false;paint()},settle,
   update(next:GlassGenerateSettings,nextRuntime:GlassGenerateRuntime){settings=next;runtime=nextRuntime;if(runtime.reduced||settings.disabled)demo=null;if(settings.disabled)pointer=focused=pressed=false;appearance();paint()},
   getState(){return {pointer,focused,pressed,activations,demonstrating:!!demo,running:reported,animations:animations().map(a=>({time:a.currentTime,playState:a.playState}))}},
   destroy(){if(dead)return;dead=true;cancelFrame();for(const a of animations())a.cancel();listeners.forEach(([node,type,fn])=>node.removeEventListener(type,fn));report(false);host.replaceChildren();host.classList.remove('ugb-stage')},
  };
 }
 return {create};
}
const engine=glassGenerateEngine(glassGenerateCss);
export const createGlassGenerate=engine.create;
export const glassGenerateEngineCode=`/* From Uiverse.io by shokat_2650. MIT; retain the accompanying notice. */\nconst glassGenerateEngine=((__name)=>(${glassGenerateEngine.toString()}))((fn)=>fn)(${JSON.stringify(glassGenerateCss)});\nconst createGlassGenerate=glassGenerateEngine.create;`;
