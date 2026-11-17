import test from 'node:test';
import assert from 'node:assert/strict';
import { PlaneGeometry } from 'three';
import { sceneFolds, foldPoint, applyFold } from '../src/fold-motion.mjs';

test('十四景折面均完整展平，所有中间态有限且有明显区别',()=>{
  assert.equal(sceneFolds.length,14);
  assert.equal(new Set(sceneFolds.map(f=>f.key)).size,14);
  const signatures=new Set();
  for(const fold of sceneFolds){
    const signature=[];
    for(const u of [0,.15,.4,.7,1])for(const v of [0,.2,.65,1]){
      const flat=foldPoint(fold.kind,u,v,1,2.74);
      assert.ok(Math.abs(flat[0]-(u-.5)*2.74)<1e-9&&Math.abs(flat[1]-(v-.5))<1e-9&&flat[2]===0,fold.key+'终态不能变形');
      for(const progress of [0,.2,.5,.8])assert.ok(foldPoint(fold.kind,u,v,progress,2.74).every(Number.isFinite));
      signature.push(...foldPoint(fold.kind,u,v,.35,2.74).map(x=>x.toFixed(3)));
    }
    signatures.add(signature.join(','));
  }
  assert.equal(signatures.size,14,'不同景不能只改折法名字');
});

test('折痕两侧相连，不把原画切成漂浮碎片',()=>{
  for(const f of sceneFolds)for(const p of [.15,.5,.85])for(let i=1;i<40;i++){
    const u=i/40,v=(i%7)/7;
    for(const [du,dv] of [[1e-6,0],[0,1e-6]]){
      const a=foldPoint(f.kind,u-du,v-dv,p,2.74),b=foldPoint(f.kind,u+du,v+dv,p,2.74);
      assert.ok(Math.hypot(...a.map((x,j)=>x-b[j]))<.001,f.key+'折面断裂');
    }
  }
});

test('实际Three网格展平回原尺寸，所有UV保持原样',()=>{
  const geometry=new PlaneGeometry(2.74*1.11,1.11,96,32);
  const original=geometry.attributes.position.array.slice(),uv=geometry.attributes.uv.array.slice();
  for(const f of sceneFolds){
    applyFold(geometry,f.kind,.3,2.74);applyFold(geometry,f.kind,1,2.74);
    assert.ok(geometry.attributes.position.array.every((x,i)=>Math.abs(x-original[i])<1e-6));
    assert.deepEqual(geometry.attributes.uv.array,uv);
  }
  geometry.dispose();
});
