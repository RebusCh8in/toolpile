import { FFmpeg } from '@ffmpeg/ffmpeg'
import { isSceneCut, smoothShotChoices } from '../../public/video-lab/smooth-background.mjs'

export type Region = { x: number; y: number; w: number; h: number }
export type LabResult = {
  original: Blob
  baseline: Blob
  ai: Blob
  seconds: number
  frames: number
  inferenceMs: number
  backend: string
  smoothFrames: number
  quality?: Record<'original' | 'baseline' | 'ai', { psnr: number; temporalError: number }>
}

const FPS = 12
const MAX_SECONDS = 3
export const TO_RGB = 'scale=flags=accurate_rnd+full_chroma_int,format=rgb24'

export function sourceRate(message: string) {
  const value = Number(message.match(/,\s*([\d.]+) fps\b/)?.[1])
  if (!Number.isFinite(value) || value < 1 || value > 60) throw new Error('Use a video between 1 and 60 frames per second.')
  for (const numerator of [24000, 30000, 60000]) {
    if (Math.abs(value - numerator / 1001) < 0.006) return `${numerator}/1001`
  }
  return String(value)
}

export function videoColor(message: string) {
  const match = message.match(/\byuv\w*\((tv|pc)(?:,\s*([a-z0-9]+))?/)
  const matrices: Record<string, string> = {
    bt709: 'bt709', bt470bg: 'bt601', smpte170m: 'bt601', smpte240m: 'smpte240m',
    bt2020nc: 'bt2020', bt2020c: 'bt2020', fcc: 'fcc',
  }
  const tag = match?.[2] && matrices[match[2]] ? match[2] : undefined
  return { matrix: tag ? matrices[tag] : 'bt601', range: match?.[1] ?? (/\byuvj/.test(message) ? 'pc' : 'tv'), tag }
}

export function getCrop(region: Region, width: number, height: number) {
  if (![width, height, region.x, region.y, region.w, region.h].every(Number.isFinite)
    || width < 16 || height < 16 || region.w < 4 || region.h < 4
    || region.x < 0 || region.y < 0 || region.x + region.w > width || region.y + region.h > height) {
    throw new Error('Select a valid area inside the video.')
  }
  const x = Math.max(0, Math.floor(region.x) - 4)
  const y = Math.max(0, Math.floor(region.y) - 4)
  const w = Math.min(width - x, Math.ceil(region.x + region.w) + 4 - x)
  const h = Math.min(height - y, Math.ceil(region.y + region.h) + 4 - y)
  const cw = Math.min(width, Math.max(512, w + 128))
  const ch = Math.min(height, Math.max(512, h + 128))
  const cx = Math.max(0, Math.min(width - cw, Math.floor(x + w / 2 - cw / 2)))
  const cy = Math.max(0, Math.min(height - ch, Math.floor(y + h / 2 - ch / 2)))
  return { x, y, w, h, cx, cy, cw, ch }
}

export async function loadEngine(status: (text: string) => void, signal: AbortSignal) {
  const engine = new FFmpeg()
  const abort = () => engine.terminate()
  signal.addEventListener('abort', abort, { once: true })
  status('Loading local video engine…')
  try {
    signal.throwIfAborted()
    await engine.load({ coreURL: '/video-lab/runtime/ffmpeg-core.js', wasmURL: '/video-lab/runtime/ffmpeg-core.wasm' })
    signal.throwIfAborted()
  } catch (error) {
    engine.terminate()
    signal.removeEventListener('abort', abort)
    throw error
  }
  return {
    engine,
    close: () => {
      signal.removeEventListener('abort', abort)
      engine.terminate()
    },
  }
}

export async function exec(engine: FFmpeg, args: string[], signal: AbortSignal) {
  signal.throwIfAborted()
  const logs: string[] = []
  const listener = ({ message }: { message: string }) => { logs.push(message); if (logs.length > 8) logs.shift() }
  engine.on('log', listener)
  try {
    const code = await engine.exec(['-hide_banner', ...args])
    signal.throwIfAborted()
    if (code !== 0) throw new Error(`Video processing failed (${code}): ${logs.join(' ').slice(-700)}`)
  } finally { engine.off('log', listener) }
}

export async function bytes(engine: FFmpeg, name: string) {
  const value = await engine.readFile(name)
  if (typeof value === 'string') throw new Error('Expected binary output')
  return new Uint8Array(value)
}

export async function videoBlob(engine: FFmpeg, name: string) {
  const data = await bytes(engine, name)
  if (data.length < 1000) throw new Error('Video output is empty')
  return new Blob([data.buffer as ArrayBuffer], { type: 'video/mp4' })
}

export function request(worker: Worker, data: object, signal: AbortSignal, transfer: Transferable[] = []): Promise<{ pixels: Uint8Array; backend: string; smooth: boolean; alpha: Float32Array | null }> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.onmessage = null
      worker.onerror = null
      signal.removeEventListener('abort', abort)
      clearTimeout(timer)
    }
    const abort = () => { cleanup(); reject(new DOMException('Cancelled', 'AbortError')) }
    const timer = setTimeout(() => { cleanup(); reject(new Error('Model took too long on this device. Try a faster computer.')) }, 120_000)
    worker.onmessage = ({ data }) => {
      cleanup()
      if (data.error) reject(new Error(data.error))
      else resolve(data)
    }
    worker.onerror = () => { cleanup(); reject(new Error('The cleanup engine could not start. Reload the page and try again.')) }
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) { abort(); return }
    worker.postMessage(data, transfer)
  })
}

