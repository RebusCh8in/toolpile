'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  {
    question: "How do I remove a watermark from a video for free?",
    answer: "Upload your video to this tool, draw a rectangle over the watermark, choose a removal mode (Content-Aware Fill for best quality, Smart Remove for speed, or Blur as a fallback), and click Remove Watermark. Everything runs in your browser — no upload, no signup."
  },
  {
    question: "What is Content-Aware Fill and how is it different from Smart Remove?",
    answer: "Content-Aware Fill extracts every frame from your video and applies an edge-aware inpainting algorithm that detects local structure and fills the watermark region by extending surrounding textures and edges inward. Smart Remove uses FFmpeg's delogo filter which is faster but uses simpler interpolation. Content-Aware Fill produces significantly better results on complex backgrounds."
  },
  {
    question: "Does removing a video watermark reduce quality?",
    answer: "The tool uses FFmpeg with high-quality encoding (CRF 20) so the rest of your video stays sharp. Only the selected watermark region is modified. Audio is copied without re-encoding."
  },
  {
    question: "Is there a file size or video length limit?",
    answer: "There is no hard limit since processing happens locally. Content-Aware Fill is slower (it processes every frame individually), so it works best on clips under 2 minutes. Smart Remove and Blur handle longer videos easily."
  },
  {
    question: "Can I remove watermarks from TikTok or YouTube videos?",
    answer: "Yes, as long as you have the video file downloaded. Upload the MP4, WebM, or MOV file and select the watermark area."
  },
  {
    question: "Is my video uploaded to a server?",
    answer: "No. All processing happens entirely in your browser using WebAssembly-powered FFmpeg and JavaScript canvas inpainting. Your video never leaves your device."
  }
]

const relatedTools: RelatedTool[] = [
  { name: "Photo Watermark Remover", href: "/tools/photo-watermark-remover" },
  { name: "Image Color Picker", href: "/tools/image-color-picker" },
  { name: "Aspect Ratio Calculator", href: "/tools/aspect-ratio-calculator" }
]

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

type Mode = 'fill' | 'delogo' | 'blur'

