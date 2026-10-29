export type AsciiSharksSettings={density:number;fontScale:number;speed:number;sharkCount:number;sharkScale:number;fishDensity:number;backgroundColor:string;inkColor:string;opacity:number;gridOpacity:number;wakeOpacity:number;interactive:boolean};
export const defaultAsciiSharks:Readonly<AsciiSharksSettings>=Object.freeze({density:1,fontScale:.9,speed:1,sharkCount:4,sharkScale:1,fishDensity:1,backgroundColor:'#fafaf9',inkColor:'#252a24',opacity:.9,gridOpacity:.04,wakeOpacity:0,interactive:false});
export const asciiSharksRanges={density:[.5,2,.05],fontScale:[.6,1.2,.05],speed:[0,3,.05],sharkCount:[1,6,1],sharkScale:[.5,1.5,.05],fishDensity:[0,2,.1],opacity:[0,1,.05],gridOpacity:[0,.2,.01],wakeOpacity:[0,1,.05]} as const;
export function validateAsciiSharks(value:unknown):AsciiSharksSettings{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)throw Error('ASCII 鲨鱼设置无效。');
 const v=value as Record<string,unknown>,keys=Object.keys(defaultAsciiSharks);
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(key=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,key)??{},'value')))throw Error('ASCII 鲨鱼设置字段不完整或含未知字段。');
 for(const [key,[min,max]] of Object.entries(asciiSharksRanges))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||Number(v[key])<min||Number(v[key])>max)throw Error(`ASCII 鲨鱼 ${key} 超出范围。`);
 if(!Number.isInteger(v.sharkCount))throw Error('鲨鱼数量须为整数。');
 for(const key of ['backgroundColor','inkColor'])if(typeof v[key]!=='string'||!/^#[\da-f]{6}$/i.test(v[key] as string))throw Error('ASCII 鲨鱼颜色须为六位十六进制。');
 if(typeof v.interactive!=='boolean')throw Error('ASCII 鲨鱼交互开关无效。');
 return {...v} as AsciiSharksSettings;
}
