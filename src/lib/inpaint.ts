/**
 * Client-side inpainting engine.
 * Fills masked regions by iteratively blending from boundary pixels inward.
 * Works on raw ImageData pixel arrays.
 */

export function inpaint(
  imageData: ImageData,
  mask: Uint8Array, // 1 = masked (remove), 0 = keep
  iterations: number = 8
): ImageData {
  const { width, height, data } = imageData
  const result = new Uint8ClampedArray(data)
  const currentMask = new Uint8Array(mask)

  for (let iter = 0; iter < iterations; iter++) {
    const boundary: Array<[number, number]> = []

    // Find boundary pixels: masked pixels adjacent to non-masked pixels
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        if (currentMask[idx] !== 1) continue

        const neighbors = [
          currentMask[(y - 1) * width + x],
          currentMask[(y + 1) * width + x],
          currentMask[y * width + (x - 1)],
          currentMask[y * width + (x + 1)],
          currentMask[(y - 1) * width + (x - 1)],
          currentMask[(y - 1) * width + (x + 1)],
          currentMask[(y + 1) * width + (x - 1)],
          currentMask[(y + 1) * width + (x + 1)],
        ]

        if (neighbors.some(n => n === 0)) {
          boundary.push([x, y])
        }
      }
    }

    if (boundary.length === 0) break

    // Fill boundary pixels with weighted average of non-masked neighbors
    for (const [bx, by] of boundary) {
      let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0
      const radius = 5 + iter * 2

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = bx + dx
          const ny = by + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue

          const nIdx = ny * width + nx
          if (currentMask[nIdx] === 1) continue

          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > radius) continue

          const weight = 1 / (1 + dist * dist)
          const pIdx = nIdx * 4

          totalR += result[pIdx] * weight
          totalG += result[pIdx + 1] * weight
          totalB += result[pIdx + 2] * weight
          totalWeight += weight
        }
      }

      if (totalWeight > 0) {
        const pIdx = (by * width + bx) * 4
        result[pIdx] = totalR / totalWeight
        result[pIdx + 1] = totalG / totalWeight
        result[pIdx + 2] = totalB / totalWeight
        result[pIdx + 3] = 255
        currentMask[by * width + bx] = 0
      }
    }
  }

  // Final pass: smooth any remaining masked pixels with gaussian-like blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      if (currentMask[idx] !== 1) continue

      let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0
      const radius = 20

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
          const nIdx = ny * width + nx
          if (currentMask[nIdx] === 1) continue

          const dist = Math.sqrt(dx * dx + dy * dy)
          const weight = Math.exp(-dist * dist / (2 * radius * radius))
          const pIdx = nIdx * 4

          totalR += result[pIdx] * weight
          totalG += result[pIdx + 1] * weight
          totalB += result[pIdx + 2] * weight
          totalWeight += weight
        }
      }

      if (totalWeight > 0) {
        const pIdx = idx * 4
        result[pIdx] = totalR / totalWeight
        result[pIdx + 1] = totalG / totalWeight
        result[pIdx + 2] = totalB / totalWeight
        result[pIdx + 3] = 255
      }
    }
  }

  return new ImageData(result, width, height)
}

/**
 * Fast inpainting for video frames — fewer iterations, smaller radius.
 * Optimized for speed over perfect quality.
 */
export function inpaintFast(
  imageData: ImageData,
  mask: Uint8Array,
): ImageData {
  return inpaint(imageData, mask, 4)
}
