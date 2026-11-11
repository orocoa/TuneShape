import {reelItems} from './elastic-reel-art';
import {defaultBencho,validateBencho,type BenchImage} from './bencho-settings';
export type ReelfolioKind='rig';
export const reelfolioKinds=['rig'] as const;
export type ReelfolioSettings={kind:ReelfolioKind;images:BenchImage[];initialIndex:number;background:string;ink:string;holdMs:number;armColor:string;panels:number};
export const isReelfolioEffect=(id:string)=>reelfolioKinds.includes(id.replace(/^reelfolio-/,'') as ReelfolioKind)&&id.startsWith('reelfolio-');
export function defaultReelfolio(kind:ReelfolioKind):ReelfolioSettings{if(!reelfolioKinds.includes(kind))throw Error('未知 Reelfolio 效果。');return {kind,images:reelItems.slice(0,6).map((x,i)=>({id:`study-${i+1}`,label:['圆','环','折面','方','三角','节奏'][i],src:x.src})),initialIndex:0,background:'#f1f1f1',ink:'#242424',holdMs:900,armColor:'#777777',panels:6}}
export function validateReelfolio(value:unknown):ReelfolioSettings{
 // Strip only inert legacy fields from retained variants; never accept an unknown kind.
 if(value&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype&&Reflect.ownKeys(value).every(k=>typeof k==='string'&&Object.hasOwn(Object.getOwnPropertyDescriptor(value,k)??{},'value'))){const copy={...value} as Record<string,unknown>;for(const k of ['columns','lensSize','dither','gap','glue','cardSize'])delete copy[k];value=copy;}
 const keys=Object.keys(defaultReelfolio('rig'));if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(value,k)??{},'value')))throw Error('Reelfolio 设置缺失或包含未知内容。');const s=value as ReelfolioSettings;
 if(!reelfolioKinds.includes(s.kind))throw Error('未知 Reelfolio 效果。');
 const sample={...defaultBencho('card-swap'),images:s.images};validateBencho(sample);
 for(const key of ['background','ink','armColor'] as const)if(typeof s[key]!=='string'||!/^#[\da-f]{6}$/i.test(s[key]))throw Error('颜色须为六位十六进制。');
 for(const [key,min,max] of [['holdMs',200,5000],['panels',3,10],] as const)if(!Number.isFinite(s[key])||s[key]<min||s[key]>max)throw Error('Reelfolio 数值超出范围：'+key);
 if(!Number.isInteger(s.panels)||!Number.isInteger(s.initialIndex)||s.initialIndex<0||s.initialIndex>=s.images.length)throw Error('初始项或数量无效。');return structuredClone(s);
}
