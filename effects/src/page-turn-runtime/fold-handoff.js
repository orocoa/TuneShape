// Keep each card on its original independent 3D turn. One interpolated clock
// schedules the outgoing and incoming poses; there is no shared fold geometry.
export function createFoldHandoff(root,wrapper){
 let instance,left,right,value=0,duration=0,moving=false,dead=false,sceneWidth=0,sceneHeight=0;
 const index=node=>instance?.slides.indexOf(node)??0;
 const read=()=>moving?Number.parseFloat(getComputedStyle(root).getPropertyValue('--fold-progress'))||0:value;
 function size(width,height){
  if(width<=0||height<=0)return;
  if(width!==sceneWidth){sceneWidth=width;root.style.setProperty('--fold-w',String(width));}
  if(height!==sceneHeight){sceneHeight=height;root.style.setProperty('--fold-h',String(height));}
 }
 function resize(){if(instance)size(Number.parseFloat(instance.slides[0]?.style.width)||instance.width,root.getBoundingClientRect().height);}
 const observer=new ResizeObserver(resize);observer.observe(root);
 function pair(a,b,p,flush=false){
  root.style.transitionDuration='0ms';moving=false;
  if(left!==a||right!==b){
   for(const slide of instance.slides)slide.dataset.foldRole='hidden';
   left=a;right=b;left.dataset.foldRole=left===right?'single':'left';
   if(left!==right)right.dataset.foldRole='right';
  }
  rebase();value=p;root.style.setProperty('--fold-progress',String(p));
  // One style flush at a programmatic handoff seeds reverse turns correctly.
  // Drag updates never read layout or computed styles.
  if(flush)getComputedStyle(root).getPropertyValue('--fold-progress');
 }
 function rebase(){
  if(!instance||!left)return;
  const write=slide=>{const slot=String(instance.slidesGrid[index(slide)]||0);if(slide.style.getPropertyValue('--fold-slot')!==slot)slide.style.setProperty('--fold-slot',slot);};
  write(left);if(right!==left)write(right);
 }
 function signalEnd(){
  if(dead||!instance||instance.destroyed)return;
  moving=false;wrapper.dispatchEvent(new CustomEvent('transitionend',{bubbles:true}));
 }
 function soonEnd(){const current=instance;queueMicrotask(()=>{if(instance===current)signalEnd();});}
 function move(target){
  if(!instance?.slides.length)return;
  const cards=instance.slides,n=cards.length;
  if(duration===0){
   const p=Math.max(0,Math.min(n-1,target)),a=Math.floor(p),b=Math.min(n-1,a+1);
   pair(cards[a],cards[b],p-a);return;
  }
  const to=Math.max(0,Math.min(n-1,Math.round(target))),card=cards[to],p=read();
  let start=p,end;
  if(left!==right&&(card===left||card===right))end=card===left?0:1;
  else{
   const from=p<.5?left:right,a=index(from);
   if(a===to){pair(card,card,0);soonEnd();return;}
   start=a<to?0:1;end=1-start;
   pair(a<to?from:card,a<to?card:from,start,true);
  }
  if(Math.abs(start-end)<1e-7){soonEnd();return;}
  const far=Math.abs(index(right)-index(left))>1;
  // Far directory jumps keep their two endpoint images until landing. Native
  // touch input may regrab adjacent turns, but must not expose unrelated slots.
  instance.params.preventInteractionOnTransition=far;root.dataset.interruptible=String(!far);
  const milliseconds=Math.round(duration*Math.max(.35,Math.sqrt(Math.min(1,Math.abs(start-end)))));
  root.style.transitionDuration=`${milliseconds}ms`;value=end;moving=true;
  root.style.setProperty('--fold-progress',String(end));
 }
 function bind(next,selected){
  instance=next;duration=0;left=right=null;moving=false;
  next.params.preventInteractionOnTransition=false;root.dataset.interruptible='true';
  resize();
  const active=next.slides[next.activeIndex],card=Number(active?.dataset.itemIndex)===selected?active:next.slides.find(s=>Number(s.dataset.itemIndex)===selected);pair(card,card,0);
 }
 function grab(){
  if(!moving)return;
  const p=read(),a=index(left),b=index(right),from=a+(b-a)*p;
  pair(left,right,p);duration=0;
  if(instance.animating)signalEnd();
  instance.setTransition(0);
  const grid=instance.slidesGrid,slot=Math.floor(from),fraction=from-slot;
  instance.setTranslate(-(grid[slot]+fraction*((grid[slot+1]??grid[slot]+instance.size)-grid[slot])));
  instance.updateActiveIndex();instance.updateSlidesClasses();
 }
 const ended=event=>{if(event.target===root&&event.propertyName==='--fold-progress'&&moving)signalEnd();};
 root.addEventListener('transitionend',ended);
 return{bind,move,grab,rebase,resize,setDuration(ms){duration=ms;},
  reset(){root.style.transitionDuration='0ms';moving=false;instance=null;left=right=null;sceneWidth=sceneHeight=0;},
  destroy(){dead=true;observer.disconnect();root.removeEventListener('transitionend',ended);},
 };
}
