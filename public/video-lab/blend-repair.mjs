/**
 * Feather only the padded repair margin. Distances are to actual known pixels,
 * not the frame border: an edge-touching watermark must still be fully replaced.
 * @param {Uint8Array} mask 0 = repair; 255 = known
 * @param {number} width
 * @param {number} height
 * @param {number} padding Extra pixels outside the user's selection
 */
export function repairWeights(mask, width, height, padding = 4) {
  const distance = new Float32Array(width * height);
  for (let i = 0; i < distance.length; i++) distance[i] = mask[i] === 0 ? Infinity : 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (x > 0) distance[i] = Math.min(distance[i], distance[i - 1] + 1);
      if (y > 0) distance[i] = Math.min(distance[i], distance[i - width] + 1);
    }
  }
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const i = y * width + x;
      if (x + 1 < width) distance[i] = Math.min(distance[i], distance[i + 1] + 1);
      if (y + 1 < height) distance[i] = Math.min(distance[i], distance[i + width] + 1);
    }
  }
  return distance.map(d => {
    const t = Math.max(0, Math.min(1, (d - 1) / Math.max(1, padding)));
    return t * t * (3 - 2 * t);
  });
}

/** @param {Uint8Array} source @param {Uint8Array} planar @param {Float32Array} weights */
export function blendRepair(source, planar, weights) {
  const count = weights.length;
  for (let i = 0; i < count; i++) {
    const alpha = weights[i];
    if (alpha === 0) continue;
    for (let c = 0; c < 3; c++) {
      const index = i * 3 + c;
      source[index] = Math.round(source[index] * (1 - alpha) + planar[c * count + i] * alpha);
    }
  }
  return source;
}
