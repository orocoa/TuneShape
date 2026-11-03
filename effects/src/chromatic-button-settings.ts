export type ChromaticButtonSettings={
 example:'message'|'button'|'icons'|'voice';hoverEffect:'none'|'brighten'|'flow'|'spotlight';entrance:'blur-up'|'zoom'|'none';colorMode:'fixed'|'gradient-2'|'gradient-3'|'spectrum';color:string;color2:string;color3:string;label:string;disabled:boolean;paused:boolean;
 entranceSpeed:number;
 entranceBlur:number;
 entranceDistance:number;
 entranceScale:number;
 borderRadius:number;
 feather:number;
 projectionScale:number;
 intensity:number;
 grain:number;
 speed:number;
 phase:number;
 seed:number;
};
export const chromaticNumberControls=[
 {"key": "entranceSpeed", "zh": "入场倍速", "en": "Entrance speed", "min": 0.1, "max": 4, "step": 0.05, "unit": "×", "group": "入场"},
 {"key": "entranceBlur", "zh": "入场模糊", "en": "Entrance blur", "min": 0, "max": 40, "step": 1, "unit": "px", "group": "入场"},
 {"key": "entranceDistance", "zh": "上升距离", "en": "Rise distance", "min": 0, "max": 120, "step": 1, "unit": "px", "group": "入场"},
 {"key": "entranceScale", "zh": "初始缩放", "en": "Starting scale", "min": 0.05, "max": 1, "step": 0.01, "unit": "", "group": "入场"},
 {"key": "borderRadius", "zh": "圆角比例", "en": "Corner radius", "min": 0, "max": 50, "step": 1, "unit": "%", "group": "材质"},
 {"key": "feather", "zh": "边缘羽化", "en": "Feather", "min": 0, "max": 100, "step": 1, "unit": "", "group": "材质"},
 {"key": "projectionScale", "zh": "实际投影角", "en": "Applied projection angle", "min": 90, "max": 179.5, "step": 0.1, "unit": "°", "group": "材质"},
 {"key": "intensity", "zh": "材质亮度", "en": "Brightness", "min": 0.1, "max": 2, "step": 0.05, "unit": "", "group": "材质"},
 {"key": "grain", "zh": "静态颗粒", "en": "Stationary grain", "min": 0, "max": 0.3, "step": 0.005, "unit": "", "group": "材质"},
 {"key": "speed", "zh": "材质流速", "en": "Material speed", "min": 0, "max": 3, "step": 0.05, "unit": "", "group": "运动"},
 {"key": "phase", "zh": "起始相位", "en": "Starting phase", "min": 0, "max": 100, "step": 0.01, "unit": "", "group": "运动"},
 {"key": "seed", "zh": "随机种子", "en": "Seed", "min": 0, "max": 100, "step": 1, "unit": "", "group": "运动"},
 ] as const;
export const chromaticSelectControls={example:['message','button','icons','voice'],hoverEffect:['none','brighten','flow','spotlight'],entrance:['blur-up','zoom','none'],colorMode:['fixed','gradient-2','gradient-3','spectrum']} as const;
export const defaultChromaticButton:ChromaticButtonSettings={"example": "message", "hoverEffect": "brighten", "entrance": "blur-up", "colorMode": "spectrum", "color": "#b126ff", "color2": "#ff177c", "color3": "#35d3ff", "label": "Get started", "disabled": false, "paused": false, "entranceSpeed": 1, "entranceBlur": 10, "entranceDistance": 20, "entranceScale": 0.65, "borderRadius": 50, "feather": 100, "projectionScale": 174.7, "intensity": 1.4, "grain": 0.105, "speed": 0.7, "phase": 0, "seed": 7};
export function chromaticRadiusCompensation(radius:number){return Math.round(16*Math.pow(1-radius/50,.83))/10}
export function changeChromaticRadius(s:ChromaticButtonSettings,radius:number):ChromaticButtonSettings{return {...s,borderRadius:radius,projectionScale:Math.round(Math.max(90,Math.min(179.5,s.projectionScale+chromaticRadiusCompensation(radius)-chromaticRadiusCompensation(s.borderRadius)))*10)/10}}
export function validateChromaticButton(value:unknown):ChromaticButtonSettings{
 const keys=Object.keys(defaultChromaticButton);if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)||!Object.hasOwn(Object.getOwnPropertyDescriptor(value,k)??{},'value')))throw Error('虹彩按钮字段不完整或含未知字段。');
 const s=value as ChromaticButtonSettings;
 for(const c of chromaticNumberControls)if(typeof s[c.key]!=='number'||!Number.isFinite(s[c.key])||s[c.key]<c.min||s[c.key]>c.max||c.key==='seed'&&!Number.isInteger(s[c.key]))throw Error('虹彩按钮数值无效：'+c.key);
 for(const [key,options] of Object.entries(chromaticSelectControls))if(!(options as readonly string[]).includes(s[key as keyof ChromaticButtonSettings] as string))throw Error('虹彩按钮选项无效：'+key);
 for(const key of ['disabled','paused'] as const)if(typeof s[key]!=='boolean')throw Error('虹彩按钮开关无效：'+key);
 for(const key of ['color','color2','color3'] as const)if(typeof s[key]!=='string'||!/^#[\da-f]{6}$/i.test(s[key]))throw Error('虹彩按钮颜色无效：'+key);
 if(typeof s.label!=='string'||!s.label.trim()||s.label.length>80||/[\u0000-\u001f<>]/.test(s.label))throw Error('按钮文案应为 1–80 个安全字符。');return structuredClone(s);
}
