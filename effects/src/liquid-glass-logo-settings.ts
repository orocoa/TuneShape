export type LiquidGlassLogoSettings={logoKind:'brand'|'tuneshape'|'note'|'orbit'|'star'|'custom';text:string;logoSrc:string;logoName:string;backgroundSrc:string;backgroundName:string;originalColors:boolean;tile:boolean;logoColor:string;tileColor:string;backgroundColor:string;transparentBackground:boolean;backgroundTint:string;loop:boolean;paused:boolean;exportType:'video'|'image';exportFormat:'mp4'|'webm'|'png'|'jpeg'|'webp';exportRatio:'16:9'|'9:16'|'1:1'|'4:5'|'4:3';exportResolution:720|1080|1440|2160;exportFps:30|60;
 logoSize:number;
 logoScale:number;
 finalLogoScale:number;
 logoRelief:number;
 depth:number;
 dispersion:number;
 relief:number;
 caustics:number;
 highlights:number;
 echoTint:number;
 innerWallFocus:number;
 bloom:number;
 dropStrength:number;
 decay:number;
 speed:number;
 loopDelay:number;
 backgroundX:number;
 backgroundY:number;
 backgroundScale:number;
 backgroundTintOpacity:number;
 maxDpr:number;
 exportFrame:number;
};
export const glassLogoNumberControls=[
 {"key": "logoSize", "zh": "图标尺寸", "en": "Tile size", "min": 48, "max": 400, "step": 1, "unit": "px", "group": "Logo", "hint": "以参考画布的 CSS 像素计；Logo、镜片和波纹一起适配容器。"},
 {"key": "logoScale", "zh": "Logo 比例", "en": "Logo scale", "min": 0.2, "max": 1, "step": 0.01, "unit": "", "group": "Logo", "hint": "相对于图标边长的 Logo 尺寸。"},
 {"key": "finalLogoScale", "zh": "终态 Logo 比例", "en": "Final logo scale", "min": 0.1, "max": 1, "step": 0.01, "unit": "", "group": "Logo", "hint": "1 保持正常大小；仅改变玻璃消退后的 Logo。"},
 {"key": "logoRelief", "zh": "Logo 浮雕", "en": "Logo relief", "min": 0, "max": 1, "step": 0.01, "unit": "", "group": "Logo", "hint": "重新着色时增加圆润明暗；保留原色时不使用浮雕。"},
 {"key": "depth", "zh": "光学深度", "en": "Optical depth", "min": 0, "max": 4, "step": 0.05, "unit": "", "group": "玻璃", "hint": "增加镜片的放大和折弯。"},
 {"key": "dispersion", "zh": "色散", "en": "Dispersion", "min": 0, "max": 3, "step": 0.05, "unit": "", "group": "玻璃", "hint": "增加玻璃边缘不同颜色的分离。"},
 {"key": "relief", "zh": "双层倒角", "en": "Double bevel", "min": 0, "max": 3, "step": 0.05, "unit": "", "group": "玻璃", "hint": "加强内层折射面和分裂高光。"},
 {"key": "caustics", "zh": "焦散", "en": "Caustics", "min": 0, "max": 3, "step": 0.05, "unit": "", "group": "玻璃", "hint": "调整镜片肩部聚集的光。"},
 {"key": "highlights", "zh": "高光", "en": "Highlights", "min": 0, "max": 3, "step": 0.05, "unit": "", "group": "玻璃", "hint": "调整轮廓和反射光的亮度。"},
 {"key": "echoTint", "zh": "回声边缘染色", "en": "Echo plate tint", "min": 0, "max": 1, "step": 0.01, "unit": "", "group": "玻璃", "hint": "0 为冷色微光，1 跟随底板颜色。"},
 {"key": "innerWallFocus", "zh": "内壁聚焦", "en": "Inner wall focus", "min": 0, "max": 1, "step": 0.01, "unit": "", "group": "玻璃", "hint": "从完整内壁过渡到左上、右下的亮弧。"},
 {"key": "bloom", "zh": "光线扩散", "en": "Light diffusion", "min": 0, "max": 2, "step": 0.05, "unit": "", "group": "玻璃", "hint": "柔化玻璃和亮边周围的光。"},
 {"key": "dropStrength", "zh": "液滴强度", "en": "Drop strength", "min": 0, "max": 3, "step": 0.05, "unit": "", "group": "运动", "hint": "改变曲率、折射拉伸和波纹的强度。"},
 {"key": "decay", "zh": "波纹衰减", "en": "Ring decay", "min": 0.2, "max": 6, "step": 0.1, "unit": "s", "group": "运动", "hint": "基准时间内的回声衰减；速度改变整个时间轴的推进。"},
 {"key": "speed", "zh": "动画速度", "en": "Animation speed", "min": 0.1, "max": 4, "step": 0.05, "unit": "×", "group": "运动", "hint": "倍率越高，显形及循环越快。"},
 {"key": "loopDelay", "zh": "循环停留", "en": "Loop delay", "min": 0, "max": 10, "step": 0.1, "unit": "s", "group": "运动", "hint": "终态 Logo 的基准停留时间。"},
 {"key": "backgroundX", "zh": "背景水平偏移", "en": "Background X", "min": -100, "max": 100, "step": 1, "unit": "%", "group": "背景", "hint": "相对于画布宽度的偏移。"},
 {"key": "backgroundY", "zh": "背景垂直偏移", "en": "Background Y", "min": -100, "max": 100, "step": 1, "unit": "%", "group": "背景", "hint": "相对于画布高度的偏移。"},
 {"key": "backgroundScale", "zh": "背景缩放", "en": "Background scale", "min": 1, "max": 3, "step": 0.01, "unit": "×", "group": "背景", "hint": "以铺满画布为起点缩放。"},
 {"key": "backgroundTintOpacity", "zh": "背景覆盖强度", "en": "Background tint opacity", "min": 0, "max": 1, "step": 0.01, "unit": "", "group": "背景", "hint": "覆盖色在背景图片上方、Logo 下方。"},
 {"key": "maxDpr", "zh": "预览像素比上限", "en": "Preview pixel ratio cap", "min": 1, "max": 3, "step": 0.25, "unit": "", "group": "性能", "hint": "上限不会超过设备像素比；导出文件按所选分辨率渲染。"},
 {"key": "exportFrame", "zh": "取帧时刻", "en": "Frame time", "min": 0, "max": 2.4, "step": 0.01, "unit": "s", "group": "导出", "hint": "基准时间轴 0–2.4 秒；修改后预览定位到同一帧。"},
] as const;
export const defaultLiquidGlassLogo:LiquidGlassLogoSettings={"logoKind": "brand", "text": "TuneShape", "logoSrc": "", "logoName": "", "backgroundSrc": "", "backgroundName": "", "originalColors": false, "tile": true, "logoColor": "#09111b", "tileColor": "#f1f1f1", "backgroundColor": "#f1f1f1", "transparentBackground": false, "backgroundTint": "#000000", "loop": false, "paused": false, "exportType": "video", "exportFormat": "mp4", "exportRatio": "16:9", "exportResolution": 1080, "exportFps": 60, "logoSize": 256, "logoScale": 0.72, "finalLogoScale": 1, "logoRelief": 1, "depth": 2.9, "dispersion": 1, "relief": 1, "caustics": 1, "highlights": 1, "echoTint": 0.5, "innerWallFocus": 0, "bloom": 0.55, "dropStrength": 1, "decay": 1.4, "speed": 1, "loopDelay": 1.6, "backgroundX": 0, "backgroundY": 0, "backgroundScale": 1, "backgroundTintOpacity": 0, "maxDpr": 2, "exportFrame": 0.9};
export const glassLogoPresets={
  "logo-default": {
    "depth": 2.9,
    "dispersion": 1.0,
    "relief": 1.0,
    "caustics": 1.0,
    "highlights": 1.0,
    "echoTint": 0.5,
    "innerWallFocus": 0.0,
    "bloom": 0.55,
    "dropStrength": 1.0,
    "decay": 1.4,
    "speed": 1.0,
    "loopDelay": 1.6
  },
  "crystal-clear": {
    "depth": 0.85,
    "dispersion": 0.0,
    "relief": 0.05,
    "caustics": 0.1,
    "highlights": 0.65,
    "echoTint": 1.0,
    "innerWallFocus": 1.0,
    "bloom": 0.0,
    "dropStrength": 0.45,
    "decay": 0.8,
    "speed": 1.2,
    "loopDelay": 1.6
  },
  "soft-glow": {
    "depth": 2.3,
    "dispersion": 0.25,
    "relief": 0.55,
    "caustics": 2.3,
    "highlights": 2.6,
    "echoTint": 0.2,
    "innerWallFocus": 0.0,
    "bloom": 1.9,
    "dropStrength": 1.6,
    "decay": 2.4,
    "speed": 0.65,
    "loopDelay": 1.6
  },
  "chromatic-edge": {
    "depth": 2.6,
    "dispersion": 3.0,
    "relief": 0.8,
    "caustics": 1.6,
    "highlights": 1.65,
    "echoTint": 0.0,
    "innerWallFocus": 0.9,
    "bloom": 0.35,
    "dropStrength": 1.35,
    "decay": 1.6,
    "speed": 0.85,
    "loopDelay": 1.6
  },
  "sculpted": {
    "depth": 3.6,
    "dispersion": 0.65,
    "relief": 2.7,
    "caustics": 1.45,
    "highlights": 1.75,
    "echoTint": 0.6,
    "innerWallFocus": 0.35,
    "bloom": 0.3,
    "dropStrength": 1.8,
    "decay": 1.8,
    "speed": 0.9,
    "loopDelay": 1.6
  },
  "slow-melt": {
    "depth": 2.4,
    "dispersion": 1.45,
    "relief": 1.2,
    "caustics": 1.35,
    "highlights": 1.5,
    "echoTint": 0.5,
    "innerWallFocus": 0.15,
    "bloom": 0.7,
    "dropStrength": 2.1,
    "decay": 3.0,
    "speed": 0.45,
    "loopDelay": 2.4
  },
  "quick-snap": {
    "depth": 2.1,
    "dispersion": 0.8,
    "relief": 0.75,
    "caustics": 1.1,
    "highlights": 1.4,
    "echoTint": 0.3,
    "innerWallFocus": 0.6,
    "bloom": 0.25,
    "dropStrength": 1.3,
    "decay": 0.8,
    "speed": 1.8,
    "loopDelay": 1.0
  }
} as const;
export const glassLogoSelectControls={logoKind:['brand','tuneshape','note','orbit','star','custom'],exportType:['video','image'],exportFormat:['mp4','webm','png','jpeg','webp'],exportRatio:['16:9','9:16','1:1','4:5','4:3'],exportResolution:[720,1080,1440,2160],exportFps:[30,60]} as const;
export const glassLogoThemes={light:{logoColor:'#09111b',tileColor:'#f1f1f1',backgroundColor:'#f1f1f1'},dark:{logoColor:'#ffffff',tileColor:'#060c18',backgroundColor:'#000000'}} as const;
export function matchingGlassTheme(s:LiquidGlassLogoSettings){return !s.transparentBackground?Object.entries(glassLogoThemes).find(([,v])=>Object.entries(v).every(([k,v])=>s[k as keyof LiquidGlassLogoSettings]===v))?.[0]??'custom':'custom'}
export function matchingGlassPreset(s:LiquidGlassLogoSettings){return Object.entries(glassLogoPresets).find(([,v])=>Object.entries(v).every(([k,v])=>s[k as keyof LiquidGlassLogoSettings]===v))?.[0]??'custom'}
export function glassLogoExportSize(s:LiquidGlassLogoSettings){const [x,y]=s.exportRatio.split(':').map(Number),short=s.exportResolution;return {width:Math.round((x>=y?short*x/y:short)/2)*2,height:Math.round((y>=x?short*y/x:short)/2)*2}}
export const glassLogoDesignWidth=700;
export function glassLogoDesignHeight(s:LiquidGlassLogoSettings){const [x,y]=s.exportRatio.split(':').map(Number);return glassLogoDesignWidth*y/x}
export function glassLogoVideoDuration(s:LiquidGlassLogoSettings,durationMs=1800,delayMs=0){return delayMs/1000+2.4/s.speed*durationMs/1800}
export function validateGlassRaster(value:unknown,limit:number){if(typeof value!=='string'||value.length>limit||value&&!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))throw Error('图片必须是配置内嵌的本地 PNG、JPEG 或 WebP 数据。');return value}
export function validateLiquidGlassLogo(value:unknown):LiquidGlassLogoSettings{
 const keys=Object.keys(defaultLiquidGlassLogo);if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype||Reflect.ownKeys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)||!Object.hasOwn(Object.getOwnPropertyDescriptor(value,k)??{},'value')))throw Error('液态玻璃 Logo 字段不完整或包含未知字段。');
 const s=value as LiquidGlassLogoSettings;for(const c of glassLogoNumberControls)if(typeof s[c.key]!=='number'||!Number.isFinite(s[c.key])||s[c.key]<c.min||s[c.key]>c.max||c.key==='logoSize'&&!Number.isInteger(s[c.key]))throw Error('液态玻璃 Logo 数值无效：'+c.key);
 for(const [key,options] of Object.entries(glassLogoSelectControls))if(!(options as readonly unknown[]).includes(s[key as keyof LiquidGlassLogoSettings]))throw Error('液态玻璃 Logo 选项无效：'+key);
 for(const key of ['tile','originalColors','transparentBackground','loop','paused'] as const)if(typeof s[key]!=='boolean')throw Error('液态玻璃 Logo 开关无效：'+key);
 for(const key of ['logoColor','tileColor','backgroundColor','backgroundTint'] as const)if(typeof s[key]!=='string'||!/^#[\da-f]{6}$/i.test(s[key]))throw Error('液态玻璃 Logo 颜色无效：'+key);
 for(const key of ['text','logoName','backgroundName'] as const)if(typeof s[key]!=='string'||s[key].length>(key==='text'?40:80)||/[\u0000-\u001f\u007f<>]/.test(s[key])||key==='text'&&!s[key].trim())throw Error('Logo 文字或图片名称无效。');
 validateGlassRaster(s.logoSrc,800000);validateGlassRaster(s.backgroundSrc,1500000);if(s.logoKind==='custom'&&!s.logoSrc)throw Error('自定义 Logo 缺少图片。');
 if((s.exportType==='video'?!['mp4','webm'].includes(s.exportFormat):!['png','jpeg','webp'].includes(s.exportFormat)))throw Error('导出格式与类型不一致。');return {...s};
}
