import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { getCrop, videoColor, sourceRate } from '../src/lib/video-cleanup-lab.ts';
import { repairWeights, blendRepair } from '../public/video-lab/blend-repair.mjs';
import { smoothBackground, smoothShotChoices, isSceneCut } from '../public/video-lab/smooth-background.mjs';

test('RGB repair conversion respects source color matrix and range', () => {
  assert.deepEqual(videoColor('Video: h264, yuv420p(tv, bt709, progressive)'), { matrix: 'bt709', range: 'tv', tag: 'bt709' });
  assert.deepEqual(videoColor('Video: h264, yuvj420p(pc, smpte170m/bt709/bt709)'), { matrix: 'bt601', range: 'pc', tag: 'smpte170m' });
  assert.deepEqual(videoColor('Video: h264, yuv420p'), { matrix: 'bt601', range: 'tv', tag: undefined });
});

test('smooth repair reconstructs a hidden gradient without reading watermark pixels', () => {
  const clean = new Uint8Array(64 * 64 * 3);
  const mask = new Uint8Array(64 * 64).fill(255);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) for (let c = 0; c < 3; c++) clean[(y * 64 + x) * 3 + c] = Math.round(140 + x * 0.6 + y * 0.2 + c * 4);
  const marked = clean.slice();
  for (let y = 20; y < 40; y++) for (let x = 15; x < 45; x++) {
    mask[y * 64 + x] = 0;
    marked.fill(255, (y * 64 + x) * 3, (y * 64 + x) * 3 + 3);
  }
  const result = smoothBackground(marked, mask, 64, 64);
  assert.ok(result);
  for (let i = 0; i < 4096; i++) for (let c = 0; c < 3; c++) assert.ok(Math.abs(result[c * 4096 + i] - clean[i * 3 + c]) <= 1);
  const textured = marked.slice();
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) if (mask[y * 64 + x]) textured.fill((x + y) % 2 ? 0 : 255, (y * 64 + x) * 3, (y * 64 + x) * 3 + 3);
  assert.equal(smoothBackground(textured, mask, 64, 64), null);
});

test('method changes only across cuts, and a bad fit rejects the whole shot', () => {
  assert.deepEqual(smoothShotChoices([true, true, false, true, true], [true, false, true, false, true]), [true, true, false, false, true]);
  const mask = new Uint8Array(100).fill(255);
  assert.equal(isSceneCut(new Uint8Array(300).fill(100), new Uint8Array(300).fill(103), mask), false);
  assert.equal(isSceneCut(new Uint8Array(300).fill(10), new Uint8Array(300).fill(200), mask), true);
});

test('repair transition preserves known pixels and fully removes pixels inside the user selection', () => {
  const mask = new Uint8Array(20 * 20).fill(255);
  for (let y = 2; y < 18; y++) mask.fill(0, y * 20 + 2, y * 20 + 18);
  const weights = repairWeights(mask, 20, 20, 4);
  const output = blendRepair(new Uint8Array(1200).fill(50), new Uint8Array(1200).fill(200), weights);
  assert.equal(output[(10 * 20 + 1) * 3], 50); // Outside repair: unchanged.
  assert.equal(output[(10 * 20 + 2) * 3], 50); // No step at the outer boundary.
  const transition = [2, 3, 4, 5, 6].map(x => output[(10 * 20 + x) * 3]);
  assert.ok(transition.every((v, i) => i === 0 || v > transition[i - 1]));
  assert.equal(output[(10 * 20 + 6) * 3], 200); // User selection: no source watermark mixed back in.
});

test('repair touching the video edge does not fade back to the source watermark', () => {
  const mask = new Uint8Array(20 * 20).fill(255);
  for (let y = 0; y < 12; y++) mask.fill(0, y * 20, y * 20 + 12);
  const weights = repairWeights(mask, 20, 20);
  assert.equal(weights[0], 1);
  assert.equal(weights[3 * 20], 1);
  assert.equal(weights[19], 0);
});

test('crop contains the full padded selection at frame edges and fractional positions', () => {
  for (const region of [
    { x: 0, y: 0, w: 90, h: 70 },
    { x: 550, y: 290, w: 90, h: 70 },
    { x: 200.2, y: 150.8, w: 90.1, h: 70.1 },
  ]) {
    const c = getCrop(region, 640, 360);
    assert.ok(c.cx >= 0 && c.cy >= 0 && c.cx + c.cw <= 640 && c.cy + c.ch <= 360);
    assert.ok(c.x >= c.cx && c.y >= c.cy && c.x + c.w <= c.cx + c.cw && c.y + c.h <= c.cy + c.ch);
    assert.ok(c.x <= region.x && c.y <= region.y && c.x + c.w >= region.x + region.w && c.y + c.h >= region.y + region.h);
  }
});

test('invalid and over-budget selections fail before creating a worker', () => {
  for (const region of [
    { x: -1, y: 0, w: 10, h: 10 },
    { x: 630, y: 0, w: 20, h: 10 },
    { x: 0, y: 0, w: 300, h: 20 },
    { x: NaN, y: 0, w: 10, h: 10 },
    { x: 0, y: 0, w: 0, h: 0 },
  ]) assert.throws(() => getCrop(region, 640, 360));
});

test('release does not change shared SEO sources', () => {
  execFileSync('git', ['diff', '--exit-code', 'HEAD', '--',
    'src/app/layout.tsx',
    'src/components/ToolLayout.tsx', 'src/app/sitemap.ts', 'src/app/robots.ts',
    'public/llms.txt', 'public/llms-full.txt',
  ], { cwd: new URL('..', import.meta.url) });
});

// Fractional rates must not drift when chunks are joined.
test('source rates retain broadcast fractions and reject missing or unsupported rates', () => {
  assert.equal(sourceRate('Video: h264, 29.97 fps, 30 tbr'), '30000/1001');
  assert.equal(sourceRate('Video: h264, 23.98 fps'), '24000/1001');
  assert.equal(sourceRate('Video: h264, 60 fps'), '60');
  assert.equal(sourceRate('Video: h264, 25 fps'), '25');
  for (const text of ['Video: h264', 'Video: h264, 120 fps', 'Video: h264, 0 fps']) assert.throws(() => sourceRate(text));
});
