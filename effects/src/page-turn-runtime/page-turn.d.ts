export type Card={id:string;label?:string;color?:string};
export type Runtime={language?:'zh'|'en';durationMs?:number;speed?:number;reduced?:boolean;paused?:boolean;enabled?:boolean};
export type Options=Runtime & {
  onSelect?:(id:string,reason:string)=>void;
  onInteraction?:(value:boolean)=>void;
  onActivate?:(id:string)=>void;
  onPosition?:(position:number,ids:string[],moving:boolean)=>void;
};
export interface PageTurn {
  select(id:string,reason?:string):void;
  next(reason?:string):void;
  previous(reason?:string):void;
  setItems(items:Card[],selectedId?:string):void;
  updateRuntime(runtime:Runtime):void;
  setLanguage(language:'zh'|'en'):void;
  pause(value?:boolean):void;
  setEnabled(value:boolean):void;
  settle():void;
  getState():{effect:'page-turn';index:number;id:string;position:number;target:number;phase:'idle'|'dragging'|'transitioning';queued:string|null;items:string[]};
  destroy():void;
  dispose():void;
}
export function createPageTurn(host:HTMLElement,items:Card[],initialId?:string,options?:Options):PageTurn;
