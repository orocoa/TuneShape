import Swiper from '../page-turn-vendor/swiper/swiper.mjs';
import EffectCards from '../page-turn-vendor/swiper/modules/effect-cards.mjs';
import {extractionPose,extractionTransform} from './cards-path.js';
import {cardMaterial,stackedCardMaterial,createCardMaterial,paintCardMaterial} from './cards-material.js';
import {mod,clamp} from './deck-physics.js';

// Swiper supplies the cyclic slide layout; one continuous position drives the
// extraction path, pile spread and layer handoff. Native input and CSS timing
// stay disabled, so a regrab takes the pose currently on screen.
export function createCardsRenderer(root){
 const surface=document.createElement('div');surface.className='swiper deck-surface';
 const wrapper=document.createElement('div');wrapper.className='swiper-wrapper sb-content sb-scene';surface.append(wrapper);root.append(surface);
 let swiper,items=[],cards=[],materials=[],origin=0,direction=0,last=0,perspective=1200;
 function setItems(next,index){
  swiper?.destroy(true,true);items=next;origin=last=index;direction=0;
  // A middle copy supplies identical neighbours in either direction at wrap.
  cards=Array.from({length:items.length*3},(_,slot)=>{
   const item=items[slot%items.length],card=document.createElement('div');
   card.className='swiper-slide sb-slide';card.dataset.itemIndex=String(slot%items.length);card.setAttribute('role','group');
   const img=document.createElement('img');img.src=item.cover;img.alt=item.title;img.draggable=false;img.decoding='async';card.append(img);return card;
  });materials=cards.map(createCardMaterial);wrapper.replaceChildren(...cards);
  swiper=new Swiper(surface,{modules:[EffectCards],effect:'cards',loop:false,initialSlide:items.length+index,spaceBetween:40,speed:0,allowTouchMove:false,simulateTouch:false,resizeObserver:false,updateOnWindowResize:false,cardsEffect:{perSlideOffset:8,perSlideRotate:2,rotate:true,slideShadows:true}});
  swiper.detachEvents();swiper.setTransition(0);perspective=parseFloat(getComputedStyle(surface).perspective)||1200;
  return cards;
 }
 function paint(position,phase){
  const n=items.length;if(!swiper||!n||phase==='pending')return;
  if(phase==='idle'){origin=Math.round(position);direction=0;}
  else if(Math.abs(position-last)>1e-8){
   const travel=position-origin;
   // Rebase at whole cards; all visible copies share the same cyclic pose.
   if(Math.abs(travel)>=1){origin=travel>0?Math.floor(position):Math.ceil(position);direction=0;}
   if(Math.abs(position-origin)>1e-7)direction=Math.sign(position-origin);
  }else if(!direction&&Math.abs(position-origin)>1e-7)direction=Math.sign(position-origin);
  last=position;
  const progress=direction?clamp((position-origin)*direction,0,1):0;
  const slot=n+mod(origin,n);
  const visual=direction*progress,step=swiper.slidesGrid[slot+1]-swiper.slidesGrid[slot];
  swiper.touchEventsData.isTouched=progress>0;swiper.touchEventsData.startTranslate=-swiper.slidesGrid[slot];
  swiper.updateActiveIndex(slot);swiper.updateSlidesClasses();
  swiper.setTranslate(-swiper.slidesGrid[slot]-visual*step);
  // Clear the receiving card, then return just beneath it and above the
  // exposed back edges. Sending the card to the whole pile's bottom pops it.
  // Neighbours unfold only during travel and meet flush again at each landing.
  const fan=Math.sin(Math.PI*progress),params=swiper.params.cardsEffect,pose=extractionPose(progress,direction||1);
  cards.forEach((slide,index)=>{
   const exposed=n===1?slide===cards[slot]:Math.abs(slide.progress||0)<=3.05;
   slide.dataset.exposed=String(exposed);
   if(!exposed||slide===cards[slot])return;
   const p=clamp(slide.progress||0,-4,4),depth=Math.abs(p),offset=slide.swiperSlideOffset;
   const x=-(params.perSlideOffset-depth*.75)*p*fan;
   slide.style.transform=`translate3d(calc(${-offset}px + (${x}%)),0,${-100*depth*fan}px) rotateZ(${-params.perSlideRotate*p*fan}deg)`;
   const receiving=slide===cards[slot+(direction||1)];
   paintCardMaterial(slide,materials[index],stackedCardMaterial(depth,receiving,pose,progress));
  });
  const card=cards[slot];
  card.style.transform=extractionTransform(pose,card.swiperSlideOffset,perspective);
  card.style.zIndex=String(pose.behind?cards.length+1:cards.length+3);
  const receiver=cards[slot+(direction||1)];
  if(receiver)receiver.style.zIndex=String(cards.length+2);
  paintCardMaterial(card,materials[slot],cardMaterial(pose,progress));
  root.dataset.cardPass=phase==='idle'?'rest':pose.behind?'inserting':'extracting';
  root.dataset.cardProgress=progress.toFixed(5);
 }
 return {setItems,paint,resize(){swiper?.update();swiper?.setTransition(0);},destroy(){swiper?.destroy(true,true);surface.remove();}};
}
