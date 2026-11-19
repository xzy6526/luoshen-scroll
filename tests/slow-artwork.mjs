import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.LUOSHEN_READING_URL||'http://127.0.0.1:5190/';
const browser=await chromium.launch({channel:'msedge'});
try{
  for(const width of [1280,390]){
    const page=await browser.newPage({viewport:{width,height:844},hasTouch:width===390});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    let release;
    const held=new Promise(resolve=>{release=resolve;});
    const stopDownload=async route=>{await held;await route.abort();};
    const checkPreview=async selector=>{
      const preview=page.locator(selector+' .v3-preview');
      await preview.evaluate(img=>img.decode());
      assert.ok(await preview.evaluate(img=>{
        const box=img.getBoundingClientRect();
        return img.src.startsWith('data:image/')&&img.naturalWidth>=300&&box.width>100&&box.height>40&&
          getComputedStyle(img.closest('.v3-scroll-fallback')||img).opacity==='1';
      }));
    };
    try{
      await page.route('**/art/02.webp',stopDownload);
      await page.goto(base+'#scene-02',{waitUntil:'domcontentloaded'});
      await checkPreview('.v3-scroll-fallback');
      await page.getByRole('button',{name:/近观画中细节/}).click();
      await checkPreview('.v3-zoom-window');
      release();
      const retry=page.getByRole('button',{name:/重新加载高清原画/});
      await retry.waitFor();
      await checkPreview('.v3-zoom-window');
      await page.unroute('**/art/02.webp',stopDownload);
      await retry.click();
      await page.locator('.v3-zoom-window [data-image-status=ready]').waitFor();
      assert.ok(await page.locator('.v3-zoom-window .v3-original').evaluate(img=>img.naturalWidth>1000));
      await page.getByRole('button',{name:'关闭近观'}).click();
      await page.getByRole('button',{name:/续卷/}).click();
      await page.waitForURL(/scene-03$/);
      await page.waitForFunction(()=>document.querySelector('.v3-scroll-art')?.dataset.status==='ready');
      await page.waitForFunction(()=>document.querySelector('.v3-scroll-art canvas').dataset.progress==='1.0000');
      const colorDifference=await page.evaluate(()=>{
        const frame=document.querySelector('.v3-scroll-art canvas'),art=document.querySelector('.v3-original');
        const aspect=art.naturalWidth/art.naturalHeight;
        const worldWidth=Math.max(aspect+.78,1.72*frame.clientWidth/frame.clientHeight);
        const pixelsPerUnit=frame.width/worldWidth;
        const tile=document.createElement('canvas');tile.width=64;tile.height=24;
        const ctx=tile.getContext('2d',{willReadFrequently:true});
        ctx.drawImage(art,0,0,64,24);
        const expected=ctx.getImageData(0,0,64,24).data;
        ctx.clearRect(0,0,64,24);
        ctx.drawImage(frame,(frame.width-aspect*pixelsPerUnit)/2,(frame.height-pixelsPerUnit)/2,
          aspect*pixelsPerUnit,pixelsPerUnit,0,0,64,24);
        const actual=ctx.getImageData(0,0,64,24).data;
        return actual.reduce((sum,value,i)=>sum+Math.abs(value-expected[i]),0)/actual.length;
      });
      assert.ok(colorDifference<10,'rendered painting must match the full original: '+colorDifference);
      const canvas=await page.locator('.v3-scroll-art canvas').elementHandle();
      await page.getByRole('button',{name:/续卷/}).click();
      await page.waitForURL(/scene-04$/);
      await page.waitForFunction(()=>document.querySelector('.v3-app').dataset.scene==='4'&&document.querySelector('.v3-scroll-art').dataset.status==='ready');
      assert.ok(await canvas.evaluate(el=>el===document.querySelector('.v3-scroll-art canvas')&&!el.getContext('webgl2').isContextLost()));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      assert.deepEqual(errors,[]);
      console.log('PASS '+width+'px: delayed image, failed image, detail retry and next scene');
    }finally{release();await page.close();}
  }
}finally{await browser.close();}
