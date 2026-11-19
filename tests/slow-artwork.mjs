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
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      assert.deepEqual(errors,[]);
      console.log('PASS '+width+'px: delayed image, failed image, detail retry and next scene');
    }finally{release();await page.close();}
  }
}finally{await browser.close();}
