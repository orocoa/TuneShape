import type {SkiperEngine,SkiperRuntime,SkiperSettings} from './skiper-types';

/** A bounded set of visible tiles over an unbounded, deterministic image grid. */
export function skiperCanvasTiles(x:number,y:number,w:number,h:number,s:SkiperSettings,count:number){
 const mod=(a:number,b:number)=>((a%b)+b)%b;
 const scale=Number(s.canvasScale),gap=w*Number(s.gap)/100*scale;
 const width=Math.max(24,(w-w*Number(s.gap)/100*(Number(s.columns)+1))/Number(s.columns)*scale);
 const height=width/Number(s.canvasAspect),pitchX=width+gap,pitchY=height+gap;
 const cols=Math.ceil(w/pitchX)+3,rows=Math.ceil(h/pitchY)+3,firstCol=Math.floor(-x/pitchX)-1;
 const tiles=[];
 for(let c=0;c<cols;c++){
  const column=firstCol+c,speed=1+([1,1.65,.625,1.5][mod(column,4)]-1)*Number(s.parallaxStrength);
  const shift=mod(column,2)*Number(s.stagger)*pitchY,offsetY=y*speed+shift;
  const firstRow=Math.floor(-offsetY/pitchY)-1;
  for(let r=0;r<rows;r++){
   const row=firstRow+r;
   tiles.push({column,row,index:mod(column*3+row,Math.max(1,count)),x:column*pitchX+x,y:row*pitchY+offsetY,width,height,speed});
  }
 }
 return {tiles,width,height,pitchX,pitchY};
}

