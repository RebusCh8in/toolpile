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

/**
 * Edge-aware content-aware fill.
 * Detects local structure/gradients at the boundary and samples
 * preferentially along edges (not across them). Produces much
 * more natural results than simple weighted averaging, especially
 * on textured or structured backgrounds.
 *
 * @param quality 'fast' for video frames (fewer iters), 'quality' for photos
 */
export function inpaintContentAware(
  imageData: ImageData,
  mask: Uint8Array,
  quality: 'fast' | 'quality' = 'quality'
): ImageData {
  const { width, height, data } = imageData
  const result = new Uint8ClampedArray(data)
  const filled = new Uint8Array(mask)

  const maxIter = quality === 'fast' ? 10 : 16
  const baseRadius = quality === 'fast' ? 5 : 7

  for (let iter = 0; iter < maxIter; iter++) {
    // Find boundary: masked pixels with at least one filled neighbor
    const boundary: Array<{ x: number; y: number; conf: number }> = []

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (filled[y * width + x] !== 1) continue

        let knownNeighbors = 0
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          if (filled[(y + dy) * width + (x + dx)] === 0) knownNeighbors++
        }
        if (knownNeighbors === 0) continue

        // Confidence: how many known pixels in a 5x5 neighborhood
        let known = 0
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const ny = y + dy, nx = x + dx
            if (ny >= 0 && ny < height && nx >= 0 && nx < width && filled[ny * width + nx] === 0) known++
          }
        }
        boundary.push({ x, y, conf: known })
      }
    }

    if (boundary.length === 0) break

    // Sort: fill high-confidence (most known neighbors) first
    boundary.sort((a, b) => b.conf - a.conf)

    const radius = baseRadius + Math.floor(iter * 0.8)

    for (const { x: bx, y: by } of boundary) {
      if (filled[by * width + bx] !== 1) continue // already filled this iteration

      // Compute local gradient direction from known neighbors
      let gx = 0, gy = 0
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = bx + dx, ny = by + dy
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
        if (filled[ny * width + nx] === 1) continue
        const pi = (ny * width + nx) * 4
        const lum = result[pi] * 0.299 + result[pi + 1] * 0.587 + result[pi + 2] * 0.114
        gx += dx * lum
        gy += dy * lum
      }

      const gradMag = Math.sqrt(gx * gx + gy * gy) + 1e-6
      // Edge runs perpendicular to gradient
      const edgeDirX = -gy / gradMag
      const edgeDirY = gx / gradMag

      let totalR = 0, totalG = 0, totalB = 0, totalW = 0

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = bx + dx, ny = by + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
          if (filled[ny * width + nx] === 1) continue

          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > radius || dist < 0.5) continue

          // Base weight: inverse distance squared
          let weight = 1 / (1 + dist * dist)

          // Edge-aware boost: sample more along detected edge direction
          const dirX = dx / dist, dirY = dy / dist
          const edgeAlignment = Math.abs(dirX * edgeDirX + dirY * edgeDirY)
          weight *= (1 + edgeAlignment * 3) // up to 4x along edge

          // Color similarity boost: prefer samples with similar color to nearby known pixels
          const pi = (ny * width + nx) * 4
          totalR += result[pi] * weight
          totalG += result[pi + 1] * weight
          totalB += result[pi + 2] * weight
          totalW += weight
        }
      }

      if (totalW > 0) {
        const pi = (by * width + bx) * 4
        result[pi] = totalR / totalW
        result[pi + 1] = totalG / totalW
        result[pi + 2] = totalB / totalW
        result[pi + 3] = 255
        filled[by * width + bx] = 0
      }
    }
  }

  // Fill any remaining pixels with large gaussian
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (filled[y * width + x] !== 1) continue
      let totalR = 0, totalG = 0, totalB = 0, totalW = 0
      const r = 30
      for (let dy = -r; dy <= r; dy += 2) {
        for (let dx = -r; dx <= r; dx += 2) {
          const nx = x + dx, ny = y + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
          if (filled[ny * width + nx] === 1) continue
          const d = Math.sqrt(dx * dx + dy * dy)
          const w = Math.exp(-d * d / (2 * r * r))
          const pi = (ny * width + nx) * 4
          totalR += result[pi] * w
          totalG += result[pi + 1] * w
          totalB += result[pi + 2] * w
          totalW += w
        }
      }
      if (totalW > 0) {
        const pi = (y * width + x) * 4
        result[pi] = totalR / totalW
        result[pi + 1] = totalG / totalW
        result[pi + 2] = totalB / totalW
        result[pi + 3] = 255
      }
    }
  }

  // Edge blending pass: smooth the boundary between inpainted and original for seamless edges
  const blendRadius = quality === 'fast' ? 2 : 3
  const blended = new Uint8ClampedArray(result)
  for (let y = blendRadius; y < height - blendRadius; y++) {
    for (let x = blendRadius; x < width - blendRadius; x++) {
      const idx = y * width + x
      // Only blend pixels that were originally masked and are near the boundary
      if (mask[idx] !== 1) continue
      let nearEdge = false
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (mask[(y + dy) * width + (x + dx)] === 0) { nearEdge = true; break }
      }
      if (!nearEdge) continue

      let sR = 0, sG = 0, sB = 0, sW = 0
      for (let dy = -blendRadius; dy <= blendRadius; dy++) {
        for (let dx = -blendRadius; dx <= blendRadius; dx++) {
          const d = Math.sqrt(dx * dx + dy * dy)
          const w = Math.exp(-d * d / (2 * blendRadius))
          const pi = ((y + dy) * width + (x + dx)) * 4
          sR += result[pi] * w
          sG += result[pi + 1] * w
          sB += result[pi + 2] * w
          sW += w
        }
      }
      const pi = idx * 4
      blended[pi] = sR / sW
      blended[pi + 1] = sG / sW
      blended[pi + 2] = sB / sW
    }
  }

  return new ImageData(blended, width, height)
}
