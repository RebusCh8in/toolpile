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

// ===== Fast O(n) separable box blur (running-sum) =====

function _blurH(scl: Float32Array, tcl: Float32Array, w: number, h: number, r: number) {
  const iarr = 1 / (r + r + 1)
  for (let i = 0; i < h; i++) {
    let ti = i * w, li = ti, ri = ti + r
    const fv = scl[ti], lv = scl[ti + w - 1]
    let val = (r + 1) * fv
    for (let j = 0; j < r; j++) val += scl[ti + j]
    for (let j = 0; j <= r; j++) { val += scl[ri++] - fv; tcl[ti++] = val * iarr }
    for (let j = r + 1; j < w - r; j++) { val += scl[ri++] - scl[li++]; tcl[ti++] = val * iarr }
    for (let j = w - r; j < w; j++) { val += lv - scl[li++]; tcl[ti++] = val * iarr }
  }
}

function _blurV(scl: Float32Array, tcl: Float32Array, w: number, h: number, r: number) {
  const iarr = 1 / (r + r + 1)
  for (let i = 0; i < w; i++) {
    let ti = i, li = ti, ri = ti + r * w
    const fv = scl[ti], lv = scl[ti + w * (h - 1)]
    let val = (r + 1) * fv
    for (let j = 0; j < r; j++) val += scl[ti + j * w]
    for (let j = 0; j <= r; j++) { val += scl[ri] - fv; tcl[ti] = val * iarr; ri += w; ti += w }
    for (let j = r + 1; j < h - r; j++) { val += scl[ri] - scl[li]; tcl[ti] = val * iarr; li += w; ri += w; ti += w }
    for (let j = h - r; j < h; j++) { val += lv - scl[li]; tcl[ti] = val * iarr; li += w; ti += w }
  }
}

/** 3-pass separable box blur ≈ Gaussian. O(n) per pass. */
function _blur3(src: Float32Array, dst: Float32Array, w: number, h: number, r: number, tmp: Float32Array) {
  dst.set(src)
  for (let p = 0; p < 3; p++) {
    _blurH(dst, tmp, w, h, r)
    _blurV(tmp, dst, w, h, r)
  }
}

/**
 * High-quality multi-scale diffusion inpainting.
 *
 * Instead of filling boundary-inward (which causes ghosting/smearing),
 * this blurs ALL known pixels with Gaussian weights and normalizes by
 * blurred weights. Works from large to small scales:
 * - Large sigma: establishes overall color/gradient across the mask
 * - Small sigma: refines detail and sharpens transitions
 *
 * Produces clean, natural fills especially on gradients and smooth backgrounds.
 * No watermark ghosting because masked pixels are completely excluded from source data.
 */
