import React,{useEffect,useRef,useState} from 'react';
import { chapters,preface } from '../content.mjs';
import { demoScenes,sampleIds,sceneFor,atlasPosition } from './scene-config.mjs';
import ScrollArtwork from './ScrollArtwork.jsx';
import Painting,{previewFor} from './Painting.jsx';
import ToolbarAction from './ToolbarAction.jsx';
import DynastyEnding from './DynastyEnding.jsx';
import './scroll-demo.css';

const numerals=['','一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四'];
const readPage=()=>{if(location.hash==='#full-text')return 15;const n=Number(location.hash.match(/scene-(\d+)/)?.[1]);return sampleIds.includes(n)?n:0;};
function useReduced(){const [value,set]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),f=()=>set(q.matches);q.addEventListener('change',f);return()=>q.removeEventListener('change',f);},[]);return value;}

function Environment({scene,still}){
  const elements=scene?.elements||[];
  return <div className="v3-environment" aria-hidden="true" data-still={still} style={{'--atlas-position':atlasPosition(scene?.atlas??5)}}>
    <div className="v3-environment-base"/><div className="v3-environment-accent"/>
    <div className="v3-environment-light"/><div className="v3-environment-grain"/>
    {scene?<div className={`v3-scene-atmosphere v3-scene-atmosphere--${scene.id}`}><div className="v3-landscape-detail"/>{elements.includes('willow')?<div className="v3-willow-detail"/>:null}{elements.includes('water')?<div className="v3-water-rings"><i/><i/><i/></div>:null}{elements.includes('cloud')?<div className="v3-cloud-veil"/>:null}{elements.includes('dawn')?<div className="v3-dawn-wash"/>:null}{scene.id===12?<><div className="v3-moon-halo"/><div className="v3-dawn-wash"/><div className="v3-distant-lights"><i/><i/><i/></div></>:null}<svg className="v3-landscape-traces" viewBox="0 0 1440 1000" preserveAspectRatio="none"><path d={scene.id===2?'M-60 830 Q180 690 390 770 T710 774 M-60 849 Q190 718 392 792 T685 795':scene.id===14?'M-80 760 C260 710 340 835 700 792 S1160 710 1490 752 M-80 785 C260 737 330 854 710 817 S1170 737 1490 774':'M-60 865 Q200 809 420 854 T870 850 T1490 810 M-60 884 Q200 831 420 876 T870 873 T1490 832'}/></svg></div>:null}
    {!scene?<><div className="v3-opening-glow"/><svg className="v3-opening-traces" viewBox="0 0 1440 1000" preserveAspectRatio="none"><g className="v3-cloud-traces"><path d="M-30 205 C65 162 108 208 158 181 S235 165 277 178 M-30 216 C60 185 105 223 160 194 S230 179 263 186 M1180 184 C1234 162 1262 201 1313 177 S1391 162 1470 188 M1205 195 C1252 180 1263 214 1324 190 S1409 180 1470 201"/></g><g className="v3-river-traces"><path d="M-60 797 C130 734 231 829 410 784 S662 788 739 804 M-60 812 C122 759 226 848 411 801 S608 804 688 817 M-60 835 C117 786 244 861 386 827 M1015 848 C1118 808 1261 865 1480 790 M1051 861 C1186 826 1270 880 1480 810 M1120 875 C1236 857 1335 871 1480 835"/></g></svg></>:null}
    {scene?.id===8?<svg className="v3-water" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M80 60 Q250 50 420 61 T760 60 T1120 62 M180 85 Q390 78 600 84 T1010 86 M340 35 Q550 28 790 37"/></svg>:null}
  </div>;
}

function ReadingPane({chapter,design,onReading,onPhase,onReplay,onFullText,onView}){
  const [tab,setTab]=useState('original'),[beat,setBeat]=useState(0);
  const text=useRef(null);
  const stops=['伊阙','轘辕','通谷','景山'],passages=design.passages;
  const [riverView,setRiverView]=useState(50);
  const originalText=p=>{
    if(chapter.id===2)return p.split(/(伊阙|轘辕|通谷|景山)/).map((part,j)=>stops.includes(part)?<mark key={j} className="v3-route-word" data-active={part===stops[beat]}>{part}</mark>:part);
    if(design.beats){const phrase=design.beats[beat].phrase,index=p.indexOf(phrase);return index<0?p:<>{p.slice(0,index)}<mark className="v3-route-word" data-active="true">{phrase}</mark>{p.slice(index+phrase.length)}</>;}
    if([1,12,13,14].includes(chapter.id))return p.split('，').map((part,j)=><span key={j} className="v3-verse-line" data-active={chapter.id===12?beat===j:undefined}>{part}{j===0?'，':''}</span>);
    return p;
  };
  const goToPassage=index=>{setBeat(index);const target=text.current?.querySelectorAll('section')[index];target?.focus({preventScroll:true});target?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
  useEffect(()=>{
    if(!text.current)return;
    const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('v3-line-visible');observer.unobserve(e.target);}},{threshold:.05});
    text.current.querySelectorAll('p').forEach(p=>observer.observe(p));return()=>observer.disconnect();
  },[]);
  const tabs=[['original','原文'],['notes','译意与简注'],['meaning','赏析']];
  return <aside className="v3-reading" onPointerEnter={()=>onReading(true)} onPointerLeave={e=>onReading(e.currentTarget.contains(document.activeElement))} onFocusCapture={()=>onReading(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget)&&!e.currentTarget.matches(':hover'))onReading(false);}}>
    <div className="v3-reading-head"><div className="v3-chapter-number">第{numerals[chapter.id]}景 <span>／ 十四景</span></div>
    <h1 className="v3-chapter-title" tabIndex="-1">{chapter.title}</h1>
    <p className="v3-author">曹植 ·《洛神赋》</p>
    <div className="v3-reading-tabs" role="tablist" aria-label="阅读内容" onKeyDown={e=>{
      const index=tabs.findIndex(([key])=>key===tab);let next;
      if(e.key==='ArrowRight')next=(index+1)%3;if(e.key==='ArrowLeft')next=(index+2)%3;if(e.key==='Home')next=0;if(e.key==='End')next=2;
      if(next!==undefined){e.preventDefault();setTab(tabs[next][0]);e.currentTarget.querySelectorAll('button')[next].focus();}
    }}>{tabs.map(([key,label])=><button key={key} type="button" id={`v3-tab-${key}`} role="tab" tabIndex={tab===key?0:-1} aria-selected={tab===key} aria-controls={`v3-panel-${key}`} onClick={()=>setTab(key)}>{label}</button>)}</div></div>
    <div id="v3-panel-original" role="tabpanel" aria-labelledby="v3-tab-original" hidden={tab!=='original'}>
      {chapter.id===2?<nav className="v3-journey-stops" aria-label="循行旅读原文">{stops.map((stop,i)=><button key={stop} aria-pressed={beat===i} onClick={()=>setBeat(i)}><i aria-hidden="true"/>{stop}</button>)}</nav>:null}
      {passages?<nav className="v3-passage-jumps" aria-label={`${chapter.title}分段阅读`}>{passages.map((label,i)=><button key={label} aria-current={beat===i?'step':undefined} onClick={()=>goToPassage(i)}>{label}</button>)}</nav>:null}
      {design.beats?<nav className="v3-reading-beats" aria-label={`${chapter.title}循句阅读`}>{design.beats.map((item,i)=><button key={item.label} aria-pressed={beat===i} onClick={()=>setBeat(i)}>{item.label}</button>)}</nav>:null}
      {chapter.id===12?<div className="v3-night-sequence" role="group" aria-label="长夜到天明"><button aria-pressed={beat===0} onClick={()=>{setBeat(0);onPhase('night');}}>长夜未央</button><span aria-hidden="true"/><button aria-pressed={beat===1} onClick={()=>{setBeat(1);onPhase('dawn');}}>霜至天明</button></div>:null}
      {chapter.id===11?<div className="v3-river-explore"><label htmlFor="v3-river-view">循川望远</label><input id="v3-river-view" type="range" min="25" max="75" value={riverView} onChange={e=>{const value=Number(e.target.value);setRiverView(value);onView({zoom:1.18,x:value/100,y:.5});}}/><button onClick={()=>{setRiverView(50);onView(undefined);}}>回到全卷</button></div>:null}
      <div ref={text} className={`v3-original-copy ${passages?'v3-reading-long':''}`} data-original-scene={chapter.id}>
        {chapter.paragraphs.map((p,i)=>passages?<section key={p} tabIndex="-1" className={`v3-passage v3-passage--${i}`} data-active={beat===i}><h2><span>{String(i+1).padStart(2,'0')}</span>{passages[i]}</h2><p>{p}</p></section>:<p key={p} data-caption={chapter.id===8?(i===0?'步履':'神情'):undefined} style={{'--line-order':i}}>{originalText(p)}</p>)}
      </div>
      {chapter.id===14?<div className="v3-ending-coda"><p className="v3-ending-aside"><span>编者旁白</span>卷尽，情未尽。远影留在回望里。</p><button className="v3-fulltext-enter" onClick={onFullText}>读《洛神赋》全文 <span aria-hidden="true">→</span></button><button onClick={onReplay}>再展此卷 <span aria-hidden="true">↗</span></button></div>:null}
    </div>
    <div id="v3-panel-notes" role="tabpanel" aria-labelledby="v3-tab-notes" hidden={tab!=='notes'} className="v3-notes">
      <h2>译意 <small>编者简释</small></h2><p>{chapter.translation}</p>
      <h2>字词简注</h2><dl>{chapter.notes.map(([word,meaning])=><div key={word}><dt>{word}</dt><dd>{meaning}</dd></div>)}</dl>
    </div>
    <div id="v3-panel-meaning" role="tabpanel" aria-labelledby="v3-tab-meaning" hidden={tab!=='meaning'} className="v3-meaning"><h2>编者赏析</h2><p>{design.meaning}</p><p className="v3-source-note">原文沿用本项目同一校对底本；释读与赏析为阅读辅助。</p></div>
  </aside>;
}

