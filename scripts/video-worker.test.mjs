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
