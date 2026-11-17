import React,{useEffect,useRef} from 'react';

function ToolIcon({name}){
  const paths={
    pause:<path d="M7 5v14M17 5v14"/>,
    play:<path d="m9 5 10 7-10 7Z"/>,
    book:<><path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z"/><path d="M6 8h2M16 8h2"/></>,
    fold:<><path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2ZM9 3v15M15 6v15"/></>,
    directory:<><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}

export default function ToolbarAction({href,icon,children,reduced=false,className='',...props}){
  const element=useRef(null),spring=useRef({x:1,v:0,target:1,frame:0,last:0});
  const reset=()=>{const s=spring.current;cancelAnimationFrame(s.frame);Object.assign(s,{x:1,v:0,target:1,frame:0,last:0});element.current?.style.setProperty('--tool-scale','1');if(element.current){element.current.dataset.pressed='false';element.current.dataset.motion='idle';}};
  useEffect(()=>{if(reduced)reset();return()=>cancelAnimationFrame(spring.current.frame);},[reduced]);
  const press=down=>{
    const el=element.current,s=spring.current;
    if(props.disabled||!el)return;
    el.dataset.pressed=String(down);
    if(reduced)return;
    s.target=down ? .96 : 1;
    if(s.frame)return;
    const tick=now=>{
      // Critical damping: retain both presentation value and velocity on re-target.
      const dt=s.last?Math.min((now-s.last)/1000,.05):1/60,w=24,d=s.x-s.target,b=s.v+w*d,decay=Math.exp(-w*dt);
      s.last=now;s.x=s.target+(d+b*dt)*decay;s.v=(s.v-w*b*dt)*decay;
      el.style.setProperty('--tool-scale',s.x.toFixed(5));
      if(Math.abs(s.x-s.target)<.0001&&Math.abs(s.v)<.001){s.x=s.target;s.v=0;s.frame=0;s.last=0;el.style.setProperty('--tool-scale',String(s.target));el.dataset.motion='idle';}
      else{s.frame=requestAnimationFrame(tick);el.dataset.motion='spring';}
    };
    s.frame=requestAnimationFrame(tick);
  };
  const Tag=href?'a':'button';
  return <Tag ref={element} href={href} type={href?undefined:'button'} {...props} className={`v3-tool ${className}`} data-motion="idle" onPointerDown={e=>{if(e.isPrimary&&e.button===0)press(true);}} onPointerUp={()=>press(false)} onPointerCancel={()=>press(false)} onPointerLeave={()=>press(false)} onPointerEnter={e=>{if(e.isPrimary&&e.buttons===1)press(true);}} onKeyDown={e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat)press(true);}} onKeyUp={e=>{if(e.key===' '||e.key==='Enter')press(false);}} onBlur={()=>press(false)}><ToolIcon name={icon}/><span>{children}</span></Tag>;
}
