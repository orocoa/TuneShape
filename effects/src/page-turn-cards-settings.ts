export type PageTurnCard={id:string;label:string;color:string};
export type PageTurnSettings={cards:PageTurnCard[];initialIndex:number;width:number;height:number;fontSize:number};
export const defaultPageTurn:PageTurnSettings={cards:Array.from({length:6},(_,i)=>({id:String(i+1),label:String(i+1),color:'#777777'})),initialIndex:0,width:280,height:336,fontSize:48};
export function validatePageTurn(value:unknown):PageTurnSettings{
 const exact=(v:unknown,keys:string[])=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.getPrototypeOf(v)!==Object.prototype||Reflect.ownKeys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value')))throw Error('翻页卡片字段缺失或包含未知内容。')};
 exact(value,Object.keys(defaultPageTurn));const s=value as PageTurnSettings;
 if(!Array.isArray(s.cards)||s.cards.length<1||s.cards.length>8||Object.keys(s.cards).length!==s.cards.length)throw Error('卡片数量须为 1–8。');
 const ids=new Set<string>();
 const cards=s.cards.map(c=>{exact(c,['id','label','color']);if(typeof c.id!=='string'||!/^[a-zA-Z0-9_-]{1,48}$/.test(c.id)||ids.has(c.id))throw Error('卡片 ID 须独立且有效。');ids.add(c.id);
  if(typeof c.label!=='string'||!c.label.trim()||c.label.length>20||/[\u0000-\u001f\u007f<>]/.test(c.label))throw Error('卡片文字须为 1–20 个可显示字符。');
  if(typeof c.color!=='string'||!/^#([0-9a-f]{2})\1\1$/i.test(c.color))throw Error('卡片颜色须为六位灰阶色。');return {...c};});
 for(const [key,min,max] of [['width',160,500],['height',180,600],['fontSize',24,80]] as const)if(!Number.isFinite(s[key])||s[key]<min||s[key]>max)throw Error('卡片尺寸或字号超出范围。');
 if(!Number.isInteger(s.initialIndex)||s.initialIndex<0||s.initialIndex>=cards.length)throw Error('初始卡片超出范围。');
 return {...s,cards};
}
export const pageTurnGeometry={camera:2.8,retreat:.10,maxAngle:100,lightLoss:.18,lightSide:.018,easing:[.42,0,.58,1],gapMin:3,gapMax:6,previewScale:.9,cornerRadius:32,cornerShape:'superellipse(2)'} as const;
