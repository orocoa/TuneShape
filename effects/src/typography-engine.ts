import {nativeEffectTools,nativeToolsCode,type NativeEffectRuntime} from './native-effect-tools';
import type {TypographySettings} from './typography-settings';
import {typographyFontCss} from './typography-fonts';
import {glyphAtlasGzip} from './type-geometry-data';
/** Browser timelines adapted from MIT Remocn; geometric data generated from licensed local fonts. */
function typographyFactory(tools:ReturnType<typeof nativeEffectTools>,packed:string,fontCss:string){
 type Command=(string|number)[];type Atlas=Record<string,[number,Command[]]>;
 let atlasPromise:Promise<Atlas>|undefined;
 function geometry(){return atlasPromise??= (async()=>{const bytes=Uint8Array.from(atob(packed),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));const raw=await new Response(stream).arrayBuffer(),view=new DataView(raw);let offset=4;const atlas:Atlas={};for(let i=0,count=view.getUint32(0,true);i<count;i++){const code=view.getUint32(offset,true),advance=view.getUint16(offset+4,true)/4,length=view.getUint16(offset+6,true);offset+=8;const commands:Command[]=[];for(let j=0;j<length;j++){const op=view.getUint8(offset++),command:Command=[['M','L','C','Z'][op]],n=op===2?6:op===3?0:2;for(let k=0;k<n;k++){command.push(view.getInt16(offset,true)/4);offset+=2}commands.push(command)}atlas[String.fromCodePoint(code)]=[advance,commands]}return atlas})()}
 const {element,install,clamp,ease,clock}=tools;
 const inOut=(p:number)=>{p=clamp(p);return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2};
 function bezier(x:number,a:number,b:number,c:number,d:number){x=clamp(x);let low=0,high=1;for(let i=0;i<20;i++){const t=(low+high)/2,q=3*(1-t)**2*t*a+3*(1-t)*t*t*c+t**3;if(q<x)low=t;else high=t}const t=(low+high)/2;return 3*(1-t)**2*t*b+3*(1-t)*t*t*d+t**3}
 const reveal=(p:number)=>bezier(p,.22,1,.36,1),wordEase=(p:number)=>bezier(p,.2,.8,.2,1),back=(p:number,k:number)=>{p=clamp(p)-1;return 1+(k+1)*p**3+k*p*p};
 const path=(commands:Command[])=>commands.map(c=>c.join(' ')).join(' ');
 function svg<K extends keyof SVGElementTagNameMap>(tag:K,attrs:Record<string,string|number>={}){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));return n}
 function dotState(t:number){
  if(t<20)return {visible:false,y:-1,sx:1,sy:1};const g=2/144,landing=1/6,impacts=[32,40.4,43.34];let y=0,speed=0,deform=0;
  if(t<32){const u=t-20;y=-1+.5*g*u*u;speed=g*u;deform=speed/landing}else{let n=2;while(n>0&&t<impacts[n])n--;const tau=t-impacts[n],launch=n<2?Math.pow(.35,n+1)*landing:0,flight=2*launch/g;if(tau<flight){y=-(launch*tau-.5*g*tau*tau);speed=Math.abs(launch-g*tau)}const decay=Math.exp(-tau/1.1);deform=-Math.pow(.35,n)*decay+(1-decay)*speed/landing}if(Math.abs(deform)<.005)deform=0;const sy=deform>=0?1+.3*deform:1+.22*Math.max(-1,deform);return {visible:true,y:Math.min(0,y)||0,sx:1/sy,sy}
 }
 function createTypography(host:HTMLElement,initial:TypographySettings,initialRuntime:NativeEffectRuntime){
  let s=initial,runtime=initialRuntime,age=0,dead=false,ready=false,playing=false,pending=false,atlas:Atlas|undefined,version=0;
  let nodes:HTMLElement[]=[],cursor:HTMLElement|undefined,dot:HTMLElement|undefined,wordWidths:number[]=[],vectorPaint:((frame:number,final:boolean)=>void)|undefined;
  const clean: (()=>void)[]=[],stage=element('div','type-motion-stage');
  install(host,'type-motion',fontCss+`.type-motion{display:block;position:relative;width:1280px;height:720px;font-family:TuneShapeMotionGeist,system-ui,-apple-system,'PingFang SC',sans-serif;cursor:pointer;outline:none}.type-motion:focus-visible{outline:2px solid currentColor;outline-offset:12px}.type-motion-stage{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:block;white-space:pre;font-kerning:normal;letter-spacing:-.03em;line-height:1.4285714286}.type-motion-stage span{box-sizing:border-box}.type-motion .type-char{display:inline-block;white-space:pre}.type-motion .type-word{position:absolute;left:50%;top:50%;white-space:pre;line-height:1.4285714286}.type-motion .type-vector{display:block;overflow:visible}.type-motion .type-period{display:inline-block;border-radius:50%;transform-origin:50% 100%;margin-left:.04em}`);
  host.append(stage);host.tabIndex=0;host.setAttribute('role','button');
  const timer=clock(runtime,dt=>{age+=dt;paint();if(age>=total()){playing=false;return false}return true},host);
  const chars=()=>Array.from(s.text),words=()=>s.text.trim().split(/\s+/u);
  const typingMs=()=>chars().length/(s.charsPerSecond??22)*1000;
  function total(){return (runtime.delayMs??0)+(s.kind==='typewriter-text'?Math.max(runtime.durationMs,typingMs()):runtime.durationMs)}
  function frameLength(){if(s.kind==='outline-trace')return Math.max(44,(chars().length-1)*(s.stagger??3)+26);if(s.kind==='glyph-anatomy')return Math.max(66,(chars().length-1)*2+58);if(s.kind==='period-drop')return Math.max(47,(chars().length-1)*2+12);if(s.kind==='short-slide-down')return Math.max(60,11+(words().length-1)*15);if(s.kind==='kinetic-center-build')return Math.max(60,10+(words().length-1)*13);if(s.kind==='soft-blur-in')return Math.max(60,chars().length-1+27);return 120}
  function paint(final=false){
   if(!ready)return;const local=Math.max(0,age-(runtime.delayMs??0)),p=final?1:clamp(local/runtime.durationMs),f=p*frameLength();host.dataset.progress=String(p);host.dataset.elapsed=String(age);
   if(vectorPaint){vectorPaint(f,final);return}
   if(s.kind==='typewriter-text'){
    const count=final?nodes.length:Math.min(nodes.length,Math.floor(local*(s.charsPerSecond??22)/1000));nodes.forEach((node,i)=>node.style.display=i<count?'inline':'none');
    if(cursor)cursor.style.opacity=String(count<nodes.length||final||Math.floor(local/500)%2===0?1:0);host.dataset.visibleCharacters=String(count);
   }else if(s.kind==='soft-blur-in')nodes.forEach((node,i)=>{const q=reveal((f-i)/27),y=16*(1-reveal((f-i)/9));node.style.opacity=String(q);node.style.transform=`translateY(${y}px)`;node.style.filter=`blur(${(1-q)*(s.blur??12)}px)`});
   else if(s.kind==='period-drop'){
    nodes.forEach((node,i)=>node.style.transform=`translateY(${115*Math.pow(1-clamp((f-i*2)/12),4)}%)`);
    const d=dotState(final?100:f);if(dot){dot.style.visibility=d.visible?'visible':'hidden';dot.style.transform=`translateY(${d.y*720*.62}px) scale(${d.sx},${d.sy})`;dot.dataset.y=String(d.y);dot.dataset.scaleY=String(d.sy)}
   }else{
    const n=nodes.length,vertical=s.kind==='short-slide-down',gap=vertical?12:10,sizes=vertical?nodes.map(()=>s.fontSize):wordWidths,first=vertical?11:10,push=vertical?15:13,travel=vertical?8:7,entryBlur=vertical?2.4:3.5,reflowBlur=vertical?.7:.8;
    const positions=(count:number)=>{const total=sizes.slice(0,count).reduce((a,b)=>a+b,0)+gap*(count-1);let pos=-total/2;return sizes.slice(0,count).map(size=>{const x=pos+size/2;pos+=size+gap;return x})};
    nodes.forEach((node,j)=>{const start=j===0?0:first+(j-1)*push,duration=j===0?first:push,target=positions(j+1)[j],q=wordEase((f-start)/Math.min(travel,duration)),fade=wordEase((f-start)/duration);let pos=target,blur=entryBlur*(1-fade),scale=.992+.008*fade;
     if(f<=start+duration){const from=j===0?(vertical?-14:target):target+(vertical?-1:1)*(s.entryOffset??28);pos=from+(target-from)*q}
     else for(let k=j+1;k<n;k++){const at=first+(k-1)*push,before=positions(k)[j],after=positions(k+1)[j];if(f>=at+push)pos=after;else if(f>=at){pos=before+(after-before)*wordEase((f-at)/travel);const reflow=clamp((f-at)/push);blur=reflowBlur*(reflow<.5?reflow*2:(1-reflow)*2);break}else{pos=before;break}}
     const firstY=!vertical&&j===0&&f<first?6*(1-wordEase(f/travel)):0;
     node.style.opacity=String(f<start?0:fade);node.style.transform=vertical?`translate(-50%,-50%) translateY(${pos}px) scale(${scale})`:`translate(-50%,-50%) translate(${pos}px,${firstY}px) scale(${scale})`;node.style.filter=`blur(${blur}px)`;
    });
   }
  }

  function buildVector(data:Atlas){
   stage.replaceChildren();const scale=s.fontSize/1000,characters=chars(),entries=characters.map(ch=>data[ch]??data['?']),width=entries.reduce((sum,g)=>sum+g[0],0),view=svg('svg',{class:'type-vector',width:1280,height:720,viewBox:'0 0 1280 720','aria-hidden':'true'}),defs=svg('defs');view.append(defs);stage.append(view);stage.style.width='1280px';stage.style.height='720px';const wordRoot=svg('g',{transform:`translate(${(1280-width*scale)/2},${(720+727.539*scale)/2}) scale(${scale})`});view.append(wordRoot);
   const token='type-'+Math.random().toString(36).slice(2),groups:{index:number;commands:Command[];fill:SVGPathElement;clip:SVGRectElement;strokes:SVGPathElement[];scaffold:SVGGElement;shape:SVGPathElement;top:number;bottom:number}[]=[];
   let x=0;
   entries.forEach((entry,index)=>{
    const [advance,commands]=entry,g=svg('g',{transform:`translate(${x},0)`});wordRoot.append(g);x+=advance;
    const contours:Command[][]=[];for(const command of commands){if(command[0]==='M')contours.push([]);contours.at(-1)?.push(command)}
    const combined=path(commands),clipId=token+'-clip-'+index,clipPath=svg('clipPath',{id:clipId}),clip=svg('rect',{x:-100,y:400,width:advance+200,height:1300});clipPath.append(clip);defs.append(clipPath);
    const fill=svg('path',{d:combined,fill:s.color,'clip-path':`url(#${clipId})`});g.append(fill);
    const maskId=token+'-mask-'+index,mask=svg('mask',{id:maskId,maskUnits:'userSpaceOnUse',x:-100,y:-1000,width:advance+200,height:1500});mask.append(svg('rect',{x:-100,y:-1000,width:advance+200,height:1500,fill:'white'}),svg('path',{d:combined,fill:'black'}));defs.append(mask);
    const areas=contours.map(c=>{const points=c.filter(p=>p[0]!=='Z').map(p=>(p.slice(-2) as number[]));return points.reduce((area,p,i)=>{const q=points[(i+1)%points.length];return area+p[0]*q[1]-q[0]*p[1]},0)}),outerSign=Math.sign(areas.reduce((a,b)=>Math.abs(a)>Math.abs(b)?a:b,0));
    const strokes=contours.map((c,index)=>{const p=svg('path',{d:path(c),fill:'none',stroke:s.strokeColor??s.color,'stroke-width':(s.strokeWidth??1.5)/scale*2,pathLength:1,'stroke-dasharray':1,'stroke-dashoffset':1,mask:`url(#${maskId})`});p.dataset.counter=String(Math.sign(areas[index])!==outerSign);g.append(p);return p});
    const shape=svg('path',{fill:'none',stroke:s.color,'stroke-width':1.25/scale});g.append(shape);
    const scaffold=svg('g',{'stroke-width':1/scale,stroke:s.guideColor??'#737373',fill:'#ffffff'});g.append(scaffold);
    const box=fill.getBBox();groups.push({index,commands,fill,clip,strokes,scaffold,shape,top:box.y,bottom:box.y+box.height});
   });
   const guides=svg('g',{stroke:s.guideColor??'#737373','stroke-width':.7/scale});wordRoot.prepend(guides);
   const metrics:[string,number][]=[['Cap height',-727.539],['x-height',-545.898],['Baseline',0],['Descender',241.211]];
   metrics.forEach(([label,y])=>{guides.append(svg('line',{x1:-300,x2:width+300,y1:y,y2:y}));const text=svg('text',{x:-300,y:y-5/scale,fill:s.guideColor??'#737373',stroke:'none','font-size':11/scale,'font-family':'TuneShapeMotionInter,system-ui','font-weight':500,'letter-spacing':0});text.textContent=label;guides.append(text)});
   if(s.kind==='outline-trace'){guides.remove();groups.forEach(g=>{g.scaffold.remove();g.shape.remove()})}
   vectorPaint=(f,final)=>{
    for(const g of groups){
     if(s.kind==='outline-trace'){
      const u=f-g.index*(s.stagger??3),fill=s.fill?ease((u-14)/12):0;g.clip.setAttribute('y',String(g.bottom-(g.bottom-g.top)*fill));g.strokes.forEach(stroke=>{const counter=stroke.dataset.counter==='true';stroke.style.strokeDashoffset=String(1-inOut((u-(counter?4:0))/(counter?14:18)));stroke.style.opacity=String(s.keepStroke||!s.fill?1:1-fill)});
     }else{
      const local=f-g.index*2,fill=inOut((local-40)/10),fade=s.keepPoints?1:1-inOut((local-46)/12),outline=clamp((local-8)/4),anchorTotal=g.commands.filter(c=>c[0]==='L'||c[0]==='C').length+g.commands.filter((c,i)=>{if(c[0]!=='Z')return false;const m=g.commands.slice(0,i).reverse().find(p=>p[0]==='M'),at=g.commands[i-1];return !!m&&!!at&&(m[1]!==at.at(-2)||m[2]!==at.at(-1))}).length,curveTotal=g.commands.filter(c=>c[0]==='C').length;g.clip.setAttribute('y','-1000');g.strokes.forEach(p=>p.style.display='none');
      let current=[0,0],start=[0,0],anchorIndex=0,curveIndex=0;const out:Command[]=[];g.scaffold.replaceChildren();
      const addPoint=(px:number,py:number)=>{const order=anchorIndex++,at=8+(anchorTotal>1?10*order/(anchorTotal-1):0),appear=Math.max(0,back((local-at)/4,1.7));if(appear<=0)return;const size=6/scale*appear;g.scaffold.append(svg('rect',{x:px-size/2,y:py-size/2,width:size,height:size,'stroke-width':1.25/scale}))};
      for(const command of g.commands){const op=command[0],values=command.slice(1) as number[];
       if(op==='M'){current=[values[0],values[1]];start=current;out.push(command)}
       else if(op==='L'){addPoint(...current as [number,number]);out.push(command);current=[values[0],values[1]]}
       else if(op==='C'){
        addPoint(...current as [number,number]);const order=curveIndex++,at=18+(curveTotal>1?14*order/(curveTotal-1):0),pull=back((local-at)/8,1.6),end=[values[4],values[5]],h1=[current[0]+(values[0]-current[0])*pull,current[1]+(values[1]-current[1])*pull],h2=[end[0]+(values[2]-end[0])*pull,end[1]+(values[3]-end[1])*pull];out.push(['C',...h1,...h2,...end]);
        if(pull>0)for(const [a,b] of [[current,h1],[end,h2]]){g.scaffold.append(svg('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],'stroke-width':1/scale}));g.scaffold.append(svg('circle',{cx:b[0],cy:b[1],r:2.6/scale,fill:s.guideColor??'#737373',stroke:'none'}))}current=end;
       }else{if(current[0]!==start[0]||current[1]!==start[1])addPoint(...current as [number,number]);out.push(command);current=start}
      }
      const d=path(out);g.shape.setAttribute('d',d);g.fill.setAttribute('d',d);g.shape.style.opacity=String(outline*fade);g.scaffold.style.opacity=String(fade);g.fill.style.opacity=String(fill);

     }
    }
    if(s.kind==='glyph-anatomy'){const last=(groups.length-1)*2,fade=s.keepPoints?1:1-inOut((f-last-46)/12);guides.style.opacity=String(s.guides?.7*fade:0);[...guides.children].forEach((node,i)=>{const draw=ease((f-Math.floor(i/2)*3)/10);if(node.tagName==='line')node.setAttribute('x2',String(-300+(width+600)*draw));else (node as SVGElement).style.opacity=String(draw)})}
    if(final)host.dataset.complete='true';
   };
  }
  function build(){
   const own=++version;ready=false;vectorPaint=undefined;stage.replaceChildren();nodes=[];cursor=undefined;dot=undefined;host.dataset.complete='false';host.setAttribute('aria-label',s.text+(runtime.language==='en'?'. Replay animation':'，重播动效'));Object.assign(stage.style,{fontFamily:s.kind==='period-drop'?'TuneShapeMotionInter,system-ui':'TuneShapeMotionGeist,system-ui',letterSpacing:s.kind==='soft-blur-in'?'-0.05em':s.kind==='period-drop'?'0':'-0.03em',lineHeight:s.kind==='period-drop'?'1':'1.4285714286',fontSize:s.fontSize+'px',fontWeight:String(s.fontWeight),color:s.color,width:'max-content',height:'auto'});
   if(['outline-trace','glyph-anatomy'].includes(s.kind)){host.dataset.loading='true';Promise.all([geometry(),document.fonts.load('500 11px TuneShapeMotionInter')]).then(([data])=>{if(dead||own!==version)return;atlas=data;buildVector(atlas);host.dataset.loading='false';ready=true;paint(!playing||runtime.reduced);if(pending){pending=false;demonstrate()}}).catch(()=>{if(dead||own!==version)return;stage.textContent=s.text;host.dataset.error='glyph-data';host.dataset.loading='false';timer.sleep()});return}
   const layout=()=>{
   if(s.kind==='short-slide-down'||s.kind==='kinetic-center-build'){
    nodes=words().map(word=>element('span','type-word',word));nodes.forEach(n=>stage.append(n));wordWidths=nodes.map(n=>n.offsetWidth);stage.style.width=(s.kind==='short-slide-down'?Math.max(...wordWidths):wordWidths.reduce((a,b)=>a+b,0)+10*(nodes.length-1))+'px';stage.style.height=(s.kind==='short-slide-down'?s.fontSize*nodes.length+12*(nodes.length-1):s.fontSize*1.4285714286)+'px';
   }else{
    const row=element('span');row.style.cssText='display:inline-block;position:relative;white-space:pre;';stage.append(row);
    nodes=chars().map(ch=>element('span','type-char',ch));nodes.forEach(n=>{if(s.kind==='period-drop'){const clip=element('span');clip.style.cssText='display:inline-block;overflow:hidden;padding-bottom:.15em;margin-bottom:-.15em;vertical-align:top;';clip.append(n);row.append(clip)}else row.append(n)});
    if(s.kind==='period-drop'){dot=element('span','type-period');dot.style.cssText+=`width:${s.dotSize}em;height:${s.dotSize}em;background:${s.dotColor};`;row.append(dot)}
    if(s.kind==='typewriter-text'&&s.cursor){cursor=element('span');cursor.style.cssText=`display:inline-block;width:.08em;height:1em;margin-left:.04em;vertical-align:text-bottom;background:${s.cursorColor};`;row.append(cursor)}
   }
   ready=true;host.dataset.loading='false';paint(!playing||runtime.reduced);if(pending){pending=false;demonstrate()}};
   host.dataset.loading='true';document.fonts.load(`${s.fontWeight} ${s.fontSize}px ${s.kind==='period-drop'?'TuneShapeMotionInter':'TuneShapeMotionGeist'}`).then(()=>{if(!dead&&own===version)layout()},()=>{if(!dead&&own===version)layout()});
  }
  function settle(){pending=false;age=total();playing=false;paint(true);timer.sleep()}
  function demonstrate(){if(dead||!runtime.enabled||runtime.paused)return;if(!ready){pending=true;return}age=0;playing=true;host.dataset.complete='false';if(runtime.reduced)settle();else{paint();timer.wake()}}
  const click=(event:Event)=>{event.stopPropagation();demonstrate()},key=(event:KeyboardEvent)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();demonstrate()}};host.addEventListener('click',click);host.addEventListener('keydown',key);clean.push(()=>{host.removeEventListener('click',click);host.removeEventListener('keydown',key)});
  build();
  return {demonstrate,settle,getValue:()=>({elapsed:age,progress:host.dataset.progress,ready}),update(next:TypographySettings,r:NativeEffectRuntime){const changed=JSON.stringify(next)!==JSON.stringify(s);s=next;runtime=r;host.setAttribute('aria-label',s.text+(r.language==='en'?'. Replay animation':'，重播动效'));timer.update(r);if(changed)build();if(r.reduced){playing=false;timer.sleep();paint(true)}else paint(!playing)},destroy(){dead=true;version++;timer.destroy();clean.forEach(fn=>fn());host.replaceChildren();host.classList.remove('type-motion')}};
 }
 return {createTypography,dotState};
}
const engine=typographyFactory(nativeEffectTools(),glyphAtlasGzip,typographyFontCss);
export const createTypography=engine.createTypography;
export const periodDotState=engine.dotState;
export const typographyEngineCode=(withGlyphs:boolean)=>nativeToolsCode+`\nconst createTypography=((__name)=>(${typographyFactory.toString()}))((fn)=>fn)(tools,${JSON.stringify(withGlyphs?glyphAtlasGzip:"")},${JSON.stringify(typographyFontCss)}).createTypography;`;
