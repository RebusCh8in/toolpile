import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

// Exercise the real worker message handler with only the costly model loader
// replaced. Smooth-only work must not load a model, and a CPU fallback must
// remain reusable instead of retrying the failed GPU initialization each run.
test('worker loads once and reuses a successful CPU fallback across requests', async () => {
  const attempts = [];
  const messages = [];
  const self = { navigator: { gpu: {} }, postMessage: value => messages.push(value) };
  const ort = {
    env: { wasm: {} },
    InferenceSession: { create: async (_path, options) => {
      attempts.push(options.executionProviders);
      if (options.executionProviders.includes('webgpu')) throw new Error('GPU unavailable');
      return {};
    } },
  };
  const source = readFileSync(new URL('../public/video-lab/inpaint-worker.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '');
  runInNewContext(source, { self, ort });
  await self.onmessage({ data: { kind: 'load', smooth: true, preferGpu: true } });
  assert.equal(attempts.length, 0);
  for (let i = 0; i < 3; i++) await self.onmessage({ data: { kind: 'load', smooth: false, preferGpu: true } });
  assert.deepEqual(attempts.map(x => Array.from(x)), [['webgpu', 'wasm'], ['wasm']]);
  assert.equal(messages[0].backend, 'Smooth background (local)');
  assert.ok(messages.slice(1).every(message => message.backend === 'CPU (WASM)'));
});

test('large RGB crops resize through valid RGBA ImageData and return full-size pixels', async () => {
  const messages=[];
  const self={navigator:{},postMessage:value=>messages.push(value)};
  class ImageData {constructor(data,width,height){assert.equal(data.length,width*height*4);this.data=data;}}
  class OffscreenCanvas {constructor(width,height){this.width=width;this.height=height;}getContext(){return {putImageData(){},drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(this.width*this.height*4)})};}}
  const session={outputNames:['output'],run:async ({image})=>({output:{type:'uint8',data:new Uint8Array(image.data.length),dispose(){}}})};
  const ort={env:{wasm:{}},InferenceSession:{create:async()=>session},Tensor:class {constructor(type,data){this.data=data;}dispose(){}}};
  const {repairWeights,blendRepair}=await import('../public/video-lab/blend-repair.mjs');
  const source=readFileSync(new URL('../public/video-lab/inpaint-worker.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  runInNewContext(source,{self,ort,ImageData,OffscreenCanvas,repairWeights,blendRepair});
  await self.onmessage({data:{kind:'load',preferGpu:false}});
  await self.onmessage({data:{width:600,height:200,pixels:new Uint8Array(600*200*3),mask:new Uint8Array(600*200).fill(255)}});
  assert.equal(messages.at(-1).error,undefined);
  assert.equal(messages.at(-1).pixels.length,600*200*3);
});
