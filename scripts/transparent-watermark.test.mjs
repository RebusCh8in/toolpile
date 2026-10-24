import assert from 'node:assert/strict';
import {test} from 'node:test';
import {estimateTransparentWatermark,undoTransparentWatermark} from '../public/video-lab/transparent-watermark.mjs';
const width=96,height=64,n=width*height;
let seed=123;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function fixture(marked=true, stationary=false){
 const mask=new Uint8Array(n).fill(255);for(let y=10;y<54;y++)mask.fill(0,y*width+10,y*width+86);
 const clean=Array.from({length:40},()=>Uint8Array.from({length:n},()=>Math.round(20+random()*140)));
 if(stationary)for(let i=1;i<40;i++)clean[i]=clean[0].slice();
 const samples=clean.map(frame=>frame.map((v,i)=>{const x=i%width,y=Math.floor(i/width);return marked && y>18 && y<45 && ((x>25&&x<30)||(x>50&&x<55)||(y>29&&y<34&&x>25&&x<55))?Math.round(v*.65+255*.35):v;}));
 return {mask,clean,samples};
}
test('translucent strokes recover real texture more accurately than the marked input',()=>{
 const {mask,clean,samples}=fixture();const alpha=estimateTransparentWatermark(samples,width,height,mask);assert.ok(alpha);
 let before=0,after=0;
 for(let f=0;f<40;f++){
 const rgb=Uint8Array.from({length:n*3},(_,i)=>samples[f][Math.floor(i/3)]);undoTransparentWatermark(rgb,alpha);
 for(let i=0;i<n;i++) {before+=(samples[f][i]-clean[f][i])**2;after+=(rgb[i*3]-clean[f][i])**2;if(mask[i])assert.equal(rgb[i*3],samples[f][i]);}
 }
 assert.ok(after<before*.15,`error ratio ${after/before}`);
});
test('unmarked moving texture does not activate inverse blending',()=>{const {mask,samples}=fixture(false);assert.equal(estimateTransparentWatermark(samples,width,height,mask),null);});
test('static scenery and insufficient evidence fall back to inpainting',()=>{const {mask,samples}=fixture(false,true);assert.equal(estimateTransparentWatermark(samples,width,height,mask),null);assert.equal(estimateTransparentWatermark(samples.slice(0,8),width,height,mask),null);});
