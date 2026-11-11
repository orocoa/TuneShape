/** Viewport fit shared by the two independent gallery renderers and offline exports. */
function galleryFocusLayout(){
 const wrap=(index:number,size:number)=>((Math.round(index)%size)+size)%size;
 function frame(width:number,height:number,aspect:number,footer:number,ui=1,cornerControl=false){
  const inset=Math.min(width*.06,16*ui),bottom=Math.min(height*.48,Math.max(0,footer)+12*ui);
  const availableWidth=Math.max(1,width-inset*2),availableHeight=Math.max(1,height-bottom-inset*2);
  let h=Math.min(height*.66,availableHeight,availableWidth/Math.max(.01,aspect)),w=h*aspect;
  const cy=Math.min(height/2,height-bottom-inset-h/2);let x=(width-w)/2;
  if(cornerControl&&cy-h/2<58*ui&&x+w>width-58*ui){
   // Tiny cards keep the entire image clear of the 40px close target.
   const maxWidth=Math.max(1,width-58*ui-inset);if(w>maxWidth){w=maxWidth;h=w/aspect}x=Math.min((width-w)/2,width-58*ui-w);
  }
  return {x,y:cy-h/2,w,h,cx:x+w/2,cy};
 }
 const distance=(cardHeight:number,fov:number,pixelHeight:number,viewportHeight:number)=>cardHeight*viewportHeight/(2*Math.tan(fov*Math.PI/360)*Math.max(1,pixelHeight));
 return {wrap,frame,distance};
}
export const galleryFocus=galleryFocusLayout();
export const galleryFocusCode=`const galleryFocus=((__name)=>(${galleryFocusLayout.toString()}))((fn)=>fn)();`;
