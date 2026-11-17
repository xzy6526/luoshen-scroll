import React, { useEffect, useRef } from 'react';
import './fold-opening.css';

const clamp=value=>Math.max(0,Math.min(1,value));
const ease=value=>{const t=clamp(value);return t*t*(3-2*t);};
const range=(p,a,b)=>ease((p-a)/(b-a));

function FoldSheet({src,alt,kind,width,height}) {
  return <figure className={`fold-sheet fold-sheet--${kind}`} data-kind={kind}>
    <div className="fold-card">
      <img className="fold-original" src={src} alt={alt} width={width} height={height} draggable="false" fetchPriority={kind==='cover'?'high':'auto'}/>
      <div className="fold-halves" aria-hidden="true">
        <div className="fold-half fold-half--left"><img src={src} alt="" draggable="false"/><span/></div>
        <div className="fold-half fold-half--right"><img src={src} alt="" draggable="false"/><span/></div>
      </div>
    </div>
  </figure>;
}

export default function FoldOpening({reduced=false}) {
  const root=useRef(null);
  useEffect(()=>{
    const el=root.current,stage=el.querySelector('.fold-stage');
    const cover=el.querySelector('[data-kind=cover]'),scene=el.querySelector('[data-kind=scene]');
    let frame=0,current=0,last=0,active=false;
    const measure=()=>clamp(-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight)/.9);
    const paint=p=>{
      const close=range(p,.02,.53),open=range(p,.37,.97);
      el.dataset.progress=p.toFixed(4);
      for(const [node,angle,opacity] of [[cover,close*87,1-range(p,.45,.62)],[scene,(1-open)*84,range(p,.35,.56)]]) {
        node.style.setProperty('--fold-angle',`${reduced?0:angle}deg`);
        node.style.setProperty('--fold-shade',String(Math.sin(angle*Math.PI/180)*.24));
        node.style.opacity=String(opacity);
        node.dataset.flat=String(reduced||angle<.02);
        node.setAttribute('aria-hidden',String(opacity<.02));
      }
      if(reduced){cover.style.opacity=p<1?'1':'0';scene.style.opacity=p<1?'0':'1';}
    };
    const draw=now=>{
      frame=0;
      const target=measure(),dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
      current=reduced?target:current+(target-current)*(1-Math.exp(-dt*11));
      if(Math.abs(target-current)<.0002)current=target;
      paint(reduced?(current>=1?1:0):current);
      if(Math.abs(target-current)>.0002)frame=requestAnimationFrame(draw);else active=false;
    };
    const wake=()=>{if(!active){active=true;last=0;frame=requestAnimationFrame(draw);}};
    const resize=()=>{
      const r=stage.getBoundingClientRect();
      stage.style.setProperty('--cover-width',`${Math.min(r.width,r.height*1672/941)}px`);
      stage.style.setProperty('--scene-width',`${Math.min(r.width,r.height*2076/758)}px`);
      wake();
    };
    const observer=new ResizeObserver(resize);observer.observe(stage);
    current=measure();paint(reduced?(current>=1?1:0):current);resize();
    window.addEventListener('scroll',wake,{passive:true});window.addEventListener('resize',resize);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',wake);window.removeEventListener('resize',resize);};
  },[reduced]);
  return <section ref={root} className="fold-opening" aria-label="沿中线折叠展开画册">
    <div className="fold-pin"><div className="fold-stage">
      <FoldSheet kind="scene" src="art/01.webp" alt="洛水夕阳与江畔车马，第一景行旅初起" width="2076" height="758"/>
      <FoldSheet kind="cover" src="art/cover.webp" alt="金色书法洛神赋，青绿飘带、山水与月色" width="1672" height="941"/>
    </div></div>
  </section>;
}
