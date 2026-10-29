import test from 'node:test';
import assert from 'node:assert/strict';
import {gooeyEngineCode} from './gooey-input';
import {defaultGooeyInput} from './aceternity-settings';
import type {GooeyInputSettings} from './aceternity-settings';
import type {NativeEffectRuntime} from './native-effect-tools';

// Execute the same portable DOM engine shipped in Prompt projects. The small DOM
// double records actual input state and painted widths; the RAF queue is explicit.
class Element extends EventTarget {
 className='';textContent='';value='';hidden=false;disabled=false;parent:Element|null=null;
 children:Element[]=[];style:Record<string,string>={};dataset:Record<string,string>={};attributes:Record<string,string>={};
 classList={add:(name:string)=>{this.className+=' '+name}};
 constructor(readonly tagName:string){super()}
 append(...nodes:Element[]){for(const node of nodes){node.parent=this;this.children.push(node)}}
 appendChild(node:Element){this.append(node);return node}
 replaceChildren(...nodes:Element[]){this.children=[];this.append(...nodes)}
 setAttribute(name:string,value:string){this.attributes[name]=value}
 contains(node:Element){return this===node||this.children.some(child=>child.contains(node))}
 querySelector(selector:string):Element|null{return this.children.find(n=>n.className.split(' ').includes(selector.slice(1)))??this.children.map(n=>n.querySelector(selector)).find(Boolean)??null}
 focus(){}
}
function fixture(settings:Partial<GooeyInputSettings>={}){
 const host=new Element('div'),frames=new Map<number,(time:number)=>void>();let nextId=0,now=0;
 const document=Object.assign(new EventTarget(),{hidden:false,activeElement:null,createElement:(tag:string)=>new Element(tag),createElementNS:(_ns:string,tag:string)=>new Element(tag)});
 const create=Function('document','requestAnimationFrame','cancelAnimationFrame','crypto',gooeyEngineCode+';return createGooeyInput;')(document,(fn:(time:number)=>void)=>{frames.set(++nextId,fn);return nextId},(id:number)=>frames.delete(id),{randomUUID:()=>String(++nextId)});
 let state={...defaultGooeyInput,...settings},runtime:NativeEffectRuntime={enabled:true,paused:false,reduced:false,speed:1,durationMs:400,language:'en'};
 const api=create(host,state,runtime),input=host.querySelector('.gi-value')!,trigger=host.querySelector('.gi-open')!,field=host.querySelector('.gi-field')!;
 return {host,input,trigger,api,frames,paint:()=>({open:host.dataset.open,progress:host.dataset.progress,width:field.style.width,left:field.style.left,inputHidden:input.hidden}),
  update(settings:Partial<GooeyInputSettings>={},options:Partial<NativeEffectRuntime>={}){state={...state,...settings};runtime={...runtime,...options};api.update(state,runtime)},
  advance(count=12){for(let i=0;i<count;i++){now+=16;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now))}},
 };
}

test('disabled input with default text is collapsed and stable before and after pause/resume',()=>{
 const f=fixture({disabled:true,defaultValue:'Saved search'}),initial=f.paint();
 assert.equal(initial.open,'false');assert.equal(initial.progress,'0.00000');assert.equal(initial.width,defaultGooeyInput.collapsedWidth+'px');
 assert.equal(f.input.disabled,true);assert.equal(f.trigger.disabled,true);assert.equal(f.api.getValue(),'Saved search');
 f.update({}, {paused:true});f.update({}, {paused:false});f.api.demonstrate();f.advance(60);
 assert.deepEqual(f.paint(),initial);assert.equal(f.frames.size,0);assert.equal(f.api.getValue(),'Saved search');f.api.destroy();
});

test('enabled default text stays expanded and editable across pause/resume',()=>{
 const f=fixture({defaultValue:'Saved search'}),initial=f.paint();
 assert.equal(initial.open,'true');assert.equal(initial.width,defaultGooeyInput.expandedWidth+'px');assert.equal(f.input.hidden,false);assert.equal(f.input.disabled,false);
 f.input.value='Edited search';f.input.dispatchEvent(new Event('input'));assert.equal(f.api.getValue(),'Edited search');
 f.update({}, {paused:true});assert.equal(f.input.disabled,true);f.update({}, {paused:false});assert.equal(f.input.disabled,false);assert.deepEqual(f.paint(),initial);assert.equal(f.frames.size,0);f.api.destroy();
});

test('disabling an in-flight demonstration settles immediately and cannot resume residual motion',()=>{
 const f=fixture();f.api.demonstrate();f.advance();assert.notEqual(f.host.dataset.progress,'0.00000');
 f.update({}, {paused:true});f.update({disabled:true});const disabled=f.paint();
 assert.equal(disabled.open,'false');assert.equal(disabled.progress,'0.00000');assert.equal(f.frames.size,0);
 f.update({}, {paused:false});f.api.demonstrate();f.advance(60);assert.deepEqual(f.paint(),disabled);assert.equal(f.frames.size,0);f.api.destroy();
});
