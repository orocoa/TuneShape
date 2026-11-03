/** Independent signed-distance / thin-film shader. No reference shader or media. */
export const soapBubbleFragment=`precision highp float;
uniform vec2 resolution;uniform vec2 sceneOffset;uniform float time;uniform vec2 pointer;uniform float menuOpen;uniform float toggleValue;uniform float sliderValue;uniform float hoverId;uniform float pressId;uniform float pressAge;uniform float selectedElement;
uniform vec4 boxes[9];uniform float radii[9];
__PARAMETERS__
float sd(vec2 p,vec2 halfSize,float r){r=min(r,min(halfSize.x,halfSize.y));vec2 q=abs(p)-halfSize+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
vec3 base(vec2 p){
 vec3 c=mix(vec3(.968,.968,.976),vec3(.055,.061,.078),page);
 if(backdrop>1.5){c=mix(c,vec3(.95,.37,.55),.72*exp(-dot((p-vec2(175.,180.))/95.,(p-vec2(175.,180.))/95.)));c=mix(c,vec3(.18,.62,.94),.7*exp(-dot((p-vec2(435.,235.))/110.,(p-vec2(435.,235.))/110.)));}
 else if(backdrop>.5){vec2 g=abs(mod(p,24.)-12.);c=mix(c,mix(vec3(.82),vec3(.18),page),.6*(1.-smoothstep(.4,1.,min(g.x,g.y))));}
 if(selectedElement<.5||abs(selectedElement-5.)<.5){float track=1.-smoothstep(-.5,.5,sd(p-vec2(144.,236.),vec2(64.,23.),23.));c=mix(c,mix(vec3(.8),toggleColor.rgb,toggleValue),track);}
 if(selectedElement<.5||abs(selectedElement-9.)<.5){float rail=1.-smoothstep(-.5,.5,sd(p-vec2(300.,336.),vec2(224.,5.5),5.5));vec3 fill=mix(sliderFrom.rgb,sliderTo.rgb,clamp((p.x-80.)/448.,0.,1.));c=mix(c,mix(vec3(.86),vec3(.2),page),rail);c=mix(c,fill,rail*(1.-smoothstep(80.+sliderValue*4.48-1.,80.+sliderValue*4.48+1.,p.x)));}
 return c;
}
vec3 spectrum(float h){h=fract(h);float v=h*6.;vec3 a=soapPaletteRed.rgb,b=soapPaletteGold.rgb;if(v>=1.&&v<2.){a=soapPaletteGold.rgb;b=soapPaletteGreen.rgb;}else if(v>=2.&&v<3.){a=soapPaletteGreen.rgb;b=soapPaletteCyan.rgb;}else if(v>=3.&&v<4.){a=soapPaletteCyan.rgb;b=soapPaletteBlue.rgb;}else if(v>=4.&&v<5.){a=soapPaletteBlue.rgb;b=soapPaletteViolet.rgb;}else if(v>=5.){a=soapPaletteViolet.rgb;b=soapPaletteRed.rgb;}return mix(a,b,fract(v));}
void main(){
 vec2 p=vec2(gl_FragCoord.x/resolution.x*600.,430.-gl_FragCoord.y/resolution.y*430.);p=(p-vec2(300.,215.))/uiScale+vec2(300.,215.)-sceneOffset;vec3 colour=base(p);vec2 mouse=(pointer-vec2(300.,215.))/uiScale+vec2(300.,215.)-sceneOffset;
 for(int i=0;i<9;i++){
  vec4 b=boxes[i];if(b.z<.1)continue;float fi=float(i)+1.;if(i==8)fi=0.;vec2 centre=b.xy+b.zw*.5,halfSize=b.zw*.5;bool active=abs(hoverId-fi)<.4,pressed=abs(pressId-fi)<.4;
  vec2 local=p-centre;float jiggle=active?wobble:0.;float swell=pressed?.055*wobble:0.;float wave=sin(time*6.+local.y*.035+seed)*exp(-abs(local.x)/200.)*.55*jiggle;
  vec2 shapeP=local/(1.+swell)+vec2(wave,wave*.6);float r=min(radii[i],min(halfSize.x,halfSize.y));float d=sd(shapeP,halfSize,r);float edge=1.-smoothstep(-.65,.65,d);if(edge<.001)continue;
  vec2 epsilon=vec2(.2,0.);vec2 normal=normalize(vec2(sd(shapeP+epsilon,halfSize,r)-sd(shapeP-epsilon,halfSize,r),sd(shapeP+epsilon.yx,halfSize,r)-sd(shapeP-epsilon.yx,halfSize,r))+vec2(.0001));
  vec2 uv=shapeP/halfSize;float inward=-d,depth=clamp(inward/max(1.,min(halfSize.x,halfSize.y)),0.,1.);float rim=exp(-inward/max(1.,mix(min(halfSize.x,halfSize.y)*.6,bevel,glass)));
  vec2 shift=(mouse-centre)/vec2(600.,430.)*tilt;vec2 bent=p+normal*refraction*(mix(22.,bevel*1.2,glass))*rim;
  vec3 ref=base(bent);if(glass>0.&&dispersion>0.)ref=vec3(base(bent+normal*dispersion*glass*1.5).r,ref.g,base(bent-normal*dispersion*glass*1.5).b);
  vec3 body=ref;float bodyAlpha=opacity;
  vec3 bodyTint=tint.rgb;if(fi==2.){bodyTint=toggleColor.rgb;bodyAlpha=max(bodyAlpha,.65);}if(fi==4.){bodyTint=mix(vec3(.83),toggleColor.rgb,toggleValue);bodyAlpha=max(bodyAlpha,.08);}
  body=mix(body,bodyTint,bodyAlpha*tint.a);
  if(fi==0.&&menuOpen>.01){body=mix(body,mix(colour,base(bent+normal*seeThroughBend*25.),clamp(seeThroughBend*.3,0.,1.)),seeThrough);}
  float env=environment;if(env<.5)env=mix(4.,1.,page);float room=(.5+.5*sin(normal.x*2.7-normal.y*3.1+shift.x));if(env<1.5)room=.25+.75*smoothstep(.2,.5,normal.x*.4-normal.y*.9+shift.x);else if(env<2.5)room=.4+.6*exp(-pow((uv.x+.3-shift.x)/.65,2.));else if(env<3.5)room=.6+.4*clamp(-normal.y+shift.y,0.,1.);float shade=(1.-room)*rim*.12*reflectivity;
  vec3 environmentShade=env<1.5?vec3(.04,.045,.055):env<2.5?vec3(.20,.23,.27):env<3.5?vec3(.22,.40,.72):vec3(.18,.18,.21);vec3 shadeC=mix(environmentShade,soapShadeColor.rgb,soapShadeColor.a);
  body=mix(body,shadeC,clamp(shade*(1.-clearCenter*(1.-rim)),0.,.6));
  vec2 v=uv/max(.2,filmScale);float swirlField=sin(v.x*7.+sin(v.y*4.+time*.23+seed)*swirl*2.4+time*.17)+cos(v.y*8.+sin(v.x*5.-time*.19)*swirl*2.);
  float film=thickness*(1.+drainage*uv.y*.4)+swirlField*100.*swirl+sin(v.y*6.+time*.3+seed)*55.;
  vec3 spectral=.5+.5*cos(12.56637*1.33*film*mix(.62,1.,depth)/vec3(650.,510.,440.));spectral=mix(spectral,spectrum(film/700.),soapPalette);
  spectral=mix(spectral,spectral*soapColor.rgb*1.5,soapColor.a);float cover=smoothstep(1.-oilCoverage-.08,1.-oilCoverage+.08,.5+.25*swirlField);
  float oil=oilOpacity*iridescence*cover*(1.-clearCenter*(1.-rim));if(b.z>100.&&oilEdge>.1)oil*=mix(1.,exp(-inward/max(1.,oilEdge/max(.1,oilEdgeFade))),min(1.,oilEdgeFade));
  body=mix(body,spectral,clamp(oil*mix(.40,.15,glass)*(.25+.75*rim),0.,.95));
  vec3 mirror=base(centre+normal*halfSize*reach);body=mix(body,mirror,clamp(mirage*.14*rim,0.,.5));
  float lightAngle=atan(normal.y,normal.x);float topBand=exp(-pow((normal.y+1.)*2.5,2.))*exp(-pow((uv.x+.2-shift.x)/max(.1,topLength*.7),2.));
  topBand*=pow(clamp(1.-uv.x*.35,0.,1.),.3+topTail)*mix(1.,(1.-smoothstep(-.8,1.,uv.x)),topFade);
  float key=keyLight*topBand*exp(-pow((inward-2.5)/mix(2.,6.,step(2.5,env)),2.))*.42;
  vec2 wp=uv-shift;float arc=exp(-pow((lightAngle+2.25)/(.45*windowLength),2.));float windowWidthAtX=.045*windowSize*windowWidth*mix(windowHead,windowTail,clamp((wp.x+.7)/1.4,0.,1.));
  float windowDistance=(wp.y+1.-windowMargin*.10+windowBend*wp.x*wp.x*.16)/max(.001,windowWidthAtX);
  float edgeWindow=exp(-pow(windowDistance,2.))*exp(-pow((wp.x+.24)/(.5*windowLength),6.));
  float window=mix(edgeWindow,arc*exp(-pow((inward-windowMargin*3.)/(2.*windowWidth*windowSize),2.)),windowStyle);
  window*=windowLight*windowIntensity*mix(1.,clamp(.7-wp.x,0.,1.),windowGradient);
  float gx=.36*windowLength+glintDistance*.20,gy=-.72+glintHeight*.15;vec2 gp=(wp-vec2(gx,gy))/max(.005,glintSize*.045*windowSize);float glint=exp(-dot(gp,gp));if(glintShape>1.5&&glintShape<2.5)glint=exp(-dot(gp/vec2(2.3,.5),gp/vec2(2.3,.5)));if(glintShape>2.5&&glintShape<3.5)glint+=exp(-dot(gp-vec2(2.5,0.),gp-vec2(2.5,0.)));if(glintShape>3.5)glint=0.;glint*=windowLight*glintIntensity;
  float twin=0.;if(windowTwin>.5){float angleWidth=.4;if(windowTwinShape>1.5&&windowTwinShape<2.5)angleWidth=.8;float a=exp(-pow((lightAngle-.7)/angleWidth,2.));float iw=windowTwinShape<.5?4.:windowTwinShape<1.5?7.:windowTwinShape<2.5?1.4:windowTwinShape<3.5?2.:4.;twin=a*exp(-pow((inward-3.)/iw,2.))*.24*windowIntensity;if(windowTwinShape>3.5)twin*=exp(-dot(uv-vec2(.65,.65),uv-vec2(.65,.65))*20.);}
  vec3 lights=mix(vec3(1.),soapHighlightColor.rgb,soapHighlightColor.a);body=mix(body,lights,clamp((key+window*.7+glint+twin)*reflectivity,0.,1.));
  float edgeLine=exp(-pow((inward-.9)/.8,2.));body=mix(body,mix(vec3(.72),vec3(.6),page),edgeLine*.20);body+=edgeLine*spectral*iridescence*oilOpacity*.08;
  if(bottomShade>.5){float bottom=exp(-pow((uv.y-.82)/.16,2.))*.14*reflectivity;body=mix(body,mix(vec3(.22),bottomShadeColor.rgb,bottomShadeColor.a),bottom);}
  colour=mix(colour,body,edge);
 }
 if(pop>.5&&pressAge>=0.&&pressAge<.7){float a=pressAge/.7;vec2 delta=p-pointer;float ring=exp(-pow((length(delta)-10.-a*45.)/1.6,2.));float theta=atan(delta.y,delta.x);float drops=ring*pow(max(0.,cos(theta*9.)),12.);float bubbles=0.;for(int j=0;j<8;j++){float angle=float(j)*.785398+seed;vec2 centre=vec2(cos(angle),sin(angle))*(10.+a*45.);bubbles+=exp(-pow((length(delta-centre)-2.-a*2.)/.7,2.));}ring=pop<1.5?drops:pop<2.5?bubbles:max(drops,bubbles);colour=mix(colour,mix(vec3(.38,.58,.91),vec3(1.),page),ring*(1.-a)*.65);}
 gl_FragColor=vec4(clamp(colour,0.,1.),1.);
}`;