function DetailDialog({chapter,dialog,close,active,onRetry}){
  const [zoom,setZoom]=useState(1),windowRef=useRef(null);
  useEffect(()=>{setZoom(1);},[chapter.id]);
  return <dialog ref={dialog} className="v3-detail-dialog" aria-labelledby="v3-detail-title" onClose={close} onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}>
    <div className="v3-dialog-header"><div><span>完整原画 · 可滚动与缩放</span><h2 id="v3-detail-title">{chapter.title}</h2></div><button aria-label="关闭近观" onClick={()=>dialog.current.close()}>关闭 ×</button></div>
    <div className="v3-zoom-controls"><button aria-label="缩小画卷" disabled={zoom<=1} onClick={()=>setZoom(v=>Math.max(1,v-.5))}>−</button><span>{Math.round(zoom*100)}%</span><button aria-label="放大画卷" disabled={zoom>=4} onClick={()=>setZoom(v=>Math.min(4,v+.5))}>＋</button><button onClick={()=>{setZoom(1);windowRef.current?.scrollTo(0,0);}}>回到全卷</button></div>
    <div ref={windowRef} className="v3-zoom-window" tabIndex="0" aria-label="原画近观区域">{active?<Painting key={chapter.id} src={chapter.image} alt={`${chapter.title}完整原画`} style={{width:`${zoom*100}%`}} onRetry={onRetry}/>:null}</div>
    <p className="v3-source-note">此处显示原始画幅，未裁去人物与景物。</p>
  </dialog>;
}

