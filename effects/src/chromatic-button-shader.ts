/** Independently authored rounded-surface chromatic reflection field. */
export const chromaticButtonFragment=`precision highp float;
uniform vec2 resolution;uniform vec4 boxes[3];uniform float count,time,phase,seed,radius,feather,projection,intensity,grain,colorMode,hover,hoverMode,hoverId;uniform vec2 pointer;uniform vec3 color,color2,color3;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 hue(float h){return clamp(abs(fract(h+vec3(0.,.666667,.333333))*6.-3.)-1.,0.,1.);}
float rgbHue(vec3 c){float hi=max(c.r,max(c.g,c.b)),lo=min(c.r,min(c.g,c.b)),d=hi-lo;if(d<.0001)return 0.;float h=c.r==hi?(c.g-c.b)/d:c.g==hi?2.+(c.b-c.r)/d:4.+(c.r-c.g)/d;return fract(h/6.+1.);}
void main(){vec2 pos=gl_FragCoord.xy/resolution*vec2(520.,260.);pos.y=260.-pos.y;vec4 outColor=vec4(0.);
for(int i=0;i<3;i++){if(float(i)>=count)break;vec4 box=boxes[i];vec2 p=pos-box.xy-box.zw*.5,b=box.zw*.5;float r=min(b.x,b.y)*radius/50.;vec2 q=abs(p)-b+vec2(r);float sd=length(max(q,0.))+min(max(q.x,q.y),0.)-r;float alpha=1.-smoothstep(-.7,.7,sd);if(alpha<.001)continue;
vec2 uv=p/b;float z=sqrt(max(.02,1.-dot(uv*.68,uv*.68)));float h=hover*(1.-step(.1,abs(float(i)-hoverId)));float angle=mix(projection-.7,projection,smoothstep(-min(b.x,b.y)*.08,0.,sd))*.017453293;vec2 projected=uv/(z+.08)*mix(.5,2.5,(angle-1.5707963)/1.5620697);float t=(time+phase*.13)+seed*.73;float moving=t+h*float(hoverMode==2.)*.7;
float field=sin(projected.x*1.6+moving*.6)+cos(projected.y*1.7-moving*.4)+.55*sin(projected.x*1.1+projected.y*2.2+seed*1.37);field=field/2.55;
float cycle=fract((time+phase*.13)*.055);vec3 base=color;
if(colorMode==1.){float f=.5-.5*cos(cycle*6.2831853);base=mix(color,color2,f);}else if(colorMode==2.){float k=cycle*3.;base=k<1.?mix(color,color2,smoothstep(0.,1.,k)):k<2.?mix(color2,color3,smoothstep(0.,1.,k-1.)):mix(color3,color,smoothstep(0.,1.,k-2.));}
if(colorMode==3.)base=hue(rgbHue(color)+field*.08+moving*.055);
float f=feather/100.;float bands=sin(projected.x*2.+projected.y*1.7-moving*.9+field*2.);float edge=max(0.,1.+sd/min(b.x,b.y));float reflection=mix(step(.45,bands),smoothstep(-.6,1.,bands),f);
float light=.53+.33*reflection+.13*z;vec3 col=base*light;
float rim=pow(edge,8.);vec3 rimColor=colorMode==3.?hue(rgbHue(color)+moving*.055+atan(p.y,p.x)/6.28318):base;col=mix(col,rimColor*.66,rim*.8);
float strip=exp(-pow((uv.y+.66+.25*sin(uv.x*2.+moving*.3))/.12,2.))*(.35+.65*reflection);float shine=.20*strip+.22*pow(max(0.,edge),26.);col+=vec3(shine)*mix(.3,1.,f);
if(hoverMode==3.&&h>0.){vec2 local=(pos-pointer)/box.zw;col+=h*.25*exp(-dot(local,local)*16.);}
col*=intensity/1.4;if(hoverMode==1.)col*=1.+h*.22;
col+=(hash(floor(gl_FragCoord.xy)+seed)-.5)*grain*.58;outColor=vec4(clamp(col,0.,1.),alpha);}
gl_FragColor=outColor;}`;
