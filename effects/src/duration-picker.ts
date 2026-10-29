/** Independent duration input, informed by Rare UI's public interaction. */
export type DurationValue={hours:number;minutes:number};
export type DurationSettings=DurationValue&{maxHours:number;maxMinutes:number;hoursLabel:string;minutesLabel:string;gap:number;bounce:number;height:number;radius:number;theme:'light'|'dark';defaultEditing:boolean;disabled:boolean};
export type DurationRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;language:'zh'|'en';onRunning?:(running:boolean)=>void;onChange?:(value:DurationValue)=>void;onConfirm?:(value:DurationValue)=>void};
export const defaultDuration:Readonly<DurationSettings>={hours:7,minutes:25,maxHours:24,maxMinutes:60,hoursLabel:'h',minutesLabel:'min',gap:8,bounce:.12,height:48,radius:12,theme:'light',defaultEditing:false,disabled:false};
export const durationRanges={hours:[0,999,1],minutes:[0,999,1],maxHours:[0,999,1],maxMinutes:[0,999,1],gap:[0,24,1],bounce:[0,.6,.01],height:[36,64,1],radius:[0,32,1]} as const;
export function validateDuration(value:unknown):DurationSettings{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)throw Error('时长选择器设置无效。');
 const v=value as Record<string,unknown>,keys=Object.keys(defaultDuration);
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value')))throw Error('时长选择器设置字段不完整或含未知字段。');
 for(const [key,[min,max]] of Object.entries(durationRanges))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||Number(v[key])<min||Number(v[key])>max||(key!=='bounce'&&!Number.isInteger(v[key])))throw Error(`时长选择器 ${key} 超出范围。`);
 if(Number(v.hours)>Number(v.maxHours)||Number(v.minutes)>Number(v.maxMinutes))throw Error('默认时长不能超过输入上限。');
 if(Number(v.radius)>Number(v.height)/2)throw Error('圆角不能超过控件高度的一半。');
 for(const key of ['hoursLabel','minutesLabel'])if(typeof v[key]!=='string'||!v[key].trim()||Array.from(v[key]).length>8||/[\u0000-\u001f\u007f-\u009f<>]/u.test(v[key]))throw Error('单位文字须为 1–8 个可见字符。');
 if(!['light','dark'].includes(v.theme as string)||typeof v.defaultEditing!=='boolean'||typeof v.disabled!=='boolean')throw Error('时长选择器外观或开关无效。');
 return structuredClone(v) as DurationSettings;
}

