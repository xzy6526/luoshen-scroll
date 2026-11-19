import React,{useEffect,useRef,useState} from 'react';
import {chapters,preface} from '../content.mjs';
import ToolbarAction from './ToolbarAction.jsx';
import './dynasty-ending.css';
import {previewFor} from './Painting.jsx';

const fullText=preface+chapters.flatMap(c=>c.paragraphs).join('');
const characters=[...new Set(fullText)];
const atlasColumns=Math.ceil(Math.sqrt(characters.length));
const roofs=[
  {id:'ink',label:'淡墨飞檐',width:101.306,left:-.653,bottom:66.575},
  {id:'silk',label:'青灰绢绘',width:101.07,left:-.605,bottom:66.299},
  {id:'mist',label:'薄雾檐影',width:101.924,left:-.892,bottom:69.613},
];

function CharacterCurtain({paused,reduced,visible,roof}){
  const canvas=useRef(null),stage=useRef(null),control=useRef(null),pausedRef=useRef(paused);
  useEffect(()=>{pausedRef.current=paused;if(paused)control.current?.stop();else control.current?.wake();},[paused]);
  useEffect(()=>{
    if(!visible)return;
    const el=canvas.current,box=stage.current,ctx=el.getContext('2d');
    if(!ctx)return;
    const atlas=document.createElement('canvas'),glyphContext=atlas.getContext('2d'),glyphs=new Map();
    let points=[],links=[],cell=0,width=0,height=0,dpr=1,size=12,frame=0,last=0,lastInput=0,draws=0,grab=null,pointer=null,onscreen=true;
    const draw=()=>{
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      let maxDistanceSq=0;
      for(const p of points){
        const next=points[p.next],angle=next?Math.atan2(next.y-p.y,next.x-p.x)-Math.PI/2:0;
        ctx.setTransform(dpr*Math.cos(angle),dpr*Math.sin(angle),-dpr*Math.sin(angle),dpr*Math.cos(angle),p.x*dpr,p.y*dpr);
        ctx.drawImage(atlas,p.glyph.x,p.glyph.y,cell,cell,-size*.8,-size*.8,size*1.6,size*1.6);
        maxDistanceSq=Math.max(maxDistanceSq,(p.x-p.homeX)**2+(p.y-p.homeY)**2);
      }
      el.dataset.frame=String(++draws);
      el.dataset.displacement=Math.sqrt(maxDistanceSq).toFixed(2);
    };
    const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;el.dataset.motion='idle';};
    const wake=()=>{
      if(reduced||pausedRef.current||document.hidden||!onscreen)return;
      lastInput=performance.now();if(!frame)frame=requestAnimationFrame(tick);
    };
    const release=()=>{if(grab){grab.point.pinned=false;grab=null;}pointer=null;lastInput=performance.now();el.dataset.grabbed='false';};
    const tick=now=>{
      frame=0;
      if(pausedRef.current||reduced||document.hidden||!onscreen){stop();return;}
      const dt=last?Math.min((now-last)/1000,.04):1/60,w=20,decay=Math.exp(-w*dt);last=now;
      let movement=0;
      for(const p of points){
        if(p.pinned)continue;
        const x=p.x-p.homeX,y=p.y-p.homeY,bx=p.vx+w*x,by=p.vy+w*y;
        p.x=p.homeX+(x+bx*dt)*decay;p.y=p.homeY+(y+by*dt)*decay;
        p.vx=(p.vx-w*bx*dt)*decay;p.vy=(p.vy-w*by*dt)*decay;
        movement=Math.max(movement,Math.abs(x)+Math.abs(y));
      }
      for(let j=0;j<5;j++)for(const [a,b,length] of links){
        const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||.001,force=(dist-length)/dist;
        const share=a.pinned||b.pinned?1:.5;
        if(!a.pinned){a.x+=dx*force*share;a.y+=dy*force*share;}
        if(!b.pinned){b.x-=dx*force*share;b.y-=dy*force*share;}
      }
      for(const p of points){p.x=Math.max(4,Math.min(width-4,p.x));p.y=Math.max(0,Math.min(height-4,p.y));}
      draw();el.dataset.motion='moving';
      if(grab||now-lastInput<80||movement>.06&&now-lastInput<1200)frame=requestAnimationFrame(tick);else stop();
    };
    const resize=()=>{
      const nextWidth=box.clientWidth,nextDpr=Math.min(devicePixelRatio||1,2);
      if(!nextWidth||(width===nextWidth&&dpr===nextDpr))return;
      stop();release();width=nextWidth;dpr=nextDpr;
      size=width<420?17:width<700?19:21;
      const columns=Math.max(9,Math.floor(width*.84/(size*1.28))),rows=Math.ceil(fullText.length/columns),area=width*.84,dx=area/(columns-1),eave=width*.16,top=eave+size*.75,dy=size*1.25;
      height=Math.ceil(top+(rows-1)*dy+size*2);box.style.height=`${height}px`;box.style.setProperty('--roof-baseline',`${eave}px`);
      el.width=Math.round(width*dpr);el.height=Math.round(height*dpr);
      points=[];links=[];el.dataset.fontSize=String(size);
      cell=Math.ceil(size*1.6*dpr);atlas.width=atlasColumns*cell;atlas.height=Math.ceil(characters.length/atlasColumns)*cell;
      glyphContext.font=`500 ${size*dpr}px KaiTi, STKaiti, SimSun, serif`;glyphContext.fillStyle='#354d49';
      glyphContext.textAlign='center';glyphContext.textBaseline='middle';
      characters.forEach((char,index)=>{
        const x=index%atlasColumns*cell,y=Math.floor(index/atlasColumns)*cell;
        glyphContext.fillText(char,x+cell/2,y+cell/2);glyphs.set(char,{x,y});
      });
      for(let col=0;col<columns;col++)for(let row=0;row<rows;row++){
        const char=fullText[col*rows+row];if(!char)continue;
        const x=(width+area)/2-col*dx,y=top+row*dy;
        points.push({glyph:glyphs.get(char),x,y,homeX:x,homeY:y,vx:0,vy:0,pinned:row===0,next:row<rows-1&&col*rows+row+1<fullText.length?points.length+1:null});
        if(row)links.push([points[points.length-2],points[points.length-1],dy]);
      }
      el.dataset.characters=String(points.length);draw();
    };
    const position=e=>{const r=el.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
    const move=e=>{
      if(pausedRef.current||reduced)return;
      const at=position(e);
      if(grab){grab.point.x=at.x+grab.dx;grab.point.y=at.y+grab.dy;grab.point.vx=grab.point.vy=0;}
      else for(const p of points){
        if(p.pinned)continue;
        const dx=p.x-at.x,dy=p.y-at.y,d=Math.hypot(dx,dy);
        if(d<62){const f=(1-d/62)**2;p.x+=(Math.sign(dx||1)*3+Math.max(-8,Math.min(8,at.x-(pointer?.x??at.x)))*.35)*f;p.y+=dy/(d||1)*1.6*f;}
      }
      pointer=at;wake();
    };
    const down=e=>{
      if(pausedRef.current||reduced||!e.isPrimary||e.button!==0)return;
      const at=position(e);let nearest=null,distance=20;
      for(const p of points){const d=Math.hypot(p.x-at.x,p.y-at.y);if(!p.pinned&&d<distance){nearest=p;distance=d;}}
      if(nearest){grab={point:nearest,dx:nearest.x-at.x,dy:nearest.y-at.y};nearest.pinned=true;el.dataset.grabbed='true';el.setPointerCapture(e.pointerId);wake();}
    };
    const visibility=()=>{release();if(document.hidden)stop();else wake();};
    const leave=()=>{pointer=null;};
    const observer=new ResizeObserver(resize);observer.observe(box);
    const intersection=new IntersectionObserver(entries=>{onscreen=entries[0].isIntersecting;if(!onscreen){release();stop();}else wake();});intersection.observe(box);
    el.addEventListener('pointermove',move);el.addEventListener('pointerdown',down);el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);el.addEventListener('pointerleave',leave);
    document.addEventListener('visibilitychange',visibility);control.current={stop,wake};resize();
    return()=>{stop();release();observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);el.removeEventListener('pointermove',move);el.removeEventListener('pointerdown',down);el.removeEventListener('pointerup',release);el.removeEventListener('pointercancel',release);el.removeEventListener('lostpointercapture',release);el.removeEventListener('pointerleave',leave);control.current=null;};
  },[reduced,visible]);
  const roofFile=`roof-${roof.id}.webp`;
  return <div ref={stage} className="dynasty-stage"><img key={roof.id} className="dynasty-roof" width="2172" height="724" src={`dynasty/${roofFile}`} style={{backgroundImage:`url(${previewFor(roofFile)})`,backgroundSize:'100% 100%',width:`${roof.width}%`,left:`${roof.left}%`,transform:`translateY(-${roof.bottom}%)`}} alt="" draggable="false" onLoad={e=>{e.currentTarget.style.backgroundImage='none';}} onError={e=>{e.currentTarget.src=previewFor(roofFile);}}/><canvas ref={canvas} className="dynasty-canvas" aria-hidden="true"/></div>;
}

