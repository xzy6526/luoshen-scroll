import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ScrollMask from './components/ScrollMask.tsx';
import FoldOpening from './components/FoldOpening.jsx';
import { sceneFolds } from './fold-motion.mjs';
import ArtEffects from './ArtEffects.jsx';
import { chapters, preface } from './content.mjs';
import DepthArtwork from './DepthArtwork.jsx';
import { storyEdition, v2Edition, initialDemo, demoFromSearch, demoNames, sceneLayouts } from './edition.mjs';
import { sceneDesigns, sceneTheme } from './scene-design.mjs';
import SilkEnvironment, { MistTransition } from './SilkEnvironment.jsx';

const numerals = ['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四'];
const pageFromHash = () => {
  const match = location.hash.match(/^#scene-(\d{1,2})$/);
  return match ? Math.max(0, Math.min(14, Number(match[1]))) : 0;
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function Reading({ chapter, jade, onGroup, guide, reduced }) {
  const textRef = useRef(null);
  useEffect(() => {
    const text = textRef.current;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-read');
        if (chapter.id === 7 || chapter.id === 9) onGroup(Number(entry.target.dataset.group));
        observer.unobserve(entry.target);
      }
    }, { threshold: .12, rootMargin: '0px 0px -12px 0px' });
    text.querySelectorAll('p').forEach(p => observer.observe(p));
    return () => observer.disconnect();
  }, [chapter.id, onGroup]);

  return <section className="reading-section" data-jade={jade} aria-label="本景原文与释读">
    <aside className="reading-aside">
      <span className="section-kicker">第{numerals[chapter.id-1]}景 · 原文</span>
      {chapter.paragraphs.length > 1 ? <blockquote>{chapter.quotes.map(quote => <p key={quote}>{quote}</p>)}</blockquote> : <p className="scene-mood">{chapter.mood}</p>}
      <span className="text-author">曹植 ·《洛神赋》</span>
    </aside>
    <div className="reading-body">
      <div ref={textRef} className={`original-text ${chapter.paragraphs.length === 1 && chapter.paragraphs[0].length < 55 ? 'is-short' : ''} ${reduced ? 'no-reveal' : ''}`}>
        {chapter.paragraphs.map((paragraph, index) => <React.Fragment key={paragraph}>
          <p data-group={index} onPointerEnter={() => guide && onGroup(index)}>{paragraph}</p>
        </React.Fragment>)}
      </div>
      <details className="reading-notes">
        <summary>译意与简注<span aria-hidden="true">＋</span></summary>
        <div className="notes-content">
          <h3>译意<span>编者简释</span></h3><p>{chapter.translation}</p>
          <h3>字词简注</h3><dl>{chapter.notes.map(([word, meaning]) => <div key={word}><dt>{word}</dt><dd>{meaning}</dd></div>)}</dl>
          <p className="edition-note">原文采用维基文库同一底本；译意与简注为阅读辅助。末句“𬴂”统一显示为“騑”。<a href="https://zh.wikisource.org/w/index.php?title=洛神賦&oldid=7908816&variant=zh-hans" target="_blank" rel="noreferrer">查阅原文底本 ↗</a></p>
        </div>
      </details>
    </div>
  </section>;
}

