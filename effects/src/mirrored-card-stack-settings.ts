export type MirroredCard={id:string;label:string;color:string};
export type MirroredStackSettings={cards:MirroredCard[];initialIndex:number;width:number;height:number;fontSize:number};
export const defaultMirroredStack:MirroredStackSettings={cards:Array.from({length:6},(_,i)=>({id:String(i+1),label:String(i+1),color:'#424242'})),initialIndex:0,width:280,height:350,fontSize:36};
export function validateMirroredStack(value:unknown):MirroredStackSettings{
 const exact=(v:unknown,keys:string[])=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.getPrototypeOf(v)!==Object.prototype||Reflect.ownKeys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value')))throw Error('镜像抽出卡片字段缺失或包含未知内容。')};
 exact(value,Object.keys(defaultMirroredStack));const s=value as MirroredStackSettings;
 if(!Array.isArray(s.cards)||s.cards.length<1||s.cards.length>8||Object.keys(s.cards).length!==s.cards.length)throw Error('卡片数量须为 1–8。');
 const ids=new Set<string>();
 const cards=s.cards.map(c=>{exact(c,['id','label','color']);if(typeof c.id!=='string'||!/^[a-zA-Z0-9_-]{1,48}$/.test(c.id)||ids.has(c.id))throw Error('卡片 ID 须独立且有效。');ids.add(c.id);
  if(typeof c.label!=='string'||!c.label.trim()||c.label.length>20||/[\u0000-\u001f\u007f<>]/.test(c.label))throw Error('卡片文字须为 1–20 个可显示字符。');
  if(typeof c.color!=='string'||!/^#([0-9a-f]{2})\1\1$/i.test(c.color))throw Error('卡片颜色须为六位灰阶色。');return {...c};});
 for(const [key,min,max] of [['width',160,500],['height',180,600],['fontSize',24,80]] as const)if(!Number.isFinite(s[key])||s[key]<min||s[key]>max)throw Error('卡片尺寸或字号超出范围。');
 if(!Number.isInteger(s.initialIndex)||s.initialIndex<0||s.initialIndex>=cards.length)throw Error('初始卡片超出范围。');
 return {...s,cards};
}
export const mirroredStackGeometry={variant:'symmetric-current-top-card-extraction',peakOffsetX:.90,peakOffsetY:-.065,peakTiltDeg:12,peakScale:.84,handoff:.58,perspective:1200,baseDurationMs:980,timing:'quintic C2 / exact spring'} as const;
export function mirroredStackCards(s:MirroredStackSettings){
 const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
 return s.cards.map(c=>({id:c.id,alt:c.label,src:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${s.width}" height="${s.height}" viewBox="0 0 ${s.width} ${s.height}"><rect width="${s.width}" height="${s.height}" fill="${c.color}"/><text x="${s.width/2}" y="${s.height/2}" text-anchor="middle" dominant-baseline="central" fill="white" font-family="sans-serif" font-size="${s.fontSize}">${escape(c.label)}</text></svg>`)}));
}
