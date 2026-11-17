import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters } from '../src/content.mjs';
import { demoScenes } from '../src/scroll/scene-config.mjs';
import { unfoldPoint } from '../src/scroll/scroll-geometry.mjs';

test('完整十四景顺序连续，环境及叙事配置覆盖每幅原画',()=>{
  assert.deepEqual(demoScenes.map(s=>s.id),Array.from({length:14},(_,i)=>i+1));
  assert.equal(demoScenes.length,14);assert.ok(new Set(demoScenes.map(s=>s.layout)).size>=10);
  for(const s of demoScenes){assert.ok(chapters[s.id-1].paragraphs.length);assert.ok(s.meaning);assert.ok(s.atlas>=0&&s.atlas<=5);assert.ok((s.hotspots||[]).every(h=>h.x>=0&&h.x<=1&&h.y>=0&&h.y<=1));if(s.passages)assert.equal(s.passages.length,chapters[s.id-1].paragraphs.length);}
});
test('展开终态保留所有画心坐标，卷口弯曲有限且中线连续',()=>{
  for(let i=0;i<=100;i++){
    const x=i/100*2.74-1.37;
    assert.deepEqual(unfoldPoint(x,1,2.74),[x,0]);
    for(const progress of [0,.1,.4,.8])assert.ok(unfoldPoint(x,progress,2.74).every(Number.isFinite));
  }
  assert.ok(Math.hypot(...unfoldPoint(-1e-8,.4,2.74))<1e-6);
});
