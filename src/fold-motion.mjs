// The paper moves only during arrival. UVs and the final plane remain unchanged.
export const sceneFolds = [
  {key:'double-gate',label:'双扉对开',kind:1,duration:1.5},
  {key:'mountain-screen',label:'山屏六折',kind:2,duration:1.65},
  {key:'heaven-earth',label:'天地对折',kind:3,duration:1.45},
  {key:'flower-letter',label:'花笺四角',kind:4,duration:1.8},
  {key:'diagonal-leaf',label:'斜笺揭页',kind:5,duration:1.6},
  {key:'letter-thirds',label:'信札三叠',kind:6,duration:1.7},
  {key:'ripple-screen',label:'连屏递展',kind:7,duration:1.75},
  {key:'water-pleat',label:'水纹柔折',kind:8,duration:1.55},
  {key:'cross-gate',label:'十字开合',kind:9,duration:1.8},
  {key:'return-leaf',label:'右页回翻',kind:10,duration:1.65},
  {key:'river-scroll',label:'横卷舒展',kind:11,duration:1.85},
  {key:'moon-curtain',label:'垂帘卷启',kind:12,duration:1.9},
  {key:'stepped-screen',label:'阶屏错展',kind:13,duration:1.7},
  {key:'diamond-letter',label:'菱笺归展',kind:14,duration:1.9},
];

const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const hinge=(x,y,px,py,ax,ay,a)=>{
  const qx=x-px,qy=y-py,dot=qx*ax+qy*ay,c=Math.cos(a),s=Math.sin(a);
  return [px+qx*c+ax*dot*(1-c),py+qy*c+ay*dot*(1-c),(ax*qy-ay*qx)*s];
};

function screen(x,width,n,progress,mode=0) {
  const s=x+width/2,length=width/n;
  let projected=0,px=0,pz=0;
  for(let i=0;i<n;i++){
    const delay=mode===1?i*.045:0;
    const a=(1-ease((progress-delay)/(1-delay)))*1.25;
    const angle=mode===2?-a*(.25+i/n):a*(i%2?1:-1);
    const used=Math.max(0,Math.min(length,s-i*length));
    px+=used*Math.cos(angle);pz+=used*Math.sin(angle);projected+=length*Math.cos(angle);
  }
  return [px-projected/2,-Math.abs(pz)];
}

export function foldPoint(kind,u,v,progress,aspect) {
  const x=(u-.5)*aspect,y=v-.5;
  if(progress>=1)return [x,y,0];
  const amount=1-ease(progress),a=amount*1.3,c=Math.cos(a),s=Math.sin(a);
  switch(kind){
    case 1:return [x*c,y,-Math.abs(x)*s];
    case 2:{const [px,z]=screen(x,aspect,6,progress);return [px,y,z];}
    case 3:return [x,y*c,-Math.abs(y)*s];
    case 4:{
      const nx=Math.sign(x)/aspect,ny=Math.sign(y),distance=x*nx+y*ny-.68;
      if(distance<=0)return [x,y,0];
      const norm=Math.hypot(nx,ny),offset=.68/(nx*nx+ny*ny);
      return hinge(x,y,nx*offset,ny*offset,ny/norm,-nx/norm,-a);
    }
    case 5:return x/aspect+y>0?hinge(x,y,0,0,aspect/Math.hypot(aspect,1),-1/Math.hypot(aspect,1),-a):[x,y,0];
    case 6:{
      if(x<-aspect/6)return hinge(x,y,-aspect/6,0,0,1,-1.9*(1-ease(progress)));
      if(x>aspect/6)return hinge(x,y,aspect/6,0,0,1,1.9*(1-ease((progress-.12)/.88)));
      return [x,y,0];
    }
    case 7:{const [px,z]=screen(-x,aspect,8,progress,1);return [-px,y,z];}
    case 8:return [x*Math.cos(a*.55),y,-amount*.22*(1-Math.cos(u*Math.PI*4))];
    case 9:{const b=(1-ease((progress-.12)/.88))*.95;return [x*c,y*Math.cos(b),-Math.abs(x)*s-Math.abs(y)*Math.sin(b)];}
    case 10:return hinge(x,y,aspect/2,0,0,1,-a);
    case 11:{const k=amount*4.5/aspect,d=u*aspect;return [-aspect/2+Math.sin(k*d)/k,y,-(1-Math.cos(k*d))/k];}
    case 12:{const k=amount*4.1,d=1-v;return [x,.5-Math.sin(k*d)/k,-(1-Math.cos(k*d))/k];}
    case 13:{const [px,z]=screen(x,aspect,4,progress,2);return [px,y,z];}
    case 14:{
      const qx=(x+y)/Math.SQRT2,qy=(y-x)/Math.SQRT2,b=a*.7;
      return [(qx*c-qy*Math.cos(b))/Math.SQRT2,(qx*c+qy*Math.cos(b))/Math.SQRT2,-Math.abs(qx)*s-Math.abs(qy)*Math.sin(b)];
    }
    default:return [x,y,0];
  }
}

export function applyFold(geometry,kind,progress,aspect) {
  const points=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<points.count;i++){
    const [x,y,z]=foldPoint(kind,uv.getX(i),uv.getY(i),progress,aspect);
    points.setXYZ(i,x*1.11,y*1.11,z*1.11);
  }
  points.needsUpdate=true;
}
