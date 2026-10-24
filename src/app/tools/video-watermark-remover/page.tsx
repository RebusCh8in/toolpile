'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  {
    question: "How do I remove a watermark from a video for free?",
    answer: "Upload your video to this tool, draw a rectangle over the watermark, click Remove Watermark. Everything runs in your browser — no upload, no signup."
  },
  {
    question: "How does automatic watermark removal work?",
    answer: "Plain backgrounds are repaired by matching surrounding lighting and color. Detailed scenes use an on-device AI model. The tool selects the approach automatically; complex motion can still leave artifacts."
  },
  {
    question: "Can I remove a watermark that moves around the video?",
    answer: "Yes. Draw a separate rectangle over each position the watermark appears in. Every selected region is repaired throughout the video. This can cover watermarks that alternate between corners, but does not track continuously moving watermarks."
  },
  {
    question: "Does removing a video watermark reduce quality?",
    answer: "Selected regions are repaired and the video is re-encoded at high quality, with audio retained as AAC. The source frame rate is used; variable-rate footage is converted to a constant rate."
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
  const exporter = useRef<ReturnType<typeof import('@/lib/video-cleanup-export').createVideoExporter> | null>(null)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => { controller.current?.abort(); exporter.current?.dispose() }, [])
  const dragRef = useRef<DragState | null>(null)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [step, setStep] = useState<'upload' | 'select' | 'processing' | 'done'>('upload')
  const [regions, setRegions] = useState<Rect[]>([])
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const [nativeSize, setNativeSize] = useState({ width: 0, height: 0 })
  const [statusMsg, setStatusMsg] = useState('')
  const [processedUrl, setProcessedUrl] = useState('')
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl) }, [videoUrl])
  useEffect(() => () => { if (processedUrl) URL.revokeObjectURL(processedUrl) }, [processedUrl])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  // ── Upload ──
  const handleUpload = useCallback((file: File) => {
    exporter.current?.dispose()
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (processedUrl) URL.revokeObjectURL(processedUrl)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (file.size > 150 * 1024 * 1024) { setError('Choose a video under 150 MB.'); return }
    setDuration(0)
    setCurrentTime(0)
    setDisplaySize({width:0,height:0})
    const url = URL.createObjectURL(file)
    setVideoFile(file)
    setVideoUrl(url)
    setRegions([])
    setError('')
    setProcessedUrl('')
    setPreviewUrl('')
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
    if (previewLoading) return
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
    if (previewLoading) return
    if ('touches' in e) e.preventDefault()
    const pos = getPos(e)
    const hit = hitTest(pos)
    dragRef.current = hit ?? { kind: 'draw', originX: pos.x, originY: pos.y }
  }

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const drag = dragRef.current
    if (!drag) return
    if (previewLoading) return
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

  // One automatic repair engine for both previews and full exports.
  const runRepair = async (preview: boolean) => {
    if (!videoFile || !regions.length || !displaySize.width || controller.current) return
    const current = new AbortController()
    controller.current = current
    setError('')
    if (preview) setPreviewLoading(true)
    else setStep('processing')
    try {
      const { createVideoExporter } = await import('@/lib/video-cleanup-export')
      exporter.current ??= createVideoExporter()
      const { getCrop } = await import('@/lib/video-cleanup-lab')
      const areas = regions.map(r => ({ x: r.x / displaySize.width * nativeSize.width, y: r.y / displaySize.height * nativeSize.height,
        w: r.w / displaySize.width * nativeSize.width, h: r.h / displaySize.height * nativeSize.height }))
      for (const area of areas) getCrop(area, nativeSize.width, nativeSize.height)
      const output = (await exporter.current.run(videoFile, areas, nativeSize.width, nativeSize.height, duration,
        setStatusMsg, current.signal, true, preview ? { previewStart: currentTime } : undefined)).video
      if (preview) setPreviewUrl(URL.createObjectURL(output))
      else { setProcessedUrl(URL.createObjectURL(output)); setStep('done'); track('wm_removed') }
    } catch (err) {
      setError(current.signal.aborted ? 'Cancelled. Adjust your selection or try again.' : err instanceof Error ? err.message : String(err))
      if (!preview) setStep('select')
    } finally { controller.current = null; setPreviewLoading(false) }
  }
  const renderPreview = () => runRepair(true)
  const processVideo = () => runRepair(false)

  const downloadResult = () => {
    if (!processedUrl) return
    const a = document.createElement('a')
    a.href = processedUrl
    a.download = `clean-${videoFile?.name?.replace(/\.[^.]+$/, '') || 'video'}.mp4`
    a.click()
    track('wm_download')
  }

  const reset = () => {
    exporter.current?.dispose()
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (processedUrl) URL.revokeObjectURL(processedUrl)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setVideoFile(null)
    setVideoUrl('')
    setProcessedUrl('')
    setPreviewUrl('')
    setRegions([])
    setStep('upload')
    setStatusMsg('')
    setError('')
    setDisplaySize({ width: 0, height: 0 })
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <ToolLayout
      title="Video Watermark Remover"
      description="Remove watermarks from video for free. Automatic on-device repair, multiple regions, and video preview. No upload, no signup, runs entirely in your browser."
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
            The Video Watermark Remover is a free browser-based tool that removes watermarks, logos, and text overlays from supported video files. It uses FFmpeg compiled to WebAssembly, running entirely in your browser with no server uploads.
          </p>

          <h3>Automatic Watermark Removal</h3>
          <p>Plain backgrounds use lighting and color matching; detailed scenes use AI reconstruction on your device. The tool chooses automatically for each scene.</p>
          <p>Supports SDR videos up to 2 minutes, 150 MB, 1080p, and 60 fps. Keep each selection within 248 × 248 original pixels.</p>

          <h3>How to Remove a Watermark</h3>
          <ol>
            <li>Upload your video file (MP4, WebM, MOV).</li>
            <li>Scrub the timeline to find a frame where the watermark is visible.</li>
            <li>Click and drag a rectangle over the watermark. Drag to move it, or pull a corner to resize. Add more rectangles if the watermark changes position.</li>
            <li>Click Preview to check a three-second sample.</li>
            <li>Click Remove Watermark and wait for processing.</li>
            <li>Preview the full result and download.</li>
          </ol>

          <h3>Tips for Best Results</h3>
          <ul>
            <li>Draw the rectangle as tightly as possible — a smaller selection produces cleaner results.</li>
            <li>For TikTok-style watermarks that jump between corners, draw one rectangle per position.</li>
            <li>Use the three-second preview to check the result before processing the full video.</li>
            <li>Watch for flicker and lost detail across scene changes. Smaller, tighter selections usually work better.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
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
            <p className="text-sm text-zinc-500">MP4, WebM, MOV · Up to 2 minutes, 150 MB, 1080p, 60 fps</p>
            <p className="text-xs text-zinc-600 mt-3">
              Powered by FFmpeg WebAssembly. Everything runs in your browser.
            </p>
            <input
              aria-label="Choose a video"
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
                <div className="flex gap-2 ml-auto">
                  <button onClick={reset} disabled={previewLoading} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors">
                    New Video
                  </button>
                  <button
                    onClick={renderPreview}
                    disabled={regions.length === 0 || previewLoading}
                    className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    {previewLoading ? 'Rendering…' : 'Preview 3 seconds'}
                  </button>
                  <button
                    onClick={processVideo}
                    disabled={regions.length === 0 || previewLoading || !Number.isFinite(duration) || !duration}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                  >
                    Remove Watermark
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-500">Automatic repair · up to 2 minutes, 150 MB, 1080p, 60 fps. Each selection can be up to 248 × 248 original pixels.</p>
              {previewLoading && <><p role="status" className="text-xs text-blue-400">{statusMsg}</p><button onClick={() => controller.current?.abort()}>Cancel</button></>}
            </div>

            {/* Timeline scrubber */}
            {duration > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 w-12">{formatTime(currentTime)}</span>
                  <input
                    aria-label="Video timeline" disabled={previewLoading} type="range" min={0} max={duration} step={0.1}
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
                  onError={() => setError('This browser cannot decode the video. Try an H.264 MP4.')}
                  style={{ width: displaySize.width || '100%', height: displaySize.height || 'auto' }}
                  className="rounded block"
                />
                {previewUrl && !showOriginal && (
                  <video autoPlay muted loop playsInline
                    src={previewUrl}
                    aria-label="Cleaned three-second preview"
                    className="absolute top-0 left-0 rounded pointer-events-none"
                    style={{ width: displaySize.width, height: displaySize.height }}
                  />
                )}
                {displaySize.width > 0 && (
                  <canvas
                    aria-label="Watermark selection area"
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
                      disabled={previewLoading}
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
                <li>Click <strong className="text-zinc-300">Preview</strong> to check a three-second sample</li>
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
            <p role="status" className="text-sm text-zinc-400 mb-6">{statusMsg}</p>
            <button onClick={() => controller.current?.abort()} className="mb-6 rounded-lg border px-5 py-2">Cancel</button>
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
              <p className="text-sm text-zinc-400 mb-6">Preview below. Audio is retained; variable-rate footage uses a constant output frame rate.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={downloadResult} className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-8 py-3 text-sm font-medium transition-colors">
                  Download Video (MP4)
                </button>
                <button onClick={() => { setStep('select'); setError(''); }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-6 py-3 text-sm transition-colors">
                  Adjust &amp; Retry
                </button>
                <button onClick={reset} disabled={previewLoading} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-6 py-3 text-sm transition-colors">
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
