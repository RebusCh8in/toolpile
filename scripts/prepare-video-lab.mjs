import { mkdir, copyFile, writeFile, rm, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Prepare only production runtime assets. Keep diagnostics and fixtures out of deploys.
const dest = new URL('../public/video-lab/runtime/', import.meta.url);
const existing = await readFile(new URL('migan.onnx', dest)).catch(() => null);
await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
for (const file of ['ort.all.min.mjs', 'ort-wasm-simd-threaded.jsep.mjs', 'ort-wasm-simd-threaded.jsep.wasm']) {
  await copyFile(new URL(`../node_modules/onnxruntime-cleanup/dist/${file}`, import.meta.url), new URL(file, dest));
}
for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  await copyFile(new URL(`../node_modules/@ffmpeg/core/dist/umd/${file}`, import.meta.url), new URL(file, dest));
}
const source = 'https://huggingface.co/andraniksargsyan/migan/resolve/406830d0fa60666da0071c342ad2fbc8f30c5c64/migan_pipeline_v2.onnx';
const expectedHash = '6f1f3530a1a2324b19752018ce756088b07973cda8d7d890034ace5c8a48c40b';
let bytes = existing && createHash('sha256').update(existing).digest('hex') === expectedHash ? existing : null;
if (!bytes) {
  const response = await fetch(source, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Model download failed: ${response.status}`);
  bytes = Buffer.from(await response.arrayBuffer());
}
if (bytes.length !== 28079181) throw new Error(`Unexpected model size: ${bytes.length}`);
const hash = createHash('sha256').update(bytes).digest('hex');
if (hash !== '6f1f3530a1a2324b19752018ce756088b07973cda8d7d890034ace5c8a48c40b') throw new Error('Model checksum mismatch');
await writeFile(new URL('migan.onnx', dest), bytes);
console.log(`MI-GAN: ${bytes.length} bytes; SHA256 ${hash}`);