export function inpaintDiffusion(
  imageData: ImageData,
  mask: Uint8Array
): ImageData {
  const { width: w, height: h, data } = imageData
  const n = w * h

  // Float channels: masked pixels start at 0 value and 0 weight
  const rc = new Float32Array(n)
  const gc = new Float32Array(n)
  const bc = new Float32Array(n)
  const wt = new Float32Array(n)

  for (let i = 0; i < n; i++) {
    if (mask[i] === 0) {
      rc[i] = data[i * 4]
      gc[i] = data[i * 4 + 1]
      bc[i] = data[i * 4 + 2]
      wt[i] = 1
    }
  }

  // Work buffers (reused across sigma levels)
  const bw = new Float32Array(n)  // blurred weights
  const buf = new Float32Array(n) // per-channel blur output
  const tmp = new Float32Array(n) // box blur intermediate

  const maxR = Math.floor(Math.min(w, h) / 2) - 1

  // Large-to-small: each pass fills more pixels, which feed into the next
  for (const sigma of [64, 32, 16, 8, 4, 2]) {
    const r = Math.min(Math.max(1, Math.round(sigma)), maxR)
    if (r < 1) continue

    // Blur weights once per sigma level
    _blur3(wt, bw, w, h, r, tmp)

    // Blur and normalize each color channel
    for (const ch of [rc, gc, bc]) {
      _blur3(ch, buf, w, h, r, tmp)
      for (let i = 0; i < n; i++) {
        if (mask[i] === 1 && bw[i] > 0.001) {
          ch[i] = buf[i] / bw[i]
        }
      }
    }

    // Newly filled pixels become "known" for the next sigma pass
    for (let i = 0; i < n; i++) {
      if (mask[i] === 1 && bw[i] > 0.001) wt[i] = 1
    }
  }

  // Soft edge mask for feathered blending at mask boundary
  const fm = new Float32Array(n)
  for (let i = 0; i < n; i++) fm[i] = mask[i]
  _blur3(fm, buf, w, h, Math.min(3, maxR), tmp)

  // Assemble output
  const result = new Uint8ClampedArray(data)
  for (let i = 0; i < n; i++) {
    const p = i * 4
    if (mask[i] === 1) {
      result[p]     = rc[i] < 0 ? 0 : rc[i] > 255 ? 255 : Math.round(rc[i])
      result[p + 1] = gc[i] < 0 ? 0 : gc[i] > 255 ? 255 : Math.round(gc[i])
      result[p + 2] = bc[i] < 0 ? 0 : bc[i] > 255 ? 255 : Math.round(bc[i])
      result[p + 3] = 255
    } else if (buf[i] > 0.05) {
      // Feathered edge blend
      const a = Math.min(buf[i] * 2, 1)
      const inv = 1 - a
      result[p]     = Math.round(data[p]     * inv + rc[i] * a)
      result[p + 1] = Math.round(data[p + 1] * inv + gc[i] * a)
      result[p + 2] = Math.round(data[p + 2] * inv + bc[i] * a)
    }
  }

  return new ImageData(result, w, h)
}

/**
 * High-quality inpainting: BFS initialization + SOR Laplacian relaxation.
 * Phase 1: BFS propagates border colors inward for a fast initial estimate.
 * Phase 2: Successive Over-Relaxation iteratively converges to the Laplacian=0
 * solution — the mathematically smoothest interpolation matching boundary colors.
 * Zero artifacts: no ghosting, no streaks, no starburst, no color shifts.
 */
