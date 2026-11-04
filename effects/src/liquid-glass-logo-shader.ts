/** TuneShape-authored convex glass, wavelength rays and studio reflections. */
export const liquidGlassLogoFragment=`precision highp float;
uniform vec2 resolution,viewSize,logoPixels,bgPixels,offset;
uniform sampler2D logoTex,bgTex;
uniform float time,progress,logoSize,logoScale,finalLogoScale,logoRelief,originalColors,tile,depth,dispersion,relief,caustics,highlights,echoTint,innerWallFocus,bloom,dropStrength,decay,backgroundScale,backgroundX,backgroundY,tintOpacity,hasBackground,transparentBackground,opaqueBackground,sceneScale;
uniform vec3 logoColor,tileColor,backgroundColor,backgroundTint;
const float PI=3.14159265;
vec4 over(vec4 a,vec4 b){float alpha=a.a+b.a*(1.-a.a);return vec4((a.rgb*a.a+b.rgb*b.a*(1.-a.a))/max(.00001,alpha),alpha);}
float roundedBox(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
vec2 boxNormal(vec2 p,vec2 b,float r){vec2 d=abs(p)-b+r,outside=max(d,0.);float l=length(outside);if(l>.000001)return sign(p)*outside/l;return abs(d.x-d.y)<.00001?normalize(sign(p)+vec2(.000001)):d.x>d.y?vec2(sign(p.x),0.):vec2(0.,sign(p.y));}
vec4 backdrop(vec2 pos){vec4 base=vec4(backgroundColor,transparentBackground>.5?0.:1.);if(opaqueBackground>.5)base=over(base,vec4(0.,0.,0.,1.));if(hasBackground>.5){float fit=max(viewSize.x/bgPixels.x,viewSize.y/bgPixels.y)*backgroundScale;vec2 uv=(pos-viewSize*.5-vec2(backgroundX,backgroundY)*viewSize/100.)/(bgPixels*fit)+.5;vec4 image=vec4(0.);if(all(greaterThanEqual(uv,vec2(0.)))&&all(lessThanEqual(uv,vec2(1.))))image=texture2D(bgTex,uv);base=over(image,base);base=over(vec4(backgroundTint,tintOpacity),base);}return base;}
vec4 art(vec2 uv,float blur){
 if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.))))return vec4(0.);
 vec4 a=texture2D(logoTex,uv);
 if(blur>.00001){vec2 px=vec2(blur)/logoPixels;a=(a*4.+texture2D(logoTex,uv+vec2(px.x,0.))+texture2D(logoTex,uv-vec2(px.x,0.))+texture2D(logoTex,uv+vec2(0.,px.y))+texture2D(logoTex,uv-vec2(0.,px.y)))*.125;}
 if(originalColors<.5){vec2 px=1./logoPixels;float ax=texture2D(logoTex,uv+vec2(px.x,0.)).a-texture2D(logoTex,uv-vec2(px.x,0.)).a,ay=texture2D(logoTex,uv+vec2(0.,px.y)).a-texture2D(logoTex,uv-vec2(0.,px.y)).a;float shade=.76+.24*max(0.,dot(normalize(vec3(-ax,-ay,.2)),normalize(vec3(-.5,-.7,1.))));a.rgb=logoColor*mix(1.,shade,logoRelief);}
 return a;
}
// Back-project an incident viewing ray through a curved air/glass interface.
vec2 opticalRay(vec2 q,vec3 normal,float ior,float thickness,float magnification,float curve){vec3 r=refract(vec3(0.,0.,-1.),normal,1./ior);float grazing=1.-normal.z;float bulb=1.-smoothstep(.27,.49,progress*1.8);float mag=magnification*(1.+(ior-1.46)*1.7*bulb*grazing);vec2 axis=q/(mag+curve*pow(abs(q)*2.,vec2(6.))*max(.1,1.+(ior-1.46)*5.*grazing*grazing));vec2 tangent=pow(clamp(abs(q.yx)*2.,0.,1.),vec2(6.));axis/=1.+curve*3.1*tangent*max(.1,1.+(ior-1.46)*5.);return axis+r.xy/max(.08,-r.z)*thickness;}
vec4 scene(vec2 ray,vec2 center,float size,float logoRatio,float reveal,float blur,float bubble){vec4 a=art(ray/logoRatio+.5,blur);a.a*=reveal;vec4 b=backdrop(center+ray*size);if(tile>.5&&hasBackground<.5&&bubble>.5)b=over(vec4(tileColor,.08),b);float roundLight=(1.-smoothstep(.27,.49,progress*1.8))*.92*bubble;b=over(vec4(vec3(1.),roundLight),b);return over(a,b);}
vec4 spectralScene(vec2 q,vec3 normal,vec2 center,float size,float ratio,float thickness,float magnification,float curve,float split,float reveal,float blur){
 vec2 red=opticalRay(q,normal,1.46-split,thickness,magnification,curve),green=opticalRay(q,normal,1.46,thickness,magnification,curve),blue=opticalRay(q,normal,1.46+split,thickness,magnification,curve);
 float filterSize=blur+split*70.*pow(1.-normal.z,2.);vec4 r=scene(red,center,size,ratio,reveal,filterSize,1.),g=scene(green,center,size,ratio,reveal,filterSize,1.),b=scene(blue,center,size,ratio,reveal,filterSize,1.);float a=max(r.a,max(g.a,b.a));return vec4(vec3(r.r*r.a,g.g*g.a,b.b*b.a)/max(.00001,a),a);
}
void main(){
 vec2 pos=gl_FragCoord.xy/resolution*viewSize;pos.y=viewSize.y-pos.y;
 vec2 center=viewSize*.5+offset;
 float fit=max(.05,min(1.,min((viewSize.x-24.)/logoSize,(viewSize.y-24.)/logoSize))),size=logoSize*fit*sceneScale;
 float t=clamp(progress,0.,1.)*1.8;
 float birth=max(0.,t-.12),visible=smoothstep(.12,.17,t);
 float growth=(1.-exp(-12.*birth))*(1.04+.04*smoothstep(.35,1.15,t));
 growth+=sin(birth*19.)*exp(-birth*9.)*.028*dropStrength;
 growth=max(.001,growth);
 float square=smoothstep(.27,.49,t),radius=mix(.5,.21,square)*growth;
 vec2 halfSize=vec2(.5*growth);
 vec2 q=(pos-center)/size;
 float wobble=sin(birth*17.)*exp(-birth*6.)*.013*dropStrength;
 vec2 surface=q*vec2(1.+wobble,1.-wobble);
 float sd=roundedBox(surface,halfSize,radius),pixel=max(.0005,viewSize.x/resolution.x/size);
 float mask=(1.-smoothstep(-pixel,pixel,sd))*visible;
 vec2 n=boxNormal(surface,halfSize,radius);
 float d=max(0.,-sd),bevel=mix(.42,.095,square)*growth*(1.-.96*smoothstep(.72,1.3,t));
 float u=clamp(d/max(.0001,bevel),0.,1.);
 float corePower=1.-smoothstep(.4,1.12,t);
 float power=1.-smoothstep(1.1,1.48,t),glass=visible*(1.-smoothstep(.94,1.49,t));
 float angle=(1.-u)*PI*.5;
 vec3 normal=normalize(mix(vec3(0.,0.,1.),vec3(n*sin(angle),cos(angle)),power));
 float shoulder=sin(u*PI)*mask;
 float corner=smoothstep(.025,.35,abs(n.x*n.y));
 float thickness=depth*(.006+.003*dropStrength)*power*mix(.06,1.,square);
 float curve=depth*(.14*square+.025*(1.-square))*power;
 float magnification=1.+depth*(.07+.12*(1.-square))*corePower;
 float ratio=logoScale*mix(1.,finalLogoScale,smoothstep(1.1,1.5,t));
 float reveal=smoothstep(.14,.24,t),blur=(1.-smoothstep(.25,.48,t))*2.4;
 // A short travelling wave belongs to the impact, then decays before the ending hold.
 float radial=length(q),front=birth*2.3;
 float wave=sin((radial-front)*61.)*exp(-pow((radial-front)/.095,2.))*exp(-birth/max(.1,decay))*exp(-t*2.8)*dropStrength*visible;
 vec2 radialN=normalize(q+vec2(.000001));
 vec4 base=scene(q+radialN*wave*.006,center,size,ratio,reveal,0.,0.);
 float outerShadow=exp(-pow((sd-.009*growth)/max(.004*growth,pixel*2.),2.))*(1.-mask)*glass*.07;
 base=over(vec4(logoColor*.3,outerShadow),base);
 float split=dispersion*.060*power;
 float edgeKeep=smoothstep(.001,.017*growth,d);
 vec4 bent=spectralScene(q,normal,center,size,ratio,thickness,magnification,curve,split,reveal*edgeKeep,blur);
 // The inset back face has its own curved normal and optical path, not a duplicate flat logo.
 float inset=.095*growth;
 float backSd=roundedBox(surface-vec2(.005,-.004)*relief,halfSize-vec2(inset),max(.0001,radius-inset*.65));
 float backU=clamp(max(0.,-backSd)/max(.001,bevel*.52),0.,1.);
 vec2 backN=boxNormal(surface-vec2(.005,-.004)*relief,halfSize-vec2(inset),max(.0001,radius-inset*.65));
 float backAngle=(1.-backU)*PI*.5;
 vec3 backNormal=normalize(mix(vec3(0.,0.,1.),vec3(backN*sin(backAngle),cos(backAngle)),power*.55));
 float reliefStage=1.-smoothstep(.72,1.12,t);
 float backBand=exp(-pow(backSd/max(.003,.02*growth),2.))*mask;
 float focus=mix(1.,smoothstep(-.2,.55,n.x*n.y*2.),innerWallFocus);
 if(relief>.001){vec4 inner=spectralScene(q,backNormal,center,size,ratio,thickness*.43,magnification,curve*.85,split*.65,reveal*edgeKeep,blur);bent=mix(bent,inner,clamp(relief*.16*backBand*focus*reliefStage,0.,.5));}


 base=mix(base,bent,mask);
 // Broad Fresnel reflection from two studio softboxes gives a transparent, convex shoulder.
 float fresnel=.035+.965*pow(1.-normal.z,5.);
 float key=clamp(.5-.48*n.x-.65*n.y,0.,1.),fill=clamp(.15+.55*n.x+.62*n.y,0.,1.);
 float softFace=pow(1.-u,2.)*mask;
 base.rgb*=1.-clamp(softFace*.018*depth*glass,0.,.28);
 float reflection=(fresnel*(.12+.7*key)*mix(1.,.68,square)+shoulder*.06*fill)*highlights*glass*mask;
 base=over(vec4(vec3(1.),clamp(reflection,0.,.85)),base);
 float rim=exp(-pow(sd/max(pixel,.001),2.));
 float outerEcho=exp(-pow((sd-.008*growth)/max(pixel*.8,.001),2.));
 float innerLine=exp(-pow(backSd/max(pixel*1.2,.0015),2.))*mask;
 float innerShade=exp(-pow((backSd+.004)/max(pixel*2.,.002),2.))*mask;
 base.rgb*=1.-clamp(innerShade*.21*relief*reliefStage*(.45+.55*fill)*glass,0.,.4);
 float glintA=exp(-pow((sd+.008*growth)/max(pixel*.7,.0008),2.));
 float glintB=exp(-pow((sd+.017*growth)/max(pixel*.6,.0007),2.));
 float splitGlints=(glintA*.28+glintB*.16)*mask*highlights*glass*(.25+.75*corner)*reliefStage;
 float contour=(rim*(.7+.6*key)+innerLine*relief*reliefStage*(.4+1.3*key)*focus)*highlights*glass;

 // Optical path colour is strongest on the deep curved shoulder and opposite corners.
 float spectralPower=dispersion*clamp((depth-1.15)*.65,0.,1.)*glass*square;
 float hue=min(1.12,.60+u*.15+.45*smoothstep(.4,.8,u))+(q.x+q.y)*.025;
 vec3 spectrum=clamp(abs(fract(hue+vec3(0.,.666667,.333333))*6.-3.)-1.,0.,1.);
 float diagonal=pow(clamp(abs(q.x-q.y)/max(.001,growth),0.,1.),2.7);
 spectrum*=1.-.30*exp(-pow((u-.63)/.18,2.));
 float spectralBand=exp(-pow((u-.38)/.42,2.))*mask;
 float spectralOpacity=spectralPower*spectralBand*(.02+.96*diagonal)*1.6;
 base=over(vec4(spectrum,clamp(spectralOpacity,0.,.88)),base);
 float concentrated=exp(-pow((u-.78)/.12,2.))*mask;
 base=over(vec4(mix(vec3(1.),spectrum,min(1.,dispersion)*.18),clamp(concentrated*caustics*(.035+.07*corner)*glass,0.,.4)),base);
 base=over(vec4(vec3(1.),clamp(contour+splitGlints,0.,.98)),base);
 vec3 echoColour=mix(vec3(.65,.82,1.),tileColor,echoTint);
 base=over(vec4(echoColour,outerEcho*.26*glass*exp(-birth/max(.1,decay))),base);
 float halo=exp(-abs(sd)/max(.001,.003+bloom*.014))*bloom*.095*glass;
 base=over(vec4(vec3(1.),clamp(halo,0.,.28)),base);
 base.rgb=clamp(base.rgb+vec3(wave*.008*(1.-mask)*glass),0.,1.);
 float material=mask*glass*square;
 float grain=fract(sin(dot(floor(pos*2.),vec2(12.9898,78.233)))*43758.5453)-.5;
 base.rgb=clamp(base.rgb*(1.-material*(.010+.008*pow(clamp(length(q)*1.5,0.,1.),2.))*min(1.,depth/2.9))+grain*.008*material,0.,1.);
 gl_FragColor=base;
}`;
