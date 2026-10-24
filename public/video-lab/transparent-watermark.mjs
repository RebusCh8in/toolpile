// Estimate a stationary translucent white overlay from changing backgrounds.
// This is deliberately conservative: opaque/animated marks use normal inpainting.
function extrema(input, width, height, radius, maximum) {
  const temp = new Float32Array(input.length), out = new Float32Array(input.length);
  for (let y=0;y<height;y++) for(let x=0;x<width;x++) {
    let v=maximum ? -Infinity : Infinity;
    for(let k=Math.max(0,x-radius);k<=Math.min(width-1,x+radius);k++) v=maximum?Math.max(v,input[y*width+k]):Math.min(v,input[y*width+k]);
    temp[y*width+x]=v;
  }
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    let v=maximum ? -Infinity : Infinity;
    for(let k=Math.max(0,y-radius);k<=Math.min(height-1,y+radius);k++) v=maximum?Math.max(v,temp[k*width+x]):Math.min(v,temp[k*width+x]);
    out[y*width+x]=v;
  }
  return out;
}
function estimate(samples, width, height, mask) {
  const n=width*height, low=new Float32Array(n), spread=new Float32Array(n);
  const values=new Float32Array(samples.length);
  for(let i=0;i<n;i++) {
    for(let f=0;f<samples.length;f++) values[f]=samples[f][i];
    values.sort();low[i]=values[Math.floor((samples.length-1)*.1)];
    spread[i]=values[Math.floor((samples.length-1)*.8)]-values[Math.floor((samples.length-1)*.2)];
  }
  const background=extrema(extrema(low,width,height,8,false),width,height,8,true);
  const alpha=new Float32Array(n);
  for(let i=0;i<n;i++) if(mask[i]===0) alpha[i]=Math.max(0,Math.min(.65,(low[i]-background[i])/Math.max(1,255-background[i])));
  return {alpha,spread};
}
export function estimateTransparentWatermark(samples, width, height, mask) {
  if(samples.length<16 || samples.some(s=>s.length!==width*height)) return null;
  const {alpha,spread}=estimate(samples,width,height,mask);
  // Independent temporal samples must agree on the same strokes. Ordinary
  // moving highlights are not a reusable watermark template.
  const a=estimate(samples.filter((_,i)=>i%2===0),width,height,mask).alpha;
  const b=estimate(samples.filter((_,i)=>i%2===1),width,height,mask).alpha;
  let selected=0,strong=0,agreement=0,variation=0,opaque=0;
  for(let i=0;i<alpha.length;i++) {
    if(mask[i]===0) selected++;
    if(alpha[i]>.6) opaque++;
    if(alpha[i]>.12) {strong++;agreement+=Math.abs(a[i]-b[i]);variation+=spread[i];}
  }
  if(opaque>strong*.05 || strong<20 || strong/selected<.015 || strong/selected>.6 || agreement/strong>.065 || variation/strong<12) return null;
  // Remove isolated texture responses; keep antialiased edges next to strokes.
  const seen=new Uint8Array(alpha.length), support=new Uint8Array(alpha.length);
  for(let i=0;i<alpha.length;i++) {
    if(seen[i] || alpha[i]<=.12) continue;
    const component=[i];seen[i]=1;
    for(let j=0;j<component.length;j++) {
      const p=component[j], x=p%width;
      for(const q of [x>0?p-1:-1,x<width-1?p+1:-1,p-width,p+width]) {
        if(q>=0 && q<alpha.length && !seen[q] && alpha[q]>.12) {seen[q]=1;component.push(q);}
      }
    }
    if(component.length>=8) for(const p of component) support[p]=1;
  }
  const expanded=extrema(support,width,height,1,true);
  for(let i=0;i<alpha.length;i++) alpha[i]=expanded[i] && mask[i]===0 ? Math.max(0,Math.min(.65,(alpha[i]-.015)*1.08)) : 0;
  return alpha;
}
export function undoTransparentWatermark(pixels, alpha) {
  for(let i=0;i<alpha.length;i++) {
    const a=alpha[i];if(!a) continue;
    for(let c=0;c<3;c++) pixels[i*3+c]=Math.round(Math.max(0,Math.min(255,(pixels[i*3+c]-255*a)/(1-a))));
  }
  return pixels;
}