export default function DynastyEnding({paused,reduced}){
  const [mode,setMode]=useState(()=>reduced||matchMedia('(max-width:600px)').matches?'reading':'interactive');
  const [roof,setRoof]=useState(roofs[0]);
  const article=useRef(null);
  useEffect(()=>{if(reduced)setMode('reading');},[reduced]);
  const changeMode=value=>{setMode(value);if(value==='reading')requestAnimationFrame(()=>article.current?.focus({preventScroll:true}));};
  return <main className="dynasty-ending" data-mode={mode}>
    <div className="dynasty-landscape" aria-hidden="true"><div className="dynasty-distant-mountains"/><div className="dynasty-water-wash"/><svg viewBox="0 0 1440 1000" preserveAspectRatio="none"><g fill="none" stroke="currentColor" strokeWidth=".8"><path d="M-80 792 C110 752 186 824 415 788 S775 794 988 783 S1250 817 1510 770 M-80 814 C120 779 208 844 419 811 S775 815 991 806 S1262 839 1510 792 M120 851 Q320 823 538 850 T988 841 M664 889 Q877 862 1115 886 T1510 857"/><path d="M38 893 Q72 830 49 776 M49 860 Q9 827 0 817 M56 838 Q94 808 100 792 M1391 885 Q1363 826 1384 769 M1379 850 Q1420 812 1440 810"/></g></svg></div>
    <div className="dynasty-topline"><p>卷后 · 墨与洛水</p><div className="dynasty-mode" role="group" aria-label="全文呈现方式"><ToolbarAction reduced={reduced} icon="fold" aria-pressed={mode==='interactive'} onClick={()=>changeMode('interactive')}>檐下拨墨</ToolbarAction><ToolbarAction id="dynasty-read-button" reduced={reduced} icon="book" aria-pressed={mode==='reading'} onClick={()=>changeMode('reading')}>静读全文</ToolbarAction></div><span>一赋千年 · 余韵未歇</span></div>
    <div className="dynasty-composition">
      <aside className="dynasty-title-block"><span className="dynasty-kicker">黄初三年 · 洛川</span><h1 className="dynasty-page-title" tabIndex="-1">洛神赋</h1><div className="dynasty-title-verse"><p>翩若惊鸿</p><p>婉若游龙</p></div><span className="dynasty-author-seal">曹<br/>植</span></aside>
      <div className="dynasty-center">
        <div hidden={mode!=='interactive'}><div className="dynasty-roof-options" role="group" aria-label="檐影风格"><span>檐影</span>{roofs.map(r=><button key={r.id} aria-pressed={roof.id===r.id} onClick={()=>setRoof(r)}>{r.label}</button>)}<small>向下纵读全文</small></div><CharacterCurtain paused={paused} reduced={reduced} visible={mode==='interactive'} roof={roof}/><p className="dynasty-interaction-hint">{reduced||paused?'静观 · 字落如初':'移近轻拂，按住可拨动字帘'}<span>序文与全文 · 自右向左纵读</span></p></div>
        <article ref={article} id="dynasty-reading" className="dynasty-reading" hidden={mode!=='reading'} tabIndex="-1" aria-label="曹植洛神赋完整原文"><header><span>魏 · 曹植</span><h2>洛神赋</h2><p>序文与正文</p></header><p className="dynasty-preface" data-dynasty-preface>{preface}</p><div data-dynasty-original>{chapters.map(c=><section key={c.id}>{c.paragraphs.map(p=><p key={p}>{p}</p>)}</section>)}</div><div className="dynasty-reading-end"><span>赋终</span></div></article>
      </div>
      <aside className="dynasty-colophon"><span className="dynasty-colophon-index">终章 / 全文</span><p>一水相隔，<br/>一念千年。</p><span className="dynasty-colophon-rule"/><p className="dynasty-colophon-quote">揽騑辔以抗策，<br/>怅盘桓而不能去。</p><span className="dynasty-side-note">画卷至此收起<br/>文字仍在水上</span></aside>
    </div>
  </main>;
}
