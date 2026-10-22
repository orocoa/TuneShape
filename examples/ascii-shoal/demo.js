import {createAsciiShoal, defaults} from './src/ascii-shoal.js';

const host=document.querySelector('#ocean');
const options={...defaults};
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let paused=false;
const engine=createAsciiShoal(host,options,{reduced:motion.matches});
const update=()=>engine.update(options,{paused,reduced:motion.matches});
function reflect(){
 for(const key of ['density','glyphScale','speed','sharkCount','fishDensity']){
  document.getElementById(key).value=String(options[key]);
  document.getElementById(key+'-value').textContent=key==='sharkCount'?String(options[key]):options[key].toFixed(2)+'×';
 }
 document.querySelectorAll('[data-density]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.density)===options.density)));
 document.getElementById('transport').textContent=paused?'Play':'Pause';
 document.getElementById('motion-note').textContent=motion.matches?'Reduced motion: showing a still frame.':'Move your pointer through the water.';
 document.getElementById('transport').disabled=motion.matches;
}
for(const key of ['density','glyphScale','speed','sharkCount','fishDensity'])document.getElementById(key).addEventListener('input',event=>{options[key]=Number(event.target.value);update();reflect()});
document.querySelectorAll('[data-density]').forEach(button=>button.addEventListener('click',()=>{options.density=Number(button.dataset.density);update();reflect()}));
for(const key of ['backgroundColor','inkColor'])document.getElementById(key).addEventListener('input',event=>{options[key]=event.target.value;update()});
document.getElementById('interactive').addEventListener('change',event=>{options.interactive=event.target.checked;update()});
document.getElementById('transport').addEventListener('click',()=>{paused=!paused;update();reflect()});
document.getElementById('restart').addEventListener('click',()=>{engine.restart();if(paused)engine.pause()});
document.getElementById('collapse').addEventListener('click',event=>{const controls=document.getElementById('controls');controls.hidden=!controls.hidden;event.currentTarget.setAttribute('aria-expanded',String(!controls.hidden));event.currentTarget.setAttribute('aria-label',controls.hidden?'Expand controls':'Collapse controls');event.currentTarget.textContent=controls.hidden?'+':'−'});
document.getElementById('save').addEventListener('click',()=>{const link=document.createElement('a');link.href=host.querySelector('canvas').toDataURL('image/png');link.download='ascii-shoal.png';link.click()});
motion.addEventListener('change',()=>{update();reflect()});
window.addEventListener('pagehide',()=>engine.destroy(),{once:true});
reflect();
