'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  {
    question: "How do I remove a watermark from a video for free?",
    answer: "Upload your video to this tool, draw a rectangle over the watermark, choose Smart Remove or Blur mode, and click Remove Watermark. Everything runs in your browser — no upload, no signup."
  },
  {
    question: "What is the difference between Smart Remove and Blur?",
    answer: "Smart Remove interpolates surrounding pixels into the watermark area and softens the result so edges blend in. Blur applies a feathered Gaussian blur that completely obscures the watermark — useful when Smart Remove leaves artifacts on complex backgrounds."
  },
  {
    question: "Can I remove a watermark that moves around the video?",
    answer: "Yes. Draw a separate rectangle over each position the watermark appears in. All selected regions are cleaned in a single pass, which handles TikTok-style watermarks that alternate between corners."
  },
  {
    question: "Does removing a video watermark reduce quality?",
    answer: "The tool uses FFmpeg with high-quality encoding (CRF 20) so the rest of your video stays sharp. Only the selected regions are modified. Audio is copied without re-encoding."
  },
  {
    question: "Is my video uploaded to a server?",
    answer: "No. All processing happens entirely in your browser using WebAssembly-powered FFmpeg. Your video never leaves your device."
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

type Mode = 'delogo' | 'blur'

type DragState =
  | { kind: 'draw'; originX: number; originY: number }
  | { kind: 'move'; index: number; offsetX: number; offsetY: number }
  | { kind: 'resize'; index: number; corner: 'nw' | 'ne' | 'sw' | 'se'; anchorX: number; anchorY: number }

const HANDLE_R = 7
const MIN_SIZE = 8

// Fire a GA4 event (gtag is loaded site-wide). Lets us measure the funnel:
// upload → watermark removed → download → coffee click.
function track(event: string) {
  if (typeof window === 'undefined') return
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  w.gtag?.('event', event, { tool: 'video-watermark-remover' })
}

export default function VideoWatermarkRemover() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  // FFmpeg instance and input file persist across runs so the engine loads once
  const ffmpegRef = useRef<import('@ffmpeg/ffmpeg').FFmpeg | null>(null)
  const inputNameRef = useRef<string>('')
  const dragRef = useRef<DragState | null>(null)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [step, setStep] = useState<'upload' | 'select' | 'processing' | 'done'>('upload')
  const [regions, setRegions] = useState<Rect[]>([])
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const [nativeSize, setNativeSize] = useState({ width: 0, height: 0 })
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [processedUrl, setProcessedUrl] = useState('')
  const [mode, setMode] = useState<Mode>('delogo')
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  // ── Upload ──
  const handleUpload = useCallback((file: File) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (processedUrl) URL.revokeObjectURL(processedUrl)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(file)
    setVideoFile(file)
    setVideoUrl(url)
    setRegions([])
    setError('')
    setProcessedUrl('')
    setPreviewUrl('')
    inputNameRef.current = ''
    setStep('select')
    track('wm_upload')
  }, [videoUrl, processedUrl, previewUrl])

  const calcDisplaySize = useCallback((nw: number, nh: number) => {
    const maxW = Math.min(1000, window.innerWidth - 80)
    const maxH = Math.min(620, window.innerHeight * 0.6)
    const scale = Math.min(maxW / nw, maxH / nh, 1)
    return { width: Math.round(nw * scale), height: Math.round(nh * scale) }
  }, [])

  const onVideoMetadata = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const nw = video.videoWidth
    const nh = video.videoHeight
    if (!nw || !nh) return
    setNativeSize({ width: nw, height: nh })
    setDuration(video.duration)
    setDisplaySize(calcDisplaySize(nw, nh))
    video.currentTime = Math.min(0.1, video.duration)
  }, [calcDisplaySize])

  useEffect(() => {
    if (!displaySize.width) return
    const overlay = overlayRef.current
    if (!overlay) return
    overlay.width = displaySize.width
    overlay.height = displaySize.height
  }, [displaySize])

  const seekTo = (time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
    setCurrentTime(time)
    // A preview belongs to the frame it was rendered from
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl('') }
  }

  // ── Overlay drawing ──
  const redraw = useCallback((rects: Rect[]) => {
    const ctx = overlayRef.current?.getContext('2d')
    if (!ctx || !displaySize.width) return
    const w = displaySize.width
    const h = displaySize.height
    ctx.clearRect(0, 0, w, h)
    if (rects.length === 0) return

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.fillRect(0, 0, w, h)
    rects.forEach(r => ctx.clearRect(r.x, r.y, r.w, r.h))

    rects.forEach((r, i) => {
      ctx.strokeStyle = '#3B82F6'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.strokeRect(r.x, r.y, r.w, r.h)
      ctx.setLineDash([])

      // corner handles
      ctx.fillStyle = '#3B82F6'
      ;[[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].forEach(([hx, hy]) => {
        ctx.beginPath()
        ctx.arc(hx, hy, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.font = 'bold 11px sans-serif'
      const label = `${i + 1} · ${Math.round(r.w)}×${Math.round(r.h)}`
      ctx.fillText(label, r.x + 4, r.y > 18 ? r.y - 6 : r.y + r.h + 14)
    })
  }, [displaySize])

  useEffect(() => { redraw(regions) }, [regions, redraw])

  // ── Pointer interactions: draw new, move, or resize existing ──
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

  const hitTest = (pos: { x: number; y: number }): DragState | null => {
    for (let i = regions.length - 1; i >= 0; i--) {
      const r = regions[i]
      const corners: Array<['nw' | 'ne' | 'sw' | 'se', number, number, number, number]> = [
        ['nw', r.x, r.y, r.x + r.w, r.y + r.h],
        ['ne', r.x + r.w, r.y, r.x, r.y + r.h],
        ['sw', r.x, r.y + r.h, r.x + r.w, r.y],
        ['se', r.x + r.w, r.y + r.h, r.x, r.y],
      ]
      for (const [corner, cx, cy, ax, ay] of corners) {
        if (Math.hypot(pos.x - cx, pos.y - cy) <= HANDLE_R) {
          return { kind: 'resize', index: i, corner, anchorX: ax, anchorY: ay }
        }
      }
      if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) {
        return { kind: 'move', index: i, offsetX: pos.x - r.x, offsetY: pos.y - r.y }
      }
    }
    return null
  }

  const clampToCanvas = (r: Rect): Rect => {
    const w = displaySize.width
    const h = displaySize.height
    return {
      x: Math.min(Math.max(r.x, 0), w - r.w),
      y: Math.min(Math.max(r.y, 0), h - r.h),
      w: r.w,
      h: r.h,
    }
  }

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) e.preventDefault()
    const pos = getPos(e)
    const hit = hitTest(pos)
    dragRef.current = hit ?? { kind: 'draw', originX: pos.x, originY: pos.y }
  }

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const drag = dragRef.current
    if (!drag) return
    if ('touches' in e) e.preventDefault()
    const pos = getPos(e)

    if (drag.kind === 'draw') {
      const x = Math.max(0, Math.min(drag.originX, pos.x))
      const y = Math.max(0, Math.min(drag.originY, pos.y))
      const w = Math.min(Math.abs(pos.x - drag.originX), displaySize.width - x)
      const h = Math.min(Math.abs(pos.y - drag.originY), displaySize.height - y)
      if (w > 4 && h > 4) {
        const draft = { x, y, w, h }
        redraw([...regions, draft])
      }
    } else if (drag.kind === 'move') {
      setRegions(prev => prev.map((r, i) =>
        i === drag.index ? clampToCanvas({ ...r, x: pos.x - drag.offsetX, y: pos.y - drag.offsetY }) : r
      ))
    } else {
      const px = Math.max(0, Math.min(pos.x, displaySize.width))
      const py = Math.max(0, Math.min(pos.y, displaySize.height))
      const x = Math.min(drag.anchorX, px)
      const y = Math.min(drag.anchorY, py)
      const w = Math.max(Math.abs(px - drag.anchorX), MIN_SIZE)
      const h = Math.max(Math.abs(py - drag.anchorY), MIN_SIZE)
      setRegions(prev => prev.map((r, i) => i === drag.index ? { x, y, w, h } : r))
    }
  }

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag || drag.kind !== 'draw') return
    const pos = getPos(e)
    const x = Math.max(0, Math.min(drag.originX, pos.x))
    const y = Math.max(0, Math.min(drag.originY, pos.y))
    const w = Math.min(Math.abs(pos.x - drag.originX), displaySize.width - x)
    const h = Math.min(Math.abs(pos.y - drag.originY), displaySize.height - y)
    if (w >= MIN_SIZE && h >= MIN_SIZE) {
      setRegions(prev => [...prev, { x, y, w, h }])
    } else {
      redraw(regions)
    }
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl('') }
  }

  const removeRegion = (index: number) => {
    setRegions(prev => prev.filter((_, i) => i !== index))
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl('') }
  }

  // ── Region math: display px → native px ──
  // delogo refuses rectangles that touch the frame edge, so inset by 1px.
  const nativeRegions = useCallback((inset: boolean) => {
    const sx = nativeSize.width / displaySize.width
    const sy = nativeSize.height / displaySize.height
    const pad = 4
    const minEdge = inset ? 1 : 0
    return regions.map(r => {
      let x = Math.round(r.x * sx) - pad
      let y = Math.round(r.y * sy) - pad
      let w = Math.round(r.w * sx) + pad * 2
      let h = Math.round(r.h * sy) + pad * 2
      x = Math.max(minEdge, x)
      y = Math.max(minEdge, y)
      w = Math.max(2, Math.min(w, nativeSize.width - minEdge - x))
      h = Math.max(2, Math.min(h, nativeSize.height - minEdge - y))
      return { x, y, w, h }
    })
  }, [regions, nativeSize, displaySize])

  // ── Filter graph ──
  // Smart Remove: chained delogo, then a light feathered blur over the same
  // regions to hide delogo's banding. Blur: strong feathered blur only.
  const buildFilter = useCallback(() => {
    const W = nativeSize.width
    const H = nativeSize.height
    const parts: string[] = []
    let cur = '[0:v]'

    if (mode === 'delogo') {
      const chain = nativeRegions(true).map(r => `delogo=x=${r.x}:y=${r.y}:w=${r.w}:h=${r.h}`).join(',')
      parts.push(`${cur}${chain}[dl]`)
      cur = '[dl]'
    }

    const sigma = mode === 'delogo' ? 4 : 40
    const feather = mode === 'delogo' ? 6 : 12
    // expand mask boxes by ~2*feather so blurring the mask ramps to full
    // strength at the original selection edge instead of at its center
    const grow = feather * 2
    const boxes = nativeRegions(false)
      .map(r => {
        const x = Math.max(0, r.x - grow)
        const y = Math.max(0, r.y - grow)
        const w = Math.min(r.w + grow * 2, W - x)
        const h = Math.min(r.h + grow * 2, H - y)
        return `drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=white:t=fill`
      })
      .join(',')

    parts.push(`${cur}split=3[b0][b1][b2]`)
    parts.push(`[b1]gblur=sigma=${sigma}[bl]`)
    // Derive the mask from a split of the video itself so it always has the
    // same frame count and timebase as the base/overlay. A standalone
    // color=...:d=N source relies on framesync repeatlast to cover the rest of
    // the clip, which the wasm ffmpeg build honors inconsistently — on a full
    // render the mask drops out and maskedmerge passes the original through
    // (watermark survives) even though a single-frame preview looks correct.
    // drawbox t=fill paints the whole frame black then white over each region,
    // so the underlying video content never bleeds into the mask.
    // lut stretches limited-range (16-235) to full range so white merges at 100%.
    parts.push(`[b2]drawbox=x=0:y=0:w=${W}:h=${H}:color=black:t=fill,${boxes},format=gray,gblur=sigma=${feather},lut=c0=clip((val-16)*255/219\\,0\\,255)[mk]`)
    // libx264 + yuv420p require even dimensions
    parts.push(`[b0][bl][mk]maskedmerge,scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p[vout]`)
    const filter = parts.join(';')
    ;(window as unknown as { __lastFilter?: string }).__lastFilter = filter
    return filter
  }, [mode, nativeRegions, nativeSize])

  // ── FFmpeg engine (loaded once, reused for previews and final render) ──
  const getFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current
    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const { toBlobURL } = await import('@ffmpeg/util')
    const ffmpeg = new FFmpeg()
    ffmpeg.on('progress', ({ progress: p }) => setProgress(Math.min(Math.round(p * 100), 99)))
    ffmpeg.on('log', ({ message }) => {
      // ring buffer of recent log lines for debugging failed runs
      const w = window as unknown as { __fflog?: string[] }
      w.__fflog = [...(w.__fflog ?? []).slice(-300), message]
      const m = message.match(/frame=\s*(\d+)/)
      if (m) setStatusMsg(`Processing frame ${m[1]}...`)
    })
    setStatusMsg('Downloading video engine (~30 MB, cached after first use)...')
    await ffmpeg.load({
      coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
    })
    ffmpegRef.current = ffmpeg
    return ffmpeg
  }

  const ensureInputWritten = async (ffmpeg: import('@ffmpeg/ffmpeg').FFmpeg) => {
    if (inputNameRef.current || !videoFile) return inputNameRef.current
    const { fetchFile } = await import('@ffmpeg/util')
    setStatusMsg('Reading video file...')
    const ext = videoFile.name.match(/\.[^.]+$/)?.[0] || '.mp4'
    const name = `input${ext}`
    await ffmpeg.writeFile(name, await fetchFile(videoFile))
    inputNameRef.current = name
    return name
  }

  useEffect(() => () => { ffmpegRef.current?.terminate() }, [])

  // ── Instant single-frame preview ──
  const renderPreview = async () => {
    if (!videoFile || regions.length === 0 || previewLoading) return
    setPreviewLoading(true)
    setError('')
    try {
      const ffmpeg = await getFFmpeg()
      const inputName = await ensureInputWritten(ffmpeg)
      setStatusMsg('')
      const t = videoRef.current?.currentTime ?? 0
      await ffmpeg.exec([
        '-ss', t.toFixed(3), '-i', inputName!,
        '-frames:v', '1',
        '-filter_complex', buildFilter(),
        '-map', '[vout]',
        '-y', 'preview.png',
      ])
      const data = await ffmpeg.readFile('preview.png')
      const raw = data as Uint8Array
      const copy = new ArrayBuffer(raw.byteLength)
      new Uint8Array(copy).set(raw)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(new Blob([copy], { type: 'image/png' })))
      await ffmpeg.deleteFile('preview.png').catch(() => {})
    } catch (err) {
      console.error('Preview error:', err)
      setError(`Preview failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setPreviewLoading(false)
    }
  }

  // ── Full render ──
  const processVideo = async () => {
    if (!videoFile || regions.length === 0 || !displaySize.width) return
    setStep('processing')
    setProgress(0)
    setError('')
    try {
      const ffmpeg = await getFFmpeg()
      const inputName = await ensureInputWritten(ffmpeg)

      setStatusMsg('Removing watermark...')
      // Cap output at the source duration in case the filter graph over-runs
      const durationCap = duration > 0 ? ['-t', (duration + 0.5).toFixed(2)] : []
      // Opus/Vorbis (webm audio) can't be copied into MP4 — transcode those
      const audioArgs = /\.webm$/i.test(inputName!) ? ['-c:a', 'aac', '-b:a', '192k'] : ['-c:a', 'copy']
      await ffmpeg.exec([
        '-i', inputName!,
        '-filter_complex', buildFilter(),
        '-map', '[vout]', '-map', '0:a?',
        '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '20',
        '-movflags', '+faststart',
        ...audioArgs,
        ...durationCap,
        '-y', 'output.mp4',
      ])

      setStatusMsg('Preparing download...')
      const data = await ffmpeg.readFile('output.mp4')
      const raw = data as Uint8Array
      const copy = new ArrayBuffer(raw.byteLength)
      new Uint8Array(copy).set(raw)
      const blob = new Blob([copy], { type: 'video/mp4' })
      if (blob.size < 1000) throw new Error('Output video is empty. Try a different mode.')
      await ffmpeg.deleteFile('output.mp4').catch(() => {})

      if (processedUrl) URL.revokeObjectURL(processedUrl)
      setProcessedUrl(URL.createObjectURL(blob))
      setProgress(100)
      setStep('done')
      track('wm_removed')
    } catch (err) {
      console.error('Processing error:', err)
      setError(`Processing failed: ${err instanceof Error ? err.message : String(err)}`)
      setStep('select')
    }
  }

  const downloadResult = () => {
    if (!processedUrl) return
    const a = document.createElement('a')
    a.href = processedUrl
    a.download = `clean-${videoFile?.name?.replace(/\.[^.]+$/, '') || 'video'}.mp4`
    a.click()
    track('wm_download')
  }

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (processedUrl) URL.revokeObjectURL(processedUrl)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setVideoFile(null)
    setVideoUrl('')
    setProcessedUrl('')
    setPreviewUrl('')
    setRegions([])
    setStep('upload')
    setProgress(0)
    setStatusMsg('')
    setError('')
    setDisplaySize({ width: 0, height: 0 })
    inputNameRef.current = ''
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const modeDescriptions: Record<Mode, { label: string; desc: string }> = {
    delogo: { label: 'Smart Remove', desc: 'Interpolates surrounding pixels into the watermark area, then softens the patch so it blends in. Best for most watermarks.' },
    blur: { label: 'Blur', desc: 'Feathered gaussian blur over the selected areas. Works on any background.' },
  }

  return (
    <ToolLayout
      title="Video Watermark Remover"
      description="Remove watermarks from any video for free. Smart Remove and Blur modes, multiple regions, instant preview. No upload, no signup, runs entirely in your browser."
      category="Design"
      slug="video-watermark-remover"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "video watermark remover",
        "remove watermark from video free",
        "video watermark remover online",
        "remove logo from video",
        "remove tiktok watermark",
        "video watermark eraser",
        "remove text from video",
        "free watermark remover no signup"
      ]}
      guide={
        <>
          <h2>What Is the Video Watermark Remover?</h2>
          <p>
            The Video Watermark Remover is a free browser-based tool that removes watermarks, logos, and text overlays from any video file. It uses FFmpeg compiled to WebAssembly, running entirely in your browser with no server uploads.
          </p>

          <h3>Two Removal Modes</h3>
          <ul>
            <li><strong>Smart Remove</strong> — Interpolates surrounding pixels into the watermark area and softens the patch so edges blend in. Fast and effective for most watermarks, especially on simple or uniform backgrounds.</li>
            <li><strong>Blur</strong> — Applies a feathered Gaussian blur that completely obscures the watermark. Use when Smart Remove leaves artifacts, or when the watermark is on a very complex moving background.</li>
          </ul>

          <h3>How to Remove a Watermark</h3>
          <ol>
            <li>Upload your video file (MP4, WebM, MOV).</li>
            <li>Scrub the timeline to find a frame where the watermark is visible.</li>
            <li>Click and drag a rectangle over the watermark. Drag to move it, or pull a corner to resize. Add more rectangles if the watermark changes position.</li>
            <li>Click Preview to check the result on the current frame.</li>
            <li>Click Remove Watermark and wait for processing.</li>
            <li>Preview the full result and download.</li>
          </ol>

          <h3>Tips for Best Results</h3>
          <ul>
            <li>Draw the rectangle as tightly as possible — a smaller selection produces cleaner results.</li>
            <li>For TikTok-style watermarks that jump between corners, draw one rectangle per position.</li>
            <li>Use Preview before processing: it renders the current frame with your settings in a couple of seconds.</li>
            <li>Use Blur as a fallback when Smart Remove leaves visible artifacts.</li>
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
              Powered by FFmpeg WebAssembly. Everything runs in your browser.
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
            {/* Mode selector + actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-zinc-400 mr-1">Mode:</span>
                {(['delogo', 'blur'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl('') } }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      mode === m
                        ? 'bg-blue-600 text-white'
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
                    onClick={renderPreview}
                    disabled={regions.length === 0 || previewLoading}
                    className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    {previewLoading ? 'Rendering…' : 'Preview'}
                  </button>
                  <button
                    onClick={processVideo}
                    disabled={regions.length === 0}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                  >
                    Remove Watermark
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-500">{modeDescriptions[mode].desc}</p>
              {statusMsg && previewLoading && <p className="text-xs text-blue-400">{statusMsg}</p>}
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
                  Scrub to a frame where the watermark is visible, then draw a rectangle over it. Drag rectangles to move them, pull corners to resize.
                </p>
              </div>
            )}

            {/* Video + overlay canvas (+ preview image when rendered) */}
            <div className="flex flex-col items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div
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
                {previewUrl && !showOriginal && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt="Processed frame preview"
                    className="absolute top-0 left-0 rounded pointer-events-none"
                    style={{ width: displaySize.width, height: displaySize.height }}
                  />
                )}
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
              {previewUrl && (
                <button
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onMouseLeave={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-xs transition-colors"
                >
                  Hold to compare with original
                </button>
              )}
            </div>

            {/* Region chips */}
            {regions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {regions.map((r, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-1.5 text-xs">
                    Region {i + 1} · {Math.round(r.w)}×{Math.round(r.h)}
                    <button
                      onClick={() => removeRegion(i)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                      aria-label={`Remove region ${i + 1}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-zinc-300 mb-2">How to use:</h3>
              <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Scrub to a frame where the watermark is visible</li>
                <li>Draw a rectangle over the watermark — add more if it changes position</li>
                <li>Click <strong className="text-zinc-300">Preview</strong> to check the result on this frame</li>
                <li>Click &ldquo;Remove Watermark&rdquo; — audio is preserved</li>
              </ol>
            </div>
          </>
        )}

        {/* ── Processing ── */}
        {step === 'processing' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <div className="text-5xl mb-6">⚙️</div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Processing Video</h2>
            <p className="text-sm text-zinc-400 mb-6">{statusMsg}</p>
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between text-sm text-zinc-400 mb-1">
                <span>{progress > 0 ? 'Encoding' : 'Loading'}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300 bg-blue-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              FFmpeg is processing your video locally. Keep this tab open.
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
                <button onClick={() => { setStep('select'); setError(''); }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-6 py-3 text-sm transition-colors">
                  Adjust &amp; Retry
                </button>
                <button onClick={reset} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-6 py-3 text-sm transition-colors">
                  New Video
                </button>
              </div>
            </div>

            {/* Support prompt — shown at the moment of value, right after removal */}
            <div className="rounded-2xl bg-gradient-to-br from-[#5F7FFF] via-[#6D6BFF] to-[#8B5CF6] p-7 text-center shadow-xl shadow-[#5F7FFF]/40 ring-1 ring-white/20">
              <div className="text-4xl mb-3">☕</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Did this save you a subscription?</h3>
              <p className="text-[15px] text-white mb-5 max-w-lg mx-auto leading-relaxed">
                This tool is free, needs no signup, and your video never left your computer. It&apos;s built and paid for by one person. If it saved you time, a $3 coffee keeps it free and the next tools coming.
              </p>
              <a
                href="https://www.buymeacoffee.com/toolpile"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('wm_coffee_click')}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-[#4d3bff] hover:bg-white/90 font-bold px-8 py-3.5 text-sm shadow-lg transition-transform hover:scale-105"
              >
                ☕ Buy me a coffee
              </a>
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
