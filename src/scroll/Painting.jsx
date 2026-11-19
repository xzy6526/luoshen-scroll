import React,{useState} from 'react';

const previews=import.meta.glob('./previews/*.webp',{eager:true,import:'default',query:'?inline'});
export const previewFor=src=>previews['./previews/'+src.split('/').pop()];

// The preview travels with the reader, so even a stalled image request has something to show.
export default function Painting({src,alt,style,onRetry}){
  const [status,setStatus]=useState('loading'),[attempt,setAttempt]=useState(0);
  const [previewReady,setPreviewReady]=useState(false);
  const preview=src.replace('art/','art-preview/');
  return <>
    <span className="v3-painting" style={style} data-image-status={status}>
      <img className="v3-preview" src={previewFor(src)} alt="" draggable="false"/>
      {status!=='ready'?<img className="v3-medium" src={preview} alt="" draggable="false"
        fetchPriority="high" data-ready={previewReady} onLoad={()=>setPreviewReady(true)}/>:null}
      <img key={attempt} className="v3-original" src={src} alt={alt} draggable="false"
        onLoad={()=>setStatus('ready')} onError={()=>setStatus('failed')}/>
    </span>
    {onRetry&&status==='failed'?<button className="v3-retry" onClick={()=>{setStatus('loading');setAttempt(n=>n+1);onRetry();}}>当前为预览图 · 重新加载高清原画</button>:null}
  </>;
}
