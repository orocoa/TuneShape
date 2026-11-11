import {wavingCardCss,wavingCardSvg} from './waving-card-assets';
export type WavingCardSettings={name:string;description:string;angleX:number;angleY:number;cardWidth:number;padding:number;radius:number;titleSize:number;bodySize:number;colorA:string;colorB:string;colorC:string;textColor:string;backgroundColor:string;waveAngle:number;waveMs:number;showHand:boolean};
export const defaultWavingCard:WavingCardSettings={name:'orocoa',description:'Passionate about creating, beautiful and functional websites',angleX:15,angleY:20,cardWidth:240,padding:24,radius:8,titleSize:16,bodySize:8,colorA:'#acfae9',colorB:'#d58feb',colorC:'#f27ef1',textColor:'#1f1f1f',backgroundColor:'#f1f1f1',waveAngle:25,waveMs:350,showHand:true};
export const wavingCardNumbers=[
 {key:'angleX',zh:'上下倾角',en:'Vertical tilt',min:0,max:35,step:1,unit:'°'},
 {key:'angleY',zh:'左右倾角',en:'Horizontal tilt',min:0,max:40,step:1,unit:'°'},
 {key:'waveMs',zh:'挥手单程',en:'Wave half-cycle',min:100,max:1500,step:10,unit:'ms'},
 {key:'waveAngle',zh:'挥手角度',en:'Wave angle',min:0,max:50,step:1,unit:'°'},
 {key:'cardWidth',zh:'卡片宽度',en:'Card width',min:180,max:420,step:1,unit:'px'},
 {key:'padding',zh:'卡片内边距',en:'Card padding',min:12,max:40,step:1,unit:'px'},
 {key:'radius',zh:'卡片圆角',en:'Corner radius',min:0,max:40,step:1,unit:'px'},
 {key:'titleSize',zh:'标题字号',en:'Title size',min:12,max:28,step:1,unit:'px'},
 {key:'bodySize',zh:'说明字号',en:'Description size',min:8,max:18,step:1,unit:'px'},
] as const;
export function validateWavingCard(value:unknown):WavingCardSettings{
 const keys=Object.keys(defaultWavingCard);
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(value,k)??{},'value')))throw Error('倾斜挥手卡片字段不完整或含未知字段。');
 const s=value as WavingCardSettings;
 for(const [key,max] of [['name',32],['description',160]] as const)if(typeof s[key]!=='string'||!s[key].trim()||Array.from(s[key]).length>max||/[\u0000-\u001f\u007f-\u009f<>]/.test(s[key]))throw Error('卡片文案长度或字符无效。');
 for(const c of wavingCardNumbers)if(typeof s[c.key]!=='number'||!Number.isInteger(s[c.key])||s[c.key]<c.min||s[c.key]>c.max)throw Error('卡片数值无效：'+c.key);
 for(const key of ['colorA','colorB','colorC','textColor','backgroundColor'] as const)if(typeof s[key]!=='string'||!/^#[\da-f]{6}$/i.test(s[key]))throw Error('卡片颜色无效。');
 if(typeof s.showHand!=='boolean')throw Error('挥手开关无效。');return structuredClone(s);
}
export function wavingCardRegionAngles(region:number,angleX:number,angleY:number){if(!Number.isInteger(region)||region<1||region>15)return {x:0,y:0};return {x:[angleX,0,-angleX][Math.floor((region-1)/5)],y:((region-1)%5-2)*angleY/2};}
export type WavingCardRuntime={enabled:boolean;interactive?:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;language:'zh'|'en';onRunning?:(running:boolean)=>void};
function wavingCardEngine(css:string,svg:string){
 function create(host:HTMLElement,initial:WavingCardSettings,initialRuntime:WavingCardRuntime){
  let settings=initial,runtime=initialRuntime,dead=false,raf=0,last=0,reported=false,pointer=false,focused=false,region=8,demo:null|{age:number;phase:number}=null;
  const style=document.createElement('style');style.textContent=css;host.appendChild(style);host.classList.add('wc-stage');
  const container=document.createElement('div');container.className='wc-container';container.tabIndex=0;container.setAttribute('role','group');
  const hover=document.createElement('div');hover.className='wc-hover';hover.setAttribute('aria-hidden','true');for(let i=1;i<=15;i++){const part=document.createElement('div');part.className='wc-part wc-part-'+i;part.dataset.region=String(i);hover.appendChild(part)}
  const card=document.createElement('div');card.className='wc-card';const say=document.createElement('div');say.className='wc-say';say.innerHTML=svg;say.setAttribute('aria-hidden','true');const title=document.createElement('div');title.className='wc-title';const description=document.createElement('div');description.className='wc-description';card.append(say,title,description);container.append(hover,card);host.appendChild(container);
  const listeners:Array<[EventTarget,string,EventListener]>=[],listen=(node:EventTarget,type:string,fn:(e:any)=>void)=>{node.addEventListener(type,fn);listeners.push([node,type,fn])};
  const allowed=()=>runtime.enabled&&!runtime.paused&&!document.hidden&&runtime.speed>0&&!runtime.reduced;
  const interactive=()=>(runtime.enabled||runtime.interactive)&&!runtime.paused&&!document.hidden&&runtime.speed>0;
  const animations=()=>host.getAnimations({subtree:true});
  const pending=(list:Animation[])=>list.some(a=>a.playState==='running'||a.playState==='paused'||a.pending);
  function report(value:boolean){host.dataset.running=String(value);if(reported!==value){reported=value;runtime.onRunning?.(value)}}
  function sync(){const list=animations();for(const a of list){if(a.playState==='finished'||a.playState==='idle')continue;if(a.playbackRate!==(runtime.speed||1))a.playbackRate=runtime.speed||1;if(!allowed()){if(a.playState!=='paused')a.pause()}else if(a.playState==='paused')a.play()}return list}
  function cancelFrame(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
  function wake(){if(dead)return;host.dataset.motionAllowed=String(allowed());const work=!!demo||pending(sync());report(allowed()&&work);if(!allowed()||!work){cancelFrame();return}if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
  function paint(){const active=pointer||focused||!!demo&&demo.phase<5;container.dataset.active=String(active);container.dataset.region=String(active?region:0);host.dataset.region=container.dataset.region;host.dataset.active=String(active);host.dataset.demo=String(!!demo);host.dataset.elapsed=String(Math.round(demo?.age??0));host.dataset.paused=String(runtime.paused);host.dataset.reduced=String(runtime.reduced);host.dataset.enabled=String(runtime.enabled);void card.offsetWidth;wake()}
  function frame(now:number){raf=0;if(!allowed()){wake();return}const dt=Math.max(0,now-last)*runtime.speed;last=now;if(demo){demo.age+=dt;const step=Math.max(350,runtime.durationMs*1.25),phase=Math.min(5,Math.floor(demo.age/step));if(phase!==demo.phase){demo.phase=phase;region=[1,5,15,11,8,0][phase];paint()}if(phase===5&&!pending(animations())){demo=null;host.dataset.demo='false'}host.dataset.elapsed=String(Math.round(demo?.age??0))}const work=!!demo||pending(sync());report(allowed()&&work);if(work&&!raf)raf=requestAnimationFrame(frame);else if(!work)last=0}
  function appearance(){const variables={'--wc-angle-x':settings.angleX+'deg','--wc-angle-y':settings.angleY+'deg','--wc-width':settings.cardWidth+'px','--wc-padding':settings.padding+'px','--wc-radius':settings.radius+'px','--wc-title-size':settings.titleSize+'px','--wc-body-size':settings.bodySize+'px','--wc-color-a':settings.colorA,'--wc-color-b':settings.colorB,'--wc-color-c':settings.colorC,'--wc-ink':settings.textColor,'--wc-background':settings.backgroundColor,'--wc-wave-angle':settings.waveAngle+'deg','--wc-wave-ms':settings.waveMs+'ms','--wc-duration':runtime.durationMs+'ms'};for(const [key,value]of Object.entries(variables))host.style.setProperty(key,value);title.textContent="Hi, I'm "+settings.name;description.textContent=settings.description;container.setAttribute('aria-label',title.textContent);container.inert=!runtime.enabled&&!runtime.interactive;container.setAttribute('aria-keyshortcuts','ArrowUp ArrowDown ArrowLeft ArrowRight Enter Space Escape');host.dataset.settings=JSON.stringify(settings);host.dataset.showHand=String(settings.showHand);host.dataset.ready='true'}
  function settle(){demo=null;pointer=focused=false;region=8;host.dataset.settling='true';appearance();paint();for(const a of animations())a.cancel();void card.offsetWidth;host.dataset.settling='false';cancelFrame();report(false)}
  function point(e:PointerEvent){const b=container.getBoundingClientRect(),col=Math.max(0,Math.min(4,Math.floor((e.clientX-b.left)/b.width*5))),row=Math.max(0,Math.min(2,Math.floor((e.clientY-b.top)/b.height*3)));region=row*5+col+1}
  function demonstrate(){if(!allowed())return;pointer=focused=false;region=1;demo={age:0,phase:0};paint()}
  listen(container,'pointerenter',e=>{if(!interactive()||e.pointerType==='touch')return;demo=null;pointer=true;point(e);paint()});
  listen(container,'pointermove',e=>{if(!interactive()||e.pointerType==='touch')return;demo=null;pointer=true;point(e);paint()});
  listen(container,'pointerleave',()=>{pointer=false;paint()});listen(container,'pointercancel',()=>{pointer=false;demo=null;paint()});
  listen(container,'pointerdown',e=>{if(!interactive()||e.button!==0||e.pointerType!=='touch')return;if(runtime.reduced){focused=true;region=8;paint()}else demonstrate()});
  listen(container,'focus',()=>{if(!interactive())return;demo=null;focused=true;region=8;paint()});listen(container,'blur',()=>{focused=false;paint()});
  listen(container,'keydown',e=>{if(!interactive())return;if(e.key==='Escape'){e.preventDefault();container.blur();settle();return}if(e.key==='Enter'||e.key===' '){e.preventDefault();if(runtime.reduced){focused=true;paint()}else demonstrate();return}if(e.key.startsWith('Arrow')){e.preventDefault();demo=null;focused=true;const col=(Math.max(1,region)-1)%5,row=Math.floor((Math.max(1,region)-1)/5);region=e.key==='ArrowLeft'?row*5+Math.max(0,col-1)+1:e.key==='ArrowRight'?row*5+Math.min(4,col+1)+1:e.key==='ArrowUp'?Math.max(0,row-1)*5+col+1:Math.min(2,row+1)*5+col+1;paint()}});
  listen(document,'visibilitychange',wake);appearance();settle();
  return {demonstrate,settle,update(next:WavingCardSettings,nextRuntime:WavingCardRuntime){settings=next;runtime=nextRuntime;if(runtime.reduced)demo=null;appearance();paint()},getState(){return{pointer,focused,region,demonstrating:!!demo,running:reported,animations:animations().map(a=>({time:a.currentTime,playState:a.playState}))}},destroy(){if(dead)return;dead=true;cancelFrame();for(const a of animations())a.cancel();listeners.forEach(([node,type,fn])=>node.removeEventListener(type,fn));report(false);host.replaceChildren();host.classList.remove('wc-stage')}};
 }
 return {create};
}
export const createWavingCard=wavingCardEngine(wavingCardCss,wavingCardSvg).create;
export const wavingCardEngineCode=`/* From Uiverse.io by MuhammadHasann. MIT; retain the accompanying notice and Greeen Yang design credit. */\nconst wavingCardEngine=((__name)=>(${wavingCardEngine.toString()}))((fn)=>fn)(${JSON.stringify(wavingCardCss)},${JSON.stringify(wavingCardSvg)});\nconst createWavingCard=wavingCardEngine.create;`;
