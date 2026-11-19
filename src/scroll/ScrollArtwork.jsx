import React,{useEffect,useRef,useState} from 'react';
import { unfoldPoint } from './scroll-geometry.mjs';
import Painting,{previewFor} from './Painting.jsx';

export default function ScrollArtwork({src,alt,duration=1.7,paused=false,reduced=false,opening=false,view,onRect,onOpened}){
  const root=useRef(null),canvas=useRef(null),controls=useRef(null),original=useRef(null);
  const latest=useRef({paused,reduced,view,onRect,onOpened});latest.current={paused,reduced,view,onRect,onOpened};
  const [status,setStatus]=useState('loading');
  useEffect(()=>{controls.current?.update();},[paused,reduced,view]);
  useEffect(()=>{
    const host=root.current,el=canvas.current,started=performance.now();
    let alive=true,renderer,scene,camera,picture,imageMap,planes,rollers,light,resize,visibility,frame=0,age=0,last=0,painted=0,complete=false,visible=true,aspect=2.74,half=1.6,ready=false,lastMove=0;
    const disposable=new Set(),surfaces=[],mounts=[],pointer={x:0,y:0};
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
        position.needsUpdate=true;mesh.geometry.computeVertexNormals();
      }
      el.dataset.progress=progress.toFixed(4);el.dataset.rotation=rollers[0].rotation.y.toFixed(3);
      if(progress===1)notify();
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
      lastMove=performance.now();if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);
    }
    function draw(now){
      frame=0;if(!alive||!ready||!visible||document.hidden){stop();return;}
      if(now-painted<32){frame=requestAnimationFrame(draw);return;}painted=now;
      const dt=last?Math.min((now-last)/1000,.05):0;last=now;
      if(age<duration){age=Math.min(duration,age+dt);paper(age/duration);}
      light.position.x=-2.5+pointer.x*.3;light.position.y=4+pointer.y*.12;
      render();el.dataset.running='true';
      if(age<duration||now-lastMove<800)frame=requestAnimationFrame(draw);else stop();
    }
    const pointerMove=event=>{
      if(event.pointerType!=='mouse'||latest.current.paused||latest.current.reduced)return;
      const box=host.getBoundingClientRect();pointer.x=(event.clientX-box.left)/box.width*2-1;pointer.y=(event.clientY-box.top)/box.height*2-1;update();
    };
    const changed=()=>{if(document.hidden)stop();else update();};
    const lost=event=>{event.preventDefault();stop();if(alive){ready=false;setStatus('fallback');latest.current.onOpened?.();}};
    async function start(){
      try{
        const gl=el.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:true});
        if(!gl){setStatus('fallback');latest.current.onOpened?.();return;}
        const T=await import('three');if(!alive)return;
        renderer=new T.WebGLRenderer({canvas:el,context:gl,alpha:true,antialias:true});
        renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
        renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.localClippingEnabled=true;
        const loader=new T.TextureLoader();
        const art=original.current;
        const [frameMap]=await Promise.all([loader.loadAsync('v3/frame-source.webp').then(texture=>{
          if(alive)own(texture);else texture.dispose();
          return texture;
        }),art.decode()]);
        if(!alive)return;
        imageMap=own(new T.Texture(art));imageMap.needsUpdate=true;
        imageMap.colorSpace=frameMap.colorSpace=T.SRGBColorSpace;
        aspect=imageMap.image.width/imageMap.image.height;half=aspect/2+.21;
        scene=new T.Scene();camera=new T.OrthographicCamera(-2,2,1,-1,.1,30);camera.position.set(0,0,8);camera.lookAt(0,0,0);
        scene.add(new T.AmbientLight(0xffffff,2.4));
        light=new T.DirectionalLight(0xfff4db,2.2);light.position.set(-2.5,4,5);light.castShadow=true;
        light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-4,right:4,top:3,bottom:-3,near:.1,far:20});light.shadow.bias=-.0005;light.shadow.radius=4;scene.add(light);
        const fill=new T.DirectionalLight(0xdce9ef,.65);fill.position.set(3,-1,4);scene.add(fill);
        planes=[new T.Plane(new T.Vector3(1,0,0),half),new T.Plane(new T.Vector3(-1,0,0),half)];
        const sampled=(x,y,w,h)=>{const map=own(frameMap.clone());map.offset.set(x,y);map.repeat.set(w,h);map.needsUpdate=true;return map;};
        const silkMap=sampled(.22,.3,.5,.38),mountMap=sampled(.057,.24,.075,.55),bandMap=sampled(.15,.814,.7,.044),woodMap=sampled(.027,.23,.016,.5);
        const cream=own(new T.MeshStandardMaterial({map:silkMap,color:0xffffff,roughness:1,side:T.DoubleSide,clippingPlanes:planes}));
        const wood=own(new T.MeshStandardMaterial({map:woodMap,color:0x815936,roughness:.57,metalness:.04}));
        const bronze=own(new T.MeshStandardMaterial({color:0xb79454,metalness:.74,roughness:.35}));
        const brown=own(new T.MeshStandardMaterial({map:mountMap,roughness:.95,side:T.DoubleSide}));
        const bandMaterial=own(new T.MeshStandardMaterial({map:bandMap,roughness:.85,side:T.DoubleSide,clippingPlanes:planes}));
        const mesh=(geometry,material,x=0,y=0,z=0)=>{const m=new T.Mesh(own(geometry),material);m.position.set(x,y,z);m.receiveShadow=true;m.frustumCulled=false;return m;};
        const cloth=mesh(new T.PlaneGeometry(half*2,1.18,100,12),cream,0,0,0);cloth.userData.width=half*2;scene.add(cloth);surfaces.push(cloth);
        picture=mesh(new T.PlaneGeometry(aspect,1,100,12),own(new T.MeshBasicMaterial({map:imageMap,side:T.DoubleSide,clippingPlanes:planes})),0,0,.008);
        picture.userData.width=aspect;scene.add(picture);surfaces.push(picture);
        for(const sign of [-1,1]){
          scene.add(mesh(new T.PlaneGeometry(half*2,.066),bandMaterial,0,sign*.55,.018));
          const edge=mesh(new T.BoxGeometry(half*2,.012,.012),bronze,0,sign*.59,.008);edge.material=own(bronze.clone());edge.material.clippingPlanes=planes;scene.add(edge);
        }
        rollers=[-1,1].map(sign=>{
          const group=new T.Group();scene.add(group);
          const rod=mesh(new T.CylinderGeometry(.061,.064,1.23,48),wood);group.add(rod);
          for(const y of [-.64,.64]){
            group.add(mesh(new T.CylinderGeometry(.075,.075,.092,48),bronze,0,y,0));
            const finial=mesh(new T.SphereGeometry(.053,24,16),bronze,0,y+Math.sign(y)*.085,0);finial.scale.y=.8;group.add(finial);
            for(const dy of [-.035,.035]){const ring=mesh(new T.TorusGeometry(.076,.005,8,48),bronze,0,y+dy,0);ring.rotation.x=Math.PI/2;group.add(ring);}
          }
          // Mounting sits next to the roller, so it does not rotate like the wood spindle.
          const mount=mesh(new T.PlaneGeometry(.19,1.04),brown,sign*(half-.11),0,.012);scene.add(mount);mount.userData.sign=sign;mounts.push(mount);
          group.traverse(part=>{if(part.isMesh)part.castShadow=true;});return group;
        });
        const receiver=mesh(new T.PlaneGeometry(half*2+1,2.2),own(new T.ShadowMaterial({opacity:.065})),0,-.025,-.06);receiver.castShadow=false;scene.add(receiver);
        resize=new ResizeObserver(()=>{
          if(!alive)return;const box=host.getBoundingClientRect(),ratio=Math.max(1,box.width)/Math.max(1,box.height);
          renderer.setSize(Math.max(1,box.width),Math.max(1,box.height),false);
          const viewWidth=opening?Math.max(half*2+.24,1.62*ratio):Math.max(half*2+.36,1.72*ratio),viewHeight=viewWidth/ratio;
          camera.left=-viewWidth/2;camera.right=viewWidth/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.updateProjectionMatrix();
          latest.current.onRect?.({left:(.5-aspect/viewWidth/2)*100,top:(.5-1/viewHeight/2)*100,width:aspect/viewWidth*100,height:1/viewHeight*100});
          render();
        });resize.observe(host);
        visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)update();else stop();});visibility.observe(host);
        ready=true;el.dataset.engine=`three.js r${T.REVISION}`;el.dataset.parts='silk,painting,wood-rollers,bronze-caps,mounting,shadow';
        age=latest.current.reduced||latest.current.paused||performance.now()-started>1500?duration:0;paper(age/duration);applyView();
        render();setStatus('ready');update();
        host.addEventListener('pointermove',pointerMove,{passive:true});document.addEventListener('visibilitychange',changed);el.addEventListener('webglcontextlost',lost);
        controls.current={update};
      }catch{
        if(alive){ready=false;stop();setStatus('fallback');latest.current.onOpened?.();}
      }
    }
    start();
    return()=>{alive=false;stop();controls.current=null;resize?.disconnect();visibility?.disconnect();host.removeEventListener('pointermove',pointerMove);document.removeEventListener('visibilitychange',changed);el.removeEventListener('webglcontextlost',lost);for(const item of disposable)item.dispose();renderer?.dispose();renderer?.forceContextLoss();};
  },[src,duration]);
  return <div ref={root} className={`v3-scroll-art ${opening?'v3-scroll-art--opening':''}`} data-status={status}>
    <div className="v3-scroll-fallback"><img className="v3-fallback-frame" src={previewFor('frame.webp')} alt=""/><Painting key={src} src={src} alt={alt} imageRef={original}/></div>
    <canvas ref={canvas} aria-hidden="true" data-progress="0" data-frame="0" data-running="false"/>
  </div>;
}
