import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import Preview from './Preview';
import {defaultConfig,parseConfig} from './model';
import type {ComponentKind} from './model';
import {useDetailPlayback} from './useDetailPlayback';
import {usePrefersReducedMotion} from './usePrefersReducedMotion';
import initialConfig from '../config.json';
import './style.css';

function Examples(){
 const [config,setConfig]=useState(()=>parseConfig(JSON.stringify(initialConfig)));
 const [draft,setDraft]=useState(JSON.stringify(config,null,2)),[error,setError]=useState('');
 const playback=useDetailPlayback(config.component),reduced=usePrefersReducedMotion();
 const select=(component:ComponentKind)=>{const next=defaultConfig(component);setConfig(next);setDraft(JSON.stringify(next,null,2));setError('')};
 return <main>
  <h1>TuneShape · Basic motion examples</h1>
  <p>Button press feedback. The complete online editor is available at <a href="https://tuneshape.kai-nex.com/">tuneshape.kai-nex.com</a>.</p>
  <nav aria-label="Examples">{(['button'] as const).map(kind=><button key={kind} aria-pressed={config.component===kind} onClick={()=>select(kind)}>{kind}</button>)}</nav>
  <div className="example-toolbar"><button onClick={playback.toggle}>{playback.playing?'Pause':'Play'}</button><span role="status">{reduced?'Reduced motion: instant transitions':'Pointer and keyboard supported'}</span></div>
  <section className="after" aria-label="Interactive example"><Preview key={config.component} config={config} label="after" speed={1} reduced={reduced} replay={playback.command.seq} paused={playback.paused} onRunningChange={playback.report}/></section>
  <details><summary>Edit the exact configuration</summary><label htmlFor="config">Configuration JSON</label><textarea id="config" spellCheck={false} value={draft} onChange={event=>setDraft(event.target.value)}/><button onClick={()=>{try{setConfig(parseConfig(draft));setError('')}catch(error){setError(error instanceof Error?error.message:String(error))}}}>Apply configuration</button><p role="alert">{error}</p></details>
  <p>Source: <code>src/Preview.tsx</code>, configuration and transitions: <code>src/model.ts</code>. Default prompts and configuration snapshots: <code>prompts/</code> and <code>configs/</code>.</p>
 </main>;
}
createRoot(document.getElementById('root')!).render(<Examples/>);
