import { bytes, exec, getCrop, loadEngine, request, TO_RGB, sourceRate, videoBlob, videoColor, type Region } from './video-cleanup-lab'
import { isSceneCut, smoothShotChoices } from '../../public/video-lab/smooth-background.mjs'

export type ExportResult = { video: Blob; frames: number; fps: number; seconds: number; backend: string }

// Bounded decoded memory: two passes keep only one 24-frame crop batch and
// boolean shot assessments, rather than the entire video's RGB frames.
export async function exportVideo(file: File, region: Region, width: number, height: number, duration: number,
  status: (text: string) => void, signal: AbortSignal, preferGpu = true): Promise<ExportResult> {
  if (file.size > 150 * 1024 * 1024) throw new Error('Choose a video under 150 MB.')
  if (!Number.isFinite(duration) || duration <= 0 || duration > 120) throw new Error('Full export currently supports videos up to two minutes.')
  if (width > 1920 || height > 1920 || width * height > 1920 * 1080) throw new Error('Choose a video at 1080p or below.')
  const { x, y, w, h, cx, cy, cw, ch } = getCrop(region, width, height)
  const worker = new Worker('/video-lab/inpaint-worker.js', { type: 'module' })
  let loaded: Awaited<ReturnType<typeof loadEngine>> | undefined
  try {
    loaded = await loadEngine(status, signal)
    const { engine } = loaded
    await engine.writeFile('input', new Uint8Array(await file.arrayBuffer()))
    let stream = ''
    const capture = ({ message }: { message: string }) => {
      if (!stream && message.includes('Video:')) stream = message
    }
    engine.on('log', capture)
    try { await exec(engine, ['-i', 'input', '-map', '0:v:0', '-frames:v', '1', '-f', 'null', '-'], signal) }
    finally { engine.off('log', capture) }
    if (/smpte2084|arib-std-b67|bt2020/.test(stream)) throw new Error('HDR video is not supported yet. Export an SDR copy first.')
    const rate = sourceRate(stream)
    const [numerator, denominator = '1'] = rate.split('/')
    const fps = Number(numerator) / Number(denominator)
    const color = videoColor(stream)
    let frames = 0
    const count = ({ message }: { message: string }) => {
      const match = message.match(/frame=\s*(\d+)/)
      if (match) frames = Math.max(frames, Number(match[1]))
    }
    status(`Preparing the full video at ${fps.toFixed(3)} fps…`)
    engine.on('log', count)
    try {
      await exec(engine, ['-i', 'input', '-map', '0:v:0', '-map', '0:a:0?',
        '-vf', `fps=${rate},pad=ceil(iw/2)*2:ceil(ih/2)*2`, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18',
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-y', 'source.mp4'], signal)
    } finally { engine.off('log', count) }
    await engine.deleteFile('input')
    if (!frames || frames > Math.ceil(121 * fps)) throw new Error('Could not verify the full video frame count.')
    const frameSize = cw * ch * 3
    const batch = 24
    const mask = new Uint8Array(cw * ch).fill(255)
    for (let my = y - cy; my < y - cy + h; my++) mask.fill(0, my * cw + x - cx, my * cw + x - cx + w)
    const decode = async (first: number, length: number) => {
      await exec(engine, ['-ss', String(first / fps), '-i', 'source.mp4', '-frames:v', String(length),
        '-vf', `${TO_RGB},crop=${cw}:${ch}:${cx}:${cy}:exact=1`, '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-y', 'crop.rgb'], signal)
      const raw = await bytes(engine, 'crop.rgb')
      await engine.deleteFile('crop.rgb')
      if (raw.length !== length * frameSize) throw new Error('Frame alignment failed. No incomplete video was exported.')
      return raw
    }
    const eligible: boolean[] = []
    const cuts: boolean[] = []
    let previous: Uint8Array | undefined
    for (let first = 0; first < frames; first += batch) {
      const length = Math.min(batch, frames - first)
      const raw = await decode(first, length)
      for (let i = 0; i < length; i++) {
        status(`Checking backgrounds: frame ${first + i + 1} of ${frames}…`)
        const pixels = raw.slice(i * frameSize, (i + 1) * frameSize)
        cuts.push(!previous || isSceneCut(previous, pixels, mask))
        previous = pixels.slice()
        eligible.push((await request(worker, { kind: 'assess', pixels, mask, width: cw, height: ch }, signal, [pixels.buffer])).smooth)
      }
    }
    const choices = smoothShotChoices(eligible, cuts)
    status('Loading the cleanup model…')
    const { backend } = await request(worker, { kind: 'load', preferGpu, smooth: choices.every(Boolean) }, signal)
    const segments: string[] = []
    for (let first = 0; first < frames; first += batch) {
      const length = Math.min(batch, frames - first)
      const raw = await decode(first, length)
      for (let i = 0; i < length; i++) {
        status(`Removing watermark: frame ${first + i + 1} of ${frames}…`)
        const pixels = raw.slice(i * frameSize, (i + 1) * frameSize)
        const result = await request(worker, { pixels, mask, width: cw, height: ch, smooth: choices[first + i] }, signal, [pixels.buffer])
        raw.set(result.pixels, i * frameSize)
      }
      await engine.writeFile('patch.rgb', raw)
      const name = `part-${segments.length}.mp4`
      status(`Encoding video: ${Math.round((first + length) / frames * 100)}%…`)
      await exec(engine, ['-ss', String(first / fps), '-i', 'source.mp4', '-f', 'rawvideo', '-pixel_format', 'rgb24',
        '-video_size', `${cw}x${ch}`, '-framerate', rate, '-i', 'patch.rgb',
        '-filter_complex', `[0:v]setpts=PTS-STARTPTS,${TO_RGB}[base];[1:v]crop=${w}:${h}:${x - cx}:${y - cy}:exact=1[patch];[base][patch]overlay=${x}:${y}:format=rgb:shortest=1,scale=flags=accurate_rnd+full_chroma_int:in_range=pc:out_range=${color.range}:out_color_matrix=${color.matrix},format=yuv420p[out]`,
        '-map', '[out]', '-frames:v', String(length), '-an', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18',
        ...(color.tag ? ['-colorspace', color.tag] : []), '-color_range', color.range, '-video_track_timescale', numerator.includes('.') ? '60000' : numerator,
        '-y', name], signal)
      await engine.deleteFile('patch.rgb')
      // MP4 container durations round to milliseconds. Supply exact frame-based
      // durations so fractional rates do not accumulate drift at every join.
      segments.push(`file '${name}'\nduration ${(length / fps).toFixed(9)}`)
    }
    status('Finishing the full video and restoring audio…')
    await engine.writeFile('parts.txt', segments.join('\n'))
    await exec(engine, ['-f', 'concat', '-safe', '0', '-i', 'parts.txt', '-i', 'source.mp4', '-map', '0:v:0', '-map', '1:a:0?',
      '-c', 'copy', '-movflags', '+faststart', '-y', 'finished.mp4'], signal)
    return { video: await videoBlob(engine, 'finished.mp4'), frames, fps, seconds: frames / fps, backend }
  } finally { worker.terminate(); loaded?.close() }
}
