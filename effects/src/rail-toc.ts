/** Independently implemented reading rail. No Rare UI source or registry dependency. */
export type RailItem={id:string;label:string;depth:number;body:string};
export type RailSettings={title:string;items:RailItem[];initialIndex:number;indent:number;rowHeight:number;fontSize:number;offset:number;planeSize:number;accentColor:string;theme:'light'|'dark';showContent:boolean};
export type RailRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;language:'zh'|'en';onRunning?:(running:boolean)=>void;onHeight?:(height:number)=>void;onSelect?:(id:string)=>void};
export type RailBinding={container?:HTMLElement;resolve?:(id:string)=>HTMLElement|null};
export type RailPoint={x:number;y:number};
export const defaultRail:Readonly<RailSettings>={title:'On this page',items:[
 {id:'installation',label:'Installation',depth:0,body:'Start with a clear path. The contents list keeps every section within reach.'},
 {id:'prerequisites',label:'Prerequisites',depth:1,body:'Gather the essentials before you begin. Related sections sit one step inside their parent.'},
 {id:'installation-steps',label:'Installation Steps',depth:1,body:'Take one step at a time. Select a heading to jump directly to its place in the article.'},
 {id:'configuration',label:'Configuration',depth:1,body:'Choose the spacing and reading position that suit your page.'},
 {id:'usage',label:'Usage',depth:0,body:'Read at your own pace. The paper plane follows your progress along the rail.'},
 {id:'customizing-content',label:'Customizing Content',depth:1,body:'Give each section a useful name. Short, concrete labels make a long page easier to explore.'},
 {id:'submenu-content',label:'Submenu Content',depth:2,body:'Use a deeper level for details that belong together. The rail bends to reflect the hierarchy.'},
 {id:'features',label:'Features',depth:0,body:'Return to any section whenever you need it. Scrolling upward turns the plane around.'},
 ],initialIndex:0,indent:14,rowHeight:32,fontSize:14,offset:96,planeSize:16,accentColor:'#333333',theme:'light',showContent:false};
