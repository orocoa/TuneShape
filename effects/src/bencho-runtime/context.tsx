import {createContext,useContext} from 'react';
import type {BenchoSettings} from '../bencho-settings';
import type {NativeEffectRuntime} from '../native-effect-tools';
import type {createBenchClock} from './clock';
export type BenchActions={demonstrate:()=>void;settle:()=>void;cancel?:()=>void;getState?:()=>Record<string,unknown>};
export type BenchContext={settings:BenchoSettings;runtime:NativeEffectRuntime;clock:ReturnType<typeof createBenchClock>;actions:BenchActions;cue:(name:'tick'|'glide'|'wisp'|'bump'|'hush',event?:Event)=>void};
export const Bench=createContext<BenchContext|null>(null);
export function useBench(){const value=useContext(Bench);if(!value)throw Error('Missing Bencho runtime');return value}
