import {skiperGroupA,createSkiperA,skiperAEngineCode} from './skiper-group-a';
import {skiperGroupB,createSkiperB,skiperBEngineCode} from './skiper-group-b';
import {skiperGroupC,createSkiperC,skiperCEngineCode} from './skiper-group-c';
import {skiperGroupD,createSkiperD,skiperDEngineCode} from './skiper-group-d';
import type {SkiperDefinition,SkiperSettings,SkiperRuntime} from './skiper-types';
import {installSkiperFonts,withSkiperFontSource} from './skiper-fonts';
export const skiperDefinitions:SkiperDefinition[]=[...skiperGroupA,...skiperGroupB,...skiperGroupC,...skiperGroupD];
export const skiperMap:Record<string,SkiperDefinition>=Object.fromEntries(skiperDefinitions.map(d=>[d.id,d]));
export const isSkiperEffect=(id:string)=>Object.hasOwn(skiperMap,id);
export const skiperGroup=(id:string)=>skiperGroupA.some(d=>d.id===id)?'a':skiperGroupB.some(d=>d.id===id)?'b':skiperGroupC.some(d=>d.id===id)?'c':'d';
export function createSkiperEffect(host:HTMLElement,id:string,settings:SkiperSettings,runtime:SkiperRuntime){installSkiperFonts(host.ownerDocument);return ({a:createSkiperA,b:createSkiperB,c:createSkiperC,d:createSkiperD})[skiperGroup(id)](host,id,settings,runtime)}
export function skiperEngineSource(id:string){const group=skiperGroup(id),name='createSkiper'+group.toUpperCase(),code=({a:skiperAEngineCode,b:skiperBEngineCode,c:skiperCEngineCode,d:skiperDEngineCode})[group];return {name,code:withSkiperFontSource(name,code)}}
export function validateSkiper(id:string,value:unknown):SkiperSettings{
 const d=skiperMap[id];if(!d||!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype)throw Error('Skiper 组件设置无效。');
 let v=value as SkiperSettings;const keys=Object.keys(d.defaults);
 // The first published 81/82 presets predate adjustable local demo replies.
 // Migrate only their exact complete old shape; retain strict validation otherwise.
 const replyKeys=['replyText','replyDelay'],legacyKeys=keys.filter(k=>!replyKeys.includes(k));
 if(['skiper-81','skiper-82'].includes(id)&&replyKeys.every(k=>Object.hasOwn(d.defaults,k)&&!Object.hasOwn(v,k))&&Reflect.ownKeys(v).length===legacyKeys.length&&legacyKeys.every(k=>Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value'))){
  v=Object.fromEntries(keys.map(k=>[k,replyKeys.includes(k)?d.defaults[k]:Object.getOwnPropertyDescriptor(v,k)!.value]));
 }
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value')))throw Error('Skiper 设置字段缺失或含未知字段。');
 for(const key of keys){const x=v[key],control=d.controls.find(c=>c.key===key);if(typeof x!==typeof d.defaults[key])throw Error('Skiper 参数类型无效：'+key);
  if(typeof x==='number'&&(!Number.isFinite(x)||(control?.min!==undefined&&x<control.min)||(control?.max!==undefined&&x>control.max)))throw Error('Skiper 数值超出范围：'+key);
  if(typeof x==='string'){if(x.length>12000000||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(x))throw Error('Skiper 内容无效：'+key);if(control?.kind==='color'&&!/^#[\da-f]{6}$/i.test(x))throw Error('颜色须为六位十六进制。');if(control?.kind==='select'&&!control.options?.some(o=>o.value===x))throw Error('Skiper 选项无效：'+key)}
 }
 for(const key of ['selectedIndex','colorIndex','paragraphs'])if(Object.hasOwn(v,key)&&!Number.isInteger(v[key]))throw Error('序号和数量必须是整数。');
 for(const [key,list] of [['selectedIndex','images'],['colorIndex','colorNames']] as const)if(typeof v[key]==='number'&&typeof v[list]==='string'&&(v[key] as number)>=String(v[list]).split('\n').filter(x=>x.trim()).length)throw Error('默认序号超出当前内容列表。');
 if(typeof v.models==='string'&&typeof v.initialModel==='string'&&!v.models.split('\n').includes(v.initialModel))throw Error('默认模型须在模型列表中。');
 return structuredClone(v);
}
