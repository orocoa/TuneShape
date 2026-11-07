import {clamp} from './deck-physics.js';

// One matte material under a fixed upper-left light. All appearance is sampled
// from the same displayed pose as geometry, including interrupted gestures.
export function cardMaterial(pose,progress){
 const fan=Math.sin(Math.PI*clamp(progress,0,1)),radians=Math.PI/180;
 const x=pose.rotateX*radians,y=pose.rotateY*radians,z=pose.rotate*radians;
 const nx=Math.sin(y)*Math.cos(x),ny=-Math.sin(x),nz=Math.cos(y)*Math.cos(x);
 const worldX=nx*Math.cos(z)-ny*Math.sin(z),worldY=nx*Math.sin(z)+ny*Math.cos(z);
 const light=-.35*worldX-.45*worldY+.82*nz;
 return {
  shade:clamp((1-light/.82)*.3,0,.02)+.046*pose.depth*fan,
  contact:.24*fan*(1-pose.lift)*(1-.7*pose.depth),
  floating:.42*pose.lift+.035*pose.tuck,
  // Counter-rotate the light direction so it remains fixed on the screen.
  shadowX:4*Math.cos(z)+6*Math.sin(z),shadowY:-4*Math.sin(z)+6*Math.cos(z)
 };
}

export function stackedCardMaterial(depth,receiving,pose,progress){
 const fan=Math.sin(Math.PI*clamp(progress,0,1));
 // The receiver gains full light as the lifted card descends beneath it.
 // Deeper edges retain a small, ordered occlusion rather than a grey backing.
 const shade=receiving?.036*(1-clamp(pose.depth*2,0,1)):.044+.013*clamp(depth,0,2.5);
 return {shade:shade*fan,contact:receiving?.30*fan:0,floating:receiving?.06*fan:0,shadowX:4,shadowY:6};
}

export function createCardMaterial(card){
 const contact=document.createElement('span'),floating=document.createElement('span');
 contact.className='deck-contact-shadow';floating.className='deck-float-shadow';
 contact.setAttribute('aria-hidden','true');floating.setAttribute('aria-hidden','true');
 card.append(contact,floating);
 return {contact,floating};
}

export function paintCardMaterial(card,layers,material){
 const shade=card.querySelector('.swiper-slide-shadow');
 if(shade)shade.style.opacity=String(material.shade);
 layers.contact.style.opacity=String(material.contact);
 layers.floating.style.opacity=String(material.floating);
 layers.floating.style.transform=`translate3d(${material.shadowX||0}px,${material.shadowY||0}px,-.1px)`;
}
