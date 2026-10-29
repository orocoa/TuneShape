export const scrambleInteraction={text:'Thank you for playing my game',radiusEm:1.4,changeIntervalMs:95,replayIndex:3,lineBreakIndex:13} as const;

/** Kai-nex homepage alphabet with a neutral gray palette; stable cells avoid moving the text. */
export function scrambleFrame(value:number,localProgress?:readonly number[],variations?:readonly number[]){
 const progress=Math.max(0,Math.min(1,value)),text='Thank you for playing my game';
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!<>-_/[{}]=+*^?#|';
 const accents=['#444444','#666666','#888888','#aaaaaa'];
 const frame=[];
 for(let i=0;i<text.length;i++){
  const noisy=text[i]!==' '&&(localProgress?(localProgress[i]??1)<1:progress<(i+1)/text.length);
  const seed=(variations?.[i]??Math.floor(progress*40))+i*3;
  const candidate=alphabet[seed%alphabet.length],replacement=localProgress&&candidate===text[i]?alphabet[(seed+1)%alphabet.length]:candidate;
  frame.push({text:noisy?replacement:text[i],color:noisy?accents[seed%accents.length]:'inherit',framed:noisy&&seed%3===0});
 }
 return frame;
}

/** Client-space glyph centers keep the hit field correct at every preview scale. */
export function scrambleTargets(x:number,y:number,glyphs:readonly {x:number;y:number;fixed:boolean}[],radius:number){
 return glyphs.flatMap((glyph,index)=>!glyph.fixed&&Math.hypot(x-glyph.x,y-glyph.y)<radius?[index]:[]);
}
