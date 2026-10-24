import { bytes, exec, getCrop, loadEngine, request, TO_RGB, sourceRate, videoBlob, videoColor, type Region } from './video-cleanup-lab'
import { undoTransparentWatermark } from '../../public/video-lab/transparent-watermark.mjs'
import { isSceneCut, smoothShotChoices } from '../../public/video-lab/smooth-background.mjs'

export type ExportResult = { video: Blob; frames: number; fps: number; seconds: number; backend: string }
export type ExportOptions = { previewStart?: number }
type Prepared = { previewStart?: number; file: File; width: number; height: number; rate: string; fps: number; frames: number; color: ReturnType<typeof videoColor> }

// A page-owned session. Retain the normalized source/model for a short retry
// window; release all workers and video data on cancel, new file, or unmount.
export function createVideoExporter() {
  let loaded: Awaited<ReturnType<typeof loadEngine>> | undefined
  let worker: Worker | undefined
  let lifetime = new AbortController()
  let prepared: Prepared | undefined
  let active = false
  let gpu: boolean | undefined
  let idle: ReturnType<typeof setTimeout> | undefined
  const crops = new Map<string, Uint8Array>()
  const transparencies = new Map<string, Float32Array | null>()
  const assessments = new Map<string, boolean[]>()
  let cropBytes = 0
  const cacheLimit = 48 * 1024 * 1024

  function dispose() {
    clearTimeout(idle)
    lifetime.abort()
    loaded?.close()
    worker?.terminate()
    loaded = undefined
    worker = undefined
    prepared = undefined
    crops.clear()
    assessments.clear()
    transparencies.clear()
    cropBytes = 0
    lifetime = new AbortController()
  }

  async function run(file: File, selection: Region | Region[], width: number, height: number, duration: number,
    status: (text: string) => void, signal: AbortSignal, preferGpu = true, options: ExportOptions = {}): Promise<ExportResult> {
    if (active) throw new Error('A video is already being processed.')
    signal.throwIfAborted()
    if (file.size > 150 * 1024 * 1024) throw new Error('Choose a video under 150 MB.')
    if (!Number.isFinite(duration) || duration <= 0 || duration > 120) throw new Error('Full export currently supports videos up to two minutes.')
    if (width > 1920 || height > 1920 || width * height > 1920 * 1080) throw new Error('Choose a video at 1080p or below.')
    const preview = options.previewStart !== undefined
    if (preview && (!Number.isFinite(options.previewStart) || options.previewStart! < 0 || options.previewStart! >= duration)) throw new Error('Choose a preview time inside the video.')
    const areas = (Array.isArray(selection) ? selection : [selection]).map(r => getCrop(r, width, height))
    if (!areas.length) throw new Error('Select a watermark first.')
    if ((prepared && (prepared.file !== file || prepared.width !== width || prepared.height !== height)) || (gpu !== undefined && gpu !== preferGpu)) dispose()
    clearTimeout(idle)
    active = true
    gpu = preferGpu
    const abort = () => dispose()
    signal.addEventListener('abort', abort, { once: true })
    try {
      if (!loaded) loaded = await loadEngine(status, lifetime.signal)
      signal.throwIfAborted()
      const { engine } = loaded
      if (prepared && prepared.previewStart !== options.previewStart) {
        // A new time window needs new footage, but not a new model/session.
        prepared = undefined; crops.clear(); assessments.clear(); transparencies.clear(); cropBytes = 0
      }
      worker ??= new Worker('/video-lab/inpaint-worker.js', { type: 'module' })
      const inference = worker
      if (!prepared) {
        await engine.writeFile('input', new Uint8Array(await file.arrayBuffer()))
        let stream = ''
        const capture = ({ message }: { message: string }) => { if (!stream && message.includes('Video:')) stream = message }
        engine.on('log', capture)
        try { await exec(engine, ['-i', 'input', '-map', '0:v:0', '-frames:v', '1', '-f', 'null', '-'], signal) }
        finally { engine.off('log', capture) }
        if (/smpte2084|arib-std-b67|bt2020/.test(stream)) throw new Error('HDR video is not supported yet. Export an SDR copy first.')
        const rate = preview ? '12' : sourceRate(stream)
        const [num, den = '1'] = rate.split('/')
        const fps = Number(num) / Number(den)
        let frames = 0
        const count = ({ message }: { message: string }) => {
          const match = message.match(/frame=\s*(\d+)/)
          if (match) frames = Math.max(frames, Number(match[1]))
        }
        status(`Preparing ${preview ? "a three-second preview" : "the full video"} at ${fps.toFixed(3)} fps…`)
        // Browser videoWidth/videoHeight include display-aspect metadata. Match
        // that coordinate space before cropping (e.g. 490 coded pixels can be
        // displayed as 491), then pad only for the encoder's even-size rule.
        engine.on('log', count)
        try {
          await exec(engine, [...(preview ? ['-ss', String(options.previewStart)] : []), '-i', 'input', ...(preview ? ['-t', '3'] : []), '-map', '0:v:0', '-map', '0:a:0?', '-vf', `fps=${rate},scale=${width}:${height}:flags=accurate_rnd+full_chroma_int,setsar=1,pad=ceil(iw/2)*2:ceil(ih/2)*2`,
            '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-y', 'source.mp4'], signal)
        } finally { engine.off('log', count) }
        await engine.deleteFile('input')
        if (!frames || frames > Math.ceil(121 * fps)) throw new Error('Could not verify the full video frame count.')
        prepared = { previewStart: options.previewStart, file, width, height, rate, fps, frames, color: videoColor(stream) }
      }
      const { rate, fps, frames, color } = prepared
      const numerator = rate.split('/')[0]
      const batch = Math.max(1, Math.min(24, Math.floor(24 * 1024 * 1024 / Math.max(...areas.map(a => a.cw * a.ch * 3)))))
      const masks = areas.map(({ x, y, w, h, cx, cy, cw, ch }) => {
        const mask = new Uint8Array(cw * ch).fill(255)
        for (let my = y - cy; my < y - cy + h; my++) mask.fill(0, my * cw + x - cx, my * cw + x - cx + w)
        return mask
      })
      const decode = async (index: number, first: number, length: number) => {
        const { cw, ch, cx, cy } = areas[index]
        const key = `${cx},${cy},${cw},${ch},${first},${length}`
        const cached = crops.get(key)
        if (cached) return cached.slice() // Repair must never mutate cached originals.
        await exec(engine, ['-ss', String(first / fps), '-i', 'source.mp4', '-frames:v', String(length),
          '-vf', `${TO_RGB},crop=${cw}:${ch}:${cx}:${cy}:exact=1`, '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-y', 'crop.rgb'], signal)
        const raw = await bytes(engine, 'crop.rgb')
        await engine.deleteFile('crop.rgb')
        if (raw.length !== length * cw * ch * 3) throw new Error('Frame alignment failed. No incomplete video was exported.')
        // Keep the first bounded set, avoiding eviction thrash between passes.
        if (cropBytes + raw.byteLength <= cacheLimit) { crops.set(key, raw.slice()); cropBytes += raw.byteLength }
        return raw
      }
      const choices: boolean[][] = []
      const alphaMaps: (Float32Array | null)[] = []
      for (let area = 0; area < areas.length; area++) {
        const key = JSON.stringify(areas[area])
        const cached = assessments.get(key)
        if (cached) { choices.push(cached); alphaMaps.push(transparencies.get(key) ?? null); continue }
        const { cw, ch } = areas[area]
        const stride = cw * ch * 3
        const eligible: boolean[] = [], cuts: boolean[] = []
        const samples: Uint8Array[] = []
        const sampleEvery = Math.max(1, Math.ceil(frames / Math.min(40, Math.floor(24 * 1024 * 1024 / (cw * ch)))))
        let previous: Uint8Array | undefined
        for (let first = 0; first < frames; first += batch) {
          const length = Math.min(batch, frames - first)
          const raw = await decode(area, first, length)
          for (let i = 0; i < length; i++) {
            status(`Checking backgrounds${areas.length > 1 ? ` (region ${area + 1}/${areas.length})` : ''}: frame ${first + i + 1} of ${frames}…`)
            const pixels = raw.slice(i * stride, (i + 1) * stride)
            if ((first + i) % sampleEvery === 0) {
              const gray = new Uint8Array(cw * ch)
              for (let p = 0; p < gray.length; p++) gray[p] = Math.round((pixels[p * 3] + pixels[p * 3 + 1] + pixels[p * 3 + 2]) / 3)
              samples.push(gray)
            }
            cuts.push(!previous || isSceneCut(previous, pixels, masks[area]))
            previous = pixels.slice()
            eligible.push((await request(inference, { kind: 'assess', pixels, mask: masks[area], width: cw, height: ch }, signal, [pixels.buffer])).smooth)
          }
        }
        status('Checking translucent watermark detail…')
        const { alpha } = await request(inference, { kind: 'transparent', samples, width: cw, height: ch, mask: masks[area] }, signal, samples.map(s => s.buffer))
        alphaMaps.push(alpha)
        transparencies.set(key, alpha)
        const decision = smoothShotChoices(eligible, cuts)
        assessments.set(key, decision)
        choices.push(decision)
      }
      status('Loading the cleanup model…')
      const { backend } = await request(inference, { kind: 'load', preferGpu, smooth: choices.every((c, i) => alphaMaps[i] || c.every(Boolean)) }, signal)
      const segments: string[] = []
      for (let first = 0; first < frames; first += batch) {
        const length = Math.min(batch, frames - first)
        // All areas share the normalized source and one final RGB composite.
        const inputs: string[] = []
        const filters = [`[0:v]setpts=PTS-STARTPTS,${TO_RGB}[base0]`]
        for (let area = 0; area < areas.length; area++) {
          const { x, y, w, h, cw, ch, cx, cy } = areas[area]
          const raw = await decode(area, first, length)
          const stride = cw * ch * 3
          for (let i = 0; i < length; i++) {
            status(`Removing watermark${areas.length > 1 ? ` (region ${area + 1}/${areas.length})` : ''}: frame ${first + i + 1} of ${frames}…`)
            const pixels = raw.slice(i * stride, (i + 1) * stride)
            if (alphaMaps[area]) {
              undoTransparentWatermark(pixels, alphaMaps[area]!)
              raw.set(pixels, i * stride)
              continue
            }
            const result = await request(inference, { pixels, mask: masks[area], width: cw, height: ch, smooth: choices[area][first + i] }, signal, [pixels.buffer])
            raw.set(result.pixels, i * stride)
          }
          // Store only the small repaired patch for each region, not its context.
          const patch = new Uint8Array(length * w * h * 3)
          for (let f = 0; f < length; f++) for (let row = 0; row < h; row++) {
            const offset = f * stride + ((y - cy + row) * cw + x - cx) * 3
            patch.set(raw.subarray(offset, offset + w * 3), (f * h + row) * w * 3)
          }
          await engine.writeFile(`patch-${area}.rgb`, patch)
          inputs.push('-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', `${w}x${h}`, '-framerate', rate, '-i', `patch-${area}.rgb`)
          filters.push(`[base${area}][${area + 1}:v]overlay=${x}:${y}:format=rgb:shortest=1[base${area + 1}]`)
        }
        filters.push(`[base${areas.length}]scale=flags=accurate_rnd+full_chroma_int:in_range=pc:out_range=${color.range}:out_color_matrix=${color.matrix},format=yuv420p[out]`)
        const name = `part-${segments.length}.mp4`
        status(`Encoding video: ${Math.round((first + length) / frames * 100)}%…`)
        await exec(engine, ['-ss', String(first / fps), '-i', 'source.mp4', ...inputs, '-filter_complex', filters.join(';'),
          '-map', '[out]', '-frames:v', String(length), '-an', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18',
          ...(color.tag ? ['-colorspace', color.tag] : []), '-color_range', color.range,
          '-video_track_timescale', numerator.includes('.') ? '60000' : numerator, '-y', name], signal)
        for (let area = 0; area < areas.length; area++) await engine.deleteFile(`patch-${area}.rgb`)
        segments.push(`file '${name}'\nduration ${(length / fps).toFixed(9)}`)
      }
      status('Finishing the full video and restoring audio…')
      await engine.writeFile('parts.txt', segments.join('\n'))
      await exec(engine, ['-f', 'concat', '-safe', '0', '-i', 'parts.txt', '-i', 'source.mp4', '-map', '0:v:0', '-map', '1:a:0?',
        '-c', 'copy', '-movflags', '+faststart', '-y', 'finished.mp4'], signal)
      const video = await videoBlob(engine, 'finished.mp4')
      // Only source.mp4 survives a successful job. Avoid accumulating outputs.
      for (const entry of await engine.listDir('/')) {
        if (!entry.isDir && entry.name !== 'source.mp4') await engine.deleteFile(entry.name)
      }
      return { video, frames, fps, seconds: frames / fps, backend: alphaMaps.every(Boolean) ? "Translucent overlay reconstruction (local)" : backend }
    } catch (error) { dispose(); throw error }
    finally {
      signal.removeEventListener('abort', abort)
      active = false
      if (loaded) idle = setTimeout(dispose, 60_000)
    }
  }
  return { run, dispose }
}

export async function exportVideo(...args: Parameters<ReturnType<typeof createVideoExporter>['run']>) {
  const session = createVideoExporter()
  try { return await session.run(...args) } finally { session.dispose() }
}