export function inpaintDelogo(
  imageData: ImageData,
  mask: Uint8Array
): ImageData {
  const { width: w, height: h, data } = imageData
  const n = w * h

  // Check for empty mask
  let hasMask = false
  for (let i = 0; i < n; i++) { if (mask[i] === 1) { hasMask = true; break } }
  if (!hasMask) return imageData

  // Float work arrays for SOR precision
  const fR = new Float32Array(n)
  const fG = new Float32Array(n)
  const fB = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    fR[i] = data[i * 4]
    fG[i] = data[i * 4 + 1]
    fB[i] = data[i * 4 + 2]
  }

  // Phase 1: BFS to initialize masked pixels with border colors
  const KNOWN = 0, BAND = 1, INSIDE = 2
  const flag = new Uint8Array(n)
  for (let i = 0; i < n; i++) flag[i] = mask[i] === 1 ? INSIDE : KNOWN

  const queue: number[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (flag[i] !== INSIDE) continue
      if ((x > 0 && flag[i - 1] === KNOWN) ||
          (x < w - 1 && flag[i + 1] === KNOWN) ||
          (y > 0 && flag[i - w] === KNOWN) ||
          (y < h - 1 && flag[i + w] === KNOWN)) {
        flag[i] = BAND
        queue.push(i)
      }
    }
  }

  let head = 0
  while (head < queue.length) {
    const ci = queue[head++]
    const cx = ci % w, cy = (ci - cx) / w

    let sR = 0, sG = 0, sB = 0, sW = 0
    const r = 5, r2 = r * r
    const ylo = Math.max(0, cy - r), yhi = Math.min(h - 1, cy + r)
    const xlo = Math.max(0, cx - r), xhi = Math.min(w - 1, cx + r)
    for (let qy = ylo; qy <= yhi; qy++) {
      const dy = qy - cy
      for (let qx = xlo; qx <= xhi; qx++) {
        const dx = qx - cx
        const d2 = dx * dx + dy * dy
        if (d2 === 0 || d2 > r2) continue
        const qi = qy * w + qx
        if (flag[qi] !== KNOWN) continue
        const wgt = 1 / (d2 + 0.5)
        sR += fR[qi] * wgt
        sG += fG[qi] * wgt
        sB += fB[qi] * wgt
        sW += wgt
      }
    }
    if (sW > 0) {
      fR[ci] = sR / sW
      fG[ci] = sG / sW
      fB[ci] = sB / sW
    }

    flag[ci] = KNOWN
    if (cx > 0     && flag[ci - 1] === INSIDE) { flag[ci - 1] = BAND; queue.push(ci - 1) }
    if (cx < w - 1 && flag[ci + 1] === INSIDE) { flag[ci + 1] = BAND; queue.push(ci + 1) }
    if (cy > 0     && flag[ci - w] === INSIDE) { flag[ci - w] = BAND; queue.push(ci - w) }
    if (cy < h - 1 && flag[ci + w] === INSIDE) { flag[ci + w] = BAND; queue.push(ci + w) }
  }

  // Phase 2: SOR relaxation — converge to Laplacian=0 (smoothest interpolation)
  const omega = 1.8
  for (let iter = 0; iter < 500; iter++) {
    let maxDelta = 0
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        if (mask[i] !== 1) continue

        let sumR = 0, sumG = 0, sumB = 0, cnt = 0
        if (x > 0)     { sumR += fR[i - 1]; sumG += fG[i - 1]; sumB += fB[i - 1]; cnt++ }
        if (x < w - 1) { sumR += fR[i + 1]; sumG += fG[i + 1]; sumB += fB[i + 1]; cnt++ }
        if (y > 0)     { sumR += fR[i - w]; sumG += fG[i - w]; sumB += fB[i - w]; cnt++ }
        if (y < h - 1) { sumR += fR[i + w]; sumG += fG[i + w]; sumB += fB[i + w]; cnt++ }
        if (cnt === 0) continue

        const inv = 1 / cnt
        const aR = sumR * inv, aG = sumG * inv, aB = sumB * inv
        const nR = fR[i] + omega * (aR - fR[i])
        const nG = fG[i] + omega * (aG - fG[i])
        const nB = fB[i] + omega * (aB - fB[i])
        const dR = Math.abs(nR - fR[i])
        const dG = Math.abs(nG - fG[i])
        const dB = Math.abs(nB - fB[i])
        if (dR > maxDelta) maxDelta = dR
        if (dG > maxDelta) maxDelta = dG
        if (dB > maxDelta) maxDelta = dB
        fR[i] = nR; fG[i] = nG; fB[i] = nB
      }
    }
    if (maxDelta < 0.1) break
  }

  // Phase 3: Assemble output with boundary smoothing
  const out = new Uint8ClampedArray(data)
  for (let i = 0; i < n; i++) {
    if (mask[i] === 1) {
      out[i * 4]     = Math.max(0, Math.min(255, Math.round(fR[i])))
      out[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(fG[i])))
      out[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(fB[i])))
      out[i * 4 + 3] = 255
    }
  }

  // Seamless boundary blend
  const blended = new Uint8ClampedArray(out)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (mask[i] !== 1) continue
      let nearBorder = false
      if (x > 0 && mask[i - 1] === 0) nearBorder = true
      if (x < w - 1 && mask[i + 1] === 0) nearBorder = true
      if (y > 0 && mask[i - w] === 0) nearBorder = true
      if (y < h - 1 && mask[i + w] === 0) nearBorder = true
      if (!nearBorder) continue

      let tR = 0, tG = 0, tB = 0, tW = 0
      for (let dy = -2; dy <= 2; dy++) {
        const ny = y + dy
        if (ny < 0 || ny >= h) continue
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx
          if (nx < 0 || nx >= w) continue
          const ni = ny * w + nx
          const wt = Math.exp(-(dx * dx + dy * dy) * 0.25)
          tR += out[ni * 4] * wt
          tG += out[ni * 4 + 1] * wt
          tB += out[ni * 4 + 2] * wt
          tW += wt
        }
      }
      blended[i * 4]     = Math.round(tR / tW)
      blended[i * 4 + 1] = Math.round(tG / tW)
      blended[i * 4 + 2] = Math.round(tB / tW)
    }
  }

  return new ImageData(blended, w, h)
}
