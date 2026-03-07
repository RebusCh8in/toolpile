'use client'

import { useState, useRef, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "How much can I compress a video?", answer: "Typically 50-90% reduction depending on the original quality and your compression settings. A 100 MB video can often be reduced to 10-30 MB at medium quality with little visible difference." },
  { question: "Does compressing a video reduce quality?", answer: "Some quality loss is inherent in compression, but at medium-high settings the difference is barely noticeable. The tool lets you preview the result before downloading so you can find the right balance." },
  { question: "What video formats are supported?", answer: "Upload MP4, WebM, or MOV files. The compressed output is always MP4 (H.264) which is universally compatible with all devices and platforms." },
  { question: "Is my video uploaded to a server?", answer: "No. All compression happens locally in your browser using FFmpeg WebAssembly. Your video never leaves your device. Nothing is stored anywhere." },
  { question: "Why is compression slow?", answer: "Video encoding is CPU-intensive work. Processing happens in your browser via WebAssembly, which is slower than native software. Shorter videos and lower resolutions process faster." },
  { question: "Can I compress videos for email or Discord?", answer: "Yes. Email typically limits attachments to 25 MB, Discord free tier to 25 MB. Use medium or high compression to get your video under these limits." },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "Video Watermark Remover", href: "/tools/video-watermark-remover" },
  { name: "Compress PDF", href: "/tools/compress-pdf" },
]

type Quality = 'low' | 'medium' | 'high' | 'custom'
type Resolution = 'original' | '1080' | '720' | '480'

