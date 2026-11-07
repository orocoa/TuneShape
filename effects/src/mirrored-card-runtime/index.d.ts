export interface Card {id:string;src:string;alt?:string}
export interface StackRuntime {durationMs?:number;speed?:number;reduced?:boolean;paused?:boolean;enabled?:boolean;language?:'en'|'zh'}
export interface StackOptions extends StackRuntime {initialId?:string;language?:'en'|'zh';onChange?:(id:string,reason:string)=>void;onOpen?:(id:string)=>void;onInteraction?:(active:boolean)=>void}
export interface StackState {index:number;id:string;position:number;displayedPosition:number;target:number;velocity:number;phase:'idle'|'pending'|'dragging'|'settling';motion:'controlled'|'inertia'|null;runtime:{durationMs:number;speed:number;reduced:boolean;enabled:boolean;paused:boolean};items:string[]}
export interface CardStack {updateRuntime(runtime:StackRuntime):void;select(id:string,reason?:string):void;next(reason?:string):void;previous(reason?:string):void;setItems(items:Card[],id?:string):void;getState():StackState;pause(value?:boolean):void;setEnabled(value:boolean):void;setLanguage(value:'en'|'zh'):void;settle():void;destroy():void}
export function mountMirroredCardStack(host:HTMLElement,items:Card[],options?:StackOptions):CardStack;
