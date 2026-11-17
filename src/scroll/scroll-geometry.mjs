// Curved silk immediately inside each moving roller; the original UV grid is never stretched.
export function unfoldPoint(x,progress,width) {
  if(progress>=1)return [x,0];
  const edge=Math.max(.015,progress)*width/2,distance=edge-Math.abs(x),curl=.16;
  if(distance<0||distance>curl)return [x,0];
  const amount=Math.sin(Math.PI*distance/curl)*(1-progress);
  return [x+Math.sign(x)*amount*.012,amount*.055];
}