function Scene({ chapter, onStep, artOnly, quiet, reduced, dialogOpen, onDetail, demo, previousSrc }) {
  const silk=v2Edition&&demo==='narrative';
  const design=sceneDesigns[chapter.id-1];
  const [pan,setPan]=useState(50);
  const [resting,setResting]=useState(false);
  const sceneRef=useRef(null);
  useEffect(()=>{
    if(!silk)return;
    let timer;
    const wake=()=>{setResting(false);clearTimeout(timer);timer=setTimeout(()=>setResting(true),6500);};
    const el=sceneRef.current;
    el.addEventListener('pointermove',wake,{passive:true});el.addEventListener('pointerdown',wake,{passive:true});el.addEventListener('keydown',wake);
    wake();
    return()=>{clearTimeout(timer);el.removeEventListener('pointermove',wake);el.removeEventListener('pointerdown',wake);el.removeEventListener('keydown',wake);};
  },[silk]);
  const [imageState, setImageState] = useState('loading');
  const [retry, setRetry] = useState(0);
  const [jade, setJade] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [group, setGroup] = useState(-1);
  const touch = useRef(null);
  const jadeTimer = useRef(0);
  const hasGuide = chapter.id === 7 || chapter.id === 9;
  useEffect(() => () => clearTimeout(jadeTimer.current), []);
  const triggerJade = () => {
    setJade(true); setPulse(n => n + 1);
    clearTimeout(jadeTimer.current);
    jadeTimer.current = setTimeout(() => setJade(false), 2600);
  };
  const setGuide = useCallback(index => setGroup(index), []);
  const touchStart = event => {
    if (event.touches.length !== 1 || event.target.closest('button')) { touch.current = null; return; }
    touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };
  const touchEnd = event => {
    const start = touch.current; touch.current = null;
    if (!start || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX-start.x, dy = event.changedTouches[0].clientY-start.y;
    if (Math.abs(dx) > 54 && Math.abs(dy) < Math.abs(dx)*.5) onStep(dx < 0 ? 1 : -1);
  };
  const spots = chapter.id === 7 ? [[.28,.56,.27,.31],[.79,.51,.24,.40],[.46,.34,.18,.32]] : [[.22,.32,.23,.39],[.62,.34,.23,.42],[.86,.45,.18,.46]];
  const spot = spots[Math.max(0,Math.min(2,group))];

  return <main ref={sceneRef} className={`reader ${artOnly ? 'art-only' : ''}`} data-layout={silk?design.layout:sceneLayouts[chapter.id-1]} data-scene={chapter.id} data-fold={silk?sceneFolds[chapter.id-1].key:undefined} data-jade={jade} data-reveal={design.reveal} data-resting={resting} style={silk?{'--arrival-time':`${design.duration}s`}:undefined}>
    <div className="chapter-heading"><div><span className="chapter-number">{String(chapter.id).padStart(2,'0')}<span> / 14</span></span><h1 tabIndex="-1" className="chapter-title">{chapter.title}</h1></div><p>{chapter.mood}</p></div>
    {storyEdition ? <blockquote className="scene-excerpt">{chapter.quotes.map(quote=><p key={quote}>{quote}</p>)}<cite>曹植《洛神赋》</cite></blockquote> : null}
    <figure className={`artwork ${!reduced&&!quiet&&!silk ? 'scene-arrival' : ''} ${chapter.id === 4 ? 'first-sighting' : ''}`} data-exploring={silk&&pan!==50} style={silk?{'--pan':`${(50-pan)*.11}%`}:undefined}>
      <div className="art-stage" onTouchStart={touchStart} onTouchMove={event => { if(event.touches.length !== 1) touch.current=null; }} onTouchEnd={touchEnd} onTouchCancel={() => {touch.current=null;}}>
        <img className="painting" src={`${chapter.image}${retry ? `?retry=${retry}` : ''}`} alt={`第${numerals[chapter.id-1]}景：${chapter.title}，完整横幅插图`} width={chapter.id === 1 ? 2076 : 2075} height="758" decoding="async" fetchPriority="high" draggable="false" onLoad={() => setImageState('ready')} onError={() => setImageState('error')} />
        {imageState === 'ready' ? <ArtEffects key={chapter.id} id={chapter.id} paused={quiet || reduced || dialogOpen || (silk&&resting)} pulse={pulse} /> : null}
        {storyEdition && demo !== 'album' && imageState === 'ready' && !reduced ? <DepthArtwork src={chapter.image} id={chapter.id} mode={demo} silk={silk} design={design} previousSrc={previousSrc} resting={silk&&resting} paused={quiet || dialogOpen} /> : null}
        {imageState === 'loading' ? <span className="image-status" role="status">画卷加载中…</span> : null}
        {imageState === 'error' ? <div className="image-error" role="alert"><p>本景画卷暂未载入，原文仍可阅读。</p><button onClick={() => {setImageState('loading');setRetry(n=>n+1);}}>重新载入画卷</button></div> : null}
        {chapter.id === 6 && imageState === 'ready' ? <button className="jade-hotspot" aria-label="轻触玉佩，托微波通辞" onClick={triggerJade}><span aria-hidden="true" /></button> : null}
        {hasGuide && group >= 0 ? <span className="scene-guide" style={{left:`${(spot[0]-spot[2]/2)*100}%`,top:`${(spot[1]-spot[3]/2)*100}%`,width:`${spot[2]*100}%`,height:`${spot[3]*100}%`}} aria-hidden="true" /> : null}
      </div>
      <figcaption><span>{chapter.id === 6 ? <button className="text-action" onClick={triggerJade}>轻触画中玉佩 · 托微波通辞</button> : hasGuide ? '随文观画，或轻选下方一处' : '一幅全景，可自在停留'}</span><button className="text-action" aria-label="放大赏画" onClick={onDetail}>{silk&&design.detail?design.detail.title:'近观画中细节'} <span aria-hidden="true">↗</span></button></figcaption>
      {silk&&design.pan?<div className="scroll-exploration"><label htmlFor="pan-range">循水观山</label><input id="pan-range" type="range" min="0" max="100" value={pan} aria-label="横向观览画卷" onChange={event=>setPan(Number(event.target.value))}/><button onClick={()=>setPan(50)}>回到全卷</button></div>:null}
    </figure>
    {silk&&design.detail?<button className="detail-vignette" onClick={onDetail} aria-label={design.detail.title}><span className="vignette-picture" style={{backgroundImage:`url("${chapter.image}")`,backgroundSize:chapter.id===6?'900%':'500%',backgroundPosition:chapter.id===6?'47.4% 60%':'67.5% 91%'}}/><span>{chapter.id===5?'采芝':'赠佩'} · 近观 ↗</span></button>:null}
    {hasGuide ? <div className="guide-controls" aria-label="随文观画">{(chapter.id === 7 ? ['徙倚长吟','众灵游江','翳袖延伫'] : ['屏翳收风','川后静波','护行将别']).map((label,index)=><button key={label} aria-pressed={group===index} onClick={()=>setGroup(index)}>{label}</button>)}</div> : null}
    <div className="chapter-reading" hidden={artOnly}><Reading chapter={chapter} jade={jade} onGroup={setGuide} guide={hasGuide} reduced={reduced} /></div>
    {chapter.id === 14 && !artOnly ? <p className="ending-note">卷尽，情未尽。烟波中的远影，留在回望里。</p> : null}
  </main>;
}

export default function App() {
  const [demo,setDemo] = useState(initialDemo);
  const changeDemo=event=>{
    const value=event.target.value;
    setDemo(value);document.documentElement.dataset.demo=value;
    const url=new URL(location.href);url.searchParams.set('demo',value);history.replaceState(null,'',url);
  };
  const [page, setPage] = useState(pageFromHash);
  const current = useRef(page);
  const [artOnly, setArtOnly] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [crossing,setCrossing]=useState({serial:0,color:'#283d3a'});
  const reduced = useReducedMotion();
  const dialogs = useRef({});
  const opener = useRef(null);
  const readingPosition = useRef(0);
  const chapter = chapters[page-1];
  const silk=v2Edition&&demo==='narrative';
  useLayoutEffect(()=>{
    document.documentElement.classList.toggle('silk',silk);
    document.documentElement.dataset.quiet=String(quiet||reduced);
    const theme=sceneTheme(page);
    for(const [key,value] of Object.entries(theme)) {
      if(silk)document.documentElement.style.setProperty(key,value);
      else document.documentElement.style.removeProperty(key);
    }
  },[page,silk,quiet,reduced]);

  const navigate = useCallback((target, push=true) => {
    const index=Math.max(0,Math.min(14,target));
    if(index===current.current) return;
    setCrossing(old=>({serial:old.serial+1,color:sceneDesigns[Math.max(0,current.current-1)].base,image:chapters[current.current-1]?.image}));
    opener.current=null;
    for (const modal of Object.values(dialogs.current)) if(modal?.open) modal.close();
    setDialog(null);
    current.current=index;
    if(push) history.pushState(null,'',index ? `#scene-${String(index).padStart(2,'0')}` : location.pathname+location.search);
    setPage(index); setArtOnly(false); readingPosition.current=0;
    window.scrollTo({top:0,behavior:'instant'});
  },[]);
  const step = useCallback(delta => navigate(current.current+delta),[navigate]);
  useEffect(() => {
    const change=()=>{
      if(storyEdition){const value=demoFromSearch();setDemo(value);document.documentElement.dataset.demo=value;}
      navigate(pageFromHash(),false);
    };
    const key=event=>{
      if(event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || document.querySelector('dialog[open]') || event.target.closest('input,textarea,select,details,[contenteditable="true"]') || getSelection()?.toString()) return;
      if(event.key==='ArrowRight' || event.key==='ArrowLeft') {event.preventDefault();step(event.key==='ArrowRight'?1:-1);}
    };
    addEventListener('popstate',change); addEventListener('hashchange',change); addEventListener('keydown',key);
    return ()=>{removeEventListener('popstate',change);removeEventListener('hashchange',change);removeEventListener('keydown',key);};
  },[navigate,step]);
  useEffect(() => {
    document.title=page ? `${chapters[page-1].title} · 洛神赋` : '洛神赋 · 一卷洛水，十四境';
    if(page) document.querySelector('.chapter-title')?.focus({preventScroll:true});
    const next=chapters[page];
    if(next) {const image=new Image();image.src=next.image;}
  },[page]);
  useEffect(()=>{
    if(!dialog) return;
    const before=document.body.style.overflow; document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=before;};
  },[dialog]);
  const openDialog=(name,event)=>{
    opener.current=event.currentTarget;
    if(name==='detail') setZoom(silk&&chapter&&sceneDesigns[chapter.id-1].detail?2:1);
    setDialog(name); dialogs.current[name].showModal();
  };
  const closeDialog=name=>dialogs.current[name].close();
  const afterClose=()=>{setDialog(null);if(opener.current?.isConnected) opener.current.focus({preventScroll:true});};
  const toggleView=()=>{
    if(!artOnly) readingPosition.current=scrollY;
    setArtOnly(value=>!value);
    requestAnimationFrame(()=>window.scrollTo({top:artOnly ? readingPosition.current : 0,behavior:'instant'}));
  };
  const skipToContent=event=>{
    event.preventDefault();
    if(page && artOnly) setArtOnly(false);
    requestAnimationFrame(()=>{
      const target=document.querySelector(page?'.original-text':'#opening-actions');
      target.tabIndex=-1;
      target.focus({preventScroll:true});
      window.scrollTo({top:target.getBoundingClientRect().top+scrollY-24,behavior:'instant'});
    });
  };
  useEffect(()=>{
    if(dialog!=='detail'||!silk||!chapter)return;
    const detail=sceneDesigns[chapter.id-1].detail;
    if(!detail)return;
    let alive=true,frame=0;
    const position=()=>{
      if(!alive)return;
      const box=document.querySelector('.detail-scroll');
      const image=box?.querySelector('img');
      if(box&&image){
        const r=image.getBoundingClientRect();
        box.scrollLeft=Math.max(0,r.width*detail.x/100-box.clientWidth/2);
        box.scrollTop=Math.max(0,r.height*detail.y/100-box.clientHeight/2);
      }
    };
    const image=document.querySelector('.detail-image');
    image?.decode().then(()=>{if(alive)frame=requestAnimationFrame(position);}).catch(()=>{});
    return()=>{alive=false;cancelAnimationFrame(frame);};
  },[dialog,chapter,silk]);

  return <div className={`app ${page===0?'is-opening':''}`} data-page={page}>
    {silk?<><SilkEnvironment src={chapter?.image||'art/01.webp'} scene={page} paused={quiet||reduced||Boolean(dialog)}/><MistTransition state={crossing} reduced={reduced||quiet}/></>:null}
    <a className="skip-link" href={page?'#original-reading':'#opening-actions'} onClick={skipToContent}>跳至{page?'原文':'入卷操作'}</a>
    <header className="site-header"><button className="brand" onClick={()=>navigate(0)} aria-label="洛神赋，返回封面"><span className="seal" aria-hidden="true">洛<br/>水</span>洛神赋</button>{storyEdition ? <label className="demo-picker"><span>观看方案</span><select aria-label="选择演示方案" value={demo} onChange={changeDemo}>{demoNames.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label> : <span className="header-caption">曹植原文 · 十四景图卷</span>}<nav aria-label="阅读工具">{page ? <><button onClick={toggleView} aria-pressed={artOnly}>{artOnly?'读文':'赏画'}</button><button className="motion-toggle" disabled={reduced} onClick={()=>setQuiet(value=>!value)} aria-pressed={quiet||reduced}>{reduced?'静观中':quiet?'恢复微动':'静观'}</button></> : <button onClick={event=>openDialog('preface',event)}>缘起</button>}<button aria-label="十四景目录" onClick={event=>openDialog('contents',event)}>目录</button></nav></header>
    {page===0 ? <div className="opening">
      <h1 className="visually-hidden">洛神赋</h1>
      {silk?<FoldOpening reduced={reduced||quiet}/>:<ScrollMask src="art/01.webp" alt="洛水夕阳与江畔车马，第一景行旅初起" variant="iris" fit="contain" feather={34} zoom={1} radius={0} scrollLength={.95} settle={.84} smooth={.18} reducedMotion={reduced} revealContent={false} underlay={<img src="art/cover.webp" alt="金色书法洛神赋，青绿飘带、山水与月色" fetchPriority="high" draggable="false" />} />}
      <div className="opening-actions" id="opening-actions"><p>一卷洛水，十四境。</p><div><span className="opening-hint">向下轻展画卷</span><button className="primary-action" onClick={()=>navigate(1)}>展卷读文 <span aria-hidden="true">→</span></button></div><span className="opening-colophon">黄初三年 · 曹植</span></div>
    </div> : <><div id="original-reading" className="reading-anchor" /><Scene key={`${page}-${demo}`} chapter={chapter} onStep={step} artOnly={artOnly} quiet={quiet} reduced={reduced} dialogOpen={Boolean(dialog)} demo={demo} previousSrc={crossing.image} onDetail={event=>openDialog('detail',event)} /><footer className="reading-footer"><div className="page-nav"><button data-prev onClick={()=>step(-1)}><span aria-hidden="true">←</span> 前卷</button><div className="chapter-progress"><span className="page-counter">第{numerals[page-1]}景 <span>/ 十四景</span></span><div className="page-marks" aria-label="章节进度">{chapters.map(item=><button key={item.id} className={item.id===page?'is-current':''} aria-current={item.id===page?'page':undefined} aria-label={`跳转第${numerals[item.id-1]}景 ${item.title}`} onClick={()=>navigate(item.id)}><span /></button>)}</div></div><button data-next className="next-action" onClick={()=>page===14?navigate(0):step(1)}>{page===14?'重展此卷':'续卷'} <span aria-hidden="true">→</span></button></div></footer></>}
    <dialog id="contents-dialog" ref={node=>{dialogs.current.contents=node;}} onClose={afterClose} onClick={event=>{if(event.target===event.currentTarget)closeDialog('contents');}} aria-labelledby="contents-title"><div className="dialog-top"><div><span className="section-kicker">展卷与回望</span><h2 id="contents-title">十四景目录</h2></div><button aria-label="关闭目录" onClick={()=>closeDialog('contents')}>关闭 ×</button></div>{dialog==='contents'?<div className="contents-list">{chapters.map(item=><button key={item.id} className={`contents-item ${item.id===page?'is-current':''}`} aria-label={`第${numerals[item.id-1]}景 ${item.title}`} onClick={()=>{closeDialog('contents');navigate(item.id);}}><img src={`thumbs/${String(item.id).padStart(2,'0')}.webp`} alt="" loading="lazy" width="480" height="175"/><span><small>{String(item.id).padStart(2,'0')}</small><strong>{item.title}</strong><em>{item.mood}</em></span><span className="contents-arrow" aria-hidden="true">↗</span></button>)}</div>:null}</dialog>
    <dialog id="preface-dialog" className="preface-dialog" ref={node=>{dialogs.current.preface=node;}} onClose={afterClose} onClick={event=>{if(event.target===event.currentTarget)closeDialog('preface');}} aria-labelledby="preface-title"><div className="dialog-top"><div><span className="section-kicker">曹植 · 序</span><h2 id="preface-title">缘起</h2></div><button aria-label="关闭缘起" onClick={()=>closeDialog('preface')}>关闭 ×</button></div><p className="preface-original">{preface}</p><div className="preface-context"><span className="section-kicker">译意 · 编者简释</span><p>黄初三年，我进京朝见，归来时渡过洛川。古人说，这条河的神灵名叫宓妃。我有感于宋玉向楚王讲述神女的故事，于是写下这篇赋。</p><p>以下十四景按原文次序展开。可读文、静观或近赏；每一景都由你决定何时续卷。</p><a href="https://zh.wikisource.org/w/index.php?title=洛神賦&oldid=7908816&variant=zh-hans" target="_blank" rel="noreferrer">查阅原文底本 ↗</a></div></dialog>
    <dialog id="detail-dialog" className="detail-dialog" ref={node=>{dialogs.current.detail=node;}} onClose={afterClose} onClick={event=>{if(event.target===event.currentTarget)closeDialog('detail');}} aria-labelledby="detail-title"><div className="dialog-top"><div><span className="section-kicker">近观 · 可滚动细赏</span><h2 id="detail-title">{chapter?.title||'画中细节'}</h2></div><div className="zoom-controls"><button aria-label="缩小一级" disabled={zoom<=1} onClick={()=>setZoom(value=>Math.max(1,value-.5))}>−</button><span>{Math.round(zoom*100)}%</span><button aria-label="放大一级" disabled={zoom>=3} onClick={()=>setZoom(value=>Math.min(3,value+.5))}>＋</button><button aria-label="关闭近观" onClick={()=>closeDialog('detail')}>关闭 ×</button></div></div>{dialog==='detail'&&chapter?<div className="detail-scroll"><img className="detail-image" src={chapter.image} alt={`${chapter.title}完整插图，可放大查看`} style={{width:`${zoom*100}%`}} /></div>:null}</dialog>
  </div>;
}
