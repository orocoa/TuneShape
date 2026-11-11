export type SkiperSettings=Record<string,string|number|boolean>;
export type SkiperControl={key:string;label:string;labelEn:string;kind:'range'|'text'|'textarea'|'color'|'select'|'checkbox';min?:number;max?:number;step?:number;options?:{value:string;label:string;labelEn:string}[];hint?:string;hintEn?:string};
export type SkiperDefinition={id:string;number:number;title:string;titleEn:string;summary:string;summaryEn:string;width:number;height:number;defaults:SkiperSettings;controls:SkiperControl[];sourceAvailable?:boolean};
export type SkiperRuntime={enabled:boolean;paused:boolean;reduced:boolean;speed:number;gallery:boolean;managed:boolean;language:'zh'|'en';durationMs:number;delayMs:number;onInteract?:()=>void;onRunning?:(running:boolean)=>void};
export type SkiperEngine={update:(settings:SkiperSettings,runtime:SkiperRuntime)=>void;demonstrate:()=>void;settle:()=>void;destroy:()=>void;getValue:()=>unknown};
