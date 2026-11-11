import {createContext,useContext} from 'react';
import type {BenchoUiSettings} from '../bencho-ui-settings';
import type {NativeEffectRuntime} from '../native-effect-tools';
import type {createBenchClock} from '../bencho-runtime/clock';
import type {SoundName} from '../bencho-runtime/sounds';
export type UiActions={demonstrate:()=>void;settle:()=>void;cancel?:()=>void;interrupt?:()=>void;getState?:()=>Record<string,unknown>};
export type UiRuntime=NativeEffectRuntime&{gallery?:boolean;onInteract?:()=>void;onFile?:(file:File)=>void};
export type UiContext={settings:BenchoUiSettings;runtime:UiRuntime;clock:ReturnType<typeof createBenchClock>;actions:UiActions;cue:(name:SoundName,event?:Event)=>void;sync:()=>void;activity:(ms?:number)=>void;motion?:(running:boolean)=>void};
export const UiBench=createContext<UiContext|null>(null);
export function useUiBench(){const value=useContext(UiBench);if(!value)throw Error('Missing Bencho UI runtime');return value}
