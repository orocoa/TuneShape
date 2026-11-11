/** Adapted from Uiverse.io / Admin12121, soft-falcon-79, MIT. */
export const menuIcons=['home','games','chat','search','profile'] as const;
export type MenuIcon=typeof menuIcons[number];
export type ExpandingMenuSettings={items:{id:string;label:string;icon:MenuIcon}[];closedWidth:number;expandedWidth:number;height:number;iconSize:number;radius:number;itemRadius:number;backgroundColor:string;surfaceColor:string;highlightColor:string;inkColor:string;shadow:number};
export const defaultExpandingMenu:ExpandingMenuSettings={items:menuIcons.map((icon,index)=>({id:icon,label:['Home','Games','Chat','Search','Profile'][index],icon})),closedWidth:70,expandedWidth:130,height:50,iconSize:28,radius:15,itemRadius:8,backgroundColor:'#f1f1f1',surfaceColor:'#ffffff',highlightColor:'#eeeeee',inkColor:'#242424',shadow:.075};
export const menuNumberControls=[
 {key:'closedWidth',zh:'收起宽度',en:'Collapsed width',min:52,max:96,step:1,unit:'px'},
 {key:'expandedWidth',zh:'展开宽度',en:'Expanded width',min:110,max:240,step:1,unit:'px'},
 {key:'height',zh:'菜单项高度',en:'Item height',min:40,max:72,step:1,unit:'px'},
 {key:'iconSize',zh:'图标尺寸',en:'Icon size',min:20,max:32,step:1,unit:'px'},
 {key:'radius',zh:'菜单圆角',en:'Menu radius',min:0,max:28,step:1,unit:'px'},
 {key:'itemRadius',zh:'高亮圆角',en:'Highlight radius',min:0,max:24,step:1,unit:'px'},
 {key:'shadow',zh:'阴影浓度',en:'Shadow opacity',min:0,max:.2,step:.005,unit:''},
] as const;
export function validateExpandingMenu(value:unknown):ExpandingMenuSettings{
 const record=(v:unknown,keys:string[])=>!!v&&typeof v==='object'&&Object.getPrototypeOf(v)===Object.prototype&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value'));
 if(!record(value,Object.keys(defaultExpandingMenu)))throw Error('展开菜单字段不完整或含未知字段。');
 const s=value as ExpandingMenuSettings;
 if(!Array.isArray(s.items)||Object.getPrototypeOf(s.items)!==Array.prototype||s.items.length<1||s.items.length>8||Reflect.ownKeys(s.items).length!==s.items.length+1)throw Error('菜单须有 1–8 项。');
 const ids=new Set<string>();
 for(let i=0;i<s.items.length;i++){
  const d=Object.getOwnPropertyDescriptor(s.items,String(i));
  if(!d||!Object.hasOwn(d,'value')||!record(d.value,['id','label','icon']))throw Error('菜单项目字段无效。');
  const item=d.value;
  if(typeof item.id!=='string'||!/^[a-zA-Z0-9_-]{1,40}$/.test(item.id)||ids.has(item.id)||typeof item.label!=='string'||!item.label.trim()||Array.from(item.label).length>24||/[\u0000-\u001f\u007f-\u009f<>]/.test(item.label)||!menuIcons.includes(item.icon))throw Error('菜单项目须有独立标识、1–24 字标签和有效图标。');
  ids.add(item.id);
 }
 for(const c of menuNumberControls)if(typeof s[c.key]!=='number'||!Number.isFinite(s[c.key])||s[c.key]<c.min||s[c.key]>c.max||c.key!=='shadow'&&!Number.isInteger(s[c.key]))throw Error('菜单尺寸或阴影无效：'+c.key);
 for(const key of ['backgroundColor','surfaceColor','highlightColor','inkColor'] as const)if(typeof s[key]!=='string'||!/^#[\da-f]{6}$/i.test(s[key]))throw Error('菜单颜色无效。');
 return structuredClone(s);
}
export type ExpandingMenuRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;language:'zh'|'en';onRunning?:(running:boolean)=>void;onSelect?:(index:number,label:string)=>void};
function expandingMenuEngine(){
 const icons:Record<string,string>={"home":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" fill=\"currentColor\" viewBox=\"0 0 256 256\" > <rect width=\"256\" height=\"256\" fill=\"none\"></rect> <path d=\"M213.3815,109.61945,133.376,36.88436a8,8,0,0,0-10.76339.00036l-79.9945,72.73477A8,8,0,0,0,40,115.53855V208a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V115.53887A8,8,0,0,0,213.3815,109.61945Z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\" ></path> </svg>","games":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" fill=\"currentColor\" viewBox=\"0 0 256 256\" > <rect width=\"256\" height=\"256\" fill=\"none\"></rect> <polyline points=\"76.201 132.201 152.201 40.201 216 40 215.799 103.799 123.799 179.799\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\" ></polyline> <line x1=\"100\" y1=\"156\" x2=\"160\" y2=\"96\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\" ></line> <path d=\"M82.14214,197.45584,52.201,227.397a8,8,0,0,1-11.31371,0L28.603,215.11268a8,8,0,0,1,0-11.31371l29.94113-29.94112a8,8,0,0,0,0-11.31371L37.65685,141.65685a8,8,0,0,1,0-11.3137l12.6863-12.6863a8,8,0,0,1,11.3137,0l76.6863,76.6863a8,8,0,0,1,0,11.3137l-12.6863,12.6863a8,8,0,0,1-11.3137,0L93.45584,197.45584A8,8,0,0,0,82.14214,197.45584Z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\" ></path> </svg>","chat":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" fill=\"currentColor\" viewBox=\"0 0 256 256\" > <rect width=\"256\" height=\"256\" fill=\"none\"></rect> <path d=\"M45.42853,176.99811A95.95978,95.95978,0,1,1,79.00228,210.5717l.00023-.001L45.84594,220.044a8,8,0,0,1-9.89-9.89l9.47331-33.15657Z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\" ></path> <line x1=\"96\" y1=\"112\" x2=\"160\" y2=\"112\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\" ></line> <line x1=\"96\" y1=\"144\" x2=\"160\" y2=\"144\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\" ></line> </svg>","search":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" fill=\"currentColor\" viewBox=\"0 0 256 256\" > <rect width=\"256\" height=\"256\" fill=\"none\"></rect> <circle cx=\"116\" cy=\"116\" r=\"84\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\" ></circle> <line x1=\"175.39356\" y1=\"175.40039\" x2=\"223.99414\" y2=\"224.00098\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\" ></line> </svg>","profile":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" fill=\"currentColor\" viewBox=\"0 0 256 256\" > <rect width=\"256\" height=\"256\" fill=\"none\"></rect> <circle cx=\"128\" cy=\"96\" r=\"64\" fill=\"none\" stroke=\"currentColor\" stroke-miterlimit=\"10\" stroke-width=\"16\" ></circle> <path d=\"M30.989,215.99064a112.03731,112.03731,0,0,1,194.02311.002\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\" ></path> </svg>"};
 const css=`.expanding-menu-stage{width:100%;height:100%;display:flex;align-items:center;justify-content:center;isolation:isolate;font-family:inherit}.expanding-menu{display:flex;justify-content:center;position:relative;width:max-content;padding:8px;box-sizing:content-box;flex:none}.expanding-menu .em-link{all:unset;box-sizing:border-box;position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;flex:none;overflow:hidden;transform-origin:center left;cursor:pointer;touch-action:manipulation;font:inherit;font-size:16px;line-height:1.25}.expanding-menu .em-highlight{position:absolute;inset:0;z-index:-1;pointer-events:none}.expanding-menu .em-icon{position:absolute;display:block;flex-shrink:0;pointer-events:none}.expanding-menu .em-icon svg{display:block;width:100%;height:100%}.expanding-menu .em-title{display:block;width:100%;white-space:nowrap;text-align:center;pointer-events:none}.expanding-menu .em-link:focus-visible{outline:2px solid currentColor;outline-offset:-3px}`;
 // The CSS reference uses ease-in = cubic-bezier(.42, 0, 1, 1).
 function ease(t:number){let lo=0,hi=1,u=t;for(let i=0;i<18;i++){u=(lo+hi)/2;const x=3*(1-u)*(1-u)*u*.42+3*(1-u)*u*u+u*u*u;if(x<t)lo=u;else hi=u}return 3*(1-u)*u*u+u*u*u}
 function create(host:HTMLElement,initial:ExpandingMenuSettings,initialRuntime:ExpandingMenuRuntime){
  let settings=initial,runtime=initialRuntime,dead=false,raf=0,last=0,pointer=-1,focused=-1,selected=-1,demo:null|{age:number;index:number}=null,reported=false;
  let buttons:HTMLButtonElement[]=[],values:number[]=[],tweens:({from:number;to:number;age:number}|null)[]=[];
  const style=document.createElement('style');style.textContent=css;host.appendChild(style);host.classList.add('expanding-menu-stage');
  const nav=document.createElement('nav');nav.className='expanding-menu';host.appendChild(nav);
  const listeners:Array<[EventTarget,string,EventListener]>=[],listen=(target:EventTarget,type:string,fn:(e:any)=>void)=>{target.addEventListener(type,fn);listeners.push([target,type,fn])};
  const available=()=>runtime.enabled&&!runtime.paused&&!document.hidden&&runtime.speed>0;
  const moving=()=>!!demo||tweens.some(Boolean);
  function report(){const running=available()&&!runtime.reduced&&moving();host.dataset.running=String(running);if(reported!==running){reported=running;runtime.onRunning?.(running)}}
  function paint(){
   buttons.forEach((b,i)=>{const p=values[i]??0;b.style.width=(settings.closedWidth+(settings.expandedWidth-settings.closedWidth)*p)+'px';b.style.height=settings.height+'px';b.style.borderRadius=settings.itemRadius+'px';b.setAttribute('aria-expanded',String(target(i)===1));if(i===selected)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');const icon=b.querySelector<HTMLElement>('.em-icon')!,title=b.querySelector<HTMLElement>('.em-title')!,bg=b.querySelector<HTMLElement>('.em-highlight')!;icon.style.width=icon.style.height=settings.iconSize+'px';icon.style.left=((settings.closedWidth-settings.iconSize)/2-3)+'px';title.style.textIndent=settings.iconSize+'px';title.style.transform=bg.style.transform=`translateX(${(1-p)*100}%)`;bg.style.background=settings.highlightColor;bg.style.borderRadius=settings.itemRadius+'px'});
   host.dataset.expansion=JSON.stringify(values.map(v=>Math.round(v*100000)/100000));host.dataset.selected=String(selected);host.dataset.demo=String(!!demo);host.dataset.paused=String(runtime.paused);host.dataset.reduced=String(runtime.reduced);
  }
  function target(i:number){return i===pointer||i===focused||i===demo?.index?1:0}
  function cancelFrame(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
  function wake(){if(dead)return;report();if(!available()||runtime.reduced||!moving()){cancelFrame();return}if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
  function retarget(){
   for(let i=0;i<buttons.length;i++){const to=target(i);if(runtime.reduced){values[i]=to;tweens[i]=null}else if(tweens[i]?.to!==to&&Math.abs(values[i]-to)>.00001)tweens[i]={from:values[i],to,age:0};else if(Math.abs(values[i]-to)<=.00001){values[i]=to;tweens[i]=null}}
   paint();wake();
  }
  function frame(now:number){
   raf=0;if(dead||!available()){cancelFrame();report();return}const dt=Math.max(0,now-last)*runtime.speed;last=now;
   if(demo){demo.age+=dt;const index=Math.floor(demo.age/(runtime.durationMs+400));if(index>=buttons.length){demo=null;retarget()}else if(index!==demo.index){demo.index=index;retarget()}}
   for(let i=0;i<tweens.length;i++){const tween=tweens[i];if(!tween)continue;tween.age+=dt;const t=Math.min(1,tween.age/Math.max(1,runtime.durationMs));values[i]=tween.from+(tween.to-tween.from)*ease(t);if(t>=1){values[i]=tween.to;tweens[i]=null}}
   paint();report();if(moving()&&!raf)raf=requestAnimationFrame(frame);else if(!moving())last=0;
  }
  function manual(){demo=null;runtime.onRunning?.(false)}
  function indexOf(e:Event){const b=(e.target as HTMLElement)?.closest?.('.em-link');return b&&nav.contains(b)?buttons.indexOf(b as HTMLButtonElement):-1}
  function rows(){nav.replaceChildren();buttons=settings.items.map(item=>{const b=document.createElement('button');b.type='button';b.className='em-link';b.setAttribute('aria-label',item.label);const bg=document.createElement('span');bg.className='em-highlight';bg.setAttribute('aria-hidden','true');const icon=document.createElement('span');icon.className='em-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=icons[item.icon];const title=document.createElement('span');title.className='em-title';title.textContent=item.label;b.append(bg,icon,title);nav.appendChild(b);return b});values=buttons.map(()=>0);tweens=buttons.map(()=>null)}
  function appearance(){host.style.background=settings.backgroundColor;host.style.color=settings.inkColor;nav.style.background=settings.surfaceColor;nav.style.borderRadius=settings.radius+'px';nav.style.boxShadow=`0 10px 25px 0 rgba(0,0,0,${settings.shadow})`;nav.setAttribute('aria-label',runtime.language==='en'?'Expanding icon navigation':'图标展开导航');nav.inert=!runtime.enabled;host.dataset.settings=JSON.stringify(settings);host.dataset.ready='true'}
  listen(nav,'pointerover',e=>{if(!available()||e.pointerType==='touch')return;const i=indexOf(e);if(i<0||i===pointer)return;manual();pointer=i;retarget()});
  listen(nav,'pointerleave',()=>{pointer=-1;retarget()});listen(nav,'pointercancel',()=>{pointer=-1;retarget()});
  listen(nav,'focusin',e=>{if(!available())return;manual();focused=indexOf(e);retarget()});
  listen(nav,'focusout',e=>{focused=nav.contains(e.relatedTarget)?buttons.indexOf(e.relatedTarget):-1;retarget()});
  listen(nav,'click',e=>{if(!available())return;const i=indexOf(e);if(i<0)return;manual();selected=i;focused=i;buttons[i].focus({preventScroll:true});runtime.onSelect?.(i,settings.items[i].label);retarget()});
  listen(nav,'keydown',e=>{if(!available())return;const i=indexOf(e);if(i<0)return;const next=e.key==='ArrowRight'?Math.min(i+1,buttons.length-1):e.key==='ArrowLeft'?Math.max(i-1,0):e.key==='Home'?0:e.key==='End'?buttons.length-1:-1;if(next>=0){e.preventDefault();manual();pointer=-1;buttons[next].focus()}else if(e.key==='Escape'){e.preventDefault();manual();pointer=focused=-1;buttons[i].blur();retarget()}});
  listen(document,'visibilitychange',()=>wake());
  rows();appearance();paint();
  return {
   demonstrate(){if(pointer>=0||focused>=0||!available()||runtime.reduced){report();return}pointer=focused=-1;demo={age:0,index:0};retarget()},
   settle(){demo=null;pointer=focused=-1;values=buttons.map(()=>0);tweens=buttons.map(()=>null);cancelFrame();paint();report()},
   update(next:ExpandingMenuSettings,nextRuntime:ExpandingMenuRuntime){const changed=JSON.stringify(next.items)!==JSON.stringify(settings.items);settings=next;runtime=nextRuntime;if(changed){demo=null;pointer=focused=selected=-1;rows()}if(runtime.reduced)demo=null;appearance();retarget()},
   getState(){return {values:[...values],selected,pointer,focused,demonstrating:!!demo,running:reported}},
   destroy(){if(dead)return;dead=true;cancelFrame();runtime.onRunning?.(false);listeners.forEach(([target,type,fn])=>target.removeEventListener(type,fn));host.replaceChildren();host.classList.remove('expanding-menu-stage')},
  };
 }
 return {create,ease};
}
const engine=expandingMenuEngine();
export const createExpandingMenu=engine.create,expandingMenuEase=engine.ease;
export const expandingMenuEngineCode=`/* From Uiverse.io by Admin12121. MIT; retain the accompanying source notice. */\nconst expandingMenuEngine=((__name)=>(${expandingMenuEngine.toString()}))((fn)=>fn)();\nconst createExpandingMenu=expandingMenuEngine.create;`;
