import React,{useState} from 'react';

const previews=import.meta.glob('./previews/*.webp',{eager:true,import:'default',query:'?inline'});
export const previewFor=src=>previews['./previews/'+src.split('/').pop()];

// The preview travels with the reader, so even a stalled image request has something to show.
export default function Painting({src,alt,imageRef,style,onRetry}){
  const [status,setStatus]=useState('loading'),[attempt,setAttempt]=useState(0);
  return <>
    <span className="v3-painting" style={style} data-image-status={status}>
      <img className="v3-preview" src={previewFor(src)} alt="" draggable="false"/>
      <img key={attempt} ref={imageRef} className="v3-original" src={src} alt={alt} draggable="false"
        fetchPriority="high" onLoad={()=>setStatus('ready')} onError={()=>setStatus('failed')}/>
    </span>
    {onRetry&&status==='failed'?<button className="v3-retry" onClick={()=>{setStatus('loading');setAttempt(n=>n+1);onRetry();}}>当前为预览图 · 重新加载高清原画</button>:null}
  </>;
}
