import React,{useEffect,useState} from 'react';

const previews=import.meta.glob(['./previews/frame.webp','./previews/roof-*.webp'],{eager:true,import:'default',query:'?inline'});
export const previewFor=src=>previews['./previews/'+src.split('/').pop()];

export function ArtworkImage({src,alt,onLoad,onError,...props}){
  const [useWebp,setUseWebp]=useState(false);
  const avif=src.replace('art/','art-fast/').replace(/\.webp$/,'.avif');
  return <picture>
    {!useWebp?<source type="image/avif" srcSet={avif}/>:null}
    <img {...props} className="v3-original" src={src} alt={alt} draggable="false" fetchPriority="high"
      onLoad={event=>onLoad(event.currentTarget)} onError={event=>{
        if(!useWebp&&event.currentTarget.currentSrc.endsWith('.avif'))setUseWebp(true);
        else onError();
      }}/>
  </picture>;
}

export default function Painting({src,alt,onArtworkLoad,onArtworkError}){
  const [status,setStatus]=useState('loading');
  const [showPreview,setShowPreview]=useState(false);
  const [previewReady,setPreviewReady]=useState(false);
  useEffect(()=>{
    if(status!=='loading')return;
    const timeout=setTimeout(()=>setShowPreview(true),1500);
    return ()=>clearTimeout(timeout);
  },[status]);
  return <span className="v3-painting" data-image-status={status}>
    {status!=='ready'&&(showPreview||status==='failed')?<img className="v3-medium"
      src={src.replace('art/','art-preview/')} alt="" draggable="false" fetchPriority="low"
      data-ready={previewReady} onLoad={()=>setPreviewReady(true)}/>:null}
    <ArtworkImage src={src} alt={alt}
      onLoad={image=>{setStatus('ready');onArtworkLoad(image);}}
      onError={()=>{setStatus('failed');onArtworkError();}}/>
    {status!=='ready'?<span className="v3-art-status" role="status">
      {status==='failed'?'原画加载失败，可在近观中重试':previewReady?'预览 · 正在加载原画':'正在加载原画…'}
    </span>:null}
  </span>;
}
