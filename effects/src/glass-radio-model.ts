import type {HistoryConfig,Track} from './history-model';

export const glassRadioOptions=['Silver','Gold','Platinum'] as const;
export const glassRadioInteraction={
 options:glassRadioOptions,initialIndex:0,demoSequence:[1,2,0],
 trigger:'Native radio inputs: click, Space or arrow keys selects a finish. Selecting the current finish does not replay.',
 selection:'Transient per-preview selection; not saved in JSON. IDs and input names must be unique per instance.',
 restart:'When the saved interruption policy is restart, reset to the previous selected state before starting the new transition.',
 retarget:'Stop previous controllers and animate from current rendered values to the latest selection; no queue.',
 appearanceEase:[.42,0,.58,1],
};
export const glassRadioTracks:Track[]=[
 {part:'glider',property:'x',values:['0%','100%'],times:[0,1],start:0,span:1},
 ...[0,1,2].map(i=>({part:'finish'+i,property:'opacity',values:[i===0?1:0,i===1?1:0],times:[0,1],start:0,span:.8})),
 ...[0,1,2].map(i=>({part:'label'+i,property:'color',values:[i===0?'#303640':'#68717d',i===1?'#303640':'#68717d'],times:[0,1],start:0,span:.6})),
];

/** Adapt the saved Silver → Gold trajectory to any pair of native radio states. */
export function glassRadioSelection(config:HistoryConfig,from:number,to:number):HistoryConfig{
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||from>2||to<0||to>2)throw Error('Invalid glass radio selection');
 const next=structuredClone(config);
 const active=config.tracks.find(t=>t.part==='label0'&&t.property==='color')!.values[0],idle=config.tracks.find(t=>t.part==='label1'&&t.property==='color')!.values[0];
 next.tracks=next.tracks.map(track=>{
  if(track.part==='glider'&&track.property==='x')return {...track,values:track.values.map(value=>`${from*100+(to-from)*parseFloat(String(value))}%`)};
  const finish=track.part.match(/^finish([0-2])$/),label=track.part.match(/^label([0-2])$/);
  if(finish)return {...track,values:track.times.map(time=>(Number(finish[1])===from?1:0)*(1-time)+(Number(finish[1])===to?1:0)*time)};
  if(label)return {...track,values:[Number(label[1])===from?active:idle,Number(label[1])===to?active:idle]};
  return track;
 });
 return next;
}
