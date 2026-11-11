import {validateAlbumCovers,type AlbumCover} from './album-content';
export type PassageGallerySettings={items:AlbumCover[];colorA:string;colorB:string;backgroundColor:string;lanes:number;gap:number;radius:number;photoFill:number;accentFill:number;lineOpacity:number;fog:number;speed:number;boost:number;blur:number;look:number;fov:number;hover:number;seed:number;focusOnClick:boolean;captions:boolean;wheel:boolean;interactive:boolean;paused:boolean};
export const defaultPassageGallery:PassageGallerySettings={items:[],colorA:'#5227ff',colorB:'#ff9ffc',backgroundColor:'#fafafa',lanes:5,gap:.1,radius:.06,photoFill:.3,accentFill:.06,lineOpacity:.12,fog:1,speed:.6,boost:10,blur:1,look:1,fov:72,hover:1,seed:0,focusOnClick:true,captions:true,wheel:true,interactive:true,paused:false};
export const passageGalleryNumbers=[
 {key:'lanes',zh:'横向格数',en:'Lanes',min:2,max:12,step:1,unit:''},
 {key:'gap',zh:'格子间隙',en:'Gap',min:0,max:.4,step:.01,unit:''},
 {key:'radius',zh:'图片圆角',en:'Radius',min:0,max:1,step:.01,unit:''},
 {key:'photoFill',zh:'图片占比',en:'Photo fill',min:0,max:1,step:.01,unit:''},
 {key:'accentFill',zh:'强调色占比',en:'Accent fill',min:0,max:.6,step:.01,unit:''},
 {key:'lineOpacity',zh:'网格线浓度',en:'Line opacity',min:0,max:.6,step:.01,unit:''},
 {key:'fog',zh:'远景雾化',en:'Fog',min:.2,max:3,step:.05,unit:''},
 {key:'speed',zh:'穿行速度',en:'Speed',min:-2,max:4,step:.05,unit:''},
 {key:'boost',zh:'按住加速',en:'Boost',min:1,max:20,step:.5,unit:'×'},
 {key:'blur',zh:'高速拖影',en:'Motion blur',min:0,max:3,step:.05,unit:''},
 {key:'look',zh:'视线跟随',en:'Look',min:0,max:3,step:.05,unit:''},
 {key:'fov',zh:'视野角度',en:'Field of view',min:40,max:100,step:1,unit:'°'},
 {key:'hover',zh:'悬停抬升',en:'Hover lift',min:0,max:2,step:.05,unit:''},
 {key:'seed',zh:'排布种子',en:'Seed',min:0,max:20,step:1,unit:''},
] as const;
/** TuneShape-authored presets using the public control vocabulary. */
export const passageGalleryPresets:Record<string,Partial<PassageGallerySettings>>={
 night:{backgroundColor:'#0a0a0a',colorA:'#5227ff',colorB:'#ff9ffc',lanes:5,gap:.1,radius:.06,photoFill:.3,accentFill:.06,lineOpacity:.12,fog:1,speed:.6,boost:10,blur:1,look:1,fov:72,hover:1,seed:0},
 gallery:{backgroundColor:'#fafafa',colorA:'#5227ff',colorB:'#ff9ffc',lanes:5,gap:.1,radius:.06,photoFill:.3,accentFill:.06,lineOpacity:.12,fog:1,speed:.6,boost:10,blur:1,look:1,fov:72,hover:1,seed:0},
 neon:{backgroundColor:'#0b061d',colorA:'#5227ff',colorB:'#ff55cd',lanes:6,gap:.08,radius:.15,photoFill:.3,accentFill:.2,lineOpacity:.25,fog:.8,speed:.85,fov:82},
 archive:{backgroundColor:'#e9e6df',colorA:'#66635d',colorB:'#b3aaa0',lanes:4,gap:.18,radius:0,photoFill:.55,accentFill:.03,lineOpacity:.15,fog:1.4,speed:.3,fov:65},
 warp:{backgroundColor:'#090910',colorA:'#6949ff',colorB:'#ff65bc',lanes:7,gap:.06,radius:.08,photoFill:.4,accentFill:.15,lineOpacity:.15,fog:.6,speed:2.5,blur:2,fov:94},
 hall:{backgroundColor:'#f3f3f3',colorA:'#818181',colorB:'#c5c5c5',lanes:3,gap:.2,radius:.04,photoFill:.45,accentFill:.04,lineOpacity:.08,fog:1.2,speed:.4,fov:55},
};
export function validatePassageGallery(value:unknown):PassageGallerySettings{
 const keys=Object.keys(defaultPassageGallery);
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(value,k)??{},'value')))throw Error('穿行图库字段不完整或含未知字段。');
 const s=value as PassageGallerySettings;validateAlbumCovers(s.items);
 for(const c of passageGalleryNumbers)if(typeof s[c.key]!=='number'||!Number.isFinite(s[c.key])||s[c.key]<c.min||s[c.key]>c.max||['lanes','seed','fov'].includes(c.key)&&!Number.isInteger(s[c.key]))throw Error('穿行图库数值无效：'+c.key);
 for(const k of ['colorA','colorB','backgroundColor'] as const)if(typeof s[k]!=='string'||!/^#[\da-f]{6}$/i.test(s[k])&&!(k==='backgroundColor'&&s[k]==='transparent'))throw Error('穿行图库颜色无效。');
 for(const k of ['focusOnClick','captions','wheel','interactive','paused'] as const)if(typeof s[k]!=='boolean')throw Error('穿行图库开关无效。');
 return structuredClone(s);
}
