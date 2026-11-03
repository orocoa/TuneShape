/** Public-demo observations only; independent TuneShape implementation. */
export const soapNumberControls=[
 {
  "key": "wobble",
  "zh": "晃动强度",
  "en": "Jiggle",
  "min": 0,
  "max": 3,
  "step": 0.05,
  "value": 0.4,
  "group": "运动",
  "hint": "控制悬停、按下、菜单展开和滑块拖动时的形变幅度；0 为静止。"
 },
 {
  "key": "speed",
  "zh": "薄膜流速",
  "en": "Speed",
  "min": 0,
  "max": 4,
  "step": 0.05,
  "value": 1,
  "group": "运动",
  "hint": "只改变薄膜流动速度；0 冻结薄膜，原生控件仍可操作。"
 },
 {
  "key": "seed",
  "zh": "纹理种子",
  "en": "Seed",
  "min": 0,
  "max": 999,
  "step": 1,
  "value": 7,
  "group": "运动",
  "hint": "改变薄膜纹路与内部气泡排列，同一数值产生同一图案。"
 },
 {
  "key": "seeThrough",
  "zh": "重叠透视",
  "en": "See-through",
  "min": 0,
  "max": 1,
  "step": 0.01,
  "value": 0.3,
  "group": "透明与折射",
  "hint": "菜单覆盖其他控件时，显示下层控件的材质。"
 },
 {
  "key": "seeThroughBend",
  "zh": "重叠弯曲",
  "en": "Bend",
  "min": 0,
  "max": 2,
  "step": 0.01,
  "value": 0.3,
  "group": "透明与折射",
  "hint": "只在材质相互重叠时改变下层控件的弯曲程度。"
 },
 {
  "key": "refraction",
  "zh": "折射强度",
  "en": "Refraction",
  "min": 0,
  "max": 1,
  "step": 0.01,
  "value": 0.15,
  "group": "透明与折射",
  "hint": "让背后的轨道、色块和网格透过表面发生偏移。"
 },
 {
  "key": "opacity",
  "zh": "底色不透明度",
  "en": "Opacity",
  "min": 0,
  "max": 1,
  "step": 0.01,
  "value": 0,
  "group": "透明与折射",
  "hint": "控制染色底面的实心程度，独立于油膜不透明度。"
 },
 {
  "key": "oilOpacity",
  "zh": "油膜不透明度",
  "en": "Oil opacity",
  "min": 0,
  "max": 1,
  "step": 0.01,
  "value": 1,
  "group": "透明与折射",
  "hint": "只控制彩色油膜，不改变玻璃底色和高光。"
 },
 {
  "key": "uiScale",
  "zh": "控件缩放",
  "en": "Scale",
  "min": 0.25,
  "max": 3,
  "step": 0.05,
  "value": 1,
  "group": "内容与尺寸",
  "hint": "围绕画布中心缩放整套控件；较大尺寸可切换单个控件查看。"
 },
 {
  "key": "radius",
  "zh": "面板圆角",
  "en": "Radius",
  "min": 0,
  "max": 120,
  "step": 1,
  "value": 40,
  "group": "内容与尺寸",
  "hint": "控制搜索框、主按钮及展开菜单的圆角；图标按钮保持圆形。"
 },
 {
  "key": "glass",
  "zh": "液态玻璃",
  "en": "Liquid glass",
  "min": 0,
  "max": 1,
  "step": 0.01,
  "value": 0.95,
  "group": "薄膜材质",
  "hint": "从鼓起的肥皂泡过渡为平整表面和集中的折射边缘。"
 },
 {
  "key": "iridescence",
  "zh": "油膜色彩强度",
  "en": "Oil film",
  "min": 0,
  "max": 3,
  "step": 0.05,
  "value": 0.5,
  "group": "薄膜材质",
  "hint": "0 去掉干涉色，1 显示自然薄膜颜色，更高值加强色彩。"
 },
 {
  "key": "filmScale",
  "zh": "油膜纹路大小",
  "en": "Oil size",
  "min": 0.2,
  "max": 6,
  "step": 0.05,
  "value": 4.85,
  "group": "薄膜材质",
  "hint": "较大值呈现宽而平缓的色带，较小值呈现细密纹路。"
 },
 {
  "key": "oilCoverage",
  "zh": "油膜覆盖率",
  "en": "Oil coverage",
  "min": 0,
  "max": 1,
  "step": 0.01,
  "value": 0.73,
  "group": "薄膜材质",
  "hint": "减少数值会在油膜之间留出透明区域。"
 },
 {
  "key": "oilEdge",
  "zh": "边缘油膜宽度",
  "en": "Oil edge (px)",
  "min": 0,
  "max": 120,
  "step": 1,
  "value": 18,
  "group": "薄膜材质",
  "hint": "限制大型搜索框和菜单的油膜距边缘的范围；0 表示全表面。"
 },
 {
  "key": "oilEdgeFade",
  "zh": "边缘油膜衰减",
  "en": "Oil edge fade",
  "min": 0,
  "max": 3,
  "step": 0.01,
  "value": 2.33,
  "group": "薄膜材质",
  "hint": "提高数值会让大型控件的中央更清澈，并缩窄边缘色带。"
 },
 {
  "key": "clearCenter",
  "zh": "中央清澈度",
  "en": "Clear centre",
  "min": 0,
  "max": 1,
  "step": 0.01,
  "value": 0.57,
  "group": "薄膜材质",
  "hint": "清除所有控件中央的油膜与反射雾感，边缘仍保留色彩。"
 },
 {
  "key": "thickness",
  "zh": "薄膜厚度",
  "en": "Film thickness (nm)",
  "min": 0,
  "max": 2400,
  "step": 10,
  "value": 480,
  "group": "薄膜材质",
  "hint": "以纳米为单位改变干涉色相：薄膜偏金与洋红，厚膜趋向浅色。"
 },
 {
  "key": "drainage",
  "zh": "重力排水",
  "en": "Drainage",
  "min": 0,
  "max": 1,
  "step": 0.01,
  "value": 0.35,
  "group": "薄膜材质",
  "hint": "让薄膜顶部变薄、底部变厚，形成水平色带。"
 },
 {
  "key": "swirl",
  "zh": "涡流强度",
  "en": "Swirl",
  "min": 0,
  "max": 1,
  "step": 0.01,
  "value": 0.5,
  "group": "薄膜材质",
  "hint": "改变薄膜流动时的旋涡形状和局部弯曲。"
 },
 {
  "key": "reflectivity",
  "zh": "反射亮度",
  "en": "Reflectivity",
  "min": 0,
  "max": 6,
  "step": 0.05,
  "value": 1.3,
  "group": "薄膜材质",
  "hint": "控制环境反射的强弱，不改变按钮文字颜色。"
 },
 {
  "key": "dispersion",
  "zh": "色散强度",
  "en": "Dispersion",
  "min": 0,
  "max": 3,
  "step": 0.05,
  "value": 1,
  "group": "薄膜材质",
  "hint": "液态玻璃边缘分离红、绿、蓝光；玻璃值为 0 时不生效。"
 },
 {
  "key": "bevel",
  "zh": "玻璃边缘宽度",
  "en": "Glass bevel (px)",
  "min": 2,
  "max": 200,
  "step": 1,
  "value": 14,
  "group": "薄膜材质",
  "hint": "控制平面玻璃向边缘折射区过渡的宽度。"
 },
 {
  "key": "mirage",
  "zh": "环境映像",
  "en": "Mirage",
  "min": 0,
  "max": 3,
  "step": 0.05,
  "value": 0.7,
  "group": "环境反射",
  "hint": "将场景中的色块与轨道包裹在控件边缘。"
 },
 {
  "key": "reach",
  "zh": "映像范围",
  "en": "Mirage reach",
  "min": 0.5,
  "max": 8,
  "step": 0.05,
  "value": 2,
  "group": "环境反射",
  "hint": "决定边缘反射从多远的场景位置取色。"
 },
 {
  "key": "tilt",
  "zh": "指针视差",
  "en": "Pointer parallax",
  "min": 0,
  "max": 2,
  "step": 0.05,
  "value": 1,
  "group": "环境反射",
  "hint": "指针移动时改变高光与反射位置。"
 },
 {
  "key": "windowSize",
  "zh": "窗光大小",
  "en": "Window size",
  "min": 0.4,
  "max": 2,
  "step": 0.05,
  "value": 0.75,
  "group": "窗光与闪点",
  "hint": "同步改变窗光和闪点的整体尺寸。"
 },
 {
  "key": "windowWidth",
  "zh": "窗光宽度",
  "en": "Window width",
  "min": 0.3,
  "max": 2.5,
  "step": 0.05,
  "value": 0.8,
  "group": "窗光与闪点",
  "hint": "只改变窗光条带的厚度。"
 },
 {
  "key": "windowHead",
  "zh": "窗光起点厚度",
  "en": "Window head",
  "min": 0.3,
  "max": 2,
  "step": 0.05,
  "value": 0.7,
  "group": "窗光与闪点",
  "hint": "改变窗光左端的粗细。"
 },
 {
  "key": "windowTail",
  "zh": "窗光末端厚度",
  "en": "Window tail",
  "min": 0.05,
  "max": 2.5,
  "step": 0.05,
  "value": 0.6,
  "group": "窗光与闪点",
  "hint": "低值让末端尖细，高值让末端饱满。"
 },
 {
  "key": "windowIntensity",
  "zh": "窗光亮度",
  "en": "Window intensity",
  "min": 0,
  "max": 2,
  "step": 0.05,
  "value": 0.85,
  "group": "窗光与闪点",
  "hint": "控制窗光与其内部倒影的亮度。"
 },
 {
  "key": "windowGradient",
  "zh": "窗光渐隐",
  "en": "Window gradient",
  "min": 0,
  "max": 1,
  "step": 0.02,
  "value": 0.96,
  "group": "窗光与闪点",
  "hint": "控制窗光沿长度方向的亮度衰减。"
 },
 {
  "key": "windowLength",
  "zh": "窗光长度",
  "en": "Window length",
  "min": 0.3,
  "max": 2,
  "step": 0.05,
  "value": 1.3,
  "group": "窗光与闪点",
  "hint": "沿控件上缘延伸或收短窗光。"
 },
 {
  "key": "windowMargin",
  "zh": "窗光内边距",
  "en": "Window margin",
  "min": 0.4,
  "max": 2.2,
  "step": 0.05,
  "value": 0.85,
  "group": "窗光与闪点",
  "hint": "将窗光向控件内部移动。"
 },
 {
  "key": "windowBend",
  "zh": "窗光弯曲",
  "en": "Window bend",
  "min": 0,
  "max": 1,
  "step": 0.05,
  "value": 0.75,
  "group": "窗光与闪点",
  "hint": "控制长条窗光贴合控件轮廓的程度。"
 },
 {
  "key": "glintSize",
  "zh": "闪点大小",
  "en": "Glint size",
  "min": 0,
  "max": 3,
  "step": 0.05,
  "value": 1.65,
  "group": "窗光与闪点",
  "hint": "改变窗光末端闪点的尺寸。"
 },
 {
  "key": "glintIntensity",
  "zh": "闪点亮度",
  "en": "Glint intensity",
  "min": 0,
  "max": 2,
  "step": 0.05,
  "value": 0,
  "group": "窗光与闪点",
  "hint": "0 隐藏闪点；需要同时启用窗光。"
 },
 {
  "key": "glintDistance",
  "zh": "闪点沿线位置",
  "en": "Glint distance",
  "min": -1,
  "max": 2,
  "step": 0.05,
  "value": -0.45,
  "group": "窗光与闪点",
  "hint": "沿窗光末端移动闪点。"
 },
 {
  "key": "glintHeight",
  "zh": "闪点内外位置",
  "en": "Glint height",
  "min": -1.5,
  "max": 1.5,
  "step": 0.05,
  "value": 0.65,
  "group": "窗光与闪点",
  "hint": "正值移向内部，负值靠近边缘。"
 },
 {
  "key": "topLength",
  "zh": "顶部高光长度",
  "en": "Top highlight length",
  "min": 0.2,
  "max": 2.5,
  "step": 0.05,
  "value": 1,
  "group": "环境反射",
  "hint": "控制顶部柔光反射的长度。"
 },
 {
  "key": "topFade",
  "zh": "顶部高光渐隐",
  "en": "Top highlight fade",
  "min": 0,
  "max": 1,
  "step": 0.05,
  "value": 0.4,
  "group": "环境反射",
  "hint": "控制顶部高光的尾部衰减。"
 },
 {
  "key": "topTail",
  "zh": "顶部高光末端",
  "en": "Top highlight tail",
  "min": 0.05,
  "max": 2,
  "step": 0.05,
  "value": 1,
  "group": "环境反射",
  "hint": "改变顶部高光远端的宽窄。"
 },
 {
  "key": "maxDpr",
  "zh": "渲染像素比上限",
  "en": "Pixel ratio",
  "min": 1,
  "max": 2,
  "step": 0.25,
  "value": 1.5,
  "group": "渲染与背景",
  "hint": "在清晰度与渲染开销之间调整，最高不超过设备像素比。"
 }
] as const;
export const soapSelectControls=[
 {
  "key": "element",
  "zh": "预览控件",
  "en": "Element",
  "group": "内容与尺寸",
  "options": [
   {
    "value": "showcase",
    "label": "整套控件"
   },
   {
    "value": "menu",
    "label": "菜单"
   },
   {
    "value": "camera",
    "label": "相机"
   },
   {
    "value": "chat",
    "label": "新建"
   },
   {
    "value": "search",
    "label": "搜索框"
   },
   {
    "value": "toggle",
    "label": "开关"
   },
   {
    "value": "add",
    "label": "添加"
   },
   {
    "value": "close",
    "label": "关闭"
   },
   {
    "value": "button",
    "label": "主按钮"
   },
   {
    "value": "slider",
    "label": "滑块"
   }
  ]
 },
 {
  "key": "page",
  "zh": "页面配色",
  "en": "Page",
  "group": "内容与尺寸",
  "options": [
   {
    "value": "light",
    "label": "浅色"
   },
   {
    "value": "dark",
    "label": "深色"
   }
  ]
 },
 {
  "key": "backdrop",
  "zh": "背景内容",
  "en": "Backdrop",
  "group": "内容与尺寸",
  "options": [
   {
    "value": "plain",
    "label": "纯色"
   },
   {
    "value": "grid",
    "label": "网格"
   },
   {
    "value": "colour",
    "label": "彩色色块"
   }
  ]
 },
 {
  "key": "pop",
  "zh": "点击散开效果",
  "en": "Pop effect",
  "group": "运动",
  "options": [
   {
    "value": "none",
    "label": "关闭"
   },
   {
    "value": "droplets",
    "label": "水滴"
   },
   {
    "value": "bubbles",
    "label": "小气泡"
   },
   {
    "value": "both",
    "label": "两者"
   }
  ]
 },
 {
  "key": "soapPalette",
  "zh": "油膜调色方式",
  "en": "Soap palette",
  "group": "薄膜配色",
  "options": [
   {
    "value": "natural",
    "label": "自然干涉色"
   },
   {
    "value": "custom",
    "label": "自定义六色"
   }
  ]
 },
 {
  "key": "environment",
  "zh": "光照环境",
  "en": "Lighting",
  "group": "环境反射",
  "options": [
   {
    "value": "auto",
    "label": "自动"
   },
   {
    "value": "studio",
    "label": "摄影棚"
   },
   {
    "value": "window",
    "label": "窗边"
   },
   {
    "value": "sky",
    "label": "天空"
   },
   {
    "value": "soft",
    "label": "柔光"
   }
  ]
 },
 {
  "key": "windowStyle",
  "zh": "窗光形状",
  "en": "Window style",
  "group": "窗光与闪点",
  "options": [
   {
    "value": "edge",
    "label": "沿边缘"
   },
   {
    "value": "bubble",
    "label": "弧形"
   }
  ]
 },
 {
  "key": "glintShape",
  "zh": "闪点形状",
  "en": "Glint shape",
  "group": "窗光与闪点",
  "options": [
   {
    "value": "auto",
    "label": "自动"
   },
   {
    "value": "dot",
    "label": "圆点"
   },
   {
    "value": "dash",
    "label": "短线"
   },
   {
    "value": "pair",
    "label": "双点"
   },
   {
    "value": "none",
    "label": "关闭"
   }
  ]
 },
 {
  "key": "windowTwinShape",
  "zh": "内部倒影形状",
  "en": "Inner reflection shape",
  "group": "环境反射",
  "options": [
   {
    "value": "mirror",
    "label": "镜像"
   },
   {
    "value": "arc",
    "label": "圆弧"
   },
   {
    "value": "crescent",
    "label": "月牙"
   },
   {
    "value": "streak",
    "label": "短线"
   },
   {
    "value": "dot",
    "label": "圆点"
   }
  ]
 }
] as const;
export const soapBooleanControls=[
 {
  "key": "paused",
  "zh": "冻结薄膜",
  "en": "Paused",
  "group": "运动"
 },
 {
  "key": "windowLight",
  "zh": "显示窗光",
  "en": "Window light",
  "group": "窗光与闪点"
 },
 {
  "key": "windowTwin",
  "zh": "显示内部倒影",
  "en": "Inner reflection",
  "group": "环境反射"
 },
 {
  "key": "keyLight",
  "zh": "显示主光反射",
  "en": "Key reflection",
  "group": "环境反射"
 },
 {
  "key": "bottomShade",
  "zh": "显示底部阴影",
  "en": "Bottom shade",
  "group": "环境反射"
 },
 {
  "key": "defaultChecked",
  "zh": "开关默认开启",
  "en": "Default switch",
  "group": "内容与尺寸"
 },
 {
  "key": "disabled",
  "zh": "禁用控件",
  "en": "Disabled",
  "group": "内容与尺寸"
 }
] as const;
export const soapColorControls=[
 {
  "key": "tint",
  "zh": "材质底色",
  "en": "Tint",
  "group": "薄膜配色"
 },
 {
  "key": "soapColor",
  "zh": "油膜滤色",
  "en": "Soap color",
  "group": "薄膜配色"
 },
 {
  "key": "soapShadeColor",
  "zh": "薄膜暗部色",
  "en": "Soap shades",
  "group": "薄膜配色"
 },
 {
  "key": "soapHighlightColor",
  "zh": "薄膜高光色",
  "en": "Soap highlights",
  "group": "薄膜配色"
 },
 {
  "key": "bottomShadeColor",
  "zh": "底部阴影色",
  "en": "Shade colour",
  "group": "薄膜配色"
 },
 {
  "key": "soapPaletteRed",
  "zh": "红粉色带",
  "en": "Red and pink",
  "group": "薄膜配色"
 },
 {
  "key": "soapPaletteGold",
  "zh": "金黄色带",
  "en": "Gold",
  "group": "薄膜配色"
 },
 {
  "key": "soapPaletteGreen",
  "zh": "绿色色带",
  "en": "Green",
  "group": "薄膜配色"
 },
 {
  "key": "soapPaletteCyan",
  "zh": "青色色带",
  "en": "Cyan",
  "group": "薄膜配色"
 },
 {
  "key": "soapPaletteBlue",
  "zh": "蓝色色带",
  "en": "Blue",
  "group": "薄膜配色"
 },
 {
  "key": "soapPaletteViolet",
  "zh": "紫色色带",
  "en": "Violet",
  "group": "薄膜配色"
 },
 {
  "key": "toggleColor",
  "zh": "开关轨道色",
  "en": "Switch colour",
  "group": "内容与尺寸"
 },
 {
  "key": "sliderFrom",
  "zh": "滑块起点色",
  "en": "Slider from",
  "group": "内容与尺寸"
 },
 {
  "key": "sliderTo",
  "zh": "滑块终点色",
  "en": "Slider to",
  "group": "内容与尺寸"
 }
] as const;
export type SoapBubbleSettings={wobble:number;speed:number;seed:number;seeThrough:number;seeThroughBend:number;refraction:number;opacity:number;oilOpacity:number;uiScale:number;radius:number;glass:number;iridescence:number;filmScale:number;oilCoverage:number;oilEdge:number;oilEdgeFade:number;clearCenter:number;thickness:number;drainage:number;swirl:number;reflectivity:number;dispersion:number;bevel:number;mirage:number;reach:number;tilt:number;windowSize:number;windowWidth:number;windowHead:number;windowTail:number;windowIntensity:number;windowGradient:number;windowLength:number;windowMargin:number;windowBend:number;glintSize:number;glintIntensity:number;glintDistance:number;glintHeight:number;topLength:number;topFade:number;topTail:number;maxDpr:number;sliderValue:number;element:"showcase"|"menu"|"camera"|"chat"|"search"|"toggle"|"add"|"close"|"button"|"slider";page:"light"|"dark";backdrop:"plain"|"grid"|"colour";pop:"none"|"droplets"|"bubbles"|"both";soapPalette:"natural"|"custom";environment:"auto"|"studio"|"window"|"sky"|"soft";windowStyle:"edge"|"bubble";glintShape:"auto"|"dot"|"dash"|"pair"|"none";windowTwinShape:"mirror"|"arc"|"crescent"|"streak"|"dot";paused:boolean;windowLight:boolean;windowTwin:boolean;keyLight:boolean;bottomShade:boolean;defaultChecked:boolean;disabled:boolean;tint:string;soapColor:string;soapShadeColor:string;soapHighlightColor:string;bottomShadeColor:string;soapPaletteRed:string;soapPaletteGold:string;soapPaletteGreen:string;soapPaletteCyan:string;soapPaletteBlue:string;soapPaletteViolet:string;toggleColor:string;sliderFrom:string;sliderTo:string;buttonText:string;searchPlaceholder:string;menuFirst:string;menuSecond:string;sliderLabel:string};
export const defaultSoapBubble:Readonly<SoapBubbleSettings>={
 "wobble": 0.4,
 "speed": 1,
 "seed": 7,
 "seeThrough": 0.3,
 "seeThroughBend": 0.3,
 "refraction": 0.15,
 "opacity": 0,
 "oilOpacity": 1,
 "uiScale": 1,
 "radius": 40,
 "glass": 0.95,
 "iridescence": 0.5,
 "filmScale": 4.85,
 "oilCoverage": 0.73,
 "oilEdge": 18,
 "oilEdgeFade": 2.33,
 "clearCenter": 0.57,
 "thickness": 480,
 "drainage": 0.35,
 "swirl": 0.5,
 "reflectivity": 1.3,
 "dispersion": 1,
 "bevel": 14,
 "mirage": 0.7,
 "reach": 2,
 "tilt": 1,
 "windowSize": 0.75,
 "windowWidth": 0.8,
 "windowHead": 0.7,
 "windowTail": 0.6,
 "windowIntensity": 0.85,
 "windowGradient": 0.96,
 "windowLength": 1.3,
 "windowMargin": 0.85,
 "windowBend": 0.75,
 "glintSize": 1.65,
 "glintIntensity": 0,
 "glintDistance": -0.45,
 "glintHeight": 0.65,
 "topLength": 1,
 "topFade": 0.4,
 "topTail": 1,
 "maxDpr": 2,
 "element": "showcase",
 "page": "light",
 "backdrop": "plain",
 "pop": "droplets",
 "soapPalette": "natural",
 "environment": "auto",
 "windowStyle": "edge",
 "glintShape": "auto",
 "windowTwinShape": "mirror",
 "paused": false,
 "windowLight": false,
 "windowTwin": false,
 "keyLight": true,
 "bottomShade": false,
 "defaultChecked": true,
 "disabled": false,
 "tint": "auto",
 "soapColor": "auto",
 "soapShadeColor": "auto",
 "soapHighlightColor": "auto",
 "bottomShadeColor": "#ffffff",
 "soapPaletteRed": "#ff6685",
 "soapPaletteGold": "#f6d365",
 "soapPaletteGreen": "#83e8a9",
 "soapPaletteCyan": "#60dce9",
 "soapPaletteBlue": "#7799ff",
 "soapPaletteViolet": "#c084fc",
 "toggleColor": "#28c64f",
 "sliderFrom": "#0986ff",
 "sliderTo": "#9d7bff",
 "buttonText": "Continue",
 "searchPlaceholder": "Search",
 "menuFirst": "Select chats",
 "menuSecond": "Read all",
 "sliderLabel": "Volume",
 "sliderValue": 40
};
export function validateSoapBubble(value:unknown):SoapBubbleSettings{
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype)throw Error('泡泡材质设置必须是普通数据。');
 const v=value as Record<string,unknown>,keys=Object.keys(defaultSoapBubble);
 if(Reflect.ownKeys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(Object.getOwnPropertyDescriptor(v,k)??{},'value')))throw Error('泡泡材质字段不完整或含未知字段。');
 for(const c of soapNumberControls)if(typeof v[c.key]!=='number'||!Number.isFinite(v[c.key])||Number(v[c.key])<c.min||Number(v[c.key])>c.max)throw Error(c.zh+'超出范围。');
 if(!Number.isInteger(v.seed)||typeof v.sliderValue!=='number'||!Number.isFinite(v.sliderValue)||v.sliderValue<0||v.sliderValue>100)throw Error('种子或滑块数值无效。');
 for(const c of soapSelectControls)if(!c.options.some(o=>o.value===v[c.key]))throw Error(c.zh+'选项无效。');
 for(const c of soapBooleanControls)if(typeof v[c.key]!=='boolean')throw Error(c.zh+'须为布尔值。');
 for(const c of soapColorControls)if(typeof v[c.key]!=='string'||!(/^[#](?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(String(v[c.key]))||v[c.key]==='auto'))throw Error(c.zh+'须为 auto 或十六进制颜色。');
 for(const k of ['buttonText','searchPlaceholder','menuFirst','menuSecond','sliderLabel'])if(typeof v[k]!=='string'||!String(v[k]).trim()||Array.from(String(v[k])).length>40||/[<>\u0000-\u001f\u007f]/u.test(String(v[k])))throw Error('控件文字须为 1–40 个可见字符。');
 return structuredClone(v) as SoapBubbleSettings;
}
export const soapMaterialPresets={
 light:{glass:.95,iridescence:.5,filmScale:4.85,oilCoverage:.73,oilEdge:18,oilEdgeFade:2.33,clearCenter:.57,thickness:480,drainage:.35,swirl:.5,reflectivity:1.3,bevel:14,refraction:.15,environment:'auto',windowLight:false,windowTwin:false,wobble:.4,opacity:0},
 rainbow:{glass:.8,iridescence:1.4,filmScale:1.6,oilCoverage:1,oilEdge:0,clearCenter:.1,thickness:520,drainage:.6,swirl:.65,reflectivity:1.6,refraction:.15,windowLight:true,windowTwin:true},
 oil:{glass:.15,iridescence:2,filmScale:1.1,oilCoverage:1,oilEdge:0,clearCenter:0,thickness:760,drainage:.8,swirl:.9,reflectivity:1.5,refraction:.1,windowLight:true,windowTwin:true},
 soap:{glass:0,iridescence:1,filmScale:1,oilCoverage:1,oilEdge:0,oilEdgeFade:1,clearCenter:0,thickness:520,drainage:.6,swirl:.65,reflectivity:1.6,bevel:24,refraction:.08,environment:'studio',windowLight:true,windowTwin:true,wobble:1,opacity:0},
 glass:{glass:1,iridescence:0,filmScale:3,oilCoverage:0,oilEdge:0,clearCenter:1,reflectivity:1.2,bevel:24,refraction:.5,dispersion:1.5,environment:'window',windowLight:true,windowTwin:false,opacity:0},
} satisfies Record<string,Partial<SoapBubbleSettings>>;
export const soapPalettePresets={pearl:['#efd9e2','#f6edcd','#e1efe5','#d6e9ee','#dce2f5','#e5d9f2'],rose:['#ff708f','#f3b2a2','#ceb6c5','#c2bfdc','#b4b4e3','#e89ed3'],amber:['#ef8e68','#ffd174','#d7d39e','#c0cecb','#aebddc','#d8afd2'],lime:['#d8b0a5','#e9e594','#b4ed88','#a0d9bb','#a7c9da','#c6badc'],mint:['#d1b7cf','#d9d5a6','#9de6c0','#87e1d6','#9ac5e8','#c7b3eb'],cyan:['#c5b1d7','#d2d2aa','#9edfc6','#68ddeb','#87c3f0','#b5a3e4'],blue:['#c0a4d7','#cecaaf','#9bcfcb','#83cee9','#729df5','#a28be5'],violet:['#de9dcc','#e5b3b1','#c5c4d5','#b5c0ed','#a29bf3','#c08af1'],original:['#ff6685','#f6d365','#83e8a9','#60dce9','#7799ff','#c084fc'],pastel:['#ffc1d6','#ffe5a3','#c1f0d4','#b7edf2','#b7c8ff','#e4c9ff'],ocean:['#ba78d6','#9acbdb','#47cfaf','#2bd6e3','#4279ff','#7562e9'],sunset:['#ff6586','#ffc76d','#ff9b76','#dca8db','#bb88e7','#e49cea']};
export const soapReflectionPresets={soft:{windowLight:false,windowTwin:false,keyLight:true,reflectivity:1.3,topFade:.4},glossy:{windowLight:true,windowTwin:true,keyLight:true,reflectivity:2,windowIntensity:1.2,glintIntensity:1},checkpoint:{windowLight:true,windowTwin:true,keyLight:true,windowStyle:'bubble',windowTwinShape:'crescent',reflectivity:1.6,windowIntensity:1.4,topFade:0}} satisfies Record<string,Partial<SoapBubbleSettings>>;
export function soapApplyReflection(s:SoapBubbleSettings,key:keyof typeof soapReflectionPresets){return validateSoapBubble({...s,...soapReflectionPresets[key]})}
export function soapApplyPreset(s:SoapBubbleSettings,key:keyof typeof soapMaterialPresets){return validateSoapBubble({...s,...soapMaterialPresets[key]})}
export function soapApplyPalette(s:SoapBubbleSettings,key:keyof typeof soapPalettePresets){const p=soapPalettePresets[key];return validateSoapBubble({...s,soapPalette:key==='original'?'natural':'custom',soapPaletteRed:p[0],soapPaletteGold:p[1],soapPaletteGreen:p[2],soapPaletteCyan:p[3],soapPaletteBlue:p[4],soapPaletteViolet:p[5]})}
