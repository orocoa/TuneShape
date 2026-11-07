import {mountTuneShapeDeck} from './portfolio-deck.js';

function normalize(items){
 if(!Array.isArray(items)||!items.length)throw new TypeError('Provide at least one card.');
 const ids=new Set();
 return items.map(item=>{
  if(!item||typeof item.id!=='string'||!item.id||ids.has(item.id)||typeof item.src!=='string'||!item.src)throw new TypeError('Cards need unique non-empty ids and image sources.');
  ids.add(item.id);return{id:item.id,cover:item.src,title:item.alt||item.id};
 });
}

export function mountMirroredCardStack(host,items,options={}){
 if(!(host instanceof HTMLElement))throw new TypeError('Provide an HTML host element.');
 const cards=normalize(items),hadClass=host.classList.contains('ts-mirrored-stack');
 host.classList.add('ts-mirrored-stack');
 const api=mountTuneShapeDeck(host,cards,options.initialId||cards[0].id,{
  onSelect:(id,reason)=>options.onChange?.(id,reason),
  onOpen:id=>options.onOpen?.(id),onInteraction:value=>options.onInteraction?.(value)
 });
 api.updateRuntime({durationMs:options.durationMs??980,speed:options.speed??1,reduced:Boolean(options.reduced),paused:Boolean(options.paused),enabled:options.enabled??true,language:options.language||'en'});
 return {
  select:api.select,next:api.next,previous:api.previous,
  setItems(next,id){const cards=normalize(next),current=id||api.getState().id;api.setItems(cards,cards.some(c=>c.id===current)?current:cards[0].id);},
  updateRuntime:api.updateRuntime,getState:api.getState,pause:api.pause,setEnabled:api.setEnabled,setLanguage:api.setLanguage,settle:api.settle,
  destroy(){api.destroy();if(!hadClass)host.classList.remove('ts-mirrored-stack');}
 };
}
