import {skiperFontCss} from './skiper-font-data';
import {skiperIconLicense} from './skiper-licenses';
/** One document-scoped installation, also serialized into every standalone export. */
export function installSkiperFonts(doc:Document,css:string=skiperFontCss){
 if(doc.getElementById('tuneshape-skiper-fonts'))return;
 const style=doc.createElement('style');style.id='tuneshape-skiper-fonts';style.textContent=css+`
@font-face{font-family:'Skiper SF Display';font-style:normal;font-weight:400;src:local('SFProDisplay-Regular'),local('SF Pro Display Regular')}
@font-face{font-family:'Skiper SF Display';font-style:normal;font-weight:500;src:local('SFProDisplay-Medium'),local('SF Pro Display Medium')}
@font-face{font-family:'Skiper SF Display';font-style:normal;font-weight:600 900;src:local('SFProDisplay-Bold'),local('SF Pro Display Bold')}
`+'\n.skiper-effect{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}';doc.head.append(style);
}
export function withSkiperFontSource(name:string,code:string){
 return `/* ${skiperIconLicense.replaceAll('*/','* /')} */\nfunction ${name}(container,id,settings,runtime){const __name=(value)=>value;(${installSkiperFonts.toString()})(container.ownerDocument,${JSON.stringify(skiperFontCss)});const factory=(()=>{${code};return ${name};})();return factory(container,id,settings,runtime);}`;
}
