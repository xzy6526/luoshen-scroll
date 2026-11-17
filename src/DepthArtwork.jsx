import React, { useEffect, useRef } from 'react';
import { sceneFolds, applyFold } from './fold-motion.mjs';

// Continuous shallow relief: original UVs stay intact; no inferred hidden imagery.
export default function DepthArtwork({ src, id, paused, mode, silk=false, design, resting=false, previousSrc }) {
  const canvas = useRef(null), controls = useRef(null);
  const pausedRef = useRef(paused);
  const restingRef = useRef(resting);
  pausedRef.current = paused;
  restingRef.current = resting;
  useEffect(() => { controls.current?.refresh(); }, [paused,resting]);

  useEffect(() => {
    const el = canvas.current, host = el.parentElement;
    const fold=silk?sceneFolds[id-1]:null;
    let alive=true, visible=true, lost=false, raf=0, renderer, geometry, material, texture, previousTexture, effectsTexture, edgeTexture, fogTexture, resize, observer, context;
    const atmosphere=[];
    let age=0, last=0, painted=0, frame=0, ready=false,foldFinished=false;
    const target={x:0,y:0}, pointer={x:0,y:0};
    const enabled=()=>alive && ready && visible && !document.hidden && !pausedRef.current && !lost;
    const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;el.dataset.running='false';};
    const refresh=()=>{
      if(fold&&(pausedRef.current||restingRef.current))age=Math.max(age,fold.duration);
      el.dataset.active=String(enabled()&&frame>0);
      const shouldDraw=enabled()&&(!restingRef.current||(fold&&!foldFinished));
      if(shouldDraw&&!raf)raf=requestAnimationFrame(draw);
      else if(!shouldDraw)stop();
    };
    const move=event=>{
      if(event.pointerType!=='mouse')return;
      const r=host.getBoundingClientRect();
      target.x=(event.clientX-r.left)/r.width*2-1;
      target.y=(event.clientY-r.top)/r.height*2-1;
    };
    const leave=()=>{target.x=0;target.y=0;};
    const contextLost=event=>{event.preventDefault();lost=true;el.dataset.status='fallback';refresh();};
    controls.current={refresh};
    let scene,camera,mesh;
    function draw(now) {
      raf=0;
      if(!enabled()||(restingRef.current&&(!fold||foldFinished)))return;
      if(now-painted<32){raf=requestAnimationFrame(draw);return;}
      painted=now;
      const dt=last?Math.min((now-last)/1000,.05):0;last=now;age+=dt;
      const amount=mode==='dream'?1.7:1;
      const ease=1-Math.exp(-dt*5);
      pointer.x+=(target.x-pointer.x)*ease;pointer.y+=(target.y-pointer.y)*ease;
      const entrance=Math.exp(-age*1.7);
      if(silk){
        camera.position.set(0,0,2.05);camera.lookAt(0,0,0);mesh.rotation.y=0;
        material.uniforms.uProgress.value=Math.min(1,age/(design?.duration||1.3));
        if(fold&&!foldFinished){
          const progress=Math.min(1,age/fold.duration);
          applyFold(geometry,fold.kind,progress,material.uniforms.uAspect.value);
          el.dataset.foldProgress=progress.toFixed(4);
          foldFinished=progress===1;
        }
        for(let i=0;i<atmosphere.length;i++){
          atmosphere[i].position.x=pointer.x*(i+1)*.012;
          atmosphere[i].position.y=pointer.y*(i+1)*.004;
          atmosphere[i].material.opacity=(i? .075:.045)*(1-Math.exp(-age*.8));
        }
      }else{
        camera.position.x=(pointer.x*.065+Math.sin(age*.32)*.009)*amount;
        camera.position.y=(-pointer.y*.025+Math.cos(age*.28)*.004)*amount;
        camera.position.z=2.05+entrance*.27;camera.lookAt(0,0,0);mesh.rotation.y=entrance*-.055;
      }
      if(effectsTexture)effectsTexture.needsUpdate=true;
      renderer.render(scene,camera);
      el.dataset.frame=String(++frame);el.dataset.running='true';el.dataset.active='true';
      if(restingRef.current)stop();else raf=requestAnimationFrame(draw);
    }
    async function start() {
      try {
        // WebGL is native; unavailable contexts retain the semantic HTML image.
        context=el.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:true});
        if(!context){el.dataset.status='fallback';return;}
        const T=await import('three');
        if(!alive)return;
        el.dataset.engine=`three.js r${T.REVISION}`;
        renderer=new T.WebGLRenderer({canvas:el,context,alpha:true,antialias:true});
        renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
        renderer.setClearColor(0x000000,0);
        renderer.outputColorSpace=T.SRGBColorSpace;
        texture=await new T.TextureLoader().loadAsync(src);
        if(!alive){texture.dispose();return;}
        texture.colorSpace=T.SRGBColorSpace;
        texture.minFilter=T.LinearFilter;
        const aspect=texture.image.width/texture.image.height;
        scene=new T.Scene();camera=new T.PerspectiveCamera(31,aspect,.1,20);
        geometry=new T.PlaneGeometry(aspect*(silk?1.11:1),silk?1.11:1,fold?96:silk?1:100,fold?32:silk?1:48);
        const p=geometry.attributes.position, uv=geometry.attributes.uv;
        for(let i=0;i<p.count;i++) {
          const x=uv.getX(i),y=uv.getY(i);
          const shore=Math.pow(1-y,2)*.055;
          const ridge=Math.exp(-Math.pow((x-.18)/.24,2)-Math.pow((y-.52)/.48,2))*.045;
          const figure=[4,5,6,8,10,14].includes(id)?Math.exp(-Math.pow((x-.68)/.18,4)-Math.pow((y-.46)/.44,4))*.06:0;
          if(!silk)p.setZ(i,shore+ridge+figure);
        }
        geometry.computeVertexNormals();
        effectsTexture=new T.CanvasTexture(host.querySelector('.art-effects'));
        effectsTexture.colorSpace=T.SRGBColorSpace;
        if(silk){
          const loader=new T.TextureLoader();
          if(!fold&&previousSrc&&previousSrc!==src){
            previousTexture=await loader.loadAsync(previousSrc);
            if(!alive){previousTexture.dispose();return;}
            previousTexture.colorSpace=T.SRGBColorSpace;
          }
          edgeTexture=await loader.loadAsync('materials/silk-edge.png');
          if(!alive){edgeTexture.dispose();return;}
          fogTexture=await loader.loadAsync('materials/original-mist.webp');
          if(!alive){fogTexture.dispose();return;}
          fogTexture.colorSpace=T.SRGBColorSpace;
          for(let i=0;i<2;i++){
            const plane=new T.Mesh(new T.PlaneGeometry(aspect*1.18,1.16),new T.MeshBasicMaterial({map:fogTexture,transparent:true,opacity:0,depthWrite:false}));
            plane.position.z=i?.075:-.09;scene.add(plane);atmosphere.push(plane);
          }
        }
        material=new T.ShaderMaterial({transparent:true,side:fold?T.DoubleSide:T.FrontSide,uniforms:{uImage:{value:texture},uPrevious:{value:previousTexture||texture},uHasPrevious:{value:previousTexture?1:0},uEffects:{value:effectsTexture},uAspect:{value:aspect},uEdge:{value:edgeTexture||texture},uSilk:{value:silk?1:0},uPaper:{value:fold?1:0},uProgress:{value:0},uReveal:{value:design?.reveal==='mist'?1:0}},
          vertexShader:'varying vec2 vUv;varying vec3 vPaperPosition;void main(){vUv=uv;vPaperPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
          fragmentShader:`uniform sampler2D uImage;uniform sampler2D uPrevious;uniform float uHasPrevious;uniform sampler2D uEffects;uniform sampler2D uEdge;uniform float uAspect;uniform float uSilk;uniform float uPaper;uniform float uProgress;uniform float uReveal;varying vec2 vUv;varying vec3 vPaperPosition;
            float wave(vec2 p){return .5+.22*sin(p.x*21.+p.y*9.)+.14*sin(p.y*33.-p.x*17.)+.09*sin(p.x*67.+p.y*43.);}
            void main(){vec4 col=texture2D(uImage,vUv);vec4 effect=texture2D(uEffects,vUv);col.rgb=mix(col.rgb,effect.rgb,effect.a);vec2 edge=min(vUv,1.0-vUv);
              vec2 q=abs(vUv-.5)*vec2(uAspect,1.)-vec2(uAspect*.5-.035,.465);
              float distance=length(max(q,0.))+min(max(q.x,q.y),0.)-.035;
              float alpha=(1.-smoothstep(-.012,0.,distance))*smoothstep(0.0,0.008,edge.x)*smoothstep(0.0,0.015,edge.y);
              if(uSilk>.5){float boundary=mix(vUv.x*.75+wave(vUv)*.25,wave(vUv),uReveal);float reveal=smoothstep(boundary-.19,boundary+.19,uProgress*1.45-.18);float edgeAlpha=texture2D(uEdge,vUv).a;if(uHasPrevious>.5){col.rgb=mix(texture2D(uPrevious,vUv).rgb,col.rgb,reveal);alpha=edgeAlpha;}else{alpha=edgeAlpha*reveal;}}
              if(uPaper>.5){
                vec3 normal=normalize(cross(dFdx(vPaperPosition),dFdy(vPaperPosition)));
                float shade=.64+.36*abs(normal.z);
                float rim=smoothstep(-.006,-.003,distance);
                vec3 paper=vec3(.80,.72,.57);
                col.rgb=(gl_FrontFacing?mix(col.rgb,paper,rim):paper)*shade;
                alpha=1.-smoothstep(-.002,0.,distance);
              }
              gl_FragColor=vec4(col.rgb,alpha);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
            }`});
        mesh=new T.Mesh(geometry,material);if(fold)mesh.frustumCulled=false;scene.add(mesh);
        resize=new ResizeObserver(()=>{if(!alive)return;const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();if(enabled())renderer.render(scene,camera);});
        resize.observe(host);
        observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();});observer.observe(host);
        host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);
        document.addEventListener('visibilitychange',refresh);
        el.addEventListener('webglcontextlost',contextLost);
        ready=true;el.dataset.status='ready';el.dataset.layers=silk?'original,far-mist,near-mist':'relief';el.dataset.transition=fold?`fold-${fold.key}`:previousTexture?'organic-blend':'reveal';if(fold){el.dataset.fold=fold.key;el.dataset.foldProgress='0';}refresh();
      } catch {if(alive){el.dataset.status='fallback';stop();}}
    }
    start();
    return ()=>{
      alive=false;stop();controls.current=null;
      resize?.disconnect();observer?.disconnect();
      host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);
      document.removeEventListener('visibilitychange',refresh);el.removeEventListener('webglcontextlost',contextLost);
      for(const plane of atmosphere){plane.geometry.dispose();plane.material.dispose();}
      geometry?.dispose();material?.dispose();texture?.dispose();previousTexture?.dispose();effectsTexture?.dispose();edgeTexture?.dispose();fogTexture?.dispose();renderer?.dispose();renderer?.forceContextLoss();
      if(!renderer)context?.getExtension('WEBGL_lose_context')?.loseContext();
    };
  },[src,id,mode,silk]);
  return <canvas ref={canvas} className="depth-art" data-status="loading" data-active="false" data-running="false" data-frame="0" aria-hidden="true" />;
}
