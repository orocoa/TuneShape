import Swiper from '../page-turn-vendor/swiper/swiper.mjs';
import {createFoldHandoff} from './fold-handoff.js';

// Motion reference: Skiper 50 / Carousel_004, by @gurvinder-singh02.
// Attribution and supplied usage notice are retained in THIRD-PARTY-NOTICES.txt.
// Swiper owns input and selection. One clock staggers two independent 3D cards.
export function createPageTurn(host, initialItems, initialId, options = {}) {
 if (!(host instanceof HTMLElement)) throw new TypeError("A host element is required.");
 const normalizeItems = values => {
  if (!Array.isArray(values) || !values.length) throw new TypeError("At least one card is required.");
  const seen = new Set();
  return values.map((item, index) => {
   const id = String(item.id ?? index + 1);
   if (!id || seen.has(id)) throw new TypeError("Card IDs must be nonempty and unique.");
   seen.add(id);
   const color = String(item.color ?? "#424242");
   if (!/^#[0-9a-f]{6}$/i.test(color) || color.slice(1,3).toLowerCase() !== color.slice(3,5).toLowerCase() || color.slice(3,5).toLowerCase() !== color.slice(5,7).toLowerCase()) throw new TypeError("Card colors must be six-digit grayscale hex values.");
   return {id, label: String(item.label ?? index + 1), color};
  });
 };
 initialItems = normalizeItems(initialItems);
 let runtime = {language: "zh", durationMs: 600, speed: 1, reduced: false, ...options};
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),abort=new AbortController();
 const root=document.createElement('div');root.className='swiper ts-page-turn';root.tabIndex=0;
 root.setAttribute('role','region');root.setAttribute('aria-roledescription','carousel');
 const wrapper=document.createElement('div');wrapper.className='swiper-wrapper';
 const live=document.createElement('span');live.className='tspt-live';live.setAttribute('aria-live','polite');
 root.append(wrapper,live);host.replaceChildren(root);
 const scene=createFoldHandoff(root,wrapper);
 let swiper,items=[],ids=[],selected=0,language=runtime.language,reason='mount',paused=false,enabled=true,interacting=false,dead=false,rebuilding=false,touching=false,loopFixing=false,queued=null,requestEpoch=0;
 const speed=()=>reduced.matches||runtime.reduced||paused||!enabled||document.hidden?0:Math.max(0,Number(runtime.durationMs)||0)/Math.max(.1,Number(runtime.speed)||1);
 const interaction=value=>{if(interacting===value)return;interacting=value;options.onInteraction?.(value);};
 function metadata(){
  const item=items[selected];if(!item)return;
  root.dataset.cardId=item.id;root.dataset.index=String(selected);root.dataset.effect='page-turn';
  root.dataset.gesture=touching?'dragging':swiper?.animating?'transitioning':'idle';
  root.setAttribute('aria-label',language==='zh'?'卡片，左右滑动或使用方向键切换':'Cards. Swipe or use the arrow keys to switch.');
  live.setAttribute('aria-live',reason==='auto'?'off':'polite');
  live.textContent=language==='zh'?`第 ${selected+1} 张，共 ${items.length} 张：${item.label}`:`Card ${selected+1} of ${items.length}: ${item.label}`;
  const active=swiper?.slides[swiper.activeIndex];
  for(const slide of wrapper.children)slide.setAttribute('aria-hidden',String(slide!==active));
 }
 function commit(force=false){
  if(dead||rebuilding||loopFixing||touching||!swiper||swiper.destroyed)return;
  const next=swiper.realIndex%items.length,changed=next!==selected;selected=next;
  metadata();options.onPosition?.(selected,ids,false);
  if(changed||force)options.onSelect?.(items[selected].id,reason);
 }
 function finish(){
  if(dead||rebuilding||loopFixing||touching)return;
  commit();scene.bind(swiper,selected);root.dataset.gesture='idle';
  const request=queued,generation=swiper,epoch=requestEpoch;queued=null;interaction(false);
  if(request)queueMicrotask(()=>{if(!dead&&!paused&&enabled&&swiper===generation&&requestEpoch===epoch)select(request.id,request.why);});
 }
 function setItems(next,id){
  if(dead)return;next=normalizeItems(next);
  requestEpoch++;queued=null;scene.reset();
  rebuilding=true;touching=false;loopFixing=false;swiper?.destroy(true,true);items=next;ids=items.map(p=>p.id);selected=Math.max(0,ids.indexOf(id));reason='mount';
  // Two slides cannot supply stable neighbours on both sides during loopFix.
  // Repeated views share the same logical IDs; there are still two logical cards.
  const physicalItems=items.length===2?[...items,...items,...items]:items;
  wrapper.replaceChildren(...physicalItems.map((item,index)=>{
   const slide=document.createElement('div');slide.className='swiper-slide tspt-slide';slide.dataset.itemIndex=String(index%items.length);slide.setAttribute('role','group');
   const face=document.createElement('div');face.className='tspt-face';face.textContent=item.label;face.style.setProperty('--card-gray',item.color);slide.setAttribute('aria-label',item.label);
   const shade=document.createElement('div');shade.className='fold-shade';shade.setAttribute('aria-hidden','true');slide.append(face,shade);return slide;
  }));
  swiper=new Swiper(root,{
   effect:'slide',virtualTranslate:true,initialSlide:items.length===2?items.length+selected:selected,
   slidesPerView:1,centeredSlides:true,spaceBetween:0,loop:items.length>1,
   speed:speed(),grabCursor:true,threshold:5,watchOverflow:true,
   allowTouchMove:enabled&&!paused&&items.length>1,
   on:{
    beforeLoopFix(){loopFixing=true;},loopFix(){loopFixing=false;scene.rebase();},
    touchStart(){if(rebuilding)return;requestEpoch++;queued=null;touching=true;reason='drag';scene.grab();root.dataset.gesture='dragging';interaction(true);},
    touchEnd(){touching=false;const ended=swiper;requestAnimationFrame(()=>{if(!dead&&swiper===ended&&!swiper.animating)finish();});},
    beforeTransitionStart(){if(rebuilding||loopFixing||touching)return;root.dataset.gesture='transitioning';interaction(true);},
    transitionEnd:finish,
    click(instance,event){if(!instance.allowClick||instance.animating||paused||!enabled||dead)return;event.preventDefault();commit();options.onActivate?.(items[selected].id);},
    setTransition(instance,ms){scene.setDuration(ms);},
    resize(instance){
     if(rebuilding)return;scene.resize();scene.rebase();
     // Native resize can cancel a custom-property transition without an end event.
     if(instance.animating)wrapper.dispatchEvent(new CustomEvent('transitionend',{bubbles:true}));
    },
    setTranslate(instance){
     if(rebuilding||loopFixing||!instance.slides?.length)return;
     const grid=instance.slidesGrid,step=grid[1]-grid[0]||instance.size,position=(-instance.translate-grid[0])/step;
     scene.move(position);
     const base=Math.max(0,Math.min(instance.slides.length-1,Math.floor(position))),id=Number(instance.slides[base].dataset.itemIndex);
     options.onPosition?.(id+position-base,ids,instance.animating||interacting);
    },
   },
  });
  scene.bind(swiper,selected);rebuilding=false;commit(true);interaction(false);
 }
 function settle(){
  if(!swiper||dead)return;
  requestEpoch++;queued=null;touching=false;
  if(swiper.animating){wrapper.dispatchEvent(new CustomEvent('transitionend',{bubbles:true}));return;}
  swiper.setTransition(0);swiper.slideTo(swiper.activeIndex,0,false);finish();
 }
 function select(id,why='control'){
  const index=items.findIndex(p=>p.id===id);if(index<0||dead)return;
  requestEpoch++;
  if(swiper.animating){queued=index===swiper.realIndex%items.length?null:{id,why};return;}
  reason=why;
  if(index===swiper.realIndex%items.length){settle();return;}
  // Select an existing physical view synchronously. slideToLoop schedules an
  // extra rAF which can otherwise restart motion after a pause or departure.
  let slot=-1,distance=Infinity;
  swiper.slides.forEach((slide,i)=>{const d=Math.abs(i-swiper.activeIndex);if(Number(slide.dataset.itemIndex)===index&&d<distance){slot=i;distance=d;}});
  if(slot>=0)swiper.slideTo(slot,speed());
 }
 function step(delta,why='control'){
  if(dead||items.length<2)return;reason=why;
  if(swiper.animating){const base=queued?ids.indexOf(queued.id):swiper.realIndex%items.length;select(ids[(base+delta+items.length)%items.length],why);return;}
  requestEpoch++;queued=null;
  if(delta>0)swiper.slideNext(speed());else swiper.slidePrev(speed());
 }
 root.addEventListener('keydown',event=>{
  if(paused||!enabled)return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowRight'?1:-1);}
  if(event.key==='Enter'){event.preventDefault();settle();options.onActivate?.(items[selected].id);}
 },{signal:abort.signal});
 root.addEventListener('dragstart',event=>event.preventDefault(),{signal:abort.signal});
 reduced.addEventListener('change',()=>{swiper.params.speed=speed();if(reduced.matches)settle();},{signal:abort.signal});
 setItems(initialItems,initialId);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();},{signal:abort.signal});
 updateRuntime(runtime);
 function updateRuntime(next){
  if(dead)return;
  runtime={...runtime,...next};language=runtime.language==='en'?'en':'zh';
  if(next.paused!==undefined)paused=Boolean(next.paused);
  if(next.enabled!==undefined)enabled=Boolean(next.enabled);
  root.dataset.paused=String(paused);swiper.params.speed=speed();
  swiper.allowTouchMove=enabled&&!paused&&items.length>1;
  if(paused||!enabled||runtime.reduced||reduced.matches)settle();
  metadata();
 }
 return{
  select,next:(why='control')=>step(1,why),previous:(why='control')=>step(-1,why),setItems,settle,updateRuntime,
  setLanguage(value){updateRuntime({language:value});},
  pause(value=true){paused=value;root.dataset.paused=String(value);swiper.allowTouchMove=enabled&&!paused&&items.length>1;if(value){queued=null;settle();}},
  setEnabled(value){enabled=value;swiper.allowTouchMove=enabled&&!paused&&items.length>1;if(!value){queued=null;settle();}},
  getState:()=>({effect:'page-turn',index:selected,id:items[selected].id,position:selected,target:swiper.realIndex%items.length,phase:swiper.animating?'transitioning':interacting?'dragging':'idle',queued:queued?.id||null,items:[...ids]}),
  destroy:dispose,dispose,
 };
 function dispose(){if(dead)return;dead=true;requestEpoch++;queued=null;abort.abort();scene.destroy();swiper.destroy(true,true);interaction(false);root.remove();}
}
