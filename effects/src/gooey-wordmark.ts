import {nativeEffectTools,nativeToolsCode,type NativeEffectRuntime} from './native-effect-tools';
import type {TypographySettings} from './typography-settings';
import {wordmarkFontCss} from './gooey-wordmark-font';

/** Independent rendering of the public hipuku wordmark interaction; no reference assets. */
function gooeyWordmarkFactory(tools:ReturnType<typeof nativeEffectTools>,fontCss:string){
 const {install,clamp,clock}=tools;
 function svg<K extends keyof SVGElementTagNameMap>(tag:K,attributes:Record<string,string|number>={}){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attributes))n.setAttribute(key,String(value));return n}
 const smooth=(p:number)=>{p=clamp(p);return p*p*(3-2*p)};
 // Authored to the observed reference: 1.2 s blur, .8 s rise, .05 s stagger.
 // Units stay independent of word length; changing duration scales the whole clock.
 function bezier(progress:number,x1:number,y1:number,x2:number,y2:number){
  const x=clamp(progress);if(x===0||x===1)return x;let low=0,high=1;
  for(let i=0;i<24;i++){const t=(low+high)/2,value=3*(1-t)**2*t*x1+3*(1-t)*t*t*x2+t**3;if(value<x)low=t;else high=t}
  const t=(low+high)/2;return 3*(1-t)**2*t*y1+3*(1-t)*t*t*y2+t**3;
 }
 function entrance(progress:number,index:number,count:number){
  const ms=clamp(progress)*Math.max(1600,800+Math.max(0,count-1)*50),rise=bezier((ms-index*50)/800,.22,1,.36,1);
  return {scaleX:1,scaleY:1,rotation:0,opacity:1,yPercent:18*(1-rise),blur:14*(1-bezier(ms/1200,.45,0,.55,1)),
   captionOpacity:bezier((ms-880)/600,0,0,.2,1),captionY:14*(1-bezier((ms-880)/280,.22,1,.36,1)),hintOpacity:bezier((ms-1000)/600,0,0,.2,1)};
 }
 function createTypography(host:HTMLElement,initial:TypographySettings,initialRuntime:NativeEffectRuntime){
  let s=initial,runtime=initialRuntime,dead=false,ready=false,age=0,playing=false,pending=false,version=0;
  let pointer={x:640,y:360,targetX:640,targetY:360,energy:0,target:0},hit=-1,sequence=0;
  let letters:SVGTextElement[]=[],widths:number[]=[],positions:number[]=[],heights:number[]=[],fontUnit=1,poster=true;
  let annotations:{group:SVGGElement;path:SVGPathElement;length:number;dot:SVGCircleElement}[]=[];
  const uid='gooey-'+Math.random().toString(36).slice(2),root=svg('svg',{viewBox:'0 0 1280 720',width:1280,height:720,'aria-hidden':'true',class:'gw-view'});
  install(host,'gooey-wordmark',fontCss+`.gooey-wordmark{display:block;position:relative;width:1280px;height:720px;outline:none;overflow:hidden;cursor:default;font-family:TuneShapeWordmarkParkinsans,system-ui,sans-serif}.gooey-wordmark:focus-visible{outline:4px solid #bababa;outline-offset:-8px}.gooey-wordmark .gw-view{display:block;width:100%;height:100%;overflow:hidden;touch-action:pan-y}.gooey-wordmark .gw-letter{cursor:crosshair}.gooey-wordmark .gw-tag{font-family:TuneShapeWordmarkParkinsans,system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:1.2px}.gooey-wordmark .gw-caption{font-family:TuneShapeWordmarkParkinsans,system-ui,sans-serif;font-size:29px;font-weight:500;letter-spacing:-.9px;fill:#cecece}.gooey-wordmark .gw-hint{font-family:TuneShapeWordmarkParkinsans,system-ui,sans-serif;font-size:13px;fill:#8c8c8c}.gooey-wordmark .gw-letter:focus{outline:none}`);
  host.classList.add('type-motion');host.append(root);host.tabIndex=0;host.setAttribute('role','group');
  const defs=svg('defs'),grid=svg('pattern',{id:uid+'-grid',width:40,height:40,patternUnits:'userSpaceOnUse'});
  grid.append(svg('path',{d:'M40 0H0V40',fill:'none',stroke:'#ffffff','stroke-opacity':.065,'stroke-width':1}));defs.append(grid);
  const filter=(id:string,blur:number,contrast:number,offset:number)=>{const f=svg('filter',{id,x:'-35%',y:'-60%',width:'170%',height:'220%','color-interpolation-filters':'sRGB'}),b=svg('feGaussianBlur',{in:'SourceGraphic',stdDeviation:blur,result:'blur'});f.append(b,svg('feColorMatrix',{in:'blur',type:'matrix',values:`1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${contrast} ${offset}`}));defs.append(f);return b};
  const entryBlur=filter(uid+'-entry',0,18,-7);for(const [key,value] of Object.entries({x:'-20%',y:'-20%',width:'140%',height:'140%'}))entryBlur.parentElement!.setAttribute(key,value);filter(uid+'-live',6.8,15,-6);
  const gradient=svg('radialGradient',{id:uid+'-spot',gradientUnits:'userSpaceOnUse',cx:640,cy:360,r:100});
  gradient.append(svg('stop',{offset:0,'stop-color':'#ffffff'}),svg('stop',{offset:.4,'stop-color':'#ffffff'}),svg('stop',{offset:1,'stop-color':'#000000'}));defs.append(gradient);
  const mask=svg('mask',{id:uid+'-mask',maskUnits:'userSpaceOnUse',x:0,y:0,width:1280,height:720});mask.append(svg('rect',{width:1280,height:720,fill:`url(#${uid}-spot)`}));defs.append(mask);
  const inverse=svg('mask',{id:uid+'-inverse',maskUnits:'userSpaceOnUse',x:0,y:0,width:1280,height:720});
  const inverseGradient=svg('radialGradient',{id:uid+'-inverse-spot',gradientUnits:'userSpaceOnUse',cx:640,cy:360,r:100});inverseGradient.append(svg('stop',{offset:0,'stop-color':'#000000'}),svg('stop',{offset:.4,'stop-color':'#000000'}),svg('stop',{offset:1,'stop-color':'#ffffff'}));defs.append(inverseGradient);
  const inverseBase=svg('rect',{width:1280,height:720,fill:'#ffffff'}),inverseSpot=svg('rect',{width:1280,height:720,fill:`url(#${uid}-inverse-spot)`});inverse.append(inverseBase,inverseSpot);defs.append(inverse);
  const background=svg('rect',{width:1280,height:720}),gridField=svg('rect',{width:1280,height:720,fill:`url(#${uid}-grid)`}),art=svg('g',{id:uid+'-letters'}),base=svg('g'),goo=svg('use',{href:'#'+uid+'-letters',filter:`url(#${uid}-live)`,mask:`url(#${uid}-mask)`,'pointer-events':'none'}),callouts=svg('g',{'pointer-events':'none'}),caption=svg('text',{x:640,y:559,'text-anchor':'middle',class:'gw-caption'}),hint=svg('text',{x:640,y:646,'text-anchor':'middle',class:'gw-hint'});
  base.append(art);root.append(defs,background,gridField,base,goo,callouts,caption,hint);
  const colors=()=>[s.color,s.color,'#f28bad','#f28bad','#e15e42','#f78d2c','#f78d2c','#7193ed','#7193ed'];
  function total(){return runtime.durationMs+(runtime.delayMs??0)}
  const timer=clock(runtime,dt=>{
   if(playing)age=Math.min(total(),age+dt);
   const a=1-Math.exp(-dt/70);pointer.x+=(pointer.targetX-pointer.x)*a;pointer.y+=(pointer.targetY-pointer.y)*a;pointer.energy+=(pointer.target-pointer.energy)*(1-Math.exp(-dt/115));
   if(pointer.energy<.002&&pointer.target===0)pointer.energy=0;
   paint();if(playing&&age>=total())playing=false;
   return playing||Math.abs(pointer.energy-pointer.target)>.002||pointer.energy>0&&(Math.abs(pointer.x-pointer.targetX)+Math.abs(pointer.y-pointer.targetY)>.15);
  },host);
  function paint(final=false){
   if(!ready)return;const p=final?1:clamp((age-(runtime.delayMs??0))/Math.max(1,runtime.durationMs)),energy=runtime.reduced?0:pointer.energy*clamp(s.intensity??1,0,1);
   host.dataset.progress=String(p);host.dataset.elapsed=String(age);host.dataset.pointerEnergy=String(energy);host.dataset.hit=String(hit);host.dataset.complete=String(p===1);
   const phase=entrance(p,0,letters.length),blur=phase.blur*fontUnit;
   entryBlur.setAttribute('stdDeviation',String(blur));host.dataset.blur=String(blur);host.dataset.blurUnits=String(phase.blur);
   base.setAttribute('filter',phase.blur>0?`url(#${uid}-entry)`:'none');
   const radius=(s.radius??100)*(.65+.35*energy);for(const g of [gradient,inverseGradient]){g.setAttribute('cx',String(pointer.x));g.setAttribute('cy',String(pointer.y));g.setAttribute('r',String(radius))}
   inverseSpot.setAttribute('opacity',String(energy));base.setAttribute('mask',energy>0?`url(#${uid}-inverse)`:'none');goo.setAttribute('opacity',String(energy));
   letters.forEach((node,i)=>{
    const entry=entrance(p,i,letters.length),x=positions[i],center=x+widths[i]/2,dy=pointer.y-354,distance=Math.hypot((pointer.x-center)*.9,dy),influence=Math.exp(-Math.pow(distance/(s.radius??100),2)*1.6)*energy*Math.max(1,s.intensity??1);
    const dx=(pointer.x-center)*.12*influence,y=heights[i]*entry.yPercent/100+dy*.16*influence,sx=entry.scaleX*(1+.12*influence),sy=entry.scaleY*(1-.17*influence),angle=entry.rotation+(pointer.x-center)*.035*influence;
    node.setAttribute('transform',`translate(${center+dx} ${363+y}) rotate(${angle}) scale(${sx} ${sy}) translate(${-widths[i]/2} 0)`);node.setAttribute('opacity',String(entry.opacity));
   });
   // Loading never draws annotation leaders over the forming liquid mass.
   const annotationProgress=p===1?(poster||runtime.reduced?1:smooth(energy)):0;
   callouts.setAttribute('opacity',String(s.annotations?annotationProgress:0));annotations.forEach(item=>{item.path.style.strokeDashoffset='0';item.dot.setAttribute('opacity',String(annotationProgress))});
   caption.setAttribute('opacity',String(phase.captionOpacity));caption.setAttribute('transform',`translate(0 ${phase.captionY})`);hint.setAttribute('opacity',String(phase.hintOpacity*.8));
  }
  function build(){
   const own=++version;ready=false;art.replaceChildren();callouts.replaceChildren();letters=[];annotations=[];positions=[];widths=[];heights=[];
   background.setAttribute('fill',s.backgroundColor??'#121213');gridField.setAttribute('opacity',s.grid?'1':'0');caption.textContent=s.caption??'';hint.textContent=runtime.language==='en'?'Move across the letters · Click to replay':'移动鼠标触碰字母 · 点击重播';
   host.setAttribute('aria-label',s.text+(runtime.language==='en'?'. Liquid letter interaction. Enter to replay; arrow keys explore letters.':'，液态字标。Enter 重播，方向键逐字体验。'));
   host.dataset.loading='true';
   document.fonts.load(`${s.fontWeight} ${s.fontSize}px TuneShapeWordmarkParkinsans`).then(()=>{
    if(dead||own!==version)return;const measure=document.createElement('canvas').getContext('2d')!;measure.font=`${s.fontWeight} ${s.fontSize}px TuneShapeWordmarkParkinsans`;
    const characters=Array.from(s.text),raw=characters.map(ch=>measure.measureText(ch).width),tracking=-s.fontSize*.01,rawWidth=raw.reduce((a,b)=>a+b,0)+Math.max(0,raw.length-1)*tracking,fit=Math.min(1,1080/Math.max(1,rawWidth)),size=s.fontSize*fit;
    widths=raw.map(w=>w*fit);heights=characters.map(ch=>{const m=measure.measureText(ch);return Math.max(1,m.actualBoundingBoxAscent+m.actualBoundingBoxDescent)*fit});fontUnit=Math.max(1,measure.measureText('h').actualBoundingBoxAscent*fit)/24.95788;const wordWidth=rawWidth*fit;let x=(1280-wordWidth)/2;
    characters.forEach((ch,i)=>{positions.push(x);const node=svg('text',{class:'gw-letter','data-letter-index':i,x:0,y:0,fill:colors()[Math.floor(i/Math.max(1,characters.length-1)*8)],'font-family':'TuneShapeWordmarkParkinsans,system-ui,sans-serif','font-size':size,'font-weight':s.fontWeight,'letter-spacing':0});node.textContent=ch;art.append(node);letters.push(node);x+=widths[i]+tracking*fit});
    const labels=['MOTION','TIMING','SHAPE','COLOUR','PLAY'],fractions=[.12,.31,.50,.72,.91];
    labels.forEach((label,i)=>{const index=Math.min(characters.length-1,Math.round(fractions[i]*(characters.length-1))),anchor=positions[index]+widths[index]*(i%2?.5:.72),endY=363+(-measure.measureText(characters[index]).actualBoundingBoxAscent+(measure.measureText(characters[index]).actualBoundingBoxAscent+measure.measureText(characters[index]).actualBoundingBoxDescent)*(i===1?.23:i===4?.8:.58))*fit,tagX=clamp(anchor+(i===0?-70:i===1?90:i===2?-80:i===3?-90:0),125,1155),tagY=[178,121,210,162,216][i],group=svg('g'),path=svg('path',{d:`M${anchor} ${endY}V${tagY+14+12}Q${anchor} ${tagY+14} ${anchor+(tagX>=anchor?12:-12)} ${tagY+14}H${tagX}`,fill:'none',stroke:'#b4b4b4','stroke-width':1,'stroke-opacity':.70}),tag=svg('rect',{x:tagX-46,y:tagY,width:92,height:28,rx:14,fill:s.backgroundColor??'#121213',stroke:'#b4b4b4','stroke-width':1}),text=svg('text',{x:tagX,y:tagY+18,'text-anchor':'middle',fill:'#dedede',class:'gw-tag'}),dot=svg('circle',{cx:anchor,cy:endY,r:4.5,fill:'#dedede'});text.textContent=label;group.append(path,tag,text,dot);callouts.append(group);const length=path.getTotalLength();path.style.strokeDasharray=String(length);annotations.push({group,path,length,dot})});
    ready=true;host.dataset.loading='false';paint(!playing||runtime.reduced);if(pending){pending=false;demonstrate()}
   },()=>{if(dead||own!==version)return;host.dataset.loading='false';caption.textContent=s.text;timer.sleep()});
  }
  function settle(){poster=true;pending=false;playing=false;age=total();pointer.energy=pointer.target=0;hit=-1;paint(true);timer.sleep()}
  function demonstrate(){if(dead||!runtime.enabled||runtime.paused)return;if(!ready){pending=true;return}if(runtime.reduced){settle();return}poster=false;age=0;playing=true;pointer.energy=pointer.target=0;hit=-1;letters.forEach((node,i)=>node.setAttribute('fill',colors()[Math.floor(i/Math.max(1,letters.length-1)*8)]));paint();timer.wake()}
  function interact(x:number,y:number){if(!ready||playing||!runtime.enabled||runtime.paused||runtime.reduced||document.hidden)return;pointer.targetX=x;pointer.targetY=y;const index=positions.findIndex((left,i)=>x>=left-5&&x<=left+widths[i]+5);pointer.target=y>363-s.fontSize&&y<430&&index>=0?1:0;
   if(index>=0&&pointer.target&&index!==hit){hit=index;const palette=colors();sequence++;letters[index].setAttribute('fill',palette[(index+sequence+2)%palette.length])}else if(!pointer.target)hit=-1;timer.wake()}
  const move=(event:PointerEvent)=>{const r=root.getBoundingClientRect();interact((event.clientX-r.left)/r.width*1280,(event.clientY-r.top)/r.height*720)},leave=()=>{pointer.target=0;hit=-1;if(runtime.enabled&&!runtime.paused&&!runtime.reduced)timer.wake()},click=(event:MouseEvent)=>{event.stopPropagation();if((event as PointerEvent).pointerType==='touch'){move(event as PointerEvent);pointer.target=0}else demonstrate()},key=(event:KeyboardEvent)=>{if(['Enter',' '].includes(event.key)){event.preventDefault();event.stopPropagation();demonstrate()}else if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();event.stopPropagation();if(playing)settle();const index=event.key==='Home'?0:event.key==='End'?letters.length-1:(Math.max(0,hit)+(event.key==='ArrowRight'?1:-1)+letters.length)%letters.length;interact(positions[index]+widths[index]/2,363-s.fontSize*.32)}else if(event.key==='Escape')leave()},visibility=()=>{if(document.hidden){pointer.energy=pointer.target=0;hit=-1;paint()}};
  root.addEventListener('pointermove',move);root.addEventListener('pointerdown',move);root.addEventListener('pointerleave',leave);root.addEventListener('pointercancel',leave);host.addEventListener('click',click);host.addEventListener('keydown',key);host.addEventListener('blur',leave);document.addEventListener('visibilitychange',visibility);build();
  return {demonstrate,settle,getValue:()=>({elapsed:age,progress:Number(host.dataset.progress),ready,pointerEnergy:pointer.energy,hit}),update(next:TypographySettings,r:NativeEffectRuntime){const changed=JSON.stringify(next)!==JSON.stringify(s);s=next;runtime=r;timer.update(r);if(changed)build();if(r.reduced||!r.enabled)settle();else if(!r.paused)paint(!playing)},destroy(){dead=true;version++;timer.destroy();root.removeEventListener('pointermove',move);root.removeEventListener('pointerdown',move);root.removeEventListener('pointerleave',leave);root.removeEventListener('pointercancel',leave);host.removeEventListener('click',click);host.removeEventListener('keydown',key);host.removeEventListener('blur',leave);document.removeEventListener('visibilitychange',visibility);host.replaceChildren();host.classList.remove('type-motion','gooey-wordmark')}};
 }
 return {createTypography,entrance};
}
const engine=gooeyWordmarkFactory(nativeEffectTools(),wordmarkFontCss);
export const createGooeyWordmark=engine.createTypography;
export const gooeyEntrance=engine.entrance;
export const gooeyWordmarkEngineCode=nativeToolsCode+`\nconst createTypography=((__name)=>(${gooeyWordmarkFactory.toString()}))((fn)=>fn)(tools,${JSON.stringify(wordmarkFontCss)}).createTypography;`;
