import {reelItems} from './elastic-reel-art';
export const benchoKinds=['card-swap','wake-slider','image-compare','label-input','carousel'] as const;
export type BenchoKind=typeof benchoKinds[number];
export type BenchImage={id:string;label:string;src:string};
export type BenchoSettings={kind:BenchoKind;images:BenchImage[];background:string;ink:string;corner:number;auto:boolean;every:number;stackGap:number;bars:number;wake:number;initialValue:number;labels:boolean;beforeLabel:string;afterLabel:string;field:'Email'|'Password';fieldLabel:string;orbit:number;depth:number;float:number;sink:number;settle:number;sound:boolean;volume:number};
export const isBenchoEffect=(id:string)=>id.startsWith('bencho-')&&benchoKinds.includes(id.slice(7) as BenchoKind);
export function defaultBencho(kind:BenchoKind):BenchoSettings{const result:BenchoSettings={kind,images:reelItems.slice(0,kind==='image-compare'?2:5).map((x,i)=>({id:`image-${i+1}`,label:(kind==='card-swap'?['Circle','Ring','Facet','Square','Triangle']:['圆','环','折面','方','三角'])[i],src:x.src})),background:'#f1f1f1',ink:'#242424',corner:20,auto:false,every:4,stackGap:34,bars:36,wake:60,initialValue:50,labels:true,beforeLabel:'原图',afterLabel:'调整后',field:'Email',fieldLabel:'邮箱',orbit:138,depth:100,float:15,sink:50,settle:50,sound:true,volume:.35};if(kind==='label-input')result.fieldLabel='Email';if(kind==='image-compare'){result.images[1].src=result.images[0].src;result.beforeLabel=result.images[0].label='Before';result.afterLabel=result.images[1].label='After'}return result}
export function validateBencho(value:unknown):BenchoSettings{
 const exact=(v:unknown,keys:string[])=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.getPrototypeOf(v)!==Object.prototype||Reflect.ownKeys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value')))throw Error('Bencho 设置字段缺失或含未知内容。')};
 const keys=Object.keys(defaultBencho('card-swap'));
 // Only the exact legacy shape is migrated; accessors, unknown keys and other missing fields remain invalid.
 if(value&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype&&!Object.hasOwn(value,'stackGap')){exact(value,keys.filter(key=>key!=='stackGap'));value={...value,stackGap:34}}
 exact(value,keys);const s=value as BenchoSettings;
 if(!benchoKinds.includes(s.kind))throw Error('未知 Bencho 组件。');
 for(const key of ['background','ink'] as const)if(typeof s[key]!=='string'||!/^#[\da-f]{6}$/i.test(s[key]))throw Error('颜色须为六位十六进制。');
 for(const [key,min,max] of [['corner',0,40],['every',1.5,20],['stackGap',16,52],['bars',12,64],['wake',0,100],['initialValue',0,100],['orbit',80,190],['depth',0,150],['float',0,100],['sink',0,100],['settle',0,100],['volume',0,1]] as const)if(!Number.isFinite(s[key])||s[key]<min||s[key]>max)throw Error('Bencho 数值超出范围：'+key);
 if(s.corner>(s.kind==='label-input'?26:s.kind==='image-compare'?28:40))throw Error('圆角超出当前组件范围。');
 if(!Number.isInteger(s.bars)||!['Email','Password'].includes(s.field))throw Error('条数或输入类型无效。');
 for(const key of ['auto','labels','sound'] as const)if(typeof s[key]!=='boolean')throw Error('开关无效。');
 for(const key of ['beforeLabel','afterLabel','fieldLabel'] as const)if(typeof s[key]!=='string'||!s[key].trim()||s[key].length>32||/[\u0000-\u001f<>]/.test(s[key]))throw Error('标签须为 1–32 个可显示字符。');
 if(!Array.isArray(s.images)||s.images.length<1||s.images.length>8||(s.kind==='image-compare'&&s.images.length!==2)||Object.keys(s.images).length!==s.images.length)throw Error('图片须为 1–8 张；图片比较固定两张。');const ids=new Set();
 s.images.forEach(item=>{exact(item,['id','label','src']);if(typeof item.id!=='string'||!/^[\w-]{1,48}$/.test(item.id)||ids.has(item.id))throw Error('图片 ID 须独立且有效。');ids.add(item.id);if(typeof item.label!=='string'||!item.label.trim()||item.label.length>32||/[\u0000-\u001f<>]/.test(item.label))throw Error('图片标签无效。');if(typeof item.src!=='string'||item.src.length>900000||!/^data:image\/(?:png|jpeg|webp|avif|svg\+xml)[;,]/i.test(item.src))throw Error('请使用嵌入图片。')});
 if(new TextEncoder().encode(JSON.stringify(s.images)).byteLength>2800000)throw Error('图片总量过大，请缩小图片后重试，以便完整导出和重新导入配置。');
 return structuredClone(s);
}