export async function runComparison(file: File, region: Region, width: number, height: number, start: number,
  status: (text: string) => void, signal: AbortSignal, reference?: File, preferGpu = true, includeBaseline = true): Promise<LabResult> {
  if (file.size > 150 * 1024 * 1024) throw new Error('Use a clip under 150 MB for this experiment.')
  if (width > 1920 || height > 1920 || width * height > 1920 * 1080) throw new Error('Use a video at 1080p or below for this experiment.')
  if (!Number.isFinite(start) || start < 0) throw new Error('Choose a valid start time.')
  const crop = getCrop(region, width, height)
  const { x, y, w, h, cx, cy, cw, ch } = crop
  const worker = new Worker('/video-lab/inpaint-worker.js', { type: 'module' })
  let loaded: Awaited<ReturnType<typeof loadEngine>> | undefined
  try {
    loaded = await loadEngine(status, signal)
    const { engine } = loaded
    await engine.writeFile('input', new Uint8Array(await file.arrayBuffer()))
    status('Preparing a three-second comparison with audio…')
    let color = videoColor('')
    const captureColor = ({ message }: { message: string }) => { if (message.includes('Video:')) color = videoColor(message) }
    engine.on('log', captureColor)
    try {
      await exec(engine, ['-ss', String(start), '-i', 'input', '-t', String(MAX_SECONDS), '-map', '0:v:0', '-map', '0:a:0?',
        '-vf', `fps=${FPS},pad=ceil(iw/2)*2:ceil(ih/2)*2`, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18',
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-y', 'original.mp4'], signal)
    } finally { engine.off('log', captureColor) }
    await engine.deleteFile('input')

    // pad supplies the sample border delogo requires, including selections at a frame edge.
    if (includeBaseline || reference) {
    status('Running the existing remover for comparison…')
    await exec(engine, ['-i', 'original.mp4', '-vf', `pad=iw+4:ih+4:2:2,delogo=x=${x + 2}:y=${y + 2}:w=${w}:h=${h},crop=iw-4:ih-4:2:2`,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-c:a', 'copy', '-y', 'baseline.mp4'], signal)

    }
    status('Extracting only the area around the watermark…')
    await exec(engine, ['-i', 'original.mp4', '-vf', `${TO_RGB},crop=${cw}:${ch}:${cx}:${cy}:exact=1`, '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-y', 'crops.rgb'], signal)
    const raw = await bytes(engine, 'crops.rgb')
    await engine.deleteFile('crops.rgb')
    const frameSize = cw * ch * 3
    const frames = raw.length / frameSize
    if (!Number.isInteger(frames) || frames < 1 || frames > MAX_SECONDS * FPS + 1) throw new Error('Unexpected decoded frame count')
    const mask = new Uint8Array(cw * ch).fill(255)
    for (let my = y - cy; my < y - cy + h; my++) mask.fill(0, my * cw + x - cx, my * cw + x - cx + w)

    status('Checking whether the background can be repaired without invented texture…')
    // Use one method per detected shot, avoiding arbitrary frame-to-frame switching.
    const eligible: boolean[] = []
    const cuts: boolean[] = []
    for (let frame = 0; frame < frames; frame++) {
      const pixels = raw.slice(frame * frameSize, (frame + 1) * frameSize)
      cuts.push(frame === 0 || isSceneCut(raw.subarray((frame - 1) * frameSize, frame * frameSize), pixels, mask))
      const assessment = await request(worker, { kind: 'assess', pixels, mask, width: cw, height: ch }, signal, [pixels.buffer])
      eligible.push(assessment.smooth)
    }
    const choices = smoothShotChoices(eligible, cuts)
    const smoothFrames = choices.filter(Boolean).length
    status(smoothFrames === frames ? 'Matching the surrounding background gradient…' : 'Loading the 28 MB cleanup model on your device…')
    const loadedModel = await request(worker, { kind: 'load', preferGpu, smooth: smoothFrames === frames }, signal)
    const backend = smoothFrames > 0 && smoothFrames < frames ? `Adaptive: smooth background + ${loadedModel.backend}` : loadedModel.backend
    let inferenceMs = 0
    for (let frame = 0; frame < frames; frame++) {
      status(`Cleanup: frame ${frame + 1} of ${frames}…`)
      const pixels = raw.slice(frame * frameSize, (frame + 1) * frameSize)
      const began = performance.now()
      const result = await request(worker, { pixels, mask, width: cw, height: ch, smooth: choices[frame] }, signal, [pixels.buffer])
      inferenceMs += performance.now() - began
      raw.set(result.pixels, frame * frameSize)
    }
    status('Combining the repaired area with the original video and audio…')
    await engine.writeFile('patches.rgb', raw)
    // Composite in a common RGB space. Converting a raw patch independently to
    // YUV loses its matrix/range metadata and used to darken even unchanged crops.
    await exec(engine, ['-i', 'original.mp4', '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', `${cw}x${ch}`, '-framerate', String(FPS), '-i', 'patches.rgb',
      '-filter_complex', `[0:v]${TO_RGB}[base];[1:v]crop=${w}:${h}:${x - cx}:${y - cy}:exact=1[patch];[base][patch]overlay=${x}:${y}:format=rgb:shortest=1,scale=flags=accurate_rnd+full_chroma_int:in_range=pc:out_range=${color.range}:out_color_matrix=${color.matrix},format=yuv420p[out]`,
      '-map', '[out]', '-map', '0:a:0?', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-pix_fmt', 'yuv420p',
      ...(color.tag ? ['-colorspace', color.tag] : []), '-color_range', color.range, '-c:a', 'copy', '-y', 'ai.mp4'], signal)
    let quality: LabResult['quality']
    if (reference) {
      status('Measuring reconstruction against the clean test clip…')
      await engine.writeFile('reference.mp4', new Uint8Array(await reference.arrayBuffer()))
      const decodeRegion = async (name: string, offset = 0) => {
        await exec(engine, ['-ss', String(offset), '-i', name, '-t', String(frames / FPS), '-vf', `fps=${FPS},crop=${w}:${h}:${x}:${y}:exact=1`,
          '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-y', 'measure.rgb'], signal)
        return bytes(engine, 'measure.rgb')
      }
      const clean = await decodeRegion('reference.mp4', start)
      quality = {} as NonNullable<LabResult['quality']>
      for (const key of ['original', 'baseline', 'ai'] as const) {
        const test = await decodeRegion(`${key}.mp4`)
        if (test.length !== clean.length) throw new Error('Benchmark frame alignment mismatch')
        let squaredError = 0
        let temporalError = 0
        const stride = w * h * 3
        for (let i = 0; i < clean.length; i++) {
          const error = test[i] - clean[i]
          squaredError += error * error
          if (i >= stride) temporalError += Math.abs(error - (test[i - stride] - clean[i - stride]))
        }
        quality[key] = {
          psnr: squaredError === 0 ? 100 : 10 * Math.log10(255 * 255 / (squaredError / clean.length)),
          temporalError: clean.length > stride ? temporalError / (clean.length - stride) : 0,
        }
      }
    }
    return {
      original: await videoBlob(engine, 'original.mp4'), baseline: await videoBlob(engine, includeBaseline || reference ? 'baseline.mp4' : 'original.mp4'), ai: await videoBlob(engine, 'ai.mp4'),
      seconds: frames / FPS, frames, inferenceMs, quality, backend, smoothFrames,
    }
  } finally {
    worker.terminate()
    loaded?.close()
  }
}

export async function createDemo(status: (text: string) => void, signal: AbortSignal) {
  const loaded = await loadEngine(status, signal)
  try {
    status('Creating a moving test pattern and an audio tone…')
    const { engine } = loaded
    await exec(engine, ['-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=12:duration=3', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3',
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', '-y', 'clean.mp4'], signal)
    await exec(engine, ['-i', 'clean.mp4', '-vf', 'drawbox=x=270:y=140:w=90:h=14:color=white:t=fill,drawbox=x=307:y=154:w=16:h=50:color=white:t=fill',
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-c:a', 'copy', '-y', 'demo.mp4'], signal)
    return {
      file: new File([await videoBlob(engine, 'demo.mp4')], 'toolpile-test-pattern.mp4', { type: 'video/mp4' }),
      reference: new File([await videoBlob(engine, 'clean.mp4')], 'toolpile-reference.mp4', { type: 'video/mp4' }),
    }
  } finally { loaded.close() }
}

export async function createFountainDemo(status: (text: string) => void, signal: AbortSignal) {
  const loaded = await loadEngine(status, signal)
  const region = { x: 690, y: 390, w: 180, h: 70 }
  try {
    const { engine } = loaded
    status('Loading the licensed fountain footage…')
    const response = await fetch('/video-lab/runtime/fountain.webm', { signal })
    if (!response.ok) throw new Error('Fountain fixture missing. Run node scripts/prepare-fountain-fixture.mjs first.')
    await engine.writeFile('source.webm', new Uint8Array(await response.arrayBuffer()))
    status('Preparing the clean reference: 5–8 seconds, 720p…')
    await exec(engine, ['-ss', '5', '-i', 'source.webm', '-t', '3', '-vf', 'scale=1280:720,fps=12',
      '-map', '0:v:0', '-map', '0:a:0?', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-y', 'clean.mp4'], signal)
    await engine.deleteFile('source.webm')
    const canvas = document.createElement('canvas')
    canvas.width = region.w
    canvas.height = region.h
    const ctx = canvas.getContext('2d')!
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.shadowColor = 'rgba(0,0,0,0.65)'
    ctx.shadowBlur = 3
    ctx.shadowOffsetY = 2
    ctx.fillText('TOOLPILE', region.w / 2, region.h / 2)
    const logo = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not create test watermark'))))
    await engine.writeFile('logo.png', new Uint8Array(await logo.arrayBuffer()))
    status('Adding a translucent test logo over the moving water…')
    await exec(engine, ['-i', 'clean.mp4', '-i', 'logo.png', '-filter_complex', `[0:v][1:v]overlay=${region.x}:${region.y}[out]`,
      '-map', '[out]', '-map', '0:a:0?', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-y', 'marked.mp4'], signal)
    return {
      file: new File([await videoBlob(engine, 'marked.mp4')], 'fountain-watermark-test.mp4', { type: 'video/mp4' }),
      reference: new File([await videoBlob(engine, 'clean.mp4')], 'fountain-clean-reference.mp4', { type: 'video/mp4' }),
      region,
    }
  } finally { loaded.close() }
}
