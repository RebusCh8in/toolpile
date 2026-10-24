// Keep inference off the UI thread. Dynamic preprocessing can fall back to WASM
// while supported neural-network operations use the GPU, when available.
import * as ort from './runtime/ort.all.min.mjs';
import { repairWeights, blendRepair } from './blend-repair.mjs';
import { smoothBackground } from './smooth-background.mjs';
ort.env.wasm.wasmPaths = '/video-lab/runtime/';
ort.env.wasm.numThreads = 1;
let session;
self.onmessage = async ({ data }) => {
  try {
    if (data.kind === 'assess') {
      self.postMessage({ smooth: smoothBackground(data.pixels, data.mask, data.width, data.height, {}, false) !== null });
      return;
    }
    if (data.kind === 'load') {
      if (data.smooth === true) {
        self.postMessage({ backend: 'Smooth background (local)' });
        return;
      }
      let backend = 'CPU (WASM)';
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
    const { pixels, mask, width, height } = data;
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
      blendRepair(pixels, result.data, repairWeights(mask, width, height, 4));
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
