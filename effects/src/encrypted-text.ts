import {interFontCss} from './typography-fonts';
import type {EncryptedTextSettings} from './aceternity-settings';
import {nativeEffectTools,nativeToolsCode} from './native-effect-tools';
import type {NativeEffectRuntime} from './native-effect-tools';
/** Original deterministic reveal algorithm; this is a visual effect, not cryptography. */
export function encryptedFrame(text:string,charset:string,elapsed:number,duration:number,flipMs:number){
 const source=Array.from(text),alphabet=Array.from(charset),count=Math.min(source.length,Math.floor(Math.max(0,elapsed)/Math.max(1,duration)*source.length)),step=Math.floor(Math.max(0,elapsed)/Math.max(1,flipMs));
 return source.map((char,index)=>{const revealed=index<count||/\s/u.test(char);let hash=Math.imul(index+17,374761393)^Math.imul(step+31,668265263);hash=Math.imul(hash^(hash>>>13),1274126177);return {char:revealed?char:alphabet[(hash>>>0)%Math.max(1,alphabet.length)]??char,revealed}});
}
function encryptedFactory(tools:ReturnType<typeof nativeEffectTools>,makeFrame:typeof encryptedFrame,fontCss:string){
function createEncryptedText(host:HTMLElement,initial:EncryptedTextSettings,initialRuntime:NativeEffectRuntime){
 let settings=initial,runtime=initialRuntime,elapsed=runtime.durationMs+(runtime.delayMs??0),playing=false,dead=false;
 tools.install(host,'encrypted-text',`${fontCss}.encrypted-text{width:max-content;max-width:100%;font-family:TuneShapeMotionInter,system-ui,-apple-system,sans-serif}.encrypted-text .et-button{all:unset;display:block;max-width:100%;font:inherit;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;cursor:pointer}.encrypted-text .et-button:focus-visible{outline:2px solid currentColor;outline-offset:6px}.encrypted-text .et-cell{display:inline-block;position:relative;vertical-align:baseline}.encrypted-text .et-original{opacity:0}.encrypted-text .et-noise{position:absolute;inset:0;text-align:center;user-select:none;pointer-events:none}`);
 const button=tools.element('button','et-button');button.type='button';host.appendChild(button);let cells:{source:HTMLSpanElement;noise:HTMLSpanElement}[]=[];
 const clock=tools.clock(runtime,dt=>{elapsed+=dt;render();if(elapsed>=runtime.durationMs+(runtime.delayMs??0)){playing=false;return false}return playing},host);
 function build(){button.replaceChildren();cells=Array.from(settings.text).map(char=>{const cell=tools.element('span','et-cell'),source=tools.element('span','et-original',char),noise=tools.element('span','et-noise');cell.setAttribute('aria-hidden','true');cell.append(source,noise);button.appendChild(cell);return {source,noise}})}
 function render(){const age=elapsed-(runtime.delayMs??0),frame=makeFrame(settings.text,settings.charset,age,runtime.durationMs,settings.flipDelayMs);button.setAttribute('aria-label',settings.text);button.title=runtime.language==='zh'?'点击重新解码':'Click to replay';button.disabled=!runtime.enabled||runtime.paused;host.style.fontSize=settings.fontSize+'px';host.dataset.revealed=String(frame.filter(cell=>cell.revealed).length);host.dataset.elapsed=String(elapsed);cells.forEach((cell,i)=>{const value=frame[i];cell.source.style.opacity=value.revealed?'1':'0';cell.source.style.color=settings.revealedColor;cell.noise.textContent=value.char;cell.noise.style.opacity=value.revealed?'0':'1';cell.noise.style.color=settings.encryptedColor})}
 function settle(){elapsed=runtime.durationMs+(runtime.delayMs??0);playing=false;render();clock.sleep()}
 function start(){if(dead||!runtime.enabled||runtime.paused)return;elapsed=runtime.reduced?runtime.durationMs+(runtime.delayMs??0):0;playing=!runtime.reduced;render();if(playing)clock.wake();else clock.sleep()}
 function click(event:MouseEvent){event.stopPropagation();start()}
 function key(event:KeyboardEvent){if(event.key===' '||event.key==='Enter')event.stopPropagation()}
 button.addEventListener('click',click);button.addEventListener('keydown',key);build();render();
 return {update(next:EncryptedTextSettings,nextRuntime:NativeEffectRuntime){const content=settings.text!==next.text,changed=JSON.stringify(settings)!==JSON.stringify(next)||runtime.durationMs!==nextRuntime.durationMs;settings=next;runtime=nextRuntime;clock.update(runtime);if(content)build();if(runtime.reduced){elapsed=runtime.durationMs+(runtime.delayMs??0);playing=false;clock.sleep()}else if(changed&&playing)elapsed=0;render()},demonstrate:start,settle,getValue:()=>settings.text,destroy(){dead=true;clock.destroy();button.removeEventListener('click',click);button.removeEventListener('keydown',key);host.replaceChildren()}};
}
 return createEncryptedText;
}
export const createEncryptedText=encryptedFactory(nativeEffectTools(),encryptedFrame,interFontCss);
export const encryptedEngineCode=nativeToolsCode+`\nconst encryptedFrame=((__name)=>(${encryptedFrame.toString()}))((fn)=>fn);`+`\nconst createEncryptedText=((__name)=>(${encryptedFactory.toString()}))((fn)=>fn)(tools,encryptedFrame,${JSON.stringify(interFontCss)});`;
