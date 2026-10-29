import {glyphCharacters} from './type-geometry-data';
export const typographyIds=['typewriter-text','soft-blur-in','short-slide-down','kinetic-center-build','period-drop','outline-trace','glyph-anatomy'] as const;
export type TypographyId=typeof typographyIds[number];
export const isTypography=(id:string):id is TypographyId=>(typographyIds as readonly string[]).includes(id);
type Base={kind:TypographyId;text:string;fontSize:number;fontWeight:number;color:string};
export type TypographySettings=Base&Partial<{charsPerSecond:number;cursor:boolean;cursorColor:string;blur:number;entryOffset:number;dotColor:string;dotSize:number;strokeColor:string;strokeWidth:number;stagger:number;fill:boolean;keepStroke:boolean;guideColor:string;guides:boolean;keepPoints:boolean}>;
export const typographyDefaults:Record<TypographyId,TypographySettings>={
 'typewriter-text':{kind:'typewriter-text',text:'Hello, World!',fontSize:72,fontWeight:600,color:'#171717',charsPerSecond:22,cursor:true,cursorColor:'#171717'},
 'soft-blur-in':{kind:'soft-blur-in',text:'Think different.',fontSize:72,fontWeight:600,color:'#171717',blur:12},
 'short-slide-down':{kind:'short-slide-down',text:'Build from above.',fontSize:72,fontWeight:600,color:'#171717',entryOffset:28},
 'kinetic-center-build':{kind:'kinetic-center-build',text:'Words push left.',fontSize:72,fontWeight:600,color:'#171717',entryOffset:88},
 'period-drop':{kind:'period-drop',text:'Tuneshape',fontSize:160,fontWeight:800,color:'#171717',dotColor:'#737373',dotSize:.2},
 'outline-trace':{kind:'outline-trace',text:'Outline',fontSize:150,fontWeight:800,color:'#171717',strokeColor:'#171717',strokeWidth:2.5,stagger:3,fill:true,keepStroke:false},
 'glyph-anatomy':{kind:'glyph-anatomy',text:'Glyph',fontSize:200,fontWeight:800,color:'#171717',guideColor:'#737373',guides:true,keepPoints:false},
};
export const typographyDurations:Record<TypographyId,number>={'typewriter-text':4000,'soft-blur-in':2000,'short-slide-down':2000,'kinetic-center-build':2000,'period-drop':1567,'outline-trace':1467,'glyph-anatomy':2200};
export function validateTypography(v:unknown):TypographySettings{
 if(!v||typeof v!=='object'||Object.getPrototypeOf(v)!==Object.prototype)throw Error('文字设置无效。');
 const s=v as TypographySettings,kind=Object.getOwnPropertyDescriptor(v,'kind');if(!kind||!Object.hasOwn(kind,'value')||!Object.hasOwn(typographyDefaults,kind.value))throw Error('文字设置字段无效。');const d=typographyDefaults[kind.value as TypographyId];
 if(!d||Reflect.ownKeys(v).length!==Object.keys(d).length||Object.keys(d).some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value')))throw Error('文字设置字段不完整或含未知字段。');
 if(typeof s.text!=='string'||!s.text.trim()||Array.from(s.text).length>(['outline-trace','glyph-anatomy','period-drop'].includes(s.kind)?32:120)||/[\u0000-\u001f\u007f-\u009f]/u.test(s.text))throw Error('请输入长度合适的可见文字。');
 if(['short-slide-down','kinetic-center-build'].includes(s.kind)&&s.text.trim().split(/\s+/u).length>8)throw Error('堆叠与推挤效果最多支持 8 个词语，以空格分隔。');
 if(['outline-trace','glyph-anatomy'].includes(s.kind)&&Array.from(s.text).some(ch=>!glyphCharacters.includes(ch)))throw Error('当前离线字形库支持拉丁字符与 GB2312 常用中文；有字符不在字库中。');
 const ranges:Record<string,number[]>={charsPerSecond:[1,60],fontSize:[18,240],fontWeight:[100,900],blur:[0,30],entryOffset:[0,160],dotSize:[.08,.5],strokeWidth:[.25,6],stagger:[0,10]};
 for(const [key,value] of Object.entries(s)){if(key==='kind'||key==='text')continue;if(key.toLowerCase().includes('color')){if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw Error('颜色须为六位十六进制。')}else if(ranges[key]){if(typeof value!=='number'||!Number.isFinite(value)||value<ranges[key][0]||value>ranges[key][1])throw Error('文字数值超出范围。')}else if(typeof value!=='boolean')throw Error('文字开关值无效。')}
 if(['outline-trace','glyph-anatomy'].includes(s.kind)&&s.fontWeight!==800)throw Error('轮廓字形使用固定 800 字重。');
 return structuredClone(s);
}
