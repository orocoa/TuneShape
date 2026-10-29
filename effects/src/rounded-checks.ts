import {interFontCss} from './typography-fonts';
/** Adapted from Uiverse.io by uiverse-astronaut, under the MIT license. */
export type CheckItem={label:string;checked:boolean};
export type RoundedChecksSettings={items:CheckItem[];size:number;radius:number;rowGap:number;labelGap:number;fontSize:number;checkedColor:string;textColor:string;boxColor:string;borderColor:string;checkColor:string;disabled:boolean};
export const defaultRoundedChecks:Readonly<RoundedChecksSettings>={items:[{label:'Daily summary email',checked:true},{label:'Weekly performance digest',checked:true},{label:'Product release notes',checked:false}],size:20,radius:8,rowGap:14,labelGap:12,fontSize:15,checkedColor:'#929292',textColor:'#737373',boxColor:'#ffffff',borderColor:'#e3e8ee',checkColor:'#ffffff',disabled:false};
export const roundedChecksRanges={size:[16,36],radius:[0,18],rowGap:[4,28],labelGap:[6,24],fontSize:[12,22]} as const;
function exact(value:unknown,keys:string[]):asserts value is Record<string,unknown>{
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(value,key)??{},'value')))throw Error('复选框设置字段不完整或含未知字段。');
}
export function validateRoundedChecks(value:unknown):RoundedChecksSettings{
 exact(value,Object.keys(defaultRoundedChecks));
 for(const [key,[min,max]] of Object.entries(roundedChecksRanges))if(typeof value[key]!=='number'||!Number.isInteger(value[key])||Number(value[key])<min||Number(value[key])>max)throw Error('复选框尺寸超出范围。');
 if(Number(value.radius)>Number(value.size)/2)throw Error('复选框圆角不能超过尺寸的一半。');
 for(const key of ['checkedColor','textColor','boxColor','borderColor','checkColor'])if(typeof value[key]!=='string'||!/^#[0-9a-f]{6}$/i.test(value[key]))throw Error('复选框颜色须为六位十六进制。');
 if(typeof value.disabled!=='boolean')throw Error('复选框禁用状态无效。');
 const items=value.items;
 if(!Array.isArray(items)||Object.getPrototypeOf(items)!==Array.prototype||items.length<1||items.length>8||Reflect.ownKeys(items).length!==items.length+1)throw Error('请输入 1–8 个复选项。');
 for(let i=0;i<items.length;i++){
  if(!Object.hasOwn(Object.getOwnPropertyDescriptor(items,String(i))??{},'value'))throw Error('复选项必须是连续的普通数据。');
  const item:unknown=items[i];exact(item,['label','checked']);
  if(typeof item.label!=='string'||!item.label.trim()||Array.from(item.label).length>80||/[\u0000-\u001f\u007f-\u009f<>]/u.test(item.label)||typeof item.checked!=='boolean')throw Error('复选项须包含 1–80 个可见字符及勾选状态。');
 }
 return structuredClone(value) as RoundedChecksSettings;
}
export type ChecksRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;durationMs:number;delayMs?:number;cssEasing?:string;interruption?:'retarget'|'restart';language:'zh'|'en';onRunning?:(running:boolean)=>void;onChange?:(checked:boolean[])=>void};
function roundedChecksEngine(fontCss:string){
 const css=fontCss+`.rounded-checks{display:inline-flex;flex-direction:column;width:max-content;max-width:100%;font-family:TuneShapeMotionInter,system-ui,-apple-system,sans-serif;font-weight:400;isolation:isolate}
 .rounded-checks .rc-row{display:flex;align-items:center;position:relative;margin:0;padding:0;cursor:pointer;touch-action:manipulation;user-select:none}
 .rounded-checks .rc-input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:inherit}
 .rounded-checks .rc-box{position:relative;display:grid;place-items:center;flex:none;box-sizing:content-box;border:1.5px solid;corner-shape:round;pointer-events:none}
 .rounded-checks .rc-mark{display:block;width:55%;height:55%;pointer-events:none}
 .rounded-checks .rc-label{line-height:1.2;overflow-wrap:anywhere;min-width:0;pointer-events:none}
 .rounded-checks .rc-input:focus-visible+.rc-box{box-shadow:0 0 0 3px rgba(46,125,239,.32)}
 .rounded-checks[data-disabled=true]{opacity:.45}.rounded-checks[data-disabled=true] .rc-row{cursor:default}
 .rounded-checks-controls .rc-content-row{display:grid;grid-template-columns:18px minmax(0,1fr) 24px;gap:8px;align-items:center;margin:12px 0}
 .rounded-checks-controls .rc-content-row input[type=text]{width:100%;min-width:0;box-sizing:border-box;padding:8px 10px;font:inherit;background:transparent;color:inherit;border:1px solid var(--line,#ddd)}
 .rounded-checks-controls .rc-remove{padding:0;width:24px;height:28px;border:0;background:transparent;color:inherit;cursor:pointer}.rounded-checks-controls .rc-add{margin:4px 0 14px}`;
 function create(host:HTMLElement,initial:RoundedChecksSettings,initialRuntime:ChecksRuntime){
  let settings=initial,runtime=initialRuntime,selected=initial.items.map(item=>item.checked),dead=false,reported=false;
  const rows:{label:HTMLLabelElement;input:HTMLInputElement;box:HTMLSpanElement;mark:SVGSVGElement;text:HTMLSpanElement}[]=[],animations=new Set<Animation>();let demo:Animation|null=null;
  const style=document.createElement('style');style.textContent=css;host.appendChild(style);host.classList.add('rounded-checks');host.setAttribute('role','group');
  function report(){const running=animations.size>0||demo!==null;if(running!==reported){reported=running;runtime.onRunning?.(running)}host.dataset.running=String(running)}
  function sync(){const frozen=runtime.paused||!runtime.enabled||document.hidden||runtime.speed<=0;for(const animation of [...animations,...(demo?[demo]:[])]){animation.updatePlaybackRate(Math.max(.01,runtime.speed));if(frozen)animation.pause();else animation.play()}host.dataset.paused=String(frozen);report()}
  function cancelDemo(){if(demo){demo.onfinish=null;demo.cancel();demo=null}report()}
  function cancelAll(){cancelDemo();for(const animation of animations){animation.onfinish=null;animation.cancel()}animations.clear();report()}
  function animate(node:HTMLElement|SVGSVGElement,target:Record<string,string>,ms:number){
   const camel=(key:string)=>key.replace(/-([a-z])/g,(_,letter:string)=>letter.toUpperCase()),frames=(values:Record<string,string>)=>Object.fromEntries(Object.entries(values).map(([key,value])=>[camel(key),value]));
   const computed=getComputedStyle(node),from=Object.fromEntries(Object.keys(target).map(key=>[key,computed.getPropertyValue(key)]));
   for(const animation of [...animations])if((animation.effect as KeyframeEffect).target===node&&Object.keys(target).some(key=>Object.hasOwn((animation.effect as KeyframeEffect).getKeyframes()[0],camel(key)))){animation.onfinish=null;animation.cancel();animations.delete(animation)}
   for(const [key,value] of Object.entries(target))node.style.setProperty(key,value);
   if(runtime.reduced||!runtime.enabled||dead)return;
   const opposite=Object.fromEntries(Object.keys(target).map(key=>[key,key==='opacity'?(target[key]==='1'?'0':'1'):key==='transform'?(target[key]==='scale(1)'?'scale(0.6)':'scale(1)'):target[key]===settings.checkedColor?(key==='background-color'?settings.boxColor:settings.borderColor):settings.checkedColor]));
   const animation=node.animate([frames(runtime.interruption==='restart'?opposite:from),frames(target)],{duration:ms,delay:runtime.delayMs??0,easing:runtime.cssEasing??'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
   animations.add(animation);animation.onfinish=()=>{animation.onfinish=null;animation.cancel();animations.delete(animation);report()};sync();
  }
  function paint(index:number,motion=false){const row=rows[index],checked=selected[index],box={ 'background-color':checked?settings.checkedColor:settings.boxColor,'border-color':checked?settings.checkedColor:settings.borderColor},mark={opacity:checked?'1':'0',transform:checked?'scale(1)':'scale(0.6)'};
   row.input.checked=checked;
   if(motion){animate(row.box,box,runtime.durationMs);animate(row.mark,{opacity:mark.opacity},runtime.durationMs*180/220);animate(row.mark,{transform:mark.transform},runtime.durationMs)}
   else{for(const [key,value] of Object.entries(box))row.box.style.setProperty(key,value);for(const [key,value] of Object.entries(mark))row.mark.style.setProperty(key,value)}
  }
  function build(){
   for(const row of rows)row.label.remove();rows.length=0;
   settings.items.forEach((_,index)=>{
    const label=document.createElement('label');label.className='rc-row';
    const input=document.createElement('input');input.type='checkbox';input.className='rc-input';input.dataset.index=String(index);
    const box=document.createElement('span');box.className='rc-box';box.setAttribute('aria-hidden','true');
    const mark=document.createElementNS('http://www.w3.org/2000/svg','svg');mark.classList.add('rc-mark');mark.setAttribute('viewBox','0 0 24 24');mark.setAttribute('fill','none');mark.setAttribute('stroke','currentColor');mark.setAttribute('stroke-width','3');mark.setAttribute('stroke-linecap','round');mark.setAttribute('stroke-linejoin','round');
    const path=document.createElementNS('http://www.w3.org/2000/svg','polyline');path.setAttribute('points','20 6 9 17 4 12');mark.appendChild(path);box.appendChild(mark);
    const text=document.createElement('span');text.className='rc-label';label.append(input,box,text);host.appendChild(label);rows.push({label,input,box,mark,text});
   });
  }
  function layout(){
   host.style.gap=settings.rowGap+'px';host.style.fontSize=settings.fontSize+'px';host.style.color=settings.textColor;host.dataset.disabled=String(settings.disabled);host.setAttribute('aria-label',runtime.language==='en'?'Notification preferences':'通知偏好');
   rows.forEach((row,index)=>{row.label.style.gap=settings.labelGap+'px';row.box.style.width=settings.size+'px';row.box.style.height=settings.size+'px';row.box.style.borderRadius=settings.radius+'px';row.mark.style.color=settings.checkColor;row.text.textContent=settings.items[index].label;row.input.setAttribute('aria-label',settings.items[index].label);row.input.disabled=settings.disabled||!runtime.enabled||runtime.paused});
  }
  function change(event:Event){event.stopPropagation();const input=event.target as HTMLInputElement,index=Number(input.dataset.index);if(input.type!=='checkbox'||!rows[index]||settings.disabled||!runtime.enabled||runtime.paused)return;cancelDemo();selected[index]=input.checked;paint(index,true);runtime.onChange?.([...selected])}
  function click(event:MouseEvent){event.stopPropagation()}
  function key(event:KeyboardEvent){if(event.key===' '||event.key==='Enter')event.stopPropagation()}
  const api={update(next:RoundedChecksSettings,nextRuntime:ChecksRuntime){
   const previous=settings,changed=JSON.stringify(next)!==JSON.stringify(settings),timing=runtime.durationMs!==nextRuntime.durationMs||runtime.cssEasing!==nextRuntime.cssEasing;settings=next;runtime=nextRuntime;
   if(changed||timing||runtime.reduced){cancelAll();if(next.items.length!==rows.length){selected=next.items.map(item=>item.checked);build()}else next.items.forEach((item,index)=>{if(previous.items[index].checked!==item.checked)selected[index]=item.checked});rows.forEach((_,index)=>paint(index))}
   layout();sync();
  },demonstrate(){
   if(settings.disabled||!runtime.enabled||runtime.paused||dead)return;cancelDemo();const original=[...selected];selected[0]=!selected[0];paint(0,true);
   if(!runtime.reduced){demo=host.animate([{opacity:1},{opacity:1}],{duration:runtime.durationMs+(runtime.delayMs??0)+320});demo.onfinish=()=>{cancelDemo();selected=original;rows.forEach((_,index)=>paint(index,true))};sync()}
  },getValue:()=>[...selected],destroy(){dead=true;cancelAll();host.removeEventListener('change',change);host.removeEventListener('click',click);host.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',sync);host.replaceChildren();runtime.onRunning?.(false)}};
  host.addEventListener('change',change);host.addEventListener('click',click);host.addEventListener('keydown',key);document.addEventListener('visibilitychange',sync);build();layout();rows.forEach((_,index)=>paint(index));return api;
 }
 return {create,css};
}
const engine=roundedChecksEngine(interFontCss);
export const createRoundedChecks=engine.create;
export const roundedChecksEngineCode=`const roundedChecksEngine=((__name)=>(${roundedChecksEngine.toString()}))((fn)=>fn)(${JSON.stringify(interFontCss)});\nconst createRoundedChecks=roundedChecksEngine.create;`;
