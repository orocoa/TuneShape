/** Match the apparent size of standalone text specimens across different renderers.
 * This is catalog presentation only: saved settings, detail previews and exports keep their own scale.
 */
export const catalogTextSize=(width:number)=>Math.min(32,Math.max(18,width*.075));
export function catalogTextFit(width:number,height:number,fontSize:number,contentWidth:number,contentHeight:number,scale=1){
 const target=catalogTextSize(width),zoom=Math.max(.01,scale);
 return Math.max(.06,Math.min(target/(Math.max(1,fontSize)*zoom),Math.max(1,width-24)/(Math.max(1,contentWidth)*zoom),Math.max(1,height-32)/(Math.max(1,contentHeight)*zoom)));
}