export const railRanges={indent:[0,28,1],rowHeight:[28,48,1],fontSize:[12,18,1],offset:[0,160,1],planeSize:[12,24,1]} as const;
export function validateRail(value:unknown):RailSettings{
 const plain=(v:unknown,keys:string[])=>{
  if(!v||typeof v!=='object'||Object.getPrototypeOf(v)!==Object.prototype||Reflect.ownKeys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value')))throw Error('轨道目录字段不完整或含未知字段。');
 };
 plain(value,Object.keys(defaultRail));const v=value as RailSettings;
 const text=(s:unknown,min:number,max:number)=>typeof s==='string'&&s.trim().length>=min&&Array.from(s).length<=max&&!/[\u0000-\u001f\u007f-\u009f<>]/u.test(s);
 if(!text(v.title,1,40))throw Error('目录标题须为 1–40 个可见字符。');
 for(const [key,[min,max]] of Object.entries(railRanges)){const n=v[key as keyof typeof railRanges];if(!Number.isInteger(n)||n<min||n>max)throw Error(`轨道目录 ${key} 超出范围。`)}
 if(!Array.isArray(v.items)||Object.getPrototypeOf(v.items)!==Array.prototype||v.items.length<1||v.items.length>12||Reflect.ownKeys(v.items).length!==v.items.length+1)throw Error('目录须有 1–12 个条目。');
 const ids=new Set<string>();
 for(let i=0;i<v.items.length;i++){
  const descriptor=Object.getOwnPropertyDescriptor(v.items,String(i));if(!descriptor||!Object.hasOwn(descriptor,'value'))throw Error('目录条目须为连续的普通数据。');
  const item=descriptor.value as RailItem;plain(item,['id','label','depth','body']);
  if(typeof item.id!=='string'||!/^[a-z][a-z0-9-]{0,47}$/.test(item.id)||ids.has(item.id)||!text(item.label,1,60)||!text(item.body,0,500)||!Number.isInteger(item.depth)||item.depth<0||item.depth>2)throw Error('目录条目、层级或标识无效。');
  ids.add(item.id);
 }
 if(!Number.isInteger(v.initialIndex)||v.initialIndex<0||v.initialIndex>=v.items.length||typeof v.accentColor!=='string'||!/^#[0-9a-f]{6}$/i.test(v.accentColor)||!['light','dark'].includes(v.theme)||typeof v.showContent!=='boolean')throw Error('目录起始章节、配色或预览设置无效。');
 return structuredClone(v);
}
/** A compact editor format; IDs are retained by matching prior labels where possible. */
export function railItemsText(items:RailItem[]){return items.map(i=>'>'.repeat(i.depth)+(i.depth?' ':'')+i.label+(i.body?' | '+i.body:'')).join('\n')}
export function parseRailItems(text:string,previous:RailItem[]=defaultRail.items):RailItem[]{
 const lines=text.split(/\r?\n/).filter(line=>line.trim()),used=new Set<string>();
 const items=lines.map((line,index)=>{
  const match=line.trim().match(/^(>{0,2})\s*([^|]+?)(?:\s*\|\s*(.*))?$/);if(!match)throw Error('每行填写一个条目，开头最多两个 > 表示层级。');
  const label=match[2].trim(),old=previous.find(i=>i.label===label&&!used.has(i.id));let id=old?.id??'section-'+(index+1),suffix=1;
  while(used.has(id))id='section-'+(index+1)+'-'+suffix++;used.add(id);
  return {id,label,depth:match[1].length,body:match[3]?.trim()??''};
 });
 return validateRail({...defaultRail,items,initialIndex:0}).items;
}

function railEngine(){
 let instance=0;
 const css=`.rail-toc-stage{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;container-type:inline-size;--rail-ink:#333333;--rail-muted:#919191;--rail-line:#b5b5b5;color:var(--rail-ink);font-family:inherit;isolation:isolate}
 .rail-toc-stage[data-theme=dark]{background:#171717;--rail-muted:#919191;--rail-line:#666}
 .rail-toc-layout{width:max-content;max-width:calc(100% - 48px);display:grid;gap:24px;align-items:start;min-width:0}
 .rail-toc-stage[data-content=true] .rail-toc-layout{width:calc(100% - 40px);grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;max-width:700px}
 .rail-toc-nav{min-width:0;width:100%;box-sizing:border-box;padding-left:8px;font-size:14px;line-height:1.35;align-self:center}
 .rail-toc-title{display:flex;align-items:center;gap:9px;margin:0 0 12px!important;font-size:inherit!important;line-height:1.35!important;font-weight:500;color:var(--rail-muted);overflow-wrap:anywhere}
 .rail-toc-title svg{flex:none;width:14px;height:14px}
 .rail-toc-list{position:relative;list-style:none;padding:0!important;margin:0!important}
 .rail-toc-list li{list-style:none;padding:0;margin:0;position:relative}
 .rail-toc-list .rail-toc-link{all:unset;display:block;width:100%;box-sizing:border-box;cursor:pointer;line-height:1.35;font:inherit;line-height:1.35;color:var(--rail-muted);overflow-wrap:anywhere;touch-action:manipulation;font-weight:400}
 .rail-toc-list .rail-toc-link:hover{color:var(--rail-ink)}.rail-toc-list .rail-toc-link[aria-current]{color:var(--rail-ink);font-weight:550}
 .rail-toc-list .rail-toc-link:focus-visible{outline:2px solid var(--rail-ink);outline-offset:2px;border-radius:3px}.rail-toc-list .rail-toc-link:disabled{cursor:default;opacity:1}
 .rail-toc-art{position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:1}
 .rail-toc-reader{position:relative;box-sizing:border-box;height:280px;min-width:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#bcbcbc transparent;outline-offset:3px;padding:4px 12px 0 10px;font-size:12px;line-height:1.75;color:var(--rail-muted);touch-action:pan-y}
 .rail-toc-reader[hidden]{display:none}.rail-toc-reader section{min-height:190px;padding:8px 0 30px;overflow-wrap:anywhere}.rail-toc-reader h3{font-family:inherit;font-size:15px;font-weight:550;line-height:1.4;color:var(--rail-ink);margin:0 0 12px}.rail-toc-reader p{font-size:12px;line-height:1.75;margin:0;color:var(--rail-muted)}
 @container(max-width:440px){.rail-toc-stage[data-content=true] .rail-toc-layout{grid-template-columns:minmax(0,1fr);width:calc(100% - 48px)}.rail-toc-stage[data-content=true] .rail-toc-nav{max-width:260px;justify-self:center}.rail-toc-reader{height:180px;padding-inline:4px}}
 .rail-controls .rail-text-field{display:grid;gap:9px;margin:18px 0;font-size:12px}.rail-controls .rail-text-field input,.rail-controls textarea{width:100%;min-width:0;border:1px solid var(--line,#ddd);border-radius:5px;padding:9px 10px;background:transparent;color:inherit;font:inherit;line-height:1.65}.rail-controls textarea{resize:vertical;min-height:190px}.rail-controls .rail-editor-hint{font-size:11px;color:var(--muted,#777);line-height:1.7;margin-top:8px}.rail-controls .rail-error{font-size:11px;color:#b52323;margin-top:8px}.rail-controls details{margin-top:20px}.rail-controls summary{cursor:pointer;font-size:12px;color:var(--muted,#777);margin-bottom:18px}`;
 function geometry(nodes:RailPoint[]){
  const points:RailPoint[]=[],lengths:number[]=[],nodeLengths:number[]=[];let total=0;
  const push=(p:RailPoint)=>{if(points.length){const a=points.at(-1)!;total+=Math.hypot(p.x-a.x,p.y-a.y)}points.push(p);lengths.push(total)};
  if(nodes.length){push({x:nodes[0].x,y:0});push(nodes[0]);nodeLengths.push(total)}
  for(let i=1;i<nodes.length;i++){const a=nodes[i-1],b=nodes[i];if(a.x!==b.x){const bevel=Math.min(12,(b.y-a.y)*.28);push({x:a.x,y:a.y+bevel});push({x:b.x,y:b.y-bevel})}push(b);nodeLengths.push(total)}
  return {points,lengths,nodeLengths,total,path:points.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' ')};
 }
 function at(g:ReturnType<typeof geometry>,distance:number):RailPoint{
  if(!g.points.length)return {x:0,y:0};const d=Math.max(0,Math.min(g.total,distance));let i=1;while(i<g.lengths.length-1&&g.lengths[i]<d)i++;
  const a=g.points[Math.max(0,i-1)],b=g.points[i]??a,f=(d-(g.lengths[i-1]??0))/((g.lengths[i]??0)-(g.lengths[i-1]??0)||1);return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};
 }
 function pose(g:ReturnType<typeof geometry>,index:number){
  if(!g.nodeLengths.length)return {x:0,y:0,angle:180,distance:0};const p=Math.max(0,Math.min(g.nodeLengths.length-1,index)),i=Math.floor(p),a=g.nodeLengths[i],b=g.nodeLengths[Math.min(i+1,g.nodeLengths.length-1)],distance=a+(b-a)*(p-i),point=at(g,distance),behind=at(g,distance-.5),ahead=at(g,distance+.5);
  return {...point,distance,angle:Math.atan2(ahead.y-behind.y,ahead.x-behind.x)*180/Math.PI+90};
 }
 function spring(position:number,velocity:number,target:number,dt:number,duration:number){const w=9/Math.max(.08,duration/1000),delta=position-target,b=velocity+w*delta,e=Math.exp(-w*dt);return {position:target+(delta+b*dt)*e,velocity:(velocity-w*b*dt)*e}}
 /** Anchor sweeps toward the viewport bottom near the end so the final heading remains reachable. */
 function readingIndex(tops:number[],scroll:number,view:number,height:number,offset:number){
  const available=Math.max(0,height-view),remaining=Math.max(0,available-scroll),baseline=Math.min(offset,Math.max(0,scroll)),line=baseline+Math.max(0,view-baseline-remaining),anchor=scroll+line;
  let i=0;for(let n=0;n<tops.length;n++)if(Number.isFinite(tops[n])&&tops[n]<=anchor)i=n;
  if(i>=tops.length-1)return Math.max(0,tops.length-1);const span=tops[i+1]-tops[i];return i+(span>0?Math.max(0,Math.min(1,(anchor-tops[i])/span)):0);
 }
 function create(host:HTMLElement,initial:RailSettings,initialRuntime:RailRuntime,initialBinding?:RailBinding){
  const prefix='reading-rail-'+(++instance);let settings=initial,runtime=initialRuntime,binding=initialBinding,g=geometry([]),position=initial.initialIndex,velocity=0,target=position,heading=180,headingV=0,facing=1,peak=position,raf=0,last=0,dead=false,reported:boolean|null=null,pinned:number|null=null,scrollMoving=false,scrollPosition=0,scrollTarget=0,scrollV=0,demo:null|{age:number;returning:boolean}=null;
  const style=document.createElement('style');style.textContent=css;host.appendChild(style);host.classList.add('rail-toc-stage');
  const layout=document.createElement('div');layout.className='rail-toc-layout';host.appendChild(layout);
  const nav=document.createElement('nav');nav.className='rail-toc-nav';nav.dataset.slot='rail-toc';layout.appendChild(nav);
  const title=document.createElement('p');title.className='rail-toc-title';title.dataset.slot='rail-toc-title';nav.appendChild(title);
  const ns='http://www.w3.org/2000/svg',makeSvg=(tag:string,attrs:Record<string,string>={})=>{const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n};
  const titleIcon=makeSvg('svg',{viewBox:'0 0 16 16',fill:'none',stroke:'currentColor','stroke-width':'1.4','aria-hidden':'true'});titleIcon.appendChild(makeSvg('path',{d:'M2 4H14 M2 8H10 M2 12H12'}));const titleText=document.createElement('span');title.append(titleIcon,titleText);
  const list=document.createElement('ul');list.className='rail-toc-list';list.dataset.slot='rail-toc-list';nav.appendChild(list);
  const svg=makeSvg('svg',{class:'rail-toc-art','aria-hidden':'true'}),defs=makeSvg('defs'),mask=makeSvg('mask',{id:prefix+'-mask',maskUnits:'userSpaceOnUse',x:'-20',y:'-20',width:'400',height:'3000'}),maskBase=makeSvg('rect',{x:'-20',y:'-20',width:'400',height:'3000',fill:'white'}),hole=makeSvg('circle',{r:'5',fill:'black'}),nodeHoles=makeSvg('g');mask.append(maskBase,hole,nodeHoles);
  const dotMask=makeSvg('mask',{id:prefix+'-dots',maskUnits:'userSpaceOnUse',x:'-20',y:'-20',width:'400',height:'3000'}),dotHole=makeSvg('circle',{r:'5',fill:'black'});dotMask.append(makeSvg('rect',{x:'-20',y:'-20',width:'400',height:'3000',fill:'white'}),dotHole);defs.append(mask,dotMask);svg.appendChild(defs);
  const railGroup=makeSvg('g',{mask:`url(#${prefix}-mask)`}),dashed=makeSvg('path',{fill:'none',stroke:'var(--rail-line)','stroke-width':'1.25','stroke-dasharray':'2 5','stroke-linecap':'round','stroke-linejoin':'round'}),filled=makeSvg('path',{fill:'none',stroke:'var(--rail-ink)','stroke-width':'1.25','stroke-linejoin':'round'}),dots=makeSvg('g',{mask:`url(#${prefix}-dots)`});railGroup.append(dashed,filled);svg.append(railGroup,dots);
  const plane=makeSvg('g',{'data-slot':'rail-toc-plane'});plane.appendChild(makeSvg('path',{d:'M0 -8 L5.8 6 L0 3.2 L-5.8 6 Z M0 -8 L0 3.2',fill:'var(--rail-ink)',stroke:'var(--rail-ink)','stroke-width':'.8','stroke-linejoin':'round'}));svg.appendChild(plane);
  const reader=document.createElement('article');reader.className='rail-toc-reader';reader.tabIndex=0;layout.appendChild(reader);
  let buttons:HTMLButtonElement[]=[],rows:HTMLLIElement[]=[],headings:HTMLElement[]=[],dotNodes:SVGElement[]=[],listenTarget:HTMLElement|Window|null=null;
  function available(){return runtime.enabled&&!runtime.paused&&!document.hidden&&!dead}
  function moving(){return Math.abs(position-target)>.0001||Math.abs(velocity)>.001||Math.abs(headingV)>.05||scrollMoving||!!demo}
  function report(){const running=available()&&!runtime.reduced&&runtime.speed>0&&moving();if(reported!==running){reported=running;runtime.onRunning?.(running)}host.dataset.running=String(running)}
  function request(){if(!raf&&available()&&!runtime.reduced&&runtime.speed>0&&moving()){last=performance.now();raf=requestAnimationFrame(tick)}report()}
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0}
  function internal(){return !binding&&settings.showContent}
  function container(){return binding?(binding.container??window):reader}
  function scrollTop(){return binding&&!binding.container?window.scrollY:(container() as HTMLElement).scrollTop}
  function writeScroll(top:number){const c=container();if(c===window)window.scrollTo({top,behavior:'instant'});else (c as HTMLElement).scrollTop=top}
  function scrollMetrics(){const c=container(),isWindow=c===window,element=c as HTMLElement;return {top:scrollTop(),view:isWindow?window.innerHeight:element.clientHeight,height:isWindow?document.documentElement.scrollHeight:element.scrollHeight}}
  function targetElements(){return binding?settings.items.map(item=>binding!.resolve?binding!.resolve(item.id):document.getElementById(item.id)):headings}
  function tops(){if(!binding)return headings.map(n=>n.offsetTop);const m=scrollMetrics(),origin=binding.container?.getBoundingClientRect().top??0;return targetElements().map(n=>n?n.getBoundingClientRect().top-origin+m.top:Infinity)}
  function aim(next:number){
   target=Math.max(0,Math.min(settings.items.length-1,next));const d=(target-peak)*facing;
   if(d>0)peak=target;else if(Math.abs(target-peak)*settings.rowHeight>2){facing*=-1;peak=target}
   if(runtime.reduced){position=target;velocity=0}render();request();
  }
  function render(){
   const p=pose(g,position),desired=p.angle+(facing<0?180:0),angle=desired+360*Math.round((heading-desired)/360);if(runtime.reduced){heading=angle;headingV=0}
   plane.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${heading}) scale(${settings.planeSize/16})`);[hole,dotHole].forEach(n=>{n.setAttribute('cx',String(p.x));n.setAttribute('cy',String(p.y));n.setAttribute('r',String(settings.planeSize*.34))});
   filled.setAttribute('stroke-dasharray',`${p.distance} ${g.total+1}`);const active=Math.max(0,Math.min(settings.items.length-1,Math.floor(position+.001)));
   buttons.forEach((button,i)=>{if(i===active)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');button.disabled=!runtime.enabled||runtime.paused;const covered=i<=position+.001;dotNodes[i]?.setAttribute('fill',covered?'var(--rail-ink)':'none');dotNodes[i]?.setAttribute('stroke',covered?'var(--rail-ink)':'var(--rail-line)')});
   host.dataset.active=String(active);host.dataset.position=position.toFixed(5);host.dataset.target=target.toFixed(5);host.dataset.facing=String(facing);host.dataset.heading=heading.toFixed(3);host.dataset.paused=String(runtime.paused);host.dataset.pinned=pinned===null?'':String(pinned);
   return angle;
  }
  function measure(){
   const nodes=rows.map((row,i)=>({x:6+settings.items[i].depth*settings.indent,y:row.offsetTop+row.offsetHeight/2}));g=geometry(nodes);dashed.setAttribute('d',g.path);filled.setAttribute('d',g.path);svg.setAttribute('width',String(Math.max(16,...nodes.map(p=>p.x+10))));svg.setAttribute('height',String(list.offsetHeight));
   dots.replaceChildren();nodeHoles.replaceChildren();dotNodes=nodes.map(p=>{const dot=makeSvg('circle',{cx:String(p.x),cy:String(p.y),r:'3.1','stroke-width':'1.25'});dots.appendChild(dot);nodeHoles.appendChild(makeSvg('circle',{cx:String(p.x),cy:String(p.y),r:'4',fill:'black'}));return dot});
   if(!raf){heading=pose(g,position).angle+(facing<0?180:0);headingV=0}render();
   runtime.onHeight?.(nav.offsetHeight+(internal()&&host.clientWidth<=440?reader.clientHeight+24:0)+56);
  }
  function content(){
   const focused=buttons.indexOf(document.activeElement as HTMLButtonElement);list.replaceChildren();reader.replaceChildren();rows=[];buttons=[];headings=[];
   settings.items.forEach((item,i)=>{
    const row=document.createElement('li'),button=document.createElement('button');button.type='button';button.className='rail-toc-link';button.dataset.railIndex=String(i);button.textContent=item.label;row.appendChild(button);list.appendChild(row);rows.push(row);buttons.push(button);
    const section=document.createElement('section'),h=document.createElement('h3'),body=document.createElement('p');h.id=prefix+'-'+item.id;h.textContent=item.label;body.textContent=item.body;section.append(h,body);reader.appendChild(section);headings.push(h);if(internal())button.setAttribute('aria-controls',h.id);
   });list.appendChild(svg);if(focused>=0)buttons[Math.min(focused,buttons.length-1)]?.focus();
  }
  function syncScroll(){if(!available()||(!binding&&!internal()))return;if(pinned!==null){aim(pinned);return}const m=scrollMetrics();aim(readingIndex(tops(),m.top,m.view,m.height,settings.offset))}
  function intent(){if(!available())return;pinned=null;scrollMoving=false;scrollV=0;demo=null;syncScroll()}
  function scrollKey(event:Event){const key=(event as KeyboardEvent).key;if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(key))intent()}
  function scrollToIndex(index:number){
   if(!binding&&!internal())return;const target=tops()[index];if(!Number.isFinite(target))return;const m=scrollMetrics();if(!scrollMoving)scrollPosition=m.top;scrollTarget=Math.max(0,Math.min(m.height-m.view,target-settings.offset));scrollMoving=Math.abs(scrollTarget-scrollPosition)>.25;if(runtime.reduced){writeScroll(scrollTarget);scrollPosition=scrollTarget;scrollMoving=false;scrollV=0}
  }
  function select(index:number,manual=true){if(!available()||index<0||index>=settings.items.length)return;if(manual)demo=null;pinned=index;aim(index);scrollToIndex(index);request();if(manual)runtime.onSelect?.(settings.items[index].id)}
  function click(event:MouseEvent){const button=(event.target as Element).closest<HTMLButtonElement>('.rail-toc-link');if(!button||!nav.contains(button))return;event.stopPropagation();select(Number(button.dataset.railIndex))}
  function keyboard(event:KeyboardEvent){const i=buttons.indexOf(event.target as HTMLButtonElement);if(i<0||!available())return;let next:number;
   if(event.key==='ArrowDown'||event.key==='ArrowRight')next=Math.min(buttons.length-1,i+1);else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=Math.max(0,i-1);else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;
   event.preventDefault();event.stopPropagation();buttons[next].focus();select(next);
  }
  function wheel(event:WheelEvent){
   if(!runtime.enabled)return;if(runtime.paused){event.preventDefault();return}if(binding)return;if(reader.contains(event.target as Node))return;
   event.preventDefault();intent();if(internal())reader.scrollTop+=event.deltaY;else aim(target+event.deltaY/(settings.rowHeight*4));
  }
  function tick(now:number){
   raf=0;if(!available())return;const dt=Math.min(.064,Math.max(0,(now-last)/1000))*runtime.speed;last=now;
   if(demo){demo.age+=dt*1000;if(!demo.returning&&demo.age>=runtime.durationMs+650){demo.returning=true;select(settings.initialIndex,false)}if(demo&&demo.age>=runtime.durationMs*2+1300)demo=null}
   const p=spring(position,velocity,target,dt,runtime.durationMs);position=p.position;velocity=p.velocity;if(Math.abs(position-target)<.0001&&Math.abs(velocity)<.001){position=target;velocity=0}
   if(scrollMoving){const s=spring(scrollPosition,scrollV,scrollTarget,dt,runtime.durationMs);scrollPosition=s.position;scrollV=s.velocity;writeScroll(scrollPosition);if(Math.abs(scrollPosition-scrollTarget)<.25&&Math.abs(scrollV)<1){writeScroll(scrollTarget);scrollPosition=scrollTarget;scrollV=0;scrollMoving=false}}
   const angle=render(),turn=spring(heading,headingV,angle,dt,Math.min(300,runtime.durationMs*.6));heading=turn.position;headingV=turn.velocity;if(Math.abs(heading-angle)<.02&&Math.abs(headingV)<.05){heading=angle;headingV=0}render();request();
  }
  function bind(){
   if(listenTarget){listenTarget.removeEventListener('scroll',syncScroll);listenTarget.removeEventListener('wheel',intent);listenTarget.removeEventListener('touchstart',intent);listenTarget.removeEventListener('pointerdown',intent);listenTarget.removeEventListener('keydown',scrollKey)}
   listenTarget=binding?(binding.container??window):reader;listenTarget.addEventListener('scroll',syncScroll,{passive:true});listenTarget.addEventListener('wheel',intent,{passive:true});listenTarget.addEventListener('touchstart',intent,{passive:true});listenTarget.addEventListener('pointerdown',intent);listenTarget.addEventListener('keydown',scrollKey);
  }
  const observer=new ResizeObserver(()=>{measure();if(pinned===null)syncScroll()});observer.observe(nav);observer.observe(host);
  function visibility(){stop();if(pinned===null)syncScroll();request()}
  const api={
   update(next:RailSettings,nextRuntime:RailRuntime){
    const old=settings,wasAvailable=available(),rebuild=JSON.stringify(old.items)!==JSON.stringify(next.items),composition=old.showContent!==next.showContent;settings=next;runtime=nextRuntime;position=Math.min(position,next.items.length-1);target=Math.min(target,next.items.length-1);if(pinned!==null)pinned=Math.min(pinned,next.items.length-1);
    host.dataset.theme=settings.theme;host.dataset.content=String(internal());host.style.setProperty('--rail-ink',settings.accentColor);nav.setAttribute('aria-label',settings.title);titleText.textContent=settings.title;nav.style.fontSize=settings.fontSize+'px';reader.hidden=!internal();reader.setAttribute('aria-label',runtime.language==='zh'?'联动阅读区':'Linked reading area');reader.style.overflow=runtime.paused||!runtime.enabled?'hidden':'auto';reader.inert=runtime.paused||!runtime.enabled;
    if(rebuild||composition)content();buttons.forEach((button,i)=>{button.style.paddingLeft=(20+settings.items[i].depth*settings.indent)+'px';button.style.paddingRight='4px';button.style.paddingBlock=(settings.rowHeight-settings.fontSize*1.35)/2+'px';if(internal())button.setAttribute('aria-controls',headings[i].id);else button.removeAttribute('aria-controls')});measure();
    if(!binding&&!internal()){scrollMoving=false;scrollV=0}
    if(old.initialIndex!==settings.initialIndex||rebuild||composition){pinned=settings.initialIndex;aim(settings.initialIndex);scrollToIndex(settings.initialIndex)}
    else if(old.offset!==settings.offset){if(pinned!==null)scrollToIndex(pinned);else syncScroll()}
    if(runtime.reduced){demo=null;position=target;velocity=0;if(scrollMoving){writeScroll(scrollTarget);scrollPosition=scrollTarget}scrollMoving=false;scrollV=0;render();heading=pose(g,position).angle+(facing<0?180:0);headingV=0}
    stop();if(!wasAvailable&&available()&&pinned===null)syncScroll();render();request();
   },
   select:(index:number)=>select(index),
   demonstrate(){if(!available()){report();return}select(target>settings.items.length/2?0:settings.items.length-1,false);if(!runtime.reduced)demo={age:0,returning:false};request()},
   connect(next?:RailBinding){scrollMoving=false;scrollV=0;demo=null;binding=next;bind();api.update(settings,runtime);pinned=null;syncScroll()},
   refresh(){measure();syncScroll()},
   destroy(){dead=true;stop();observer.disconnect();host.removeEventListener('click',click);host.removeEventListener('keydown',keyboard);host.removeEventListener('wheel',wheel);document.removeEventListener('visibilitychange',visibility);if(listenTarget){listenTarget.removeEventListener('scroll',syncScroll);listenTarget.removeEventListener('wheel',intent);listenTarget.removeEventListener('touchstart',intent);listenTarget.removeEventListener('pointerdown',intent);listenTarget.removeEventListener('keydown',scrollKey)}host.replaceChildren();runtime.onRunning?.(false)},
  };
  host.addEventListener('click',click);host.addEventListener('keydown',keyboard);host.addEventListener('wheel',wheel,{passive:false});document.addEventListener('visibilitychange',visibility);content();bind();api.update(settings,runtime);
  if(binding){pinned=null;syncScroll();position=target;velocity=0;heading=pose(g,position).angle;headingV=0;stop();render();report()}
  else{pinned=settings.initialIndex;scrollToIndex(settings.initialIndex);if(scrollMoving){writeScroll(scrollTarget);scrollPosition=scrollTarget;scrollMoving=false;scrollV=0}}
  render();report();document.fonts?.ready.then(()=>{if(!dead){measure();syncScroll()}}).catch(()=>{});return api;
 }
 return {css,geometry,pose,spring,readingIndex,create};
}
const engine=railEngine();
export const railCss=engine.css,railGeometry=engine.geometry,railPose=engine.pose,railSpring=engine.spring,railReadingIndex=engine.readingIndex,createRailToc=engine.create;
export const railEngineCode=`const railEngine=((__name)=>(${railEngine.toString()}))((fn)=>fn)();\nconst createRailToc=railEngine.create;`;
