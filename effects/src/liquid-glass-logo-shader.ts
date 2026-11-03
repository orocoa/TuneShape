/** Authored optical surface and studio lighting, based on the public visual reference. */
export const liquidGlassLogoFragment=`precision highp float;
uniform vec2 resolution,viewSize,logoPixels,bgPixels,offset;
uniform sampler2D logoTex,bgTex;
uniform float time,progress,logoSize,logoScale,finalLogoScale,logoRelief,originalColors,tile,depth,dispersion,relief,caustics,highlights,echoTint,innerWallFocus,bloom,dropStrength,decay,backgroundScale,backgroundX,backgroundY,tintOpacity,hasBackground,transparentBackground,opaqueBackground,sceneScale;
uniform vec3 logoColor,tileColor,backgroundColor,backgroundTint;
float box(vec2 p,vec2 halfSize,float radius){vec2 q=abs(p)-halfSize+radius;return length(max(q,0.))+min(max(q.x,q.y),0.)-radius;}
vec4 over(vec4 a,vec4 b){float alpha=a.a+b.a*(1.-a.a);return vec4((a.rgb*a.a+b.rgb*b.a*(1.-a.a))/max(.0001,alpha),alpha);}
vec4 backdrop(vec2 pos){
 vec4 base=vec4(backgroundColor,transparentBackground>.5?0.:1.);
 if(opaqueBackground>.5)base=over(base,vec4(0.,0.,0.,1.));
 if(hasBackground>.5){float fit=max(viewSize.x/bgPixels.x,viewSize.y/bgPixels.y)*backgroundScale;vec2 uv=(pos-viewSize*.5-vec2(backgroundX,backgroundY)*viewSize/100.)/(bgPixels*fit)+.5;vec4 image=vec4(0.);if(all(greaterThanEqual(uv,vec2(0.)))&&all(lessThanEqual(uv,vec2(1.))))image=texture2D(bgTex,uv);base=over(image,base);base=over(vec4(backgroundTint,tintOpacity),base);}
 return base;
}
vec4 artwork(vec2 uv){
 if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.))))return vec4(0.);
 vec4 art=texture2D(logoTex,uv);
 if(originalColors<.5){vec2 px=1./logoPixels;float ax=texture2D(logoTex,uv+vec2(px.x,0.)).a-texture2D(logoTex,uv-vec2(px.x,0.)).a;float ay=texture2D(logoTex,uv+vec2(0.,px.y)).a-texture2D(logoTex,uv-vec2(0.,px.y)).a;vec3 n=normalize(vec3(-ax,-ay,.18));float light=.73+.27*max(0.,dot(n,normalize(vec3(-.5,-.7,1.))));art.rgb=logoColor*mix(1.,light,logoRelief);}
 return art;
}
// Each wavelength samples a different ray, rather than painting rainbow lines on a rim.
vec4 refractedArtwork(vec2 point,vec2 shift,float spread){
 vec4 a=artwork(point),r=artwork(point+shift*spread),b=artwork(point-shift*spread);
 float alpha=max(a.a,max(r.a,b.a));
 vec3 paper=backdrop(viewSize*.5).rgb;
 return vec4(mix(paper.r,r.r,r.a),mix(paper.g,a.g,a.a),mix(paper.b,b.b,b.a),alpha);
}
void main(){
 vec2 pos=gl_FragCoord.xy/resolution*viewSize;pos.y=viewSize.y-pos.y;
 vec2 center=viewSize*.5+offset;
 float fit=min(1.,min((viewSize.x-24.)/logoSize,(viewSize.y-24.)/logoSize));
 float size=logoSize*max(.05,fit)*sceneScale;
 float p=clamp(progress,0.,1.);
 float glass=1.-smoothstep(.63,1.,p);
 float opening=smoothstep(0.,.23,p);
 float pulse=sin(p*20.)*exp(-p*10.)*.065*dropStrength;
 float growth=max(.012,opening+pulse);
 float fall=-.24*size*exp(-p*17.);
 vec2 point=pos-center-vec2(0.,fall),q=point/size;
 float radius=mix(.49,.205,smoothstep(.025,.25,p))*growth;
 vec2 halfSize=vec2(.5*growth);
 // A small surface wobble dies before the resting logo is revealed.
 vec2 flex=q+vec2(sin(q.y*6.+p*17.),sin(q.x*5.-p*14.))*exp(-p*3.)*.015*dropStrength;
 float sd=box(flex,halfSize,radius);
 float pixel=max(1./size,.0006);
 float mask=1.-smoothstep(-pixel,pixel,sd);
 vec2 eps=vec2(.001,0.);
 vec2 n=normalize(vec2(box(flex+eps,halfSize,radius)-box(flex-eps,halfSize,radius),box(flex+eps.yx,halfSize,radius)-box(flex-eps.yx,halfSize,radius))+vec2(.000001));
 float inside=max(0.,-sd),bevel=.082*growth;
 float shoulder=exp(-pow((inside-.035*growth)/max(.003,bevel),2.))*mask;
 float edge=1.-smoothstep(0.,max(.004,bevel),inside);
 float corner=smoothstep(.04,.38,abs(n.x*n.y));
 float wallFocus=mix(1.,smoothstep(-.3,.55,n.x*n.y*2.),innerWallFocus);
 float radial=length(q);
 float waveFront=p*2.4;
 float waveEnvelope=exp(-pow((radial-waveFront)/.13,2.))*exp(-time/max(.1,decay))*exp(-p*3.);
 float rings=sin((radial-waveFront)*66.)*waveEnvelope*dropStrength*glass*smoothstep(.01,.06,p);
 vec2 radialN=normalize(q+vec2(.00001));
 vec4 base=backdrop(pos+radialN*rings*size*.012);
 float outside=1.-mask;
 float waveLight=rings*.012*outside;
 base.rgb=clamp(base.rgb+vec3(waveLight),0.,1.);
 // The curved shoulder magnifies the centre, then folds the outer image back in.
 float magnification=1.+depth*mix(.36,.12,smoothstep(.10,.72,p))*glass;
 float curvature=depth*(.014+.012*dropStrength)*glass*(1.-.45*smoothstep(.2,.7,p));
 vec2 ray=q/magnification-n*shoulder*curvature;
 ray+=radialN*rings*.008;
 vec2 artUv=ray/max(.05,logoScale)+.5;
 vec2 normalUv=(pos-center)/(size*logoScale*mix(1.,finalLogoScale,smoothstep(.63,1.,p)))+.5;
 vec4 normalArt=artwork(normalUv);
 float separation=dispersion*.011*(.12+shoulder*1.5)*glass;
 vec2 opticalUv=mix(normalUv,artUv,glass);
 vec4 bent=refractedArtwork(opticalUv,n,separation*mask);
 // The inset back face has a separate ray and a slight diagonal optical parallax.
 vec2 insetUv=(ray+n*relief*.024*edge+vec2(-.009,.009)*relief*shoulder)/max(.05,logoScale)+.5;
 vec4 backArt=refractedArtwork(insetUv,n,separation*.65);
 float backFace=clamp(relief*.38,0.,.8)*shoulder*wallFocus;
 bent=mix(bent,over(backArt,bent),backFace);
 vec4 refractedBg=backdrop(pos+(ray-q)*size);
 vec4 lensBase=refractedBg;
 if(tile>.5&&hasBackground<.5)lensBase=over(vec4(tileColor,.19*mask),lensBase);
 // Thin neutral absorption provides thickness without making a second background panel.
 float absorption=mask*edge*(.025+.045*depth)*glass;
 lensBase.rgb*=1.-absorption;
 base=mix(base,lensBase,mask*glass);
 vec4 art=mix(normalArt,bent,mask);
 art.a*=smoothstep(.015,.13,p);
 base=over(art,base);
 float rim=exp(-pow(sd/(pixel*.75),2.));
 float insetSd=box(flex,halfSize-vec2(.065*growth),max(.001,radius-.034*growth));
 float insetLine=exp(-pow(insetSd/(pixel*.8),2.))*mask;
 float insetShadow=exp(-pow((insetSd+.006)/(pixel*1.7),2.))*mask;
 float studio=clamp(.48-.5*n.x-.64*n.y,0.,1.);
 float backStudio=clamp(.35+.55*n.x+.6*n.y,0.,1.);
 float whiteRim=(rim*(.32+.68*studio)+insetLine*relief*.72*wallFocus*(.15+.85*studio))*highlights;
 float darkRim=(insetShadow*.23*relief*(.2+.8*backStudio)+shoulder*corner*.095*depth)*glass;
 base.rgb*=1.-clamp(darkRim,0.,.55);
 // Broad spectral glints concentrate at opposite corners, with a narrow white edge.
 float spectral=dispersion*glass*corner*shoulder;
 float wavelength=inside/max(.006,bevel)*7.5+n.x*1.8-n.y*2.2;
 vec3 spectrum=.5+.5*cos(wavelength+vec3(0.,2.1,4.2));
 float spectralAlpha=clamp(spectral*.22*(.25+backStudio),0.,.55);
 base=over(vec4(spectrum,spectralAlpha),base);
 base=over(vec4(vec3(1.),clamp(whiteRim*glass,0.,.94)),base);
 float caustic=exp(-pow((inside-.07*growth)/.026,2.))*corner*caustics*.15*glass;
 base=over(vec4(mix(vec3(1.),spectrum,.28*min(dispersion,1.)),clamp(caustic,0.,.7)),base);
 float echo=exp(-pow((sd-.009*growth)/(pixel*1.1),2.))*exp(-time/max(.1,decay))*.3*glass;
 base=over(vec4(mix(vec3(.63,.79,1.),tileColor,echoTint),echo),base);
 float halo=exp(-abs(sd)/(.006+bloom*.022))*bloom*.07*glass;
 base=over(vec4(vec3(1.),clamp(halo,0.,.3)),base);
 gl_FragColor=base;
}`;
