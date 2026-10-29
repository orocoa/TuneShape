export type AppOrbitSettings={count:number;radius:number;cardSize:number;tilt:number;autoRotate:boolean;rotationSpeed:number;showDock:boolean;backgroundColor:string};
export const defaultAppOrbit:Readonly<AppOrbitSettings>={count:12,radius:160,cardSize:68,tilt:14,autoRotate:true,rotationSpeed:.16,showDock:true,backgroundColor:'transparent'};
export function validateAppOrbit(v:unknown):AppOrbitSettings{
 if(!v||typeof v!=='object'||Object.getPrototypeOf(v)!==Object.prototype||Reflect.ownKeys(v).length!==Object.keys(defaultAppOrbit).length||Object.keys(defaultAppOrbit).some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value')))throw Error('轨道设置字段不完整或含未知字段。');
 const s=v as AppOrbitSettings,ranges={count:[4,12],radius:[100,220],cardSize:[40,96],tilt:[-30,40],rotationSpeed:[-.5,.5]};
 for(const [key,range] of Object.entries(ranges)){const value=s[key as keyof AppOrbitSettings];if(typeof value!=='number'||!Number.isFinite(value)||value<range[0]||value>range[1]||(key==='count'&&!Number.isInteger(value)))throw Error('轨道数值超出范围。')}
 if(typeof s.autoRotate!=='boolean'||typeof s.showDock!=='boolean'||typeof s.backgroundColor!=='string'||s.backgroundColor!=='transparent'&&!/^#[0-9a-f]{6}$/i.test(s.backgroundColor))throw Error('轨道外观无效。');return structuredClone(s)
}
