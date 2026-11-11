/** Prefix selector lists without splitting commas inside functions or strings. */
export function scopeSelectorList(selectors:string,scope:string){
 const parts:string[]=[];let start=0,round=0,square=0,quote='',escaped=false;
 for(let i=0;i<selectors.length;i++){
  const char=selectors[i];
  if(escaped){escaped=false;continue}
  if(char==='\\'){escaped=true;continue}
  if(quote){if(char===quote)quote='';continue}
  if(char==='"'||char==="'"){quote=char;continue}
  if(char==='(')round++;else if(char===')')round--;else if(char==='[')square++;else if(char===']')square--;
  else if(char===','&&round===0&&square===0){parts.push(selectors.slice(start,i).trim());start=i+1}
 }
 parts.push(selectors.slice(start).trim());
 return parts.filter(Boolean).map(selector=>scope+' '+selector).join(', ');
}

const cache=new Map<string,string>();
/** Called lazily from createBencho in the browser; module imports stay SSR-safe. */
export function scopeBenchoCSS(css:string,scope='.bencho-effect'){
 const key=scope+'\0'+css,existing=cache.get(key);if(existing!==undefined)return existing;
 const sheet=new CSSStyleSheet();sheet.replaceSync(css);
 const visit=(rules:CSSRuleList)=>{
  for(const rule of Array.from(rules)){
   if(rule.type===CSSRule.STYLE_RULE){const style=rule as CSSStyleRule;style.selectorText=scopeSelectorList(style.selectorText,scope)}
   // Keyframe steps are not document selectors. Preserve their names, keys and
   // declarations, while recursing into grouping rules such as @media.
   else if(rule.type!==CSSRule.KEYFRAMES_RULE&&'cssRules' in rule)visit((rule as CSSGroupingRule).cssRules);
  }
 };
 visit(sheet.cssRules);const scoped=Array.from(sheet.cssRules,rule=>rule.cssText).join('\n');cache.set(key,scoped);return scoped;
}