function durationEngine(){
 const css=`.duration-picker{display:flex;align-items:center;justify-content:center;position:relative;width:max-content;isolation:isolate;font-family:inherit;font-size:16px;font-weight:600;line-height:1;color:#171717;--duration-surface:#fff;--duration-muted:#9998a3}
 .duration-picker[data-theme=dark]{color:#fafafa;--duration-surface:#262626;--duration-muted:#a09fa8}
 .duration-picker .duration-segment{display:flex;align-items:center;flex:none;position:relative;overflow:hidden;background:var(--duration-surface);height:48px;box-sizing:border-box;gap:4px}
 .duration-picker .duration-field{all:unset;box-sizing:border-box;min-width:0;flex:none;height:100%;text-align:center;font:inherit;color:inherit;font-variant-numeric:tabular-nums;appearance:textfield;caret-color:currentColor;cursor:default}
 .duration-picker .duration-field::-webkit-inner-spin-button,.duration-picker .duration-field::-webkit-outer-spin-button{appearance:none;margin:0}
 .duration-picker[data-editing=true] .duration-field{cursor:text}
 .duration-picker .duration-field:focus-visible{box-shadow:inset 0 -2px 0 currentColor}
 .duration-picker .duration-unit{white-space:pre;color:var(--duration-muted);padding-right:1px}
 .duration-picker .duration-toggle{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex:none;background:var(--duration-surface);color:var(--duration-muted);cursor:pointer;touch-action:manipulation}
 .duration-picker .duration-toggle:focus-visible{outline:2px solid currentColor;outline-offset:3px}
 .duration-picker .duration-toggle:active:not(:disabled) svg{transform:scale(.88)}
 .duration-picker[data-disabled=true]{opacity:.45}.duration-picker .duration-toggle:disabled{cursor:default}
 .duration-controls details{margin-top:20px}.duration-controls summary{cursor:pointer;font-size:12px;margin-bottom:18px;color:var(--muted,#737373)}
 .duration-controls .duration-text-field{display:flex;align-items:center;gap:12px;margin:16px 0;font-size:13px}.duration-controls .duration-text-field span{flex:1}.duration-controls .duration-text-field input{width:100px;min-width:0;padding:7px 9px;border:1px solid var(--line,#ddd);border-radius:5px;font:inherit;background:transparent;color:inherit}`;
 // Exact analytical damped spring. Retargeting retains current position and velocity.
 function step(position:number,velocity:number,target:number,seconds:number,durationMs:number,bounce:number){
  const w=10/Math.max(.08,durationMs/1000),z=1-bounce*.85,y=position-target;
  if(z>.9999){const b=velocity+w*y,e=Math.exp(-w*seconds);return {position:target+(y+b*seconds)*e,velocity:(velocity-w*b*seconds)*e}}
  const a=z*w,d=w*Math.sqrt(1-z*z),b=(velocity+a*y)/d,e=Math.exp(-a*seconds),c=Math.cos(d*seconds),s=Math.sin(d*seconds);
  return {position:target+e*(y*c+b*s),velocity:e*((-a*y+b*d)*c+(-a*b-y*d)*s)};
 }
 function create(host:HTMLElement,initial:DurationSettings,initialRuntime:DurationRuntime){
  let settings=initial,runtime=initialRuntime,editing=initial.defaultEditing&&!initial.disabled,text=[String(initial.hours),String(initial.minutes)],saved=[...text],position=editing?1:0,velocity=0,target=position,shake=[0,0],shakeV=[0,0],frame=0,last=0,dead=false,reported:boolean|null=null,demo:null|{age:number;closing:boolean}=null;
  const style=document.createElement('style');style.textContent=css;host.appendChild(style);host.classList.add('duration-picker');host.setAttribute('role','group');
  const fields:HTMLInputElement[]=[],segments:HTMLDivElement[]=[],labels:HTMLSpanElement[]=[];
  for(let i=0;i<2;i++){
   const segment=document.createElement('div');segment.className='duration-segment';segment.dataset.slot='duration-picker-segment';
   const input=document.createElement('input');input.className='duration-field';input.type='number';input.inputMode='numeric';input.min='0';input.step='1';input.autocomplete='off';input.dataset.slot='duration-picker-input';
   const label=document.createElement('span');label.className='duration-unit';segment.append(input,label);host.appendChild(segment);fields.push(input);segments.push(segment);labels.push(label);
  }
  const button=document.createElement('button');button.type='button';button.className='duration-toggle';button.dataset.slot='duration-picker-toggle';
  const limits=document.createElement('small');limits.className='duration-limits';limits.style.cssText='position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);font-size:10px;line-height:1.4;white-space:nowrap;pointer-events:none;opacity:.65';host.appendChild(limits);
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),path=document.createElementNS(ns,'path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');path.setAttribute('fill','currentColor');path.setAttribute('stroke-linejoin','round');svg.appendChild(path);button.appendChild(svg);host.appendChild(button);host.dataset.slot='duration-picker';
  // Our own ten-point silhouettes use matching vertices for a continuous pencil-to-check morph.
  const pen=[[3,21],[4,15],[15,4],[17,3],[19,4],[21,6],[21,8],[20,9],[9,20],[3,21]],check=[[3,12],[5,10],[10,15],[19,5],[22,7],[11,20],[9,21],[8,20],[3,14],[3,12]];
  const clamp=(raw:string,max:number)=>Math.min(max,Math.max(0,Math.trunc(Number(raw))||0));
  const max=(i:number)=>i===0?settings.maxHours:settings.maxMinutes;
  const value=():DurationValue=>({hours:clamp(text[0],max(0)),minutes:clamp(text[1],max(1))});
  const moving=()=>Math.abs(position-target)>.0001||Math.abs(velocity)>.001||shake.some((p,i)=>Math.abs(p)>.01||Math.abs(shakeV[i])>.1);
  function report(){const running=!!demo||moving();if(running!==reported){reported=running;runtime.onRunning?.(running)}host.dataset.running=String(running)}
  function canAnimate(){return runtime.enabled&&!runtime.paused&&!runtime.reduced&&runtime.speed>0&&!document.hidden&&!dead}
  function request(){if(!frame&&canAnimate()&&(moving()||demo)){last=performance.now();frame=requestAnimationFrame(tick)}report()}
  function cancelFrame(){if(frame)cancelAnimationFrame(frame);frame=0}
  function render(){
   limits.hidden=!editing;limits.textContent=`0–${settings.maxHours} ${settings.hoursLabel} · 0–${settings.maxMinutes} ${settings.minutesLabel}`;
   const p=Math.max(0,Math.min(1,position)),h=settings.height,ratio=h/48,radius=Math.min(settings.radius,h/2),inner=radius*p,gap=Math.max(-1,settings.gap*position-(1-p));
   host.dataset.editing=String(editing);host.dataset.disabled=String(settings.disabled);host.dataset.theme=settings.theme;host.dataset.progress=position.toFixed(5);host.dataset.paused=String(runtime.paused);host.dataset.hours=String(value().hours);host.dataset.minutes=String(value().minutes);host.style.fontSize=16*ratio+'px';
   fields.forEach((input,i)=>{
    if(input.value!==text[i])input.value=text[i];input.readOnly=!editing;input.disabled=settings.disabled||!runtime.enabled||runtime.paused;input.max=String(max(i));
    input.setAttribute('aria-label',runtime.language==='zh'?(i===0?'小时':'分钟'):(i===0?'Hours':'Minutes'));
    const collapsed=Math.max(22,(text[i].length*9.7+12))*ratio;input.style.width=(collapsed+(44*ratio-collapsed)*p)+'px';input.style.transform=`translateX(${(runtime.reduced?0:velocity*.13)+shake[i]}px)`;
    const segment=segments[i];segment.style.height=h+'px';segment.style.gap=4*ratio+'px';segment.style.paddingLeft=(i===0?8*ratio:9*p*ratio)+'px';segment.style.paddingRight=(3+9*p)*ratio+'px';segment.style.borderRadius=`${i===0?radius:inner}px ${inner}px ${inner}px ${i===0?radius:inner}px`;segment.style.marginLeft=i?gap+'px':'0';
    labels[i].textContent=i===0?settings.hoursLabel:settings.minutesLabel;
   });
   button.style.width=h+'px';button.style.height=h+'px';button.style.marginLeft=gap+'px';button.style.borderRadius=`${inner}px ${radius}px ${radius}px ${inner}px`;button.disabled=settings.disabled||!runtime.enabled||runtime.paused;button.setAttribute('aria-label',runtime.language==='zh'?(editing?'确认时长':'编辑时长'):(editing?'Confirm duration':'Edit duration'));button.setAttribute('aria-expanded',String(editing));
   svg.setAttribute('width',String(18*ratio));svg.setAttribute('height',String(18*ratio));path.setAttribute('d',pen.map((point,i)=>`${i?'L':'M'}${point[0]+(check[i][0]-point[0])*p},${point[1]+(check[i][1]-point[1])*p}`).join(' ')+' Z');
  }
  function settle(){position=target;velocity=0;shake=[0,0];shakeV=[0,0]}
  function setEditing(next:boolean,focus=false,confirm=false){
   if(settings.disabled||!runtime.enabled||runtime.paused)return;
   editing=next;target=next?1:0;if(runtime.reduced)settle();
   if(!next){text=text.map((v,i)=>String(clamp(v,max(i))));if(confirm){saved=[...text];host.dataset.confirmed=JSON.stringify(value());runtime.onConfirm?.(value())}}
   render();request();if(focus){fields[0].focus();fields[0].select()}
  }
  function tick(now:number){
   frame=0;if(!canAnimate())return;const dt=Math.min(.064,Math.max(0,(now-last)/1000))*runtime.speed;last=now;
   const next=step(position,velocity,target,dt,runtime.durationMs,settings.bounce);position=next.position;velocity=next.velocity;
   shake.forEach((p,i)=>{const s=step(p,shakeV[i],0,dt,350,.55);shake[i]=s.position;shakeV[i]=s.velocity});
   if(demo){demo.age+=dt*1000;if(!demo.closing&&demo.age>=runtime.durationMs+650){demo.closing=true;setEditing(false)}if(demo&&demo.age>=runtime.durationMs*2+900)demo=null}
   if(!moving())settle();render();request();
  }
  function input(event:Event){
   const i=fields.indexOf(event.target as HTMLInputElement);if(i<0||!editing||settings.disabled||!runtime.enabled||runtime.paused)return;
   demo=null;const raw=fields[i].value,n=clamp(raw,max(i));text[i]=raw===''?'':String(n);
   if(raw!==''&&Number(raw)!==n&&!runtime.reduced){shake[i]=6;shakeV[i]=0;host.dataset.corrected=String(i)}
   render();runtime.onChange?.(value());request();
  }
  function click(event:MouseEvent){event.stopPropagation();if(!(event.target as Element).closest('.duration-toggle'))return;demo=null;setEditing(!editing,!editing,editing)}
  function key(event:KeyboardEvent){
   if(!editing||settings.disabled||!runtime.enabled||runtime.paused)return;
   if(event.key==='Enter'){event.preventDefault();event.stopPropagation();demo=null;setEditing(false,false,true);button.focus()}
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();demo=null;text=[...saved];runtime.onChange?.(value());setEditing(false);button.focus()}
  }
  function visibility(){cancelFrame();request()}
  const api={
   update(next:DurationSettings,nextRuntime:DurationRuntime){
    const previous=settings;settings=next;runtime=nextRuntime;
    fields.forEach((_,i)=>{const field=i===0?'hours':'minutes';if(previous[field]!==next[field]){text[i]=String(next[field]);saved[i]=text[i]}text[i]=text[i]===''?'':String(clamp(text[i],max(i)));saved[i]=String(clamp(saved[i],max(i)))});
    if(previous.defaultEditing!==next.defaultEditing){editing=next.defaultEditing;target=editing?1:0}
    if(settings.disabled){demo=null;editing=false;target=0}
    if(runtime.reduced){demo=null;settle()}cancelFrame();render();request();
   },
   demonstrate(){if(settings.disabled||!runtime.enabled||runtime.paused){report();return}demo=null;setEditing(true);if(!runtime.reduced)demo={age:0,closing:false};request()},
   getValue:value,
   destroy(){dead=true;cancelFrame();host.removeEventListener('input',input);host.removeEventListener('click',click);host.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);host.replaceChildren();runtime.onRunning?.(false)},
  };
  host.addEventListener('input',input);host.addEventListener('click',click);host.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);render();request();return api;
 }
 return {css,step,create};
}
const engine=durationEngine();
export const durationCss=engine.css;
export const durationStep=engine.step;
export const createDurationPicker=engine.create;
export const durationEngineCode=`const durationEngine=((__name)=>(${durationEngine.toString()}))((fn)=>fn)();\nconst createDurationPicker=durationEngine.create;`;
