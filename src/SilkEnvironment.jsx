import React, { useEffect, useRef } from 'react';

export default function SilkEnvironment({ src, paused, scene }) {
  const root=useRef(null);
  useEffect(()=>{
    const el=root.current;
    const move=event=>{
      if(paused||event.pointerType!=='mouse')return;
      el.style.setProperty('--light-x',`${42+event.clientX/innerWidth*16}%`);
      el.style.setProperty('--light-y',`${22+event.clientY/innerHeight*12}%`);
    };
    window.addEventListener('pointermove',move,{passive:true});
    return()=>window.removeEventListener('pointermove',move);
  },[paused]);
  return <div ref={root} className="silk-environment" aria-hidden="true" data-paused={paused}>
    <div key={src} className="environment-wash" style={{backgroundImage:`url("${src}")`}} />
    <div className="environment-light" />
    <div className="environment-texture" />
    <div key={scene} className="environment-mist"><img src="materials/original-mist.webp" alt="" /></div>
  </div>;
}

export function MistTransition({ state, reduced }) {
  return <div key={state.serial} className={`mist-transition ${state.serial&&!reduced?'is-crossing':''}`} aria-hidden="true" data-transition={state.serial}>
    <div style={{backgroundColor:state.color}} />
  </div>;
}
