import {createRoot} from 'react-dom/client';
import {useState} from 'react';
import Preview from '../src/Preview';import HistoryPreview from '../src/HistoryPreview';
import {parseConfig} from '../src/model';import {parseHistory} from '../src/history-model';
import {usePrefersReducedMotion} from '../src/usePrefersReducedMotion';import {useDetailPlayback} from '../src/useDetailPlayback';
import {effectTrigger} from '../src/effect-behavior';import {isReelRecipe} from '../src/effect-variants';import {isStudioEffect} from '../src/orbit-typography-spec';
import {setLanguage} from '../src/i18n';
import '../src/style.css';
import '../src/catalog-design.css';
import '../src/dark-interface.css';
import '../src/detail-interface.css';
import '../src/refinement-interface.css';
import '../src/typography.css';
import '../src/header-interface.css';
import '../src/continuous-corners.css';
import '../src/reuse-runtime.css';
export function mountDemo(input:any,id:string){const raw=JSON.stringify(input),config=input.schemaVersion===2?parseHistory(raw):parseConfig(raw);setLanguage('en');
function Demo(){const reduced=usePrefersReducedMotion();const auto=config.schemaVersion===2&&(effectTrigger(id)==='loading'||['ascii-wave','encrypted-text','flip-words'].includes(id)||isStudioEffect(id)||isReelRecipe(id));const playback=useDetailPlayback(id,auto&&!reduced);const [epoch,setEpoch]=useState(0);return <main className="reuse-demo" data-public-effect={id}><nav className="reuse-toolbar" aria-label="Playback"><a href="../../">All effects</a><button onClick={playback.toggle}>{playback.playing?'Pause':'Play'}</button><button onClick={()=>setEpoch(n=>n+1)}>Replay</button><button onClick={()=>setLanguage('zh')}>中文</button><button onClick={()=>setLanguage('en')}>English</button><a href={'https://tuneshape.kai-nex.com/#/effect/'+id}>Open editor ↗</a></nav><div className="preview-card after" key={epoch}>{config.schemaVersion===2?<HistoryPreview config={config} speed={1} reduced={reduced} command={playback.command} paused={playback.paused} onRunningChange={playback.report} side="after" enabled/>:<Preview config={config} speed={1} reduced={reduced} replay={playback.command.seq} paused={playback.paused} onRunningChange={playback.report} label="after"/>}</div></main>};createRoot(document.getElementById('root')!).render(<Demo/>)}
