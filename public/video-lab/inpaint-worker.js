// Keep inference off the UI thread. Dynamic preprocessing can fall back to WASM
// while supported neural-network operations use the GPU, when available.
import * as ort from './runtime/ort.all.min.mjs';
import { repairWeights, blendRepair } from './blend-repair.mjs';
import { smoothBackground } from './smooth-background.mjs';
ort.env.wasm.wasmPaths = '/video-lab/runtime/';
ort.env.wasm.numThreads = 1;
let session;
let backend = 'CPU (WASM)';
self.onmessage = async ({ data }) => {
  try {
    if (data.kind === 'assess') {
      if (data.width > 512 || data.height > 512) { self.postMessage({ smooth: false }); return; }
      self.postMessage({ smooth: smoothBackground(data.pixels, data.mask, data.width, data.height, {}, false) !== null });
      return;
    }
    if (data.kind === 'load') {
      if (data.smooth === true) {
        self.postMessage({ backend: 'Smooth background (local)' });
        return;
      }
      if (session) {
        self.postMessage({ backend });
        return;
      }
      if (data.preferGpu && self.navigator.gpu) {
        try {
          session = await ort.InferenceSession.create('/video-lab/runtime/migan.onnx', { executionProviders: ['webgpu', 'wasm'] });
          backend = 'WebGPU + WASM';
        } catch { /* Report the CPU fallback below; never claim GPU acceleration. */ }
      }
      if (!session) session = await ort.InferenceSession.create('/video-lab/runtime/migan.onnx', { executionProviders: ['wasm'] });
      self.postMessage({ backend });
      return;
    }
    const original = data;
    let { pixels, mask, width, height } = data;
    const large = width > 512 || height > 512;
    if (large) {
      const scale = Math.min(512 / width, 512 / height);
      const sw = Math.max(1, Math.round(width * scale));
      const sh = Math.max(1, Math.round(height * scale));
      const source = new OffscreenCanvas(width, height);
      source.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(pixels), width, height), 0, 0);
      const small = new OffscreenCanvas(sw, sh);
      const ctx = small.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(source, 0, 0, sw, sh);
      const rgba = ctx.getImageData(0, 0, sw, sh).data;
      const resized = new Uint8Array(sw * sh * 3);
      const resizedMask = new Uint8Array(sw * sh).fill(255);
      for (let i = 0; i < sw * sh; i++) for (let c = 0; c < 3; c++) resized[i * 3 + c] = rgba[i * 4 + c];
      // Any selected source pixel masks its destination pixel: thin marks and
      // selection edges must not disappear during downsampling.
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        if (mask[y * width + x] === 0) resizedMask[Math.min(sh - 1, Math.floor(y * sh / height)) * sw + Math.min(sw - 1, Math.floor(x * sw / width))] = 0;
      }
      pixels = resized; mask = resizedMask; width = sw; height = sh;
    }
    if (data.smooth === true) {
      const surface = smoothBackground(pixels, mask, width, height);
      if (!surface) throw new Error('Background changed after assessment. Please retry.');
      blendRepair(pixels, surface, repairWeights(mask, width, height, 4));
      self.postMessage({ pixels }, [pixels.buffer]);
      return;
    }
    const count = width * height;
    const planar = new Uint8Array(count * 3);
    for (let i = 0; i < count; i++) {
      planar[i] = pixels[i * 3];
      planar[count + i] = pixels[i * 3 + 1];
      planar[count * 2 + i] = pixels[i * 3 + 2];
    }
    const imageTensor = new ort.Tensor('uint8', planar, [1, 3, height, width]);
    const maskTensor = new ort.Tensor('uint8', mask, [1, 1, height, width]);
    let outputs;
    try {
      outputs = await session.run({ image: imageTensor, mask: maskTensor });
      const result = outputs[session.outputNames[0]];
      if (result.type !== 'uint8' || result.data.length !== count * 3) throw new Error('Unexpected model output');
      // The mask includes a four-pixel safety margin. Feather that margin only;
      // keep the actual user selection at full replacement strength.
      if (large) {
        const rgba = new Uint8ClampedArray(count * 4);
        for (let i = 0; i < count; i++) {
          for (let c = 0; c < 3; c++) rgba[i * 4 + c] = result.data[c * count + i];
          rgba[i * 4 + 3] = 255;
        }
        const small = new OffscreenCanvas(width, height);
        small.getContext('2d').putImageData(new ImageData(rgba, width, height), 0, 0);
        const full = new OffscreenCanvas(original.width, original.height);
        const ctx = full.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(small, 0, 0, original.width, original.height);
        const restored = ctx.getImageData(0, 0, original.width, original.height).data;
        const n = original.width * original.height;
        const planarFull = new Uint8Array(n * 3);
        for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) planarFull[c * n + i] = restored[i * 4 + c];
        pixels = blendRepair(original.pixels, planarFull, repairWeights(original.mask, original.width, original.height, 4));
      } else {
        blendRepair(pixels, result.data, repairWeights(mask, width, height, 4));
      }
      self.postMessage({ pixels }, [pixels.buffer]);
    } finally {
      imageTensor.dispose();
      maskTensor.dispose();
      if (outputs) Object.values(outputs).forEach(tensor => tensor.dispose());
    }
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
};
