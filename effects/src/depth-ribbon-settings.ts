import {validateAlbumCovers} from './album-content';
export type DepthRibbonItem={src:string;title:string;subtitle:string};
export type DepthRibbonSettings={items:DepthRibbonItem[];count:number;path:'loop'|'knot'|'wave';tour:'cycle'|'ride'|'overview';interval:number;speed:number;cardSize:number;aspect:number;radius:number;offset:number;fov:number;fog:number;thread:number;shadow:number;accentColor:string;backgroundColor:string;seed:number;focusOnClick:boolean;holdToReveal:boolean;captions:boolean;interactive:boolean;draggable:boolean;wheel:boolean;pauseOnHover:boolean;paused:boolean};
export const defaultDepthRibbon:DepthRibbonSettings={items:[],count:72,path:'loop',tour:'cycle',interval:9,speed:.6,cardSize:.72,aspect:1,radius:.12,offset:1,fov:60,fog:1,thread:.3,shadow:.5,accentColor:'#b19eef',backgroundColor:'#f1f1f1',seed:0,focusOnClick:true,holdToReveal:true,captions:true,interactive:true,draggable:true,wheel:true,pauseOnHover:true,paused:false};
export const depthRibbonNumbers=[
 {key:'count',zh:'图片数量',en:'Card count',min:24,max:240,sliderMax:180,step:1,unit:''},
 {key:'speed',zh:'穿行速度',en:'Ride speed',min:-2,max:3,step:.05,unit:''},
 {key:'interval',zh:'穿行间隔',en:'Ride interval',min:3,max:20,step:.5,unit:'s'},
 {key:'cardSize',zh:'卡片尺寸',en:'Card size',min:.3,max:1.2,step:.01,unit:''},
 {key:'aspect',zh:'卡片宽高比',en:'Card aspect',min:.5,max:1.8,step:.05,unit:':1'},
 {key:'radius',zh:'卡片圆角',en:'Corner radius',min:0,max:1,step:.01,unit:''},
 {key:'offset',zh:'镜头偏移',en:'Camera offset',min:.4,max:2.5,step:.05,unit:''},
 {key:'fov',zh:'视野角度',en:'Field of view',min:35,max:95,step:1,unit:'°'},
 {key:'fog',zh:'远景雾化',en:'Fog',min:.3,max:3,step:.05,unit:''},
 {key:'thread',zh:'轨迹线浓度',en:'Thread opacity',min:0,max:1,step:.01,unit:''},
 {key:'shadow',zh:'卡片阴影',en:'Card shadow',min:0,max:1,step:.01,unit:''},
 {key:'seed',zh:'排布种子',en:'Shuffle seed',min:0,max:20,step:1,unit:''},
] as const;
/** TuneShape-authored presets; reference names describe comparable directions. */
export const depthRibbonPresets:Record<string,Partial<DepthRibbonSettings>>={
 ribbon:{...defaultDepthRibbon,items:[]},
 knot:{path:'knot',tour:'cycle',count:96,speed:.6,interval:9,cardSize:.72,aspect:1,offset:1.2,fov:62,accentColor:'#a18aff'},
 crown:{path:'wave',tour:'overview',count:72,speed:.5,cardSize:.8,aspect:1,offset:1,fov:55,accentColor:'#c59c79'},
 atlas:{path:'loop',tour:'overview',count:120,cardSize:.78,aspect:1.4,offset:1.3,fov:60,accentColor:'#8a8a8a',backgroundColor:'#f5f5f5'},
 drift:{path:'wave',tour:'ride',count:72,speed:.25,cardSize:.8,aspect:1.25,offset:1.5,fov:55,fog:1.3,accentColor:'#a6a0bd'},
 rush:{path:'knot',tour:'ride',count:132,speed:2.2,cardSize:.7,aspect:1,offset:.65,fov:82,fog:.8,accentColor:'#9e78ff',backgroundColor:'#111016'},
};
export function validateDepthRibbon(value:unknown):DepthRibbonSettings{
 const keys=Object.keys(defaultDepthRibbon);
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(value,k)??{},'value')))throw Error('纵深图带字段不完整或含未知字段。');
 const s=value as DepthRibbonSettings;
 if(!Array.isArray(s.items)||Object.getPrototypeOf(s.items)!==Array.prototype||s.items.length>12||Reflect.ownKeys(s.items).length!==s.items.length+1)throw Error('最多上传 12 张图片。');
 for(let i=0;i<s.items.length;i++){
  const d=Object.getOwnPropertyDescriptor(s.items,String(i));if(!d||!Object.hasOwn(d,'value'))throw Error('图片数组必须是连续数据。');const item=d.value;
  if(!item||typeof item!=='object'||Object.getPrototypeOf(item)!==Object.prototype||Reflect.ownKeys(item).length!==3||['src','title','subtitle'].some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(item,k)??{},'value')))throw Error('图片仅能包含图片、标题和副标题。');
  if(typeof item.subtitle!=='string'||Array.from(item.subtitle).length>120||/[\u0000-\u001f\u007f-\u009f<>]/u.test(item.subtitle))throw Error('副标题最多 120 个可见字符。');
 }
 validateAlbumCovers(s.items.map(({src,title})=>({src,title})));
 for(const c of depthRibbonNumbers)if(typeof s[c.key]!=='number'||!Number.isFinite(s[c.key])||s[c.key]<c.min||s[c.key]>c.max||['count','fov','seed'].includes(c.key)&&!Number.isInteger(s[c.key]))throw Error('纵深图带数值无效：'+c.key);
 if(!['loop','knot','wave'].includes(s.path)||!['cycle','ride','overview'].includes(s.tour))throw Error('路径或镜头模式无效。');
 for(const k of ['accentColor','backgroundColor'] as const)if(typeof s[k]!=='string'||!/^#[\da-f]{6}$/i.test(s[k])&&!(k==='backgroundColor'&&s[k]==='transparent'))throw Error('纵深图带颜色无效。');
 for(const k of ['focusOnClick','holdToReveal','captions','interactive','draggable','wheel','pauseOnHover','paused'] as const)if(typeof s[k]!=='boolean')throw Error('纵深图带开关无效。');
 return structuredClone(s);
}
