// Conservative alternative to neural texture synthesis for plain walls/gradients.
// Fit only known pixels around the hole; never train the fit on the watermark.
/** @param {Uint8Array} pixels @param {Uint8Array} mask @param {number} width @param {number} height @param {{rms?: number, maximum?: number}} diagnostics @param {boolean} reconstruct */
export function smoothBackground(pixels, mask, width, height, diagnostics = {}, reconstruct = true) {
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (mask[y * width + x] !== 0) continue;
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  // Require evidence on all sides; don't guess a surface at the frame boundary.
  if (left < 4 || top < 4 || right + 4 >= width || bottom + 4 >= height) return null;
  const basis = (x, y) => {
    const u = (x - (left + right) / 2) / Math.max(1, (right - left) / 2);
    const v = (y - (top + bottom) / 2) / Math.max(1, (bottom - top) / 2);
    return [1, u, v, u * v, u * u, v * v];
  };
  const samples = [];
  const matrix = Array.from({ length: 6 }, () => new Float64Array(9));
  const low = [255, 255, 255], high = [0, 0, 0];
  for (let y = top - 4; y <= bottom + 4; y++) for (let x = left - 4; x <= right + 4; x++) {
    if (mask[y * width + x] === 0) continue;
    const b = basis(x, y);
    const rgb = Array.from(pixels.subarray((y * width + x) * 3, (y * width + x) * 3 + 3));
    samples.push({ b, rgb });
    for (let c = 0; c < 3; c++) { low[c] = Math.min(low[c], rgb[c]); high[c] = Math.max(high[c], rgb[c]); }
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) matrix[row][col] += b[row] * b[col];
      for (let c = 0; c < 3; c++) matrix[row][6 + c] += b[row] * rgb[c];
    }
  }
  // Pivoted elimination for three independent color fits.
  for (let col = 0; col < 6; col++) {
    let pivot = col;
    for (let row = col + 1; row < 6; row++) if (Math.abs(matrix[row][col]) > Math.abs(matrix[pivot][col])) pivot = row;
    if (Math.abs(matrix[pivot][col]) < 1e-8) return null;
    [matrix[col], matrix[pivot]] = [matrix[pivot], matrix[col]];
    const divisor = matrix[col][col];
    for (let j = col; j < 9; j++) matrix[col][j] /= divisor;
    for (let row = 0; row < 6; row++) {
      if (row === col) continue;
      const factor = matrix[row][col];
      for (let j = col; j < 9; j++) matrix[row][j] -= factor * matrix[col][j];
    }
  }
  const predict = (b, c) => b.reduce((sum, value, i) => sum + value * matrix[i][6 + c], 0);
  let squared = 0, maximum = 0;
  for (const { b, rgb } of samples) for (let c = 0; c < 3; c++) {
    const error = predict(b, c) - rgb[c];
    squared += error * error;
    maximum = Math.max(maximum, Math.abs(error));
  }
  // Reject texture, hair, object edges and poorly predicted backgrounds.
  diagnostics.rms = Math.sqrt(squared / (samples.length * 3));
  diagnostics.maximum = maximum;
  if (diagnostics.rms > 3 || maximum > 16) return null;
  const count = width * height;
  const output = new Uint8Array(count * 3);
  for (let i = 0; i < count; i++) for (let c = 0; c < 3; c++) output[c * count + i] = pixels[i * 3 + c];
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
    if (mask[y * width + x] !== 0) continue;
    const b = basis(x, y);
    for (let c = 0; c < 3; c++) {
      const value = predict(b, c);
      // Reject polynomial overshoot instead of flattening it by clamping.
      if (value < low[c] - 4 || value > high[c] + 4) return null;
      output[c * count + y * width + x] = Math.round(Math.max(0, Math.min(255, value)));
    }
  }
  if (!reconstruct) return output;
  // Match the actual boundary, not just the best-fit surface. Diffuse the
  // boundary residual through the hole so the fitted shade cannot form a box.
  const rw = right - left + 3, rh = bottom - top + 3;
  for (let c = 0; c < 3; c++) {
    const correction = new Float32Array(rw * rh);
    for (let ry = 0; ry < rh; ry++) for (let rx = 0; rx < rw; rx++) {
      const x = left + rx - 1, y = top + ry - 1;
      if (mask[y * width + x] !== 0) correction[ry * rw + rx] = pixels[(y * width + x) * 3 + c] - predict(basis(x, y), c);
    }
    for (let iteration = 0; iteration < 160; iteration++) {
      let change = 0;
      for (let ry = 1; ry < rh - 1; ry++) for (let rx = 1; rx < rw - 1; rx++) {
        const x = left + rx - 1, y = top + ry - 1;
        if (mask[y * width + x] !== 0) continue;
        const i = ry * rw + rx;
        const average = (correction[i - 1] + correction[i + 1] + correction[i - rw] + correction[i + rw]) / 4;
        const delta = (average - correction[i]) * 1.7;
        correction[i] += delta;
        change = Math.max(change, Math.abs(delta));
      }
      if (change < 0.01) break;
    }
    for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
      if (mask[y * width + x] !== 0) continue;
      const value = predict(basis(x, y), c) + correction[(y - top + 1) * rw + x - left + 1];
      output[c * count + y * width + x] = Math.round(Math.max(0, Math.min(255, value)));
    }
  }
  return output;
}

/** Detect large changes in known image content, not the watermark itself.
 * @param {Uint8Array} previous @param {Uint8Array} current @param {Uint8Array} mask
 */
export function isSceneCut(previous, current, mask) {
  let total = 0, changed = 0, count = 0;
  for (let i = 0; i < mask.length; i += 17) {
    if (mask[i] === 0) continue;
    const delta = (Math.abs(previous[i * 3] - current[i * 3]) + Math.abs(previous[i * 3 + 1] - current[i * 3 + 1]) + Math.abs(previous[i * 3 + 2] - current[i * 3 + 2])) / 3;
    total += delta; changed += delta > 25 ? 1 : 0; count++;
  }
  // A crop can contain static letterboxing, so do not require most pixels to change.
  return count > 0 && total / count > 22 && changed / count > 0.3;
}

/** Choose one repair method per shot to avoid switching on tiny confidence changes.
 * @param {boolean[]} eligible @param {boolean[]} cuts
 */
export function smoothShotChoices(eligible, cuts) {
  const choices = new Array(eligible.length).fill(false);
  let start = 0;
  for (let end = 1; end <= eligible.length; end++) {
    if (end !== eligible.length && !cuts[end]) continue;
    choices.fill(eligible.slice(start, end).every(Boolean), start, end);
    start = end;
  }
  return choices;
}
