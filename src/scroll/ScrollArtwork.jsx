import React,{useEffect,useRef,useState} from 'react';
import { unfoldPoint } from './scroll-geometry.mjs';
import Painting,{previewFor} from './Painting.jsx';

export default function ScrollArtwork({src,alt,duration=1.7,paused=false,reduced=false,opening=false,view,onRect,onOpened}){
  const root=useRef(null),canvas=useRef(null),controls=useRef(null),rendererRef=useRef(null);
  const latest=useRef({paused,reduced,view,onRect,onOpened});latest.current={paused,reduced,view,onRect,onOpened};
  const [result,setResult]=useState(null);
  const status=result?.src===src?result.status:'loading';
  useEffect(()=>{controls.current?.update();},[paused,reduced,view]);
  useEffect(()=>{
    const host=root.current,el=canvas.current,started=performance.now();
    const setStatus=status=>setResult({src,status});
    el.dataset.progress='0';el.dataset.frame='0';host.dataset.flat='false';
    const touchScreen=matchMedia('(pointer: coarse)').matches;
    let alive=true,renderer,scene,camera,picture,imageMap,planes,rollers,light,resize,visibility,frame=0,age=0,last=0,complete=false,visible=true,aspect=2.74,half=1.6,ready=false,presented=false;
    const disposable=new Set(),surfaces=[],mounts=[];
    const own=value=>{disposable.add(value);return value;};
    const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;el.dataset.running='false';};
    const notify=()=>{if(!complete){complete=true;latest.current.onOpened?.();}};
    function paper(progress){
      const eased=progress*progress*(3-2*progress),edge=Math.max(.065,half*eased);
      planes.forEach(p=>{p.constant=edge;});
      rollers.forEach((g,i)=>{g.position.x=(i?1:-1)*edge;g.rotation.y=(i?-1:1)*(1-eased)*Math.PI*5;});
      mounts.forEach(m=>{m.position.x=m.userData.sign*Math.max(.02,half*eased-.11);m.visible=progress>.12;});
      for(const mesh of surfaces){
        const position=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv,w=mesh.userData.width;
        for(let i=0;i<position.count;i++){
          const original=(uv.getX(i)-.5)*w,[x,z]=unfoldPoint(original,eased,half*2);
          position.setZ(i,z);position.setX(i,x);
        }
        position.needsUpdate=true;if(mesh.material.isMeshStandardMaterial)mesh.geometry.computeVertexNormals();
      }
      el.dataset.progress=progress.toFixed(4);el.dataset.rotation=rollers[0].rotation.y.toFixed(3);
      if(progress===1){host.dataset.flat='true';notify();}
    }
    function applyView(){
      if(!imageMap)return;
      const {zoom=1,x=.5,y=.5}=latest.current.view||{},span=1/zoom;
      imageMap.repeat.set(span,span);imageMap.offset.set(Math.max(0,Math.min(1-span,x-span/2)),Math.max(0,Math.min(1-span,1-y-span/2)));
      el.dataset.zoom=String(zoom);
    }
    function render(){
      renderer.render(scene,camera);el.dataset.frame=String(Number(el.dataset.frame||0)+1);
    }
    function update(){
      if(!ready||!alive)return;
      applyView();
      if(latest.current.paused||latest.current.reduced){age=duration;paper(1);render();stop();return;}
      if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);
    }
    function draw(now){
      frame=0;if(!alive||!ready||!visible||document.hidden){stop();return;}
      if(last&&now-last<15){frame=requestAnimationFrame(draw);return;}
      const dt=last?(now-last)/1000:0;last=now;
      if(age<duration){age=Math.min(duration,age+dt);paper(age/duration);}
      render();el.dataset.running='true';
      if(age<duration)frame=requestAnimationFrame(draw);else stop();
    }
    const changed=()=>{if(document.hidden)stop();else update();};
    const lost=event=>{event.preventDefault();stop();if(alive){ready=false;setStatus('fallback');latest.current.onOpened?.();}};
    async function start(){
      try{
        const art=new Image();art.src=src;
        const [T]=await Promise.all([import('three'),art.decode()]);
        if(!alive)return;
        const frameMap=await new T.TextureLoader().loadAsync('v3/frame-source.webp');
        if(!alive){frameMap.dispose();return;}
        own(frameMap);
        const gl=el.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:true});
        if(!gl||gl.isContextLost()){setStatus('fallback');notify();return;}
        renderer=rendererRef.current??=new T.WebGLRenderer({canvas:el,context:gl,alpha:true,antialias:true});
        renderer.setPixelRatio(Math.min(devicePixelRatio,touchScreen?1.25:1.5));renderer.outputColorSpace=T.SRGBColorSpace;
        renderer.localClippingEnabled=true;
        imageMap=own(new T.Texture(art));imageMap.needsUpdate=true;
        imageMap.colorSpace=frameMap.colorSpace=T.SRGBColorSpace;
        aspect=art.naturalWidth/art.naturalHeight;el.dataset.artAspect=String(aspect);half=aspect/2+.21;
        scene=new T.Scene();camera=new T.OrthographicCamera(-2,2,1,-1,.1,30);camera.position.set(0,0,8);camera.lookAt(0,0,0);
        scene.add(new T.AmbientLight(0xffffff,2.4));
        light=new T.DirectionalLight(0xfff4db,2.2);light.position.set(-2.5,4,5);scene.add(light);
        const fill=new T.DirectionalLight(0xdce9ef,.65);fill.position.set(3,-1,4);scene.add(fill);
        planes=[new T.Plane(new T.Vector3(1,0,0),half),new T.Plane(new T.Vector3(-1,0,0),half)];
        const sampled=(x,y,w,h)=>{const map=own(frameMap.clone());map.offset.set(x,y);map.repeat.set(w,h);map.needsUpdate=true;return map;};
        const silkMap=sampled(.22,.3,.5,.38),mountMap=sampled(.057,.24,.075,.55),bandMap=sampled(.15,.814,.7,.044),woodMap=sampled(.027,.23,.016,.5);
        const cream=own(new T.MeshStandardMaterial({map:silkMap,color:0xffffff,roughness:1,side:T.DoubleSide,clippingPlanes:planes}));
        const wood=own(new T.MeshStandardMaterial({map:woodMap,color:0x815936,roughness:.57,metalness:.04}));
        const bronze=own(new T.MeshStandardMaterial({color:0xb79454,metalness:.74,roughness:.35}));
        const brown=own(new T.MeshStandardMaterial({map:mountMap,roughness:.95,side:T.DoubleSide}));
        const bandMaterial=own(new T.MeshStandardMaterial({map:bandMap,roughness:.85,side:T.DoubleSide,clippingPlanes:planes}));
        const mesh=(geometry,material,x=0,y=0,z=0)=>{const m=new T.Mesh(own(geometry),material);m.position.set(x,y,z);m.frustumCulled=false;return m;};
        const cloth=mesh(new T.PlaneGeometry(half*2,1.18,100,1),cream,0,0,0);cloth.userData.width=half*2;scene.add(cloth);surfaces.push(cloth);
        picture=mesh(new T.PlaneGeometry(aspect,1,100,1),own(new T.MeshBasicMaterial({map:imageMap,side:T.DoubleSide,clippingPlanes:planes})),0,0,.008);
        picture.userData.width=aspect;scene.add(picture);surfaces.push(picture);
        for(const sign of [-1,1]){
          scene.add(mesh(new T.PlaneGeometry(half*2,.066),bandMaterial,0,sign*.55,.018));
          const edge=mesh(new T.BoxGeometry(half*2,.012,.012),bronze,0,sign*.59,.008);edge.material=own(bronze.clone());edge.material.clippingPlanes=planes;scene.add(edge);
        }
        rollers=[-1,1].map(sign=>{
          const group=new T.Group();scene.add(group);
          const rod=mesh(new T.CylinderGeometry(.061,.064,1.23,32),wood);group.add(rod);
          for(const y of [-.64,.64]){
            group.add(mesh(new T.CylinderGeometry(.075,.075,.092,32),bronze,0,y,0));
            const finial=mesh(new T.SphereGeometry(.053,16,10),bronze,0,y+Math.sign(y)*.085,0);finial.scale.y=.8;group.add(finial);
            for(const dy of [-.035,.035]){const ring=mesh(new T.TorusGeometry(.076,.005,6,32),bronze,0,y+dy,0);ring.rotation.x=Math.PI/2;group.add(ring);}
          }
          // Mounting sits next to the roller, so it does not rotate like the wood spindle.
          const mount=mesh(new T.PlaneGeometry(.19,1.04),brown,sign*(half-.11),0,.012);scene.add(mount);mount.userData.sign=sign;mounts.push(mount);
          return group;
        });
        resize=new ResizeObserver(()=>{
          if(!alive||!ready)return;const box=host.getBoundingClientRect(),ratio=Math.max(1,box.width)/Math.max(1,box.height);
          renderer.setSize(Math.max(1,box.width),Math.max(1,box.height),false);
          const viewWidth=opening?Math.max(half*2+.24,1.62*ratio):Math.max(half*2+.36,1.72*ratio),viewHeight=viewWidth/ratio;
          camera.left=-viewWidth/2;camera.right=viewWidth/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.updateProjectionMatrix();
          host.style.setProperty('--art-width',`${aspect/viewWidth*100}%`);
          host.style.setProperty('--art-height',`${1/viewHeight*100}%`);
          latest.current.onRect?.({left:(.5-aspect/viewWidth/2)*100,top:(.5-1/viewHeight/2)*100,width:aspect/viewWidth*100,height:1/viewHeight*100});
          render();if(!presented){presented=true;setStatus('ready');}
        });resize.observe(host);
        visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)update();else stop();});visibility.observe(host);
        ready=true;el.dataset.engine=`three.js r${T.REVISION}`;el.dataset.parts='silk,painting,wood-rollers,bronze-caps,mounting,shadow';
        age=latest.current.reduced||latest.current.paused||performance.now()-started>1500?duration:0;paper(age/duration);applyView();
        update();
        document.addEventListener('visibilitychange',changed);el.addEventListener('webglcontextlost',lost);
        controls.current={update};
      }catch{
        if(alive){ready=false;stop();setStatus('fallback');latest.current.onOpened?.();}
      }
    }
    start();
    return()=>{alive=false;stop();controls.current=null;resize?.disconnect();visibility?.disconnect();document.removeEventListener('visibilitychange',changed);el.removeEventListener('webglcontextlost',lost);for(const item of disposable)item.dispose();renderer?.renderLists.dispose();};
  },[src,duration]);
  // The reader keeps one graphics context while the paintings and their scene resources change.
  useEffect(()=>()=>{const renderer=rendererRef.current;renderer?.dispose();renderer?.forceContextLoss();rendererRef.current=null;},[]);
  return <div ref={root} className={`v3-scroll-art ${opening?'v3-scroll-art--opening':''}`} data-status={status} data-zoomed={(view?.zoom??1)>1}>
    <div className="v3-scroll-fallback"><img className="v3-fallback-frame" src={previewFor('frame.webp')} alt=""/><Painting key={src} src={src} alt={alt}/></div>
    <canvas ref={canvas} aria-hidden="true" data-progress="0" data-frame="0" data-running="false"/>
  </div>;
}