export default function ScrollDemo(){
  const [page,setPage]=useState(readPage),[paused,setPaused]=useState(false),[reading,setReading]=useState(false),[resting,setResting]=useState(false),[opened,setOpened]=useState(false),[dialog,setDialog]=useState(null),[fullscreen,setFullscreen]=useState(false),[phase,setPhase]=useState('night');
  const root=useRef(null),directory=useRef(null),detail=useRef(null),prefaceDialog=useRef(null),gallery=useRef(null),opener=useRef(null),timer=useRef(null),rest=useRef(false),touch=useRef(null);
  const [view,setView]=useState(),[artAttempt,setArtAttempt]=useState(0);
  const reduced=useReduced(),fullText=page===15,chapter=chapters[(Math.min(page,14)||1)-1],design=sceneFor(Math.min(page,14)||1);
  const still=paused||reduced||reading||resting||Boolean(dialog);
  const navigate=id=>{if(id===readPage())return;location.hash=id===15?'full-text':id?`scene-${String(id).padStart(2,'0')}`:'';};
  const step=delta=>{const pages=[0,...sampleIds,15],index=pages.indexOf(readPage());navigate(pages[(index+delta+pages.length)%pages.length]);};
  const wake=()=>{clearTimeout(timer.current);if(rest.current){rest.current=false;setResting(false);}timer.current=setTimeout(()=>{rest.current=true;setResting(true);},6500);};
  useEffect(()=>{
    const change=()=>{opener.current=null;directory.current?.close();detail.current?.close();prefaceDialog.current?.close();setDialog(null);setPage(readPage());setPhase('night');setView(undefined);setOpened(false);setReading(false);scrollTo({top:0,behavior:'instant'});};
    const fs=()=>setFullscreen(Boolean(document.fullscreenElement));
    addEventListener('hashchange',change);document.addEventListener('fullscreenchange',fs);
    return()=>{removeEventListener('hashchange',change);document.removeEventListener('fullscreenchange',fs);clearTimeout(timer.current);};
  },[]);
  useEffect(()=>{document.title=fullText?'洛神赋全文 · 檐下拨墨':page?`${chapter.title} · 洛神赋`:'洛神赋 · 沉浸式图文长卷';wake();requestAnimationFrame(()=>{if(page){document.querySelector(fullText?'.dynasty-page-title':'.v3-chapter-title')?.focus({preventScroll:true});document.querySelector('.v3-footer [aria-current=page]')?.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'});}});},[page]);
  useEffect(()=>{
    const key=e=>{if(e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||e.shiftKey||dialog||e.target.closest('input,button,a,[role=tablist],textarea,select')||getSelection()?.toString())return;if(e.key==='ArrowRight'){e.preventDefault();step(1);}if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}};
    addEventListener('keydown',key);return()=>removeEventListener('keydown',key);
  },[page,dialog]);
  useEffect(()=>{if(!dialog)return;const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=before;};},[dialog]);
  const show=(name,event)=>{opener.current=event.currentTarget;setDialog(name);({directory,detail,preface:prefaceDialog})[name].current.showModal();};
  const close=()=>{setDialog(null);if(opener.current?.isConnected)opener.current.focus({preventScroll:true});};
  const full=async event=>{const trigger=event.currentTarget;try{if(document.fullscreenElement)await document.exitFullscreen();else await gallery.current.requestFullscreen();}catch{opener.current=trigger;detail.current.showModal();setDialog('detail');}};
  const onTouchStart=e=>{touch.current=e.touches.length===1&&!e.target.closest('button')?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;};
  const onTouchEnd=e=>{const start=touch.current;touch.current=null;if(!start||!e.changedTouches.length)return;const p=e.changedTouches[0],dx=p.clientX-start.x,dy=p.clientY-start.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*2)step(dx<0?1:-1);};
  return <div ref={root} className="v3-app" data-scene={page} data-layout={fullText?'dynasty':page?design.layout:'opening'} data-phase={phase} data-still={still} data-reduced={reduced} style={{'--v3-base':fullText?'#f1eee3':design.base,'--v3-ink':fullText?'#354d49':design.ink,'--v3-accent':fullText?'#9e493c':design.accent,'--v3-light':design.sky,'--light-origin':design.light}} onPointerMove={e=>{
    if(!paused&&!reduced&&!reading){e.currentTarget.style.setProperty('--pointer-x',`${(e.clientX/innerWidth-.5)*9}px`);e.currentTarget.style.setProperty('--pointer-y',`${(e.clientY/innerHeight-.5)*4}px`);wake();}
  }} onPointerDown={wake} onKeyDown={wake}>
    {!fullText?<Environment scene={page?design:null} still={still}/>:null}
    <a className="v3-skip" href={fullText?'#dynasty-reading':page?'#v3-reading':'#v3-enter'} onClick={e=>{e.preventDefault();if(fullText){document.getElementById('dynasty-read-button')?.click();requestAnimationFrame(()=>{document.getElementById('dynasty-reading')?.focus();});return;}if(page)document.getElementById('v3-tab-original')?.click();const anchor=document.getElementById(page?'v3-reading':'v3-enter'),target=anchor&&getComputedStyle(anchor).display==='contents'?anchor.querySelector('.v3-chapter-title'):anchor;target?.focus();target?.scrollIntoView({block:'start',behavior:'instant'});}}>跳至{page?'原文':'入卷'}</a>
    <header className="v3-header"><button className="v3-brand" onClick={()=>navigate(0)} aria-label="洛神赋，返回卷首"><span className="v3-seal">洛<br/>水</span>洛神赋</button><nav className="v3-toolbar" aria-label="观卷工具"><ToolbarAction reduced={reduced} icon={paused||reduced?'play':'pause'} aria-pressed={paused||reduced} disabled={reduced} title={reduced?'系统已启用减少动态':paused?'恢复环境微动':'暂停环境微动'} onClick={()=>setPaused(v=>!v)}>{reduced?'静观中':'静观'}</ToolbarAction><ToolbarAction reduced={reduced} icon="book" aria-haspopup="dialog" aria-expanded={dialog==='preface'} aria-controls="v3-preface-dialog" onClick={e=>show('preface',e)}>卷前序</ToolbarAction><ToolbarAction reduced={reduced} icon="fold" className="v3-tool--fold" href={`?edition=story${page?'#scene-'+String(Math.min(page,14)).padStart(2,'0'):''}`}>折页风格</ToolbarAction><ToolbarAction reduced={reduced} icon="directory" className="v3-tool--directory" aria-haspopup="dialog" aria-expanded={dialog==='directory'} aria-controls="v3-directory-dialog" onClick={e=>show('directory',e)}>目录</ToolbarAction></nav></header>
    {fullText?<DynastyEnding paused={paused||Boolean(dialog)} reduced={reduced}/>:!page?<main className="v3-opening" data-opened={opened}><h1 className="v3-opening-theme">曹植《洛神赋》<span>沉浸式图文长卷</span></h1><ScrollArtwork key="cover" src="art/cover.webp" alt="洛神赋原始封面，金色题字与青绿山水" duration={2.8} paused={paused||Boolean(dialog)} reduced={reduced} opening onOpened={()=>setOpened(true)}/><div className="v3-opening-actions"><p>一卷洛水，十四境。</p><button id="v3-enter" onClick={()=>navigate(1)}>展卷入境 <span>→</span></button><span>黄初三年 · 曹植</span></div></main>:<main className="v3-scene" key={page}>
      <div className="v3-scene-art"><figure ref={gallery} className="v3-gallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onTouchCancel={()=>{touch.current=null;}}>
        <ScrollArtwork key={`${page}-${artAttempt}`} src={chapter.image} alt={`第${numerals[page]}景 ${chapter.title}，完整原画`} duration={design.duration} paused={paused||Boolean(dialog)||resting} reduced={reduced} view={view}/>
        <figcaption><span>第{numerals[page]}景 · 绢本画卷</span><div><button onClick={e=>show('detail',e)}>近观画中细节 <span aria-hidden="true">↗</span></button><button onClick={full}>{fullscreen?'退出全屏':'全屏赏画'}</button></div></figcaption>
      </figure></div>
      <div id="v3-reading" className="v3-reading-anchor" tabIndex="-1"><ReadingPane chapter={chapter} design={design} onReading={setReading} onPhase={setPhase} onReplay={()=>navigate(0)} onFullText={()=>navigate(15)} onView={setView}/></div>
    </main>}
    {fullText?<footer className="v3-footer v3-dynasty-footer"><button onClick={()=>navigate(14)}><span aria-hidden="true">← </span>返回第十四景</button><p>洛水长流 · 赋意长存</p><button onClick={()=>navigate(0)}>重展此卷 <span aria-hidden="true">→</span></button></footer>:page?<footer className="v3-footer"><button onClick={()=>step(-1)}>← <span>{page===1?'卷首':'前卷'}</span></button><nav aria-label="十四景卷轴导航">{demoScenes.map(s=><button key={s.id} aria-current={page===s.id?'page':undefined} aria-label={`第${numerals[s.id]}景 ${chapters[s.id-1].title}`} onClick={()=>navigate(s.id)}><span className="v3-node-index">{String(s.id).padStart(2,'0')}</span><span className="v3-node-title">{chapters[s.id-1].title}</span><i/></button>)}</nav><button onClick={()=>step(1)}><span>{page===14?'全文终章':'续卷'}</span><span aria-hidden="true"> →</span></button></footer>:null}
    <dialog ref={directory} id="v3-directory-dialog" className="v3-directory" aria-labelledby="v3-directory-title" onClose={close} onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}><div className="v3-dialog-header"><div><span>一卷洛水 · 十四境</span><h2 id="v3-directory-title">循卷入境</h2></div><button aria-label="关闭目录" onClick={()=>directory.current.close()}>关闭 ×</button></div><div className="v3-directory-list">{demoScenes.map(s=><button key={s.id} onClick={()=>{opener.current=null;directory.current.close();navigate(s.id);}}><span>{String(s.id).padStart(2,'0')}</span><img src={previewFor(chapters[s.id-1].image)} alt=""/><div><strong>{chapters[s.id-1].title}</strong><small>{chapters[s.id-1].mood}</small></div><span>↗</span></button>)}</div><button className="v3-dynasty-directory" aria-label="洛神赋全文 · 檐下拨墨" onClick={()=>{opener.current=null;directory.current.close();navigate(15);}}><span>洛神赋全文<small>檐下拨墨 · 卷后静读</small></span><span aria-hidden="true">→</span></button><a className="v3-complete-link" href="?edition=story">查看旧版阅读布局 →</a></dialog>
    <dialog ref={prefaceDialog} id="v3-preface-dialog" className="v3-preface v3-directory" aria-labelledby="v3-preface-title" onClose={close} onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}><div className="v3-dialog-header"><div><span>曹植 · 黄初三年</span><h2 id="v3-preface-title">洛神赋 · 序</h2></div><button aria-label="关闭序文" onClick={()=>prefaceDialog.current.close()}>关闭 ×</button></div><p data-preface>{preface}</p><button className="v3-preface-enter" onClick={()=>{opener.current=null;prefaceDialog.current.close();navigate(1);}}>从第一景启程 →</button></dialog>
    <DetailDialog onRetry={()=>setArtAttempt(n=>n+1)} active={dialog==='detail'} chapter={chapter} dialog={detail} close={close}/>
  </div>;
}
