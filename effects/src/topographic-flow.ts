import {type TopographicFlowSettings} from './topographic-flow-settings';
import type {NativeEffectRuntime} from './native-effect-tools';
export {defaultTopographicFlow,validateTopographicFlow} from './topographic-flow-settings';
export type {TopographicFlowSettings} from './topographic-flow-settings';
export type TopographicPointer={x:number;y:number;strength:number;dx:number;dy:number};
/** Independent gradient field and connected marching-squares contours. */
function topographicEngine(){
 const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
 function noise(x:number,y:number,seed:number){
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*fx*(fx*(fx*6-15)+10),v=fy*fy*fy*(fy*(fy*6-15)+10);
  function gradient(a:number,b:number,dx:number,dy:number){let h=Math.imul(a,374761393)^Math.imul(b,668265263)^Math.imul(seed+17,1442695041);h=Math.imul(h^(h>>>13),1274126177);switch((h^(h>>>16))&7){case 0:return dx;case 1:return -dx;case 2:return dy;case 3:return -dy;case 4:return (dx+dy)*.7071;case 5:return (dx-dy)*.7071;case 6:return (-dx+dy)*.7071;default:return (-dx-dy)*.7071;}}
  const a=gradient(ix,iy,fx,fy),b=gradient(ix+1,iy,fx-1,fy),c=gradient(ix,iy+1,fx,fy-1),d=gradient(ix+1,iy+1,fx-1,fy-1);return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;
 }
 function sample(x:number,y:number,time:number,s:TopographicFlowSettings,p:TopographicPointer|null=null){
  let px=x,py=y,extra=0;const t=time*.035,sign=s.hoverDirection==='push'?1:-1;
  if(p&&s.hoverEnabled){const dx=x-p.x,dy=y-p.y,r=Math.hypot(dx,dy)/s.hoverRadius,g=Math.exp(-r*r*2)*s.hoverStrength*p.strength*sign;
   switch(s.hoverEffect){case 'rings':extra=g*1.35;break;case 'spread':px+=dx*g;py+=dy*g;break;case 'swirl':{const a=g*2.8,c=Math.cos(a),b=Math.sin(a);px=p.x+dx*c-dy*b;py=p.y+dx*b+dy*c;break;}case 'ripple':extra=Math.cos(r*14-time*2.2)*g*.5;break;case 'drag':px-=p.dx*g*4;py-=p.dy*g*4;break;}
  }
  let qx=px/s.scale+17.37+s.seed*.017,qy=py/s.scale+9.83-s.seed*.011;
  const wx=noise(qx*.72+t*.3,qy*.72-t*.19,s.seed+31),wy=noise(qx*.72-t*.24,qy*.72+t*.27,s.seed+67);
  qx+=wx*s.distortion*.62;qy+=wy*s.distortion*.62;
  const broad=noise(qx+t*.5,qy-t*.24,s.seed)*1.8,detail=noise(qx*1.9-t*.27,qy*1.9+t*.21,s.seed+91)*.32;
  return broad+detail+.18*Math.sin(qx*1.5+qy*.65+t*.6)+extra;
 }
 type Point={x:number;y:number};type Line={level:number;points:Point[];closed:boolean};
 function contours(values:Float32Array,nx:number,ny:number,width:number,height:number,density:number):Line[]{
  let min=Infinity,max=-Infinity;for(const v of values){min=Math.min(min,v);max=Math.max(max,v)}const lines:Line[]=[],sx=width/nx,sy=height/ny;
  for(let k=Math.ceil(min*density);k<=Math.floor(max*density);k++){
   const level=k/density,nodes=new Map<string,{point:Point;links:string[]}>();
   function point(id:string,x:number,y:number){if(!nodes.has(id))nodes.set(id,{point:{x,y},links:[]});return id}
   function edge(x:number,y:number,e:number,a:number,b:number,c:number,d:number){
    if(e===0){const f=(level-a)/(b-a);return point('h'+x+','+y,(x+f)*sx,y*sy)}
    if(e===1){const f=(level-b)/(c-b);return point('v'+(x+1)+','+y,(x+1)*sx,(y+f)*sy)}
    if(e===2){const f=(level-d)/(c-d);return point('h'+x+','+(y+1),(x+f)*sx,(y+1)*sy)}
    const f=(level-a)/(d-a);return point('v'+x+','+y,x*sx,(y+f)*sy);
   }
   for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
    const i=y*(nx+1)+x,a=values[i],b=values[i+1],c=values[i+nx+2],d=values[i+nx+1],code=(a>=level?1:0)|(b>=level?2:0)|(c>=level?4:0)|(d>=level?8:0);let pairs:number[][]=[];
    switch(code){case 1:case 14:pairs=[[3,0]];break;case 2:case 13:pairs=[[0,1]];break;case 3:case 12:pairs=[[3,1]];break;case 4:case 11:pairs=[[1,2]];break;case 6:case 9:pairs=[[0,2]];break;case 7:case 8:pairs=[[3,2]];break;case 5:pairs=(a+b+c+d)/4>=level?[[0,1],[2,3]]:[[3,0],[1,2]];break;case 10:pairs=(a+b+c+d)/4>=level?[[3,0],[1,2]]:[[0,1],[2,3]];break;}
    for(const [ea,eb] of pairs){const u=edge(x,y,ea,a,b,c,d),v=edge(x,y,eb,a,b,c,d);nodes.get(u)!.links.push(v);nodes.get(v)!.links.push(u);}
   }
   const seen=new Set<string>();function walk(start:string){const points:Point[]=[];let current=start,previous='',closed=false;while(!seen.has(current)){seen.add(current);const node=nodes.get(current)!;points.push(node.point);const next=node.links.find(id=>id!==previous);if(!next)break;if(next===start){closed=true;break;}previous=current;current=next;}if(points.length>1)lines.push({level:k,points,closed});}
   for(const [id,node] of nodes)if(node.links.length===1&&!seen.has(id))walk(id);for(const id of nodes.keys())if(!seen.has(id))walk(id);
  }
  return lines;
 }
 function palette(height:number,colors:string[],diffusion:number){
  const h=clamp(height)*(colors.length-1),index=Math.min(colors.length-2,Math.floor(h)),p=h-index,t=p*p*(3-2*p),a=colors[index],b=colors[index+1];const rgb=[0,2,4].map(i=>{const ca=parseInt(a.slice(i+1,i+3),16),cb=parseInt(b.slice(i+1,i+3),16),before=parseInt(colors[Math.max(0,index-1)].slice(i+1,i+3),16),after=parseInt(colors[Math.min(colors.length-1,index+2)].slice(i+1,i+3),16);return ca*(1-t)+cb*t+diffusion*.2*((before-ca)*(1-t)+(after-cb)*t)});return rgb;
 }
 function create(host:HTMLElement,initial:TopographicFlowSettings,initialRuntime:NativeEffectRuntime){
  let s=initial,runtime=initialRuntime,dead=false,raf=0,last=0,paintWait=100,time=0,intro=initial.animateEntrance?0:1,introMs=0,reported=false,width=640,height=400,nx=1,ny=1,dpr=1,grainCanvas:HTMLCanvasElement|null=null,grainKey='';
  let target:TopographicPointer|null=null,current:TopographicPointer={x:320,y:200,strength:0,dx:0,dy:0},keyboard=false,pointerFocus=false;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false}),gradient=document.createElement('canvas'),gctx=gradient.getContext('2d')!;host.classList.add('topographic-flow');host.style.cssText+=';position:relative;width:100%;height:100%;overflow:hidden;touch-action:pan-y;';canvas.style.cssText='display:block;width:100%;height:100%;pointer-events:none';canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);host.tabIndex=0;host.setAttribute('role','img');host.dataset.renderer=ctx?'canvas2d':'unavailable';
  function report(value:boolean){host.dataset.running=String(value);if(reported!==value){reported=value;runtime.onRunning?.(value)}}
  const allowed=()=>!dead&&!!ctx&&runtime.enabled&&!runtime.paused&&!runtime.reduced&&runtime.speed>0&&!document.hidden;
  const moving=()=>Math.abs((target?.strength??0)-current.strength)>.0005||!!target&&(Math.hypot(target.x-current.x,target.y-current.y)>.05||Math.hypot(current.dx,current.dy)>.05);
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;report(false)}
  function request(){if(!raf&&allowed()&&((!s.paused&&s.speed>0)||intro<1||moving())){raf=requestAnimationFrame(tick);report(true)}}
  function measure(){const b=host.getBoundingClientRect();width=Math.max(1,b.width);height=Math.max(1,b.height);dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));nx=Math.max(2,Math.min(180,Math.ceil(width/6)));ny=Math.max(2,Math.min(120,Math.ceil(height/6)));gradient.width=nx+1;gradient.height=ny+1;grainCanvas=null;paint();}
  function grain(){const key=canvas.width+','+canvas.height;if(grainCanvas&&grainKey===key)return grainCanvas;grainKey=key;grainCanvas=document.createElement('canvas');grainCanvas.width=canvas.width;grainCanvas.height=canvas.height;const c=grainCanvas.getContext('2d')!,im=c.createImageData(canvas.width,canvas.height);for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){let h=Math.imul(x+1,374761393)^Math.imul(y+1,668265263);h=Math.imul(h^(h>>>13),1274126177);const a=((h>>>0)%256)/255,offset=(y*canvas.width+x)*4;im.data[offset]=im.data[offset+1]=im.data[offset+2]=255;im.data[offset+3]=Math.round(a*a*48);}c.putImageData(im,0,0);return grainCanvas;}
  function path(points:{x:number;y:number}[],closed:boolean){ctx!.beginPath();if(closed){const first=points[0],last=points.at(-1)!;ctx!.moveTo((first.x+last.x)/2,(first.y+last.y)/2);for(let i=0;i<points.length;i++){const p=points[i],next=points[(i+1)%points.length];ctx!.quadraticCurveTo(p.x,p.y,(p.x+next.x)/2,(p.y+next.y)/2)}ctx!.closePath();}else{ctx!.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length-1;i++){const p=points[i],next=points[i+1];ctx!.quadraticCurveTo(p.x,p.y,(p.x+next.x)/2,(p.y+next.y)/2)}ctx!.lineTo(points.at(-1)!.x,points.at(-1)!.y)}}
  function paint(){if(dead||!ctx)return;const values=new Float32Array((nx+1)*(ny+1)),pointer=current.strength>.0001?current:null;let low=Infinity,high=-Infinity;for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){const px=x*width/nx,py=y*height/ny,value=sample(px,py,time,s,pointer);values[y*(nx+1)+x]=value;if(s.gradientEnabled){const nominal=pointer?sample(px,py,time,s,null):value;low=Math.min(low,nominal);high=Math.max(high,nominal);}}
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=1;ctx.fillStyle=s.backgroundColor;ctx.fillRect(0,0,width,height);
   if(s.gradientEnabled){const span=Math.max(.0001,high-low);const image=gctx.createImageData(nx+1,ny+1);for(let i=0;i<values.length;i++){const col=palette((values[i]-low)/span,s.gradientColors,s.gradientDiffusion);for(let k=0;k<3;k++)image.data[i*4+k]=Math.round(clamp(col[k],0,255));image.data[i*4+3]=255;}gctx.putImageData(image,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(gradient,0,0,width,height);}
   const lines=contours(values,nx,ny,width,height,s.density);ctx.lineWidth=s.lineWidth;ctx.lineCap='butt';ctx.lineJoin='round';ctx.globalAlpha=s.opacity;for(const line of lines){const major=line.level%4===0;ctx.strokeStyle=major?s.accentColor:s.lineColor;ctx.setLineDash(s.lineStyle==='dashed'||s.lineStyle==='mixed'&&major?[s.dashLength,s.dashGap]:[]);path(line.points,line.closed);ctx.stroke();}ctx.setLineDash([]);ctx.globalAlpha=1;if(s.grain>0){ctx.globalAlpha=s.grain;ctx.drawImage(grain(),0,0,width,height);ctx.globalAlpha=1;}
   canvas.style.opacity=String(intro);host.dataset.phase=String(time);host.dataset.entrance=String(intro);host.dataset.lines=String(lines.length);host.dataset.pointer=JSON.stringify(current);host.dataset.settings=JSON.stringify(s);host.dataset.paused=String(runtime.paused||s.paused);host.dataset.frame=String(Number(host.dataset.frame??0)+1);
  }
  function tick(now:number){raf=0;if(!allowed()){report(false);return}const dt=last?Math.min(64,now-last)*runtime.speed:0;last=now;if(!s.paused)time+=dt/1000*s.speed;
   if(intro<1){introMs+=dt;intro=clamp((introMs-(runtime.delayMs??0))/Math.max(1,runtime.durationMs));}
   const amount=1-Math.exp(-5*dt/1000/Math.max(.001,target?s.hoverFollow:s.hoverFade));const oldX=current.x,oldY=current.y;if(target){current.x+=(target.x-current.x)*amount;current.y+=(target.y-current.y)*amount;}current.strength+=((target?.strength??0)-current.strength)*amount;current.dx+=(current.x-oldX-current.dx)*.25;current.dy+=(current.y-oldY-current.dy)*.25;if(!target&&current.strength<.0005)current.strength=0;
   paintWait+=dt;if(paintWait>=32||intro<1){paintWait=0;paint();}request();if(!raf)report(false);
  }
  function setPointer(x:number,y:number){if(!s.hoverEnabled||!runtime.enabled||runtime.paused)return;if(!target&&current.strength<.0005){current.x=clamp(x,0,width);current.y=clamp(y,0,height);current.dx=0;current.dy=0;}target={x:clamp(x,0,width),y:clamp(y,0,height),strength:1,dx:0,dy:0};if(runtime.reduced){current={...target,dx:current.strength>0?x-current.x:0,dy:current.strength>0?y-current.y:0};paint();}else request();}
  function move(e:PointerEvent){if(e.pointerType==='touch'&&e.buttons===0)return;const b=host.getBoundingClientRect();keyboard=false;setPointer(e.clientX-b.left,e.clientY-b.top);}
  function leave(){if(keyboard&&host===document.activeElement)return;target=null;if(runtime.reduced){current.strength=0;paint();}else request();}
  function down(e:PointerEvent){pointerFocus=true;move(e)}
  function release(e:PointerEvent){if(e.pointerType==='touch')leave()}
  function focus(){if(pointerFocus&&target){pointerFocus=false;return}pointerFocus=false;keyboard=true;setPointer(width/2,height/2)}
  function blur(){keyboard=false;pointerFocus=false;target=null;if(runtime.reduced)current.strength=0;paint();request()}
  function key(e:KeyboardEvent){if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','Escape'].includes(e.key)){e.preventDefault();keyboard=true;const p=target??{x:width/2,y:height/2};if(e.key==='Escape'){target=null;current.strength=0;paint();return}setPointer(e.key==='Home'?width/2:p.x+(e.key==='ArrowLeft'?-24:e.key==='ArrowRight'?24:0),e.key==='Home'?height/2:p.y+(e.key==='ArrowUp'?-24:e.key==='ArrowDown'?24:0));}else if(e.key==='Enter'||e.key===' '){e.preventDefault();api.demonstrate();}}
  function visibility(){stop();request()}
  const observer=new ResizeObserver(measure);observer.observe(host);host.addEventListener('pointermove',move);host.addEventListener('pointerdown',down);host.addEventListener('pointerup',release);host.addEventListener('pointerleave',leave);host.addEventListener('pointercancel',leave);host.addEventListener('focus',focus);host.addEventListener('blur',blur);host.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);
  function sync(){if(!runtime.enabled)intro=1;host.setAttribute('aria-label',runtime.language==='en'?'Topographic Flow. Move the pointer or use arrow keys to reshape terrain.':'流动等高线背景。移动指针或用方向键塑造地形。');host.style.background=s.backgroundColor;if(runtime.reduced){intro=1;current=target?{...target}:current;}}
  const api={update(next:TopographicFlowSettings,nextRuntime:NativeEffectRuntime){const previous=s;s=next;runtime=nextRuntime;stop();if(!s.hoverEnabled){target=null;current.strength=0;}if(!s.animateEntrance||runtime.reduced)intro=1;if(previous.seed!==s.seed){target=null;current.strength=0;}if(!runtime.enabled){target=null;current.strength=0;intro=1;}sync();paint();request();},demonstrate(){if(!runtime.enabled||runtime.paused)return;time=0;introMs=0;intro=s.animateEntrance&&!runtime.reduced?0:1;target=null;current.strength=0;paint();request();},settle(){stop();target=null;current.strength=0;intro=1;paint();},getState:()=>({time,intro,pointer:{...current}}),destroy(){dead=true;stop();observer.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerdown',down);host.removeEventListener('pointerup',release);host.removeEventListener('pointerleave',leave);host.removeEventListener('pointercancel',leave);host.removeEventListener('focus',focus);host.removeEventListener('blur',blur);host.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);host.replaceChildren();}};
  sync();measure();if(runtime.reduced)intro=1;paint();request();return api;
 }
 return {create,sample,contours,palette};
}
const engine=topographicEngine();
export const createTopographicFlow=engine.create;
export const topographicSample=engine.sample;
export const topographicContours=engine.contours;
export const topographicPalette=engine.palette;
export const topographicFlowEngineCode=`const createTopographicFlow=((__name)=>(${topographicEngine.toString()}))((fn)=>fn)().create;`;