/** TuneShape canvas extension; separate from the source Skiper 30 scroll mode. */
export function createSkiperCanvasImpl(host:HTMLElement,id:string,settings:SkiperSettings,runtime:SkiperRuntime,layout:typeof skiperCanvasTiles):SkiperEngine{
 let s={...settings},r={...runtime},dead=false,frame=0,last=0,w=1,h=1,elapsed=0,settleElapsed=0,demo=false;
 let position={x:0,y:0},target={x:0,y:0},from={x:0,y:0},demoFrom={x:0,y:0};
 let pointer:number|undefined,point={x:0,y:0},pointerStart={x:0,y:0},velocity={x:0,y:0},pointerTime=0,dragged=false;
 let sources:string[]=[],labels:string[]=[],tiles:{node:HTMLDivElement;image:HTMLImageElement;index:number}[]=[];
 const controller=new AbortController(),root=document.createElement('div'),view=document.createElement('div'),plane=document.createElement('div'),list=document.createElement('ul'),style=document.createElement('style');
 root.className='skiper-effect skiper-scroll-effect skiper-canvas-effect';root.dataset.skiper=id;root.dataset.mode='canvas';root.dataset.running='false';
 view.className='se-viewport se-canvas-viewport';view.tabIndex=0;view.setAttribute('role','region');view.dataset.nativeInteractive='true';
 plane.className='se-canvas-plane';plane.setAttribute('aria-hidden','true');list.className='se-canvas-description';view.append(plane,list);root.append(style,view);host.replaceChildren(root);
 style.textContent=`.skiper-canvas-effect{position:relative;width:100%;height:100%;overflow:hidden;isolation:isolate;background:var(--se-bg);font-family:"Skiper Inter",Arial,sans-serif}.skiper-scroll-effect.skiper-canvas-effect .se-canvas-viewport{position:absolute;inset:0 0 var(--se-reserve,0px);overflow:hidden;touch-action:none;overscroll-behavior:contain;cursor:grab;user-select:none}.skiper-canvas-effect[data-dragging=true] .se-canvas-viewport{cursor:grabbing}.skiper-canvas-effect .se-canvas-viewport:focus-visible{outline:2px solid #777;outline-offset:-3px}.skiper-canvas-effect .se-canvas-plane{position:absolute;inset:0;overflow:hidden;pointer-events:none}.skiper-canvas-effect .se-canvas-tile{position:absolute;left:0;top:0;overflow:hidden;pointer-events:none}.skiper-canvas-effect .se-canvas-image{position:absolute!important;inset:0!important;display:block;width:100%!important;height:100%!important;max-width:none;user-select:none;pointer-events:none;-webkit-user-drag:none}.skiper-canvas-effect .se-canvas-description{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;pointer-events:none}`;
 const listen=(node:EventTarget,name:string,fn:EventListener,options:AddEventListenerOptions={})=>node.addEventListener(name,fn,{...options,signal:controller.signal});
 const can=()=>!dead&&r.enabled&&!r.paused&&!document.hidden&&r.speed>0;
 const moving=()=>Math.abs(target.x-position.x)+Math.abs(target.y-position.y)>.02;
 function announce(value:boolean){const next=value&&can()&&!r.reduced;if(root.dataset.running!==String(next)){root.dataset.running=String(next);r.onRunning?.(next)}}
 function attrs(){
  root.dataset.panX=position.x.toFixed(3);root.dataset.panY=position.y.toFixed(3);
  root.dataset.targetX=target.x.toFixed(3);root.dataset.targetY=target.y.toFixed(3);
  root.dataset.progress=String(Math.min(1,Math.hypot(position.x,position.y)/Math.max(w,h)).toFixed(6));
  root.dataset.phase=demo?'demo':pointer!==undefined?'dragging':moving()?'settling':'idle';
  root.dataset.paused=String(r.paused);root.dataset.enabled=String(r.enabled);root.dataset.reduced=String(r.reduced);root.dataset.dragging=String(pointer!==undefined);
 }
 function paint(){
  root.style.setProperty('--se-bg',String(s.backgroundColor));
  const grid=layout(position.x,position.y,w,h,s,sources.length);
  while(tiles.length<grid.tiles.length){const node=document.createElement('div'),image=document.createElement('img');node.className='se-canvas-tile';image.className='se-image se-canvas-image';image.alt='';image.draggable=false;image.decoding='async';node.append(image);plane.append(node);tiles.push({node,image,index:-1})}
  while(tiles.length>grid.tiles.length)tiles.pop()!.node.remove();
  for(let i=0;i<grid.tiles.length;i++){
   const cell=grid.tiles[i],tile=tiles[i];
   if(tile.index!==cell.index){tile.image.src=sources[cell.index];tile.index=cell.index}
   tile.node.style.width=cell.width+'px';tile.node.style.height=cell.height+'px';tile.node.style.borderRadius=Number(s.cornerRadius)*Math.min(1,w/700)+'px';
   tile.node.style.transform=`translate(${cell.x}px,${cell.y}px)`;
   tile.node.dataset.column=String(cell.column);tile.node.dataset.row=String(cell.row);tile.node.dataset.imageIndex=String(cell.index);
   tile.image.style.objectFit=s.imageFit==='natural'?'contain':String(s.imageFit);
  }
  root.dataset.tileCount=String(tiles.length);attrs();
 }
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;announce(false)}
 function wake(){if(!can()||r.reduced){announce(false);return}if(!frame&&(demo||moving())){announce(true);frame=requestAnimationFrame(tick)}}
 function seek(x:number,y:number){
  target={x,y};from={...position};settleElapsed=0;
  if(r.reduced||Number(s.scrub)===0){position={...target};paint();if(!demo)stop()}else wake();
 }
 function tick(now:number){
  frame=0;if(!can()){stop();return}
  const dt=last?Math.min(48,now-last):0;last=now;const rate=r.speed*500/Math.max(80,r.durationMs);
  if(demo){
   elapsed+=dt*rate;const u=Math.min(1,Math.max(0,elapsed-r.delayMs)/5000),wave=(1-Math.cos(u*Math.PI*2))/2;
   position={x:demoFrom.x-w*.9*wave,y:demoFrom.y-h*.65*wave};target={...position};
   if(u===1){demo=false;position={...demoFrom};target={...position}}
  }else{
   settleElapsed+=dt*rate;const f=Math.min(1,settleElapsed/Math.max(1,Number(s.scrub)*1000)),ease=1-Math.pow(1-f,3);
   position={x:from.x+(target.x-from.x)*ease,y:from.y+(target.y-from.y)*ease};
   if(f===1||!moving())position={...target};
  }
  paint();if(demo||moving())wake();else{last=0;announce(false)}
 }
 function interact(event:Event){
  if(!can()){event.preventDefault();event.stopPropagation();return false}
  if(demo){demo=false;target={...position};from={...position};settleElapsed=0}
  r.onInteract?.();return true;
 }
 function release(cancel=false){
  if(pointer===undefined)return;const captured=pointer;pointer=undefined;
  if(view.hasPointerCapture(captured))view.releasePointerCapture(captured);
  if(cancel){target={...position};demo=false;stop()}
  else if(dragged&&!r.reduced&&Number(s.scrub)>0&&performance.now()-pointerTime<100){seek(target.x+velocity.x*150*Number(s.momentum),target.y+velocity.y*150*Number(s.momentum))}
  velocity={x:0,y:0};attrs();
 }
 function media(){
  sources=String(s.images).split('\n').map(x=>x.trim()).filter(Boolean);labels=String(s.labels).split('\n');
  list.replaceChildren(...labels.map(label=>{const item=document.createElement('li');item.textContent=label;return item}));
  for(const tile of tiles)tile.index=-1;
 }
 function fit(){
  if(dead)return;const nextW=Math.max(1,host.clientWidth),reserve=r.managed?44:0,nextH=Math.max(80,host.clientHeight-reserve);
  if(w>1&&nextW!==w){const factor=nextW/w;position={x:position.x*factor,y:position.y*factor};target={x:target.x*factor,y:target.y*factor};from={x:from.x*factor,y:from.y*factor};demoFrom={x:demoFrom.x*factor,y:demoFrom.y*factor}}
  w=nextW;h=nextH;root.style.setProperty('--se-reserve',reserve+'px');
  view.setAttribute('aria-label',r.language==='zh'?`无限画布，${sources.length} 张图片。拖拽或使用方向键平移，Home 复位。`:`Infinite canvas, ${sources.length} images. Drag or use arrow keys to pan; Home resets the view.`);paint();
 }
 listen(view,'pointerdown',event=>{
  const e=event as PointerEvent;if(e.button!==0||!e.isPrimary||pointer!==undefined||!interact(e))return;
  e.preventDefault();e.stopPropagation();stop();target={...position};from={...position};pointer=e.pointerId;point={x:e.clientX,y:e.clientY};pointerStart={...point};velocity={x:0,y:0};pointerTime=performance.now();dragged=false;if(e.pointerType!=='touch')view.focus({preventScroll:true});view.setPointerCapture(pointer);attrs();
 });
 listen(view,'pointermove',event=>{
  const e=event as PointerEvent;if(pointer!==e.pointerId)return;if(!can()){release(true);return}
  const now=performance.now(),dt=Math.max(8,now-pointerTime),gain=Number(s.dragSensitivity),dx=(e.clientX-point.x)*gain,dy=(e.clientY-point.y)*gain;
  dragged=dragged||Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>4;
  velocity={x:Math.max(-3,Math.min(3,velocity.x*.3+dx/dt*.7)),y:Math.max(-3,Math.min(3,velocity.y*.3+dy/dt*.7))};point={x:e.clientX,y:e.clientY};pointerTime=now;
  seek(target.x+dx,target.y+dy);e.preventDefault();e.stopPropagation();
 });
 listen(view,'pointerup',event=>{if((event as PointerEvent).pointerId===pointer)release()});
 listen(view,'pointercancel',()=>release(true));listen(view,'lostpointercapture',()=>release(true));
 listen(view,'click',event=>{event.stopPropagation();if(dragged)event.preventDefault()});
 listen(view,'wheel',event=>{
  const e=event as WheelEvent;if(e.ctrlKey)return;if(!interact(e))return;e.preventDefault();e.stopPropagation();
  const unit=e.deltaMode===1?16:e.deltaMode===2?h:1,gain=Number(s.dragSensitivity),dx=e.shiftKey&&e.deltaX===0?e.deltaY:e.deltaX,dy=e.shiftKey&&e.deltaX===0?0:e.deltaY;
  seek(target.x-Math.max(-2000,Math.min(2000,dx*unit))*gain,target.y-Math.max(-2000,Math.min(2000,dy*unit))*gain);
 },{passive:false});
 listen(view,'keydown',event=>{
  const e=event as KeyboardEvent;if(e.key==='Escape'){release(true);return}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key)||!interact(e))return;
  e.preventDefault();e.stopPropagation();const step=e.shiftKey?120:48;
  if(e.key==='Home')seek(0,0);
  else if(e.key==='ArrowLeft')seek(target.x+step,target.y);
  else if(e.key==='ArrowRight')seek(target.x-step,target.y);
  else if(e.key==='ArrowUp')seek(target.x,target.y+step);
  else if(e.key==='ArrowDown')seek(target.x,target.y-step);
  else seek(target.x,target.y+(e.key==='PageUp'?1:-1)*h*.8);
 });
 listen(window,'blur',()=>release(true));listen(document,'visibilitychange',()=>{if(document.hidden){release(true);stop()}else wake()});
 const observer=new ResizeObserver(fit);observer.observe(host);media();fit();root.dataset.settings=JSON.stringify(s);announce(false);
 const demonstrate=()=>{if(!can()||r.reduced||pointer!==undefined)return;demo=true;elapsed=0;demoFrom={...position};target={...position};last=0;wake()};
 if(r.gallery)demonstrate();
 return {
  update(next,nextRuntime){
   if(dead)return;const before=s;s={...next};r={...nextRuntime};const changed=JSON.stringify(before)!==JSON.stringify(s);
   if(before.images!==s.images||before.labels!==s.labels)media();
   if(changed)root.dataset.settings=JSON.stringify(s);fit();
   if(!can()){release(true);stop()}else if(r.reduced){release(true);demo=false;position={...target};paint();stop()}else wake();attrs();
  },
  demonstrate,
  settle(){release(true);demo=false;target={...position};from={...position};stop();attrs()},
  getValue(){return {mode:'canvas',offset:{...position},target:{...target},tileCount:tiles.length,geometry:layout(position.x,position.y,w,h,s,sources.length),running:root.dataset.running==='true',demo}},
  destroy(){if(dead)return;release(true);dead=true;stop();controller.abort();observer.disconnect();root.remove()},
 };
}
