import React, { useEffect, useRef, useState } from 'react';
import { effectMasks, paintEffect } from './effects.mjs';

export default function ArtEffects({ id, paused, pulse }) {
  const canvas=useRef(null),clock=useRef(0),pulseAt=useRef(-10);
  const [masks,setMasks]=useState([]),[visible,setVisible]=useState(true),[hidden,setHidden]=useState(document.hidden);
  const names=effectMasks[id]||[];
  useEffect(()=>{
    let alive=true;
    Promise.all(names.map(async name=>{const image=new Image();image.src=`masks/${name}.png`;await image.decode();return {name,image};})).then(images=>{if(alive)setMasks(images);}).catch(()=>{if(alive)canvas.current.dataset.status='static-fallback';});
    const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:0});
    observer.observe(canvas.current);
    const visibility=()=>setHidden(document.hidden);
    document.addEventListener('visibilitychange',visibility);
    return ()=>{alive=false;observer.disconnect();document.removeEventListener('visibilitychange',visibility);};
  },[id]);
  useEffect(()=>{if(pulse)pulseAt.current=clock.current;},[pulse]);
  useEffect(()=>{
    const el=canvas.current,ctx=el.getContext('2d',{willReadFrequently:true});
    const running=!paused&&visible&&!hidden&&masks.length>0;
    el.dataset.running=String(running);
    if(!running){ctx.clearRect(0,0,el.width,el.height);el.dataset.frame=String(Number(el.dataset.frame||0)+1);return;}
    const layer=document.createElement('canvas');layer.width=el.width;layer.height=el.height;
    const draw=layer.getContext('2d',{willReadFrequently:true});
    let frame=0,last=0,painted=0;
    const step=now=>{
      if(last)clock.current+=Math.min((now-last)/1000,.05);last=now;
      if(now-painted>=32){
        painted=now;ctx.clearRect(0,0,el.width,el.height);
        for(const {name,image} of masks){
          draw.globalCompositeOperation='source-over';draw.clearRect(0,0,el.width,el.height);
          paintEffect(draw,id,name.split('-')[1],clock.current,clock.current-pulseAt.current);
          draw.globalCompositeOperation='destination-in';draw.drawImage(image,0,0,el.width,el.height);
          ctx.drawImage(layer,0,0);
        }
        el.dataset.frame=String(Number(el.dataset.frame||0)+1);
      }
      frame=requestAnimationFrame(step);
    };
    frame=requestAnimationFrame(step);
    return ()=>cancelAnimationFrame(frame);
  },[id,paused,visible,hidden,masks]);
  return <canvas ref={canvas} className="art-effects" width="1038" height="379" data-masks={names.join(',')} data-frame="0" data-running="false" aria-hidden="true" />;
}