export default function VideoCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [quality, setQuality] = useState<Quality>('medium')
  const [customCrf, setCustomCrf] = useState(28)
  const [resolution, setResolution] = useState<Resolution>('original')
  const [step, setStep] = useState<'upload' | 'settings' | 'processing' | 'done'>('upload')
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [resultSize, setResultSize] = useState(0)
  const [videoInfo, setVideoInfo] = useState({ duration: 0, width: 0, height: 0 })
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  const crfMap: Record<Quality, number> = { high: 22, medium: 28, low: 35, custom: customCrf }

  const handleUpload = useCallback((f: File) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    const url = URL.createObjectURL(f)
    setFile(f)
    setVideoUrl(url)
    setStep('settings')
    setError('')
    setResultUrl('')
    setResultSize(0)
  }, [videoUrl, resultUrl])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('video/')) handleUpload(f)
  }, [handleUpload])

  const onVideoMeta = () => {
    const v = videoRef.current
    if (v) setVideoInfo({ duration: v.duration, width: v.videoWidth, height: v.videoHeight })
  }

  const compress = async () => {
    if (!file) return
    setStep('processing')
    setProgress(0)
    setError('')

    try {
      setStatusMsg('Loading compression engine...')
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util')

      const ffmpeg = new FFmpeg()
      ffmpeg.on('progress', ({ progress: p }) => {
        setProgress(Math.min(95, Math.round(p * 95)))
      })

      await ffmpeg.load({
        coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
      })

      setStatusMsg('Compressing video...')
      await ffmpeg.writeFile('input', await fetchFile(file))

      const crf = crfMap[quality]
      const args = ['-i', 'input', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', String(crf)]

      if (resolution !== 'original') {
        const h = parseInt(resolution)
        args.push('-vf', `scale=-2:${h}`)
      }

      args.push('-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-y', 'output.mp4')
      await ffmpeg.exec(args)

      setProgress(98)
      setStatusMsg('Finishing up...')
      const data = await ffmpeg.readFile('output.mp4')
      const raw = data as Uint8Array
      const buf = new ArrayBuffer(raw.byteLength)
      new Uint8Array(buf).set(raw)
      const blob = new Blob([buf], { type: 'video/mp4' })

      await ffmpeg.deleteFile('input').catch(() => {})
      await ffmpeg.deleteFile('output.mp4').catch(() => {})
      ffmpeg.terminate()

      setResultSize(blob.size)
      setResultUrl(URL.createObjectURL(blob))
      setProgress(100)
      setStep('done')
    } catch (err) {
      console.error(err)
      setError(`Compression failed: ${err instanceof Error ? err.message : String(err)}`)
      setStep('settings')
    }
  }

  const fmtSize = (b: number) => b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(1) + ' MB'
  const fmtDur = (s: number) => { const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}` }
  const reduction = file && resultSize ? Math.round((1 - resultSize / file.size) * 100) : 0

  const btn = "px-4 py-2 rounded-lg text-sm font-medium transition-colors"

  return (
    <ToolLayout title="Video Compressor" description="Compress video files for free. Reduce MP4, WebM, and MOV file size with adjustable quality. No upload, no signup — runs entirely in your browser." category="Media" slug="video-compressor" faqs={faqs} relatedTools={relatedTools} keywords={["video compressor", "compress video online", "reduce video size", "video file compressor", "mp4 compressor", "compress video for email"]} guide={
      <div className="space-y-4 text-sm text-zinc-300">
        <h2 className="text-lg font-semibold text-zinc-100">How to use:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Upload your video file (MP4, WebM, MOV).</li>
          <li>Choose quality level and target resolution.</li>
          <li>Click &quot;Compress Video&quot; and wait for processing.</li>
          <li>Download your compressed video.</li>
        </ol>
      </div>
    }>
      {step === 'upload' && (
        <div onDrop={onDrop} onDragOver={e => e.preventDefault()} onClick={() => document.getElementById('vid-input')?.click()} className="border-2 border-dashed border-zinc-600 rounded-xl p-16 text-center cursor-pointer hover:border-zinc-500 transition-colors">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-zinc-300 font-medium">Drop a video here or click to upload</p>
          <p className="text-zinc-500 text-sm mt-1">MP4, WebM, MOV — any length, any size</p>
          <input id="vid-input" type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
        </div>
      )}

      {step === 'settings' && file && (
        <div className="space-y-6">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <video ref={videoRef} src={videoUrl} onLoadedMetadata={onVideoMeta} className="w-full max-h-64 rounded-lg mb-3" controls />
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              <span>Size: <strong className="text-zinc-200">{fmtSize(file.size)}</strong></span>
              {videoInfo.duration > 0 && <span>Duration: <strong className="text-zinc-200">{fmtDur(videoInfo.duration)}</strong></span>}
              {videoInfo.width > 0 && <span>Resolution: <strong className="text-zinc-200">{videoInfo.width}×{videoInfo.height}</strong></span>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Quality</label>
              <div className="grid grid-cols-2 gap-2">
                {(['high', 'medium', 'low', 'custom'] as Quality[]).map(q => (
                  <button key={q} onClick={() => setQuality(q)} className={`${btn} ${quality === q ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                    {q === 'high' ? 'High (slight)' : q === 'medium' ? 'Medium (balanced)' : q === 'low' ? 'Low (smallest)' : 'Custom CRF'}
                  </button>
                ))}
              </div>
              {quality === 'custom' && (
                <div className="mt-3">
                  <label className="text-xs text-zinc-400">CRF: {customCrf} (lower = better quality, larger file)</label>
                  <input type="range" min={18} max={45} value={customCrf} onChange={e => setCustomCrf(Number(e.target.value))} className="w-full mt-1" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Resolution</label>
              <div className="grid grid-cols-2 gap-2">
                {([['original', 'Original'], ['1080', '1080p'], ['720', '720p'], ['480', '480p']] as [Resolution, string][]).map(([r, l]) => (
                  <button key={r} onClick={() => setResolution(r)} className={`${btn} ${resolution === r ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-300">{error}</div>}

          <div className="flex gap-3">
            <button onClick={compress} className="px-6 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">Compress Video</button>
            <button onClick={() => { setStep('upload'); setFile(null) }} className="px-4 py-3 rounded-lg font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">New Video</button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-zinc-100 mb-2">Compressing Video</h3>
          <p className="text-zinc-400 mb-6">{statusMsg}</p>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-zinc-400 mb-1"><span>Encoding</span><span>{progress}%</span></div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          </div>
          <p className="text-zinc-500 text-sm mt-4">Processing locally. Keep this tab open.</p>
        </div>
      )}

      {step === 'done' && file && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-zinc-100 mb-4">Video Compressed</h3>
          <div className="flex justify-center gap-8 mb-6">
            <div><p className="text-zinc-500 text-xs">Original</p><p className="text-lg font-mono text-zinc-300">{fmtSize(file.size)}</p></div>
            <div className="text-2xl text-zinc-600">→</div>
            <div><p className="text-zinc-500 text-xs">Compressed</p><p className="text-lg font-mono text-green-400">{fmtSize(resultSize)}</p></div>
            <div><p className="text-zinc-500 text-xs">Reduction</p><p className="text-lg font-mono text-blue-400">{reduction}%</p></div>
          </div>
          <video src={resultUrl} className="max-w-lg mx-auto rounded-lg mb-6" controls />
          <div className="flex justify-center gap-3">
            <a href={resultUrl} download={`compressed-${file.name}`} className="px-6 py-3 rounded-lg font-medium bg-green-600 hover:bg-green-500 text-white transition-colors inline-block">Download MP4</a>
            <button onClick={() => { setStep('settings'); setResultUrl('') }} className={`${btn} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 py-3`}>Adjust & Retry</button>
            <button onClick={() => { setStep('upload'); setFile(null); setResultUrl('') }} className={`${btn} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 py-3`}>New Video</button>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