export default function VideoWatermarkRemover() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [step, setStep] = useState<'upload' | 'select' | 'processing' | 'done'>('upload')
  const [rect, setRect] = useState<Rect | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawOrigin, setDrawOrigin] = useState<{ x: number; y: number } | null>(null)
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const [nativeSize, setNativeSize] = useState({ width: 0, height: 0 })
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [processedUrl, setProcessedUrl] = useState('')
  const [mode, setMode] = useState<Mode>('fill')
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // ── Upload ──
  const handleUpload = useCallback((file: File) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (processedUrl) URL.revokeObjectURL(processedUrl)
    const url = URL.createObjectURL(file)
    setVideoFile(file)
    setVideoUrl(url)
    setRect(null)
    setError('')
    setProcessedUrl('')
    setStep('select')
  }, [videoUrl, processedUrl])

  // ── Calculate display size from native video dimensions ──
  const calcDisplaySize = useCallback((nw: number, nh: number) => {
    const maxW = Math.min(1000, window.innerWidth - 80)
    const maxH = Math.min(620, window.innerHeight * 0.6)
    const scale = Math.min(maxW / nw, maxH / nh, 1)
    return { width: Math.round(nw * scale), height: Math.round(nh * scale) }
  }, [])

  // ── When video metadata loads ──
  const onVideoMetadata = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const nw = video.videoWidth
    const nh = video.videoHeight
    if (!nw || !nh) return

    setNativeSize({ width: nw, height: nh })
    setDuration(video.duration)
    const ds = calcDisplaySize(nw, nh)
    setDisplaySize(ds)
    video.currentTime = Math.min(0.1, video.duration)
  }, [calcDisplaySize])

  // ── Keep overlay canvas sized ──
  useEffect(() => {
    if (!displaySize.width) return
    const overlay = overlayRef.current
    if (!overlay) return
    overlay.width = displaySize.width
    overlay.height = displaySize.height
  }, [displaySize])

  // ── Timeline scrub ──
  const seekTo = (time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
    setCurrentTime(time)
  }

  // ── Rectangle drawing ──
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const el = overlayRef.current
    if (!el) return { x: 0, y: 0 }
    const bounds = el.getBoundingClientRect()
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX - bounds.left, y: e.touches[0].clientY - bounds.top }
    }
    const me = e as React.MouseEvent
    return { x: me.clientX - bounds.left, y: me.clientY - bounds.top }
  }

  const drawRectOverlay = useCallback((r: Rect) => {
    const ctx = overlayRef.current?.getContext('2d')
    if (!ctx || !displaySize.width) return
    const w = displaySize.width
    const h = displaySize.height
    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.fillRect(0, 0, w, h)
    ctx.clearRect(r.x, r.y, r.w, r.h)

    ctx.strokeStyle = '#C45D3E'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.strokeRect(r.x, r.y, r.w, r.h)
    ctx.setLineDash([])

    ctx.fillStyle = '#C45D3E'
    ctx.font = 'bold 11px sans-serif'
    const label = `${Math.round(r.w)}×${Math.round(r.h)}`
    ctx.fillText(label, r.x + 4, r.y > 18 ? r.y - 6 : r.y + r.h + 14)
  }, [displaySize])

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.preventDefault()
    const pos = getPos(e)
    setIsDrawing(true)
    setDrawOrigin(pos)
    setRect(null)
    const ctx = overlayRef.current?.getContext('2d')
    if (ctx && displaySize.width) ctx.clearRect(0, 0, displaySize.width, displaySize.height)
  }

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !drawOrigin) return
    if ('touches' in e) e.preventDefault()
    const pos = getPos(e)
    const x = Math.min(drawOrigin.x, pos.x)
    const y = Math.min(drawOrigin.y, pos.y)
    const w = Math.abs(pos.x - drawOrigin.x)
    const h = Math.abs(pos.y - drawOrigin.y)
    if (w > 4 && h > 4) {
      const newRect = { x, y, w, h }
      setRect(newRect)
      drawRectOverlay(newRect)
    }
  }

  const handlePointerUp = () => {
    setIsDrawing(false)
    setDrawOrigin(null)
  }

  // ── FFmpeg processing (Smart Remove & Blur) ──
  const processFFmpeg = async (ffmpegMode: 'delogo' | 'blur') => {
    if (!videoFile || !rect || !displaySize.width) return

    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util')

    const ffmpeg = new FFmpeg()
    ffmpeg.on('progress', ({ progress: p }) => setProgress(Math.min(Math.round(p * 100), 99)))
    ffmpeg.on('log', ({ message }) => {
      const m = message.match(/frame=\s*(\d+)/)
      if (m) setStatusMsg(`Processing frame ${m[1]}...`)
    })

    setStatusMsg('Downloading video engine (~30 MB, cached after first use)...')
    await ffmpeg.load({
      coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
    })

    setStatusMsg('Reading video file...')
    const ext = videoFile.name.match(/\.[^.]+$/)?.[0] || '.mp4'
    const inputName = `input${ext}`
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile))

    const sx = nativeSize.width / displaySize.width
    const sy = nativeSize.height / displaySize.height
    const pad = 4
    const vx = Math.max(0, Math.round(rect.x * sx) - pad)
    const vy = Math.max(0, Math.round(rect.y * sy) - pad)
    const vw = Math.min(Math.round(rect.w * sx) + pad * 2, nativeSize.width - vx)
    const vh = Math.min(Math.round(rect.h * sy) + pad * 2, nativeSize.height - vy)

    setStatusMsg('Removing watermark...')
    let filter: string
    if (ffmpegMode === 'delogo') {
      filter = `delogo=x=${vx}:y=${vy}:w=${vw}:h=${vh}`
    } else {
      const bx = Math.max(0, vx - 15)
      const by = Math.max(0, vy - 15)
      const bw = Math.min(vw + 30, nativeSize.width - bx)
      const bh = Math.min(vh + 30, nativeSize.height - by)
      filter = `split[a][b];[b]crop=${bw}:${bh}:${bx}:${by},gblur=sigma=40[blur];[a][blur]overlay=${bx}:${by}`
    }

    await ffmpeg.exec(['-i', inputName, '-vf', filter, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '20', '-c:a', 'copy', '-y', 'output.mp4'])

    setStatusMsg('Preparing download...')
    const data = await ffmpeg.readFile('output.mp4')
    const raw = data as Uint8Array
    const copy = new ArrayBuffer(raw.byteLength)
    new Uint8Array(copy).set(raw)
    const blob = new Blob([copy], { type: 'video/mp4' })

    if (blob.size < 1000) throw new Error('Output video is empty. Try a different mode.')

    await ffmpeg.deleteFile(inputName).catch(() => {})
    await ffmpeg.deleteFile('output.mp4').catch(() => {})
    ffmpeg.terminate()

    return blob
  }

  // ── Content-Aware Fill: frame-by-frame inpainting ──
  const processContentAwareFill = async () => {
    if (!videoFile || !rect || !displaySize.width) return

    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const { fetchFile, toBlobURL } = await import('@ffmpeg/util')
    const { inpaintContentAware } = await import('@/lib/inpaint')

    const ffmpeg = new FFmpeg()

    // Detect FPS from probe
    let detectedFps = 30
    ffmpeg.on('log', ({ message }) => {
      const m = message.match(/(\d+(?:\.\d+)?)\s+fps/)
      if (m) detectedFps = Math.round(parseFloat(m[1]))
    })

    setStatusMsg('Downloading video engine (~30 MB, cached after first use)...')
    await ffmpeg.load({
      coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
    })

    setStatusMsg('Reading video file...')
    const ext = videoFile.name.match(/\.[^.]+$/)?.[0] || '.mp4'
    const inputName = `input${ext}`
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile))

    // Probe to get FPS
    setStatusMsg('Analyzing video...')
    await ffmpeg.exec(['-i', inputName, '-f', 'null', '-t', '0.01', '-']).catch(() => {})

    // Limit FPS for content-aware to keep processing time reasonable
    const processFps = Math.min(detectedFps, 30)

    // Extract frames as JPEG
    setStatusMsg('Extracting frames...')
    await ffmpeg.exec([
      '-i', inputName,
      '-vf', `fps=${processFps}`,
      '-qscale:v', '3',
      '-y',
      'frame_%05d.jpg'
    ])

    // Extract audio separately
    await ffmpeg.exec(['-i', inputName, '-vn', '-c:a', 'copy', '-y', 'audio.aac']).catch(() => {})
    const hasAudio = await ffmpeg.readFile('audio.aac').then(() => true).catch(() => false)

    // List frames
    const files = await ffmpeg.listDir('/')
    const frameFiles = files
      .filter(f => f.name.startsWith('frame_') && f.name.endsWith('.jpg'))
      .map(f => f.name)
      .sort()

    if (frameFiles.length === 0) throw new Error('Failed to extract frames from video.')

    // Scale rectangle to native coords
    const sx = nativeSize.width / displaySize.width
    const sy = nativeSize.height / displaySize.height
    const pad = 6
    const vx = Math.max(0, Math.round(rect.x * sx) - pad)
    const vy = Math.max(0, Math.round(rect.y * sy) - pad)
    const vw = Math.min(Math.round(rect.w * sx) + pad * 2, nativeSize.width - vx)
    const vh = Math.min(Math.round(rect.h * sy) + pad * 2, nativeSize.height - vy)

    // Create offscreen canvas for frame processing
    const offCanvas = document.createElement('canvas')
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })!

    setStatusMsg(`Inpainting ${frameFiles.length} frames...`)

    for (let i = 0; i < frameFiles.length; i++) {
      setStatusMsg(`Content-Aware Fill: frame ${i + 1}/${frameFiles.length}`)
      setProgress(Math.round((i / frameFiles.length) * 90))

      // Read frame from FFmpeg FS
      const frameData = await ffmpeg.readFile(frameFiles[i])
      const raw = frameData as Uint8Array
      const buf = new ArrayBuffer(raw.byteLength)
      new Uint8Array(buf).set(raw)
      const blob = new Blob([buf], { type: 'image/jpeg' })
      const bitmap = await createImageBitmap(blob)

      offCanvas.width = bitmap.width
      offCanvas.height = bitmap.height
      offCtx.drawImage(bitmap, 0, 0)

      // Create mask for the watermark rectangle
      const imgData = offCtx.getImageData(0, 0, bitmap.width, bitmap.height)
      const mask = new Uint8Array(bitmap.width * bitmap.height)
      for (let my = vy; my < vy + vh && my < bitmap.height; my++) {
        for (let mx = vx; mx < vx + vw && mx < bitmap.width; mx++) {
          mask[my * bitmap.width + mx] = 1
        }
      }

      // Run edge-aware inpainting (fast mode for video)
      const result = inpaintContentAware(imgData, mask, 'fast')
      offCtx.putImageData(result, 0, 0)

      // Write processed frame back
      const processedBlob = await new Promise<Blob>((resolve) => {
        offCanvas.toBlob(b => resolve(b!), 'image/jpeg', 0.95)
      })
      const processedData = new Uint8Array(await processedBlob.arrayBuffer())
      await ffmpeg.writeFile(frameFiles[i], processedData)

      bitmap.close()
    }

    // Re-encode frames + audio
    setStatusMsg('Encoding final video...')
    setProgress(92)

    const encodeArgs = [
      '-framerate', String(processFps),
      '-i', 'frame_%05d.jpg',
    ]
    if (hasAudio) {
      encodeArgs.push('-i', 'audio.aac', '-map', '0:v', '-map', '1:a', '-c:a', 'copy')
    }
    encodeArgs.push(
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '20',
      '-pix_fmt', 'yuv420p',
      '-y', 'output.mp4'
    )

    await ffmpeg.exec(encodeArgs)

    setStatusMsg('Preparing download...')
    const outData = await ffmpeg.readFile('output.mp4')
    const outRaw = outData as Uint8Array
    const outCopy = new ArrayBuffer(outRaw.byteLength)
    new Uint8Array(outCopy).set(outRaw)
    const outBlob = new Blob([outCopy], { type: 'video/mp4' })

    if (outBlob.size < 1000) throw new Error('Output video is empty.')

    // Cleanup
    for (const f of frameFiles) await ffmpeg.deleteFile(f).catch(() => {})
    await ffmpeg.deleteFile(inputName).catch(() => {})
    await ffmpeg.deleteFile('output.mp4').catch(() => {})
    if (hasAudio) await ffmpeg.deleteFile('audio.aac').catch(() => {})
    ffmpeg.terminate()

    return outBlob
  }

  // ── Main process dispatcher ──
  const processVideo = async () => {
    if (!videoFile || !rect || !displaySize.width) return

    setStep('processing')
    setProgress(0)
    setError('')

    try {
      setStatusMsg('Loading video engine...')
      let blob: Blob | undefined

      if (mode === 'fill') {
        blob = await processContentAwareFill()
      } else {
        blob = await processFFmpeg(mode)
      }

      if (blob) {
        setProcessedUrl(URL.createObjectURL(blob))
        setProgress(100)
        setStep('done')
      }
    } catch (err) {
      console.error('Processing error:', err)
      setError(err instanceof Error ? err.message : 'Processing failed. Try a different mode.')
      setStep('select')
    }
  }

  const downloadResult = () => {
    if (!processedUrl) return
    const a = document.createElement('a')
    a.href = processedUrl
    a.download = `clean-${videoFile?.name?.replace(/\.[^.]+$/, '') || 'video'}.mp4`
    a.click()
  }

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (processedUrl) URL.revokeObjectURL(processedUrl)
    setVideoFile(null)
    setVideoUrl('')
    setProcessedUrl('')
    setRect(null)
    setStep('upload')
    setProgress(0)
    setStatusMsg('')
    setError('')
    setDisplaySize({ width: 0, height: 0 })
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const modeDescriptions: Record<Mode, { label: string; desc: string }> = {
    fill: { label: 'Content-Aware Fill', desc: 'Best quality — inpaints each frame with edge-aware algorithm. Slower.' },
    delogo: { label: 'Smart Remove', desc: 'Fast — FFmpeg delogo interpolation. Good for simple backgrounds.' },
    blur: { label: 'Blur', desc: 'Fallback — heavy gaussian blur. Works on anything.' },
  }

  return (
    <ToolLayout
      title="Video Watermark Remover"
      description="Remove watermarks from any video for free. Content-Aware Fill, Smart Remove, and Blur modes. No upload, no signup, runs entirely in your browser."
      category="Design"
      slug="video-watermark-remover"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "video watermark remover",
        "remove watermark from video free",
        "content aware fill video",
        "video watermark remover online",
        "remove logo from video",
        "ffmpeg watermark removal",
        "video watermark eraser",
        "remove text from video",
        "free watermark remover no signup"
      ]}
      guide={
        <>
          <h2>What Is the Video Watermark Remover?</h2>
          <p>
            The Video Watermark Remover is a free browser-based tool that removes watermarks, logos, and text overlays from any video file. It offers three removal modes including Content-Aware Fill, which uses an edge-aware inpainting algorithm to intelligently reconstruct the background behind a watermark.
          </p>
          <p>
            All processing happens entirely on your device using FFmpeg WebAssembly and JavaScript canvas processing. Nothing is uploaded to a server.
          </p>

          <h3>Three Removal Modes</h3>
          <ul>
            <li><strong>Content-Aware Fill</strong> — Extracts every frame, detects edge structure around the watermark, and fills inward by extending surrounding textures along their natural direction. Produces the most natural results, especially on complex or textured backgrounds. Slower, best for clips under 2 minutes.</li>
            <li><strong>Smart Remove</strong> — Uses FFmpeg&apos;s delogo filter to quickly interpolate surrounding pixels. Fast and effective for watermarks on simple or solid-color backgrounds.</li>
            <li><strong>Blur</strong> — Applies a heavy Gaussian blur that completely obscures the watermark. Use when other modes leave artifacts, or when the watermark is on a very complex moving background.</li>
          </ul>

          <h3>How to Remove a Watermark</h3>
          <ol>
            <li>Upload your video file (MP4, WebM, MOV).</li>
            <li>Scrub the timeline to find a frame where the watermark is visible.</li>
            <li>Click and drag a rectangle tightly around the watermark.</li>
            <li>Choose your removal mode.</li>
            <li>Click Remove Watermark and wait for processing.</li>
            <li>Preview the result and download.</li>
          </ol>

          <h3>Tips for Best Results</h3>
          <ul>
            <li>Draw the rectangle as tightly as possible — a smaller selection produces cleaner results.</li>
            <li>For semi-transparent stock watermarks (Shutterstock, Getty), Content-Aware Fill works great.</li>
            <li>For opaque text over a uniform background, Smart Remove is fastest and sufficient.</li>
            <li>Content-Aware Fill processes each frame individually, so processing time scales with video length. For quick tests, trim your video to the first 10-15 seconds.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* ── Upload ── */}
        {step === 'upload' && (
          <div
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('video/')) handleUpload(f) }}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('video-upload')?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
          >
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-lg text-zinc-300 mb-2">Drop a video here or click to upload</p>
            <p className="text-sm text-zinc-500">MP4, WebM, MOV — any length, any size</p>
            <p className="text-xs text-zinc-600 mt-3">
              Powered by FFmpeg + Content-Aware Fill. Everything runs in your browser.
            </p>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
            />
          </div>
        )}

        {/* ── Select watermark area ── */}
        {step === 'select' && (
          <>
            {/* Mode selector */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-zinc-400 mr-1">Mode:</span>
                {(['fill', 'delogo', 'blur'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      mode === m
                        ? m === 'fill' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {modeDescriptions[m].label}
                  </button>
                ))}
                <div className="flex gap-2 ml-auto">
                  <button onClick={reset} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors">
                    New Video
                  </button>
                  <button
                    onClick={processVideo}
                    disabled={!rect}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                  >
                    Remove Watermark
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-500">{modeDescriptions[mode].desc}</p>
            </div>

            {/* Timeline scrubber */}
            {duration > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 w-12">{formatTime(currentTime)}</span>
                  <input
                    type="range" min={0} max={duration} step={0.1}
                    value={currentTime}
                    onChange={e => seekTo(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs text-zinc-500 w-12">{formatTime(duration)}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Scrub to a frame where the watermark is visible, then draw a rectangle over it.
                </p>
              </div>
            )}

            {/* Video + overlay canvas */}
            <div className="flex justify-center bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div
                ref={containerRef}
                className="relative"
                style={displaySize.width ? { width: displaySize.width, height: displaySize.height } : undefined}
              >
                <video
                  ref={videoRef}
                  src={videoUrl}
                  muted
                  playsInline
                  preload="auto"
                  onLoadedMetadata={onVideoMetadata}
                  style={{ width: displaySize.width || '100%', height: displaySize.height || 'auto' }}
                  className="rounded block"
                />
                {displaySize.width > 0 && (
                  <canvas
                    ref={overlayRef}
                    className="absolute top-0 left-0 rounded"
                    style={{ width: displaySize.width, height: displaySize.height, cursor: 'crosshair', touchAction: 'none' }}
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                  />
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-zinc-300 mb-2">How to use:</h3>
              <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Scrub to a frame where the watermark is visible</li>
                <li>Click and drag a rectangle tightly around the watermark</li>
                <li>Choose <strong className="text-green-400">Content-Aware Fill</strong> for best quality, or <strong className="text-zinc-300">Smart Remove</strong> for speed</li>
                <li>Click &ldquo;Remove Watermark&rdquo; — audio is preserved</li>
              </ol>
            </div>
          </>
        )}

        {/* ── Processing ── */}
        {step === 'processing' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <div className="text-5xl mb-6">{mode === 'fill' ? '🧠' : '⚙️'}</div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">
              {mode === 'fill' ? 'Content-Aware Fill' : 'Processing Video'}
            </h2>
            <p className="text-sm text-zinc-400 mb-6">{statusMsg}</p>
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between text-sm text-zinc-400 mb-1">
                <span>{mode === 'fill' ? 'Inpainting frames' : progress > 0 ? 'Encoding' : 'Loading'}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${mode === 'fill' ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              {mode === 'fill'
                ? 'Each frame is being individually inpainted with edge-aware content fill. This takes longer but produces superior results.'
                : 'FFmpeg is processing your video locally. Keep this tab open.'}
            </p>
          </div>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-zinc-100 mb-2">Watermark Removed</h2>
              <p className="text-sm text-zinc-400 mb-6">Preview below. Audio has been preserved.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={downloadResult} className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-8 py-3 text-sm font-medium transition-colors">
                  Download Video (MP4)
                </button>
                <button onClick={() => { setStep('select'); setProcessedUrl(''); setError(''); }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-6 py-3 text-sm transition-colors">
                  Adjust &amp; Retry
                </button>
                <button onClick={reset} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-6 py-3 text-sm transition-colors">
                  New Video
                </button>
              </div>
            </div>
            {processedUrl && (
              <div className="flex justify-center bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <video src={processedUrl} controls className="rounded max-w-full" style={{ maxHeight: 500 }} />
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
