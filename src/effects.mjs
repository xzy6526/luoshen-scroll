export const effectMasks = {
  1:['01-water'],2:['02-fog'],3:['03-water'],5:['05-water'],6:['06-water'],8:['08-water'],9:['09-water'],11:['11-water','11-fog'],12:['12-water','12-candle'],13:['13-fog'],14:['14-water'],
};

export function paintEffect(ctx, id, kind, time, pulse=0) {
  const w=ctx.canvas.width,h=ctx.canvas.height;
  if(kind==='fog') {
    ctx.filter='blur(9px)';
    ctx.fillStyle='rgba(238,221,184,.15)';
    for(let i=0;i<8;i++) {
      const x=(i*.145+.06+Math.sin(time/18+i)*.035)*w;
      const y=(.44+Math.sin(i*1.7+time/26)*.04)*h;
      ctx.beginPath();ctx.ellipse(x,y,w*.15,h*.022,0,0,Math.PI*2);ctx.fill();
    }
    ctx.filter='none'; return;
  }
  if(kind==='candle') {
    for(const [x,y] of [[765/2075,361/758],[916/2075,386/758]]) {
      const r=8+Math.sin(time*3.2+x*10)*1.4;
      const glow=ctx.createRadialGradient(x*w,y*h,0,x*w,y*h,r);
      glow.addColorStop(0,`rgba(255,229,159,${.13+Math.sin(time*2.4)*.035})`);glow.addColorStop(1,'rgba(255,229,159,0)');
      ctx.fillStyle=glow;ctx.fillRect(x*w-r,y*h-r,r*2,r*2);
    }
    return;
  }
  ctx.lineWidth=.7;
  for(let i=0;i<19;i++) {
    ctx.strokeStyle=`rgba(248,221,166,${.065+(.5+.5*Math.sin(time*.8+i*1.6))*.12})`;
    const y=(.54+i*.023)*h;
    ctx.beginPath();
    for(let x=0;x<=w;x+=16) {
      const dy=Math.sin(x*.022-time*.5+i)*.75;
      if(x===0)ctx.moveTo(x,y+dy);else ctx.lineTo(x,y+dy);
    }
    ctx.stroke();
  }
  if(id===8 || (id===6 && pulse>0 && pulse<3)) {
    for(let i=0;i<3;i++) {
      const progress=((time*.13+i/3)%1);
      const x=(id===8?.648:.51)*w,y=(id===8?.852:.79)*h;
      ctx.strokeStyle=`rgba(249,225,177,${(1-progress)*.28})`;
      ctx.lineWidth=.9;
      ctx.beginPath();ctx.ellipse(x,y,(.018+progress*.115)*w,(.006+progress*.055)*h,0,0,Math.PI*2);ctx.stroke();
    }
  }
}
