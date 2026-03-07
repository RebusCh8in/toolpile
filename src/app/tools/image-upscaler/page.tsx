'use client'

import { useState, useRef, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "How does image upscaling work?", answer: "The tool enlarges your image using advanced canvas interpolation algorithms. Smooth mode uses high-quality bicubic interpolation, Sharp mode applies a sharpening filter after upscaling, and Pixel Art mode uses nearest-neighbor for crisp pixel edges." },
  { question: "Will upscaling make a blurry image sharp?", answer: "Upscaling increases resolution but can't add detail that wasn't in the original image. A small, clear image will upscale well. A blurry or very low-resolution image will remain soft. For best results, start with the highest quality source you have." },
  { question: "What's the maximum upscale size?", answer: "You can upscale up to 4x the original dimensions. For example, a 500x500 image can become 2000x2000. Very large outputs may take a moment to process." },
  { question: "Is my image uploaded anywhere?", answer: "No. All processing happens locally in your browser using the Canvas API. Your image never leaves your device." },
  { question: "When should I use Pixel Art mode?", answer: "Use Pixel Art (Nearest Neighbor) mode when upscaling pixel art, retro game sprites, or any image where you want to preserve hard pixel edges without blurring or smoothing." },
  { question: "What output formats are available?", answer: "You can download the upscaled image as PNG (lossless, best quality) or JPG (smaller file size). PNG is recommended for graphics and pixel art, JPG for photographs." },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Resizer", href: "/tools/image-resizer" },
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "Background Remover", href: "/tools/background-remover" },
]

type Mode = 'smooth' | 'sharp' | 'pixel'
type Scale = 2 | 4

export default function ImageUpscaler() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState('')
  const [mode, setMode] = useState<Mode>('smooth')
  const [scale, setScale] = useState<Scale>(2)
  const [origSize, setOrigSize] = useState({ w: 0, h: 0 })
  const [newSize, setNewSize] = useState({ w: 0, h: 0 })
  const [processing, setProcessing] = useState(false)
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')
  const imgRef = useRef<HTMLImageElement>(null)

  const handleUpload = useCallback((f: File) => {
    if (preview) URL.revokeObjectURL(preview)
    if (result) URL.revokeObjectURL(result)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult('')
  }, [preview, result])

  const onImgLoad = () => {
    const img = imgRef.current
    if (!img) return
    setOrigSize({ w: img.naturalWidth, h: img.naturalHeight })
    setNewSize({ w: img.naturalWidth * scale, h: img.naturalHeight * scale })
  }

  const updateScale = (s: Scale) => {
    setScale(s)
    if (origSize.w) setNewSize({ w: origSize.w * s, h: origSize.h * s })
    setResult('')
  }

  const upscale = async () => {
    if (!file || !origSize.w) return
    setProcessing(true)

    const img = new Image()
    img.src = preview
    await new Promise(r => { img.onload = r })

    const w = origSize.w * scale
    const h = origSize.h * scale

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!

    if (mode === 'pixel') {
      ctx.imageSmoothingEnabled = false
    } else {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }

    ctx.drawImage(img, 0, 0, w, h)

    if (mode === 'sharp') {
      const imageData = ctx.getImageData(0, 0, w, h)
      const data = imageData.data
      const copy = new Uint8ClampedArray(data)

      const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          for (let c = 0; c < 3; c++) {
            let sum = 0
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const idx = ((y + ky) * w + (x + kx)) * 4 + c
                sum += copy[idx] * kernel[(ky + 1) * 3 + (kx + 1)]
              }
            }
            data[(y * w + x) * 4 + c] = Math.min(255, Math.max(0, sum))
          }
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob(b => resolve(b!), format === 'jpeg' ? 'image/jpeg' : 'image/png', 0.92)
    )
    setResult(URL.createObjectURL(blob))
    setProcessing(false)
  }

  const btn = "px-4 py-2 rounded-lg text-sm font-medium transition-colors"

  return (
    <ToolLayout title="Image Upscaler" description="Upscale and enlarge images for free. 2x and 4x scaling with multiple algorithms. No upload, no signup — runs entirely in your browser." category="Design" slug="image-upscaler" faqs={faqs} relatedTools={relatedTools} keywords={["image upscaler", "upscale image", "enlarge image", "increase image resolution", "image enlarger", "photo upscaler"]} guide={
      <div className="space-y-4 text-sm text-zinc-300">
        <h2 className="text-lg font-semibold text-zinc-100">How to use:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Upload an image (PNG, JPG, WebP).</li>
          <li>Choose scale (2x or 4x) and mode (Smooth, Sharp, or Pixel Art).</li>
          <li>Click &quot;Upscale&quot; and download the result.</li>
        </ol>
      </div>
    }>
      {!file ? (
        <div onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleUpload(f) }} onDragOver={e => e.preventDefault()} onClick={() => document.getElementById('img-up')?.click()} className="border-2 border-dashed border-zinc-600 rounded-xl p-16 text-center cursor-pointer hover:border-zinc-500 transition-colors">
          <div className="text-4xl mb-4">🖼️</div>
          <p className="text-zinc-300 font-medium">Drop an image here or click to upload</p>
          <p className="text-zinc-500 text-sm mt-1">PNG, JPG, WebP</p>
          <input id="img-up" type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-zinc-400 mr-2">Scale:</span>
            {([2, 4] as Scale[]).map(s => (
              <button key={s} onClick={() => updateScale(s)} className={`${btn} ${scale === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>{s}x</button>
            ))}
            <span className="text-sm text-zinc-400 ml-4 mr-2">Mode:</span>
            {([['smooth', 'Smooth'], ['sharp', 'Sharp'], ['pixel', 'Pixel Art']] as [Mode, string][]).map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setResult('') }} className={`${btn} ${mode === m ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>{l}</button>
            ))}
            <span className="text-sm text-zinc-400 ml-4 mr-2">Format:</span>
            {(['png', 'jpeg'] as const).map(f => (
              <button key={f} onClick={() => { setFormat(f); setResult('') }} className={`${btn} ${format === f ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>{f.toUpperCase()}</button>
            ))}
            <button onClick={upscale} disabled={processing} className={`${btn} ml-auto bg-green-600 hover:bg-green-500 text-white disabled:opacity-50`}>
              {processing ? 'Processing...' : 'Upscale'}
            </button>
            <button onClick={() => { setFile(null); setPreview(''); setResult('') }} className={`${btn} bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}>New Image</button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-2">Original — {origSize.w}×{origSize.h}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={preview} alt="Original" onLoad={onImgLoad} className="w-full rounded-lg border border-zinc-700" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-2">Upscaled — {newSize.w}×{newSize.h}</p>
              {result ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result} alt="Upscaled" className="w-full rounded-lg border border-zinc-700" />
                  <a href={result} download={`upscaled-${scale}x.${format === 'jpeg' ? 'jpg' : 'png'}`} className="inline-block mt-3 px-5 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors">Download</a>
                </>
              ) : (
                <div className="w-full aspect-video rounded-lg border border-zinc-700 bg-zinc-800/50 flex items-center justify-center text-zinc-500 text-sm">
                  Click &quot;Upscale&quot; to see result
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
