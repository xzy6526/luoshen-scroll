import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.LUOSHEN_READING_URL||'http://127.0.0.1:5190/';
const browser=await chromium.launch({channel:'msedge'});
try{
  for(const width of [1280,390]){
    const page=await browser.newPage({viewport:{width,height:844},hasTouch:width===390,deviceScaleFactor:width===390?3:1});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    let release;
    const held=new Promise(resolve=>{release=resolve;});
    const stopDownload=async route=>{await held;await route.abort();};
    const sceneArt=['**/art-fast/06.avif','**/art/06.webp'];
    try{
      for(const pattern of sceneArt)await page.route(pattern,stopDownload);
      await page.goto(base+'#scene-06',{waitUntil:'domcontentloaded'});
      const medium=page.locator('.v3-scroll-fallback .v3-medium[data-ready=true]');
      await medium.waitFor();
      assert.equal(await medium.evaluate(img=>img.naturalWidth),1080);
      assert.equal(await medium.evaluate(img=>getComputedStyle(img).opacity),'1');
      await page.getByRole('button',{name:/近观画中细节/}).click();
      const detail=page.locator('.v3-detail-dialog[open]');
      const detailedArt=detail.locator('.v3-original');
      const zoomIn=detail.getByRole('button',{name:'放大画卷'});
      await detail.getByText('正在加载清晰原画…',{exact:true}).waitFor();
      assert.equal(await detail.locator('img').count(),1);
      assert.ok(await detailedArt.isHidden());
      assert.ok(await zoomIn.isDisabled());
      release();
      const retry=page.getByRole('button',{name:/重新加载高清原画/});
      await retry.waitFor();
      assert.ok(await detailedArt.isHidden());
      for(const pattern of sceneArt)await page.unroute(pattern,stopDownload);
      if(width===1280)await page.route(sceneArt[0],route=>route.abort());
      await retry.click();
      await detailedArt.waitFor();
      const native=await detailedArt.evaluate(img=>[img.naturalWidth,img.naturalHeight,new URL(img.currentSrc).pathname]);
      assert.deepEqual(native.slice(0,2),[2075,758]);
      assert.ok(native[2].endsWith(width===1280?'/art/06.webp':'/art-fast/06.avif'));
      for(let i=0;i<8&&await zoomIn.isEnabled();i++)await zoomIn.click();
      assert.ok(await zoomIn.isDisabled());
      assert.ok(await detailedArt.evaluate(img=>img.getBoundingClientRect().width*devicePixelRatio<=img.naturalWidth+1));
      await detail.getByRole('button',{name:'回到全卷',exact:true}).click();
      assert.equal(await detail.locator('.v3-zoom-controls>span').innerText(),'100%');
      await page.getByRole('button',{name:'关闭近观'}).click();
      await page.locator('.v3-footer').getByRole('button',{name:/第.*景 停驻洛川/}).click();
      await page.waitForURL(/scene-03$/);
      await page.waitForFunction(()=>{
        const scene=document.querySelector('.v3-app'),art=scene?.querySelector('.v3-scroll-art');
        return scene?.dataset.scene==='3'&&art?.dataset.status==='ready'&&art.dataset.flat==='true';
      });
      const original=page.locator('.v3-scroll-fallback .v3-original');
      assert.ok(await original.evaluate(img=>{
        const box=img.getBoundingClientRect();
        return getComputedStyle(img).opacity==='1'&&getComputedStyle(img.closest('.v3-scroll-fallback')).opacity==='1'&&
          Math.abs(box.width/box.height-img.naturalWidth/img.naturalHeight)<.02;
      }));
      if(width===1280){
        const canvas=page.locator('.v3-scroll-art canvas'),box=await canvas.boundingBox();
        await page.waitForFunction(()=>document.querySelector('.v3-scroll-art canvas').dataset.running==='false');
        const frame=await canvas.getAttribute('data-frame');
        await page.mouse.move(box.x+25,box.y+60);
        await page.mouse.move(box.x+180,box.y+60,{steps:12});
        assert.equal(await canvas.getAttribute('data-frame'),frame);
      }
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
