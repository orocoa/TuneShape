import {reelItems} from './elastic-reel-art';
import {validateAlbumCovers} from './album-content';
export const benchoUiKinds=['upload-dropzone','slide-confirm','aspect','liq-create','eye-tracker','context-meter'] as const;
export type BenchoUiKind=typeof benchoUiKinds[number];
export type BenchFile={id:string;name:string;ext:string;size:number;tint:string};
export type ContextSegment={id:string;name:string;k:number;colour:string};
export type CreateItem={id:string;label:string;icon:'file'|'table'|'grid'|'folder'};
export type BenchoUiSettings={kind:BenchoUiKind;background:string;ink:string;fill:'Light'|'Dark';stroke:boolean;corner:number;speed:number;bounce:number;width:number;morph:number;ratio:'land'|'square'|'tall';image:string;maxMb:number;uploadLabel:string;files:BenchFile[];confirmLabel:string;confirmedLabel:string;createLabel:string;menuItems:CreateItem[];follow:number;shape:'Cube'|'Pill'|'Hexagon';eyes:'Slant'|'Dots'|'Squares';size:number;messages:string[];meterStyle:'Bar'|'Field';colour:'Colour'|'Mono';capacity:number;compactChat:number;segments:ContextSegment[];sound:boolean;volume:number};
export const isBenchoUiEffect=(id:string)=>id.startsWith('bencho-')&&benchoUiKinds.includes(id.slice(7) as BenchoUiKind);
export function defaultBenchoUi(kind:BenchoUiKind):BenchoUiSettings{return {
 kind,background:'#f1f1f1',ink:'#242424',fill:'Light',stroke:false,corner:kind==='slide-confirm'?28:20,speed:50,bounce:kind==='eye-tracker'?30:40,width:280,morph:50,ratio:'square',image:reelItems[0].src,maxMb:5,uploadLabel:'Drag a file here',
 files:[{id:'img',name:'Final2.png',ext:'PNG',size:2400000,tint:'#079455'},{id:'vid',name:'11Nov.mp4',ext:'MP4',size:12600000,tint:'#155eef'}],
 confirmLabel:'Slide to confirm',confirmedLabel:'Confirmed',createLabel:'Create',menuItems:[{id:'document',label:'Document',icon:'file'},{id:'spreadsheet',label:'Spreadsheet',icon:'table'},{id:'board',label:'Board',icon:'grid'},{id:'folder',label:'Folder',icon:'folder'}],
 follow:60,shape:'Cube',eyes:'Slant',size:100,messages:['Hey, I see you.','Boop.','That tickles.','Hi there!','Stop poking me.',"I'm watching you.",'Again? Okay.','You found me.'],
 meterStyle:'Bar',colour:'Colour',capacity:200,compactChat:30.4,segments:[{id:'sys',name:'System',k:4.2,colour:'#ec4f8c'},{id:'tools',name:'Tools',k:12.8,colour:'#9a5cf6'},{id:'files',name:'Files',k:46.1,colour:'#3d7ef5'},{id:'chat',name:'Chat',k:108.6,colour:'#1db4cc'},{id:'mem',name:'Memory',k:3.9,colour:'#2ccb7e'}],sound:true,volume:.35,
}}
const exact=(v:unknown,keys:string[])=>{if(!v||typeof v!=='object'||Object.getPrototypeOf(v)!==Object.prototype||Reflect.ownKeys(v).length!==keys.length||keys.some(k=>{const d=Object.getOwnPropertyDescriptor(v,k);return !d?.enumerable||!Object.hasOwn(d,'value')}))throw Error('Bencho UI 字段不完整或含未知字段。')};
const text=(v:unknown,max=40)=>typeof v==='string'&&v.trim().length>0&&Array.from(v).length<=max&&!/[\u0000-\u001f\u007f-\u009f<>]/u.test(v);
function list(v:unknown,min:number,max:number){if(!Array.isArray(v)||Object.getPrototypeOf(v)!==Array.prototype||v.length<min||v.length>max||Reflect.ownKeys(v).length!==v.length+1||Array.from({length:v.length},(_,i)=>Object.getOwnPropertyDescriptor(v,String(i))).some(d=>!d?.enumerable||!Object.hasOwn(d,'value')))throw Error('Bencho UI 列表无效。')}
const hex=(v:unknown)=>typeof v==='string'&&/^#[\da-f]{6}$/i.test(v);
export function validateBenchoUi(value:unknown):BenchoUiSettings{
 exact(value,Object.keys(defaultBenchoUi('aspect')));const s=value as BenchoUiSettings;
 if(!benchoUiKinds.includes(s.kind))throw Error('未知 Bencho UI 组件。');
 for(const [key,min,max] of [['corner',0,s.kind==='upload-dropzone'?24:s.kind==='slide-confirm'?28:40],['speed',0,100],['bounce',0,100],['width',220,380],['morph',0,100],['maxMb',.1,200],['follow',0,100],['size',60,180],['capacity',20,2000],['compactChat',0,2000],['volume',0,1]] as const)if(typeof s[key]!=='number'||!Number.isFinite(s[key])||s[key]<min||s[key]>max)throw Error('Bencho UI 数值无效：'+key);
 for(const key of ['background','ink'] as const)if(!hex(s[key]))throw Error('Bencho UI 颜色无效。');
 for(const key of ['stroke','sound'] as const)if(typeof s[key]!=='boolean')throw Error('Bencho UI 开关无效。');
 for(const [key,values] of [['fill',['Light','Dark']],['ratio',['land','square','tall']],['shape',['Cube','Pill','Hexagon']],['eyes',['Slant','Dots','Squares']],['meterStyle',['Bar','Field']],['colour',['Colour','Mono']]] as const)if(!(values as readonly unknown[]).includes(s[key]))throw Error('Bencho UI 选项无效：'+key);
 for(const key of ['uploadLabel','confirmLabel','confirmedLabel','createLabel'] as const)if(!text(s[key],32))throw Error('标签须为1–32个可见字符。');
 if(typeof s.image!=='string')throw Error('图片无效。');if(!reelItems.some(x=>x.src===s.image))validateAlbumCovers([{src:s.image,title:'Image'}]);
 list(s.files,1,4);const fileIds=new Set<string>();for(const f of s.files){exact(f,['id','name','ext','size','tint']);if(!text(f.id,32)||!/^[\w-]+$/.test(f.id)||fileIds.has(f.id)||['__proto__','constructor','prototype'].includes(f.id)||!text(f.name,40)||!text(f.ext,4)||typeof f.size!=='number'||!Number.isFinite(f.size)||f.size<0||f.size>1e9||!hex(f.tint))throw Error('演示文件无效。');fileIds.add(f.id)}
 list(s.menuItems,1,6);const menuIds=new Set<string>();for(const item of s.menuItems){exact(item,['id','label','icon']);if(!text(item.id,32)||!/^[\w-]+$/.test(item.id)||menuIds.has(item.id)||['__proto__','constructor','prototype'].includes(item.id)||!text(item.label,32)||!['file','table','grid','folder'].includes(item.icon))throw Error('菜单项无效。');menuIds.add(item.id)}
 list(s.messages,1,8);if(s.messages.some(x=>!text(x,48)))throw Error('回应文案须为1–48个可见字符。');
 list(s.segments,1,8);const ids=new Set<string>();for(const segment of s.segments){exact(segment,['id','name','k','colour']);if(!text(segment.id,24)||!/^[a-z][a-z\d-]*$/.test(segment.id)||ids.has(segment.id)||['__proto__','constructor','prototype'].includes(segment.id)||!text(segment.name,24)||typeof segment.k!=='number'||!Number.isFinite(segment.k)||segment.k<0||segment.k>2000||!hex(segment.colour))throw Error('上下文分段无效。');ids.add(segment.id)}
 return structuredClone(s);
}
