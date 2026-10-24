'use client'

import { useState, useRef, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  {
    question: "How does the image compressor work?",
    answer: "The tool re-encodes your image in the browser using the Canvas API with adjustable quality settings. Lower quality means smaller file size. For JPEG and WebP formats, quality directly controls compression. PNG uses lossless compression so quality doesn't apply — but converting a PNG to WebP or JPEG can dramatically reduce size."
  },
  {
    question: "Is my image uploaded to a server?",
    answer: "No. All compression happens entirely in your browser using the HTML5 Canvas API. Your image never leaves your device, keeping your files completely private."
  },
  {
    question: "What image formats are supported?",
    answer: "You can upload any image your browser supports — PNG, JPEG, WebP, GIF, BMP, TIFF, and more. You can export as JPEG, WebP, or PNG. WebP typically gives the best compression with the least quality loss."
  },
  {
    question: "What's the best format for compression?",
    answer: "WebP gives the best file size to quality ratio in most cases. JPEG is best for photos when you need maximum compatibility. PNG should be used when you need transparency or lossless quality."
  },
  {
    question: "How much can I reduce the file size?",
    answer: "It depends on the original image and settings. Photos can typically be reduced by 60-90% with minimal visible quality loss. At quality 80%, most images look virtually identical to the original while being significantly smaller."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Photo Watermark Remover", href: "/tools/photo-watermark-remover" },
  { name: "Image Color Picker", href: "/tools/image-color-picker" },
  { name: "QR Code Generator", href: "/tools/qr-code-generator" },
]

type Format = 'image/jpeg' | 'image/webp' | 'image/png'
const FORMATS: { label: string; value: Format }[] = [
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'WebP', value: 'image/webp' },
  { label: 'PNG', value: 'image/png' },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function ImageCompressor() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<Format>('image/webp')
  const [fileName, setFileName] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const compress = useCallback((img: HTMLImageElement, q: number, fmt: Format) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    canvas.toBlob(
      blob => {
        if (!blob) return
        if (compressedUrl) URL.revokeObjectURL(compressedUrl)
        const url = URL.createObjectURL(blob)
        setCompressedBlob(blob)
        setCompressedUrl(url)
      },
      fmt,
      fmt === 'image/png' ? undefined : q / 100
    )
  }, [compressedUrl])

  const handleImageUpload = useCallback((file: File) => {
    setOriginalSize(file.size)
    setFileName(file.name.replace(/\.[^.]+$/, ''))
    const img = new Image()
    img.onload = () => {
      setImage(img)
      compress(img, quality, format)
    }
    img.src = URL.createObjectURL(file)
  }, [quality, format, compress])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleImageUpload(file)
  }, [handleImageUpload])

  const handleQualityChange = (q: number) => {
    setQuality(q)
    if (image) compress(image, q, format)
  }

  const handleFormatChange = (fmt: Format) => {
    setFormat(fmt)
    if (image) compress(image, quality, fmt)
  }

  const download = () => {
    if (!compressedUrl) return
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png'
    const a = document.createElement('a')
    a.href = compressedUrl
    a.download = `${fileName}-compressed.${ext}`
    a.click()
  }

  const reset = () => {
    if (compressedUrl) URL.revokeObjectURL(compressedUrl)
    setImage(null)
    setCompressedBlob(null)
    setCompressedUrl(null)
    setOriginalSize(0)
  }

  const savings = compressedBlob ? Math.round((1 - compressedBlob.size / originalSize) * 100) : 0

  return (
    <ToolLayout
      title="Image Compressor"
      description="Compress images online for free. Reduce file size by up to 90% with adjustable quality. No upload — everything runs in your browser."
      category="Design"
      slug="image-compressor"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "image compressor",
        "compress image online",
        "reduce image size",
        "image compression tool",
        "compress jpg online",
        "compress png online",
        "webp converter",
        "reduce photo file size",
        "free image compressor",
        "compress image without losing quality"
      ]}
      guide={
        <>
          <h2>What Is the Image Compressor?</h2>
          <p>
            The Image Compressor reduces your image file size directly in your browser. Upload any image, choose your quality level and output format, and download a smaller version. No server upload, no signup, completely private.
          </p>

          <h3>How to Compress an Image</h3>
          <ul>
            <li>Upload an image by clicking the upload area or dragging and dropping.</li>
            <li>Adjust the quality slider — lower quality means smaller file size.</li>
            <li>Choose an output format: WebP for best compression, JPEG for compatibility, PNG for lossless.</li>
            <li>See the file size reduction in real time.</li>
            <li>Download your compressed image.</li>
          </ul>

          <h3>Tips for Best Results</h3>
          <ul>
            <li>WebP at 80% quality gives excellent results for most photos — often 70-80% smaller than the original.</li>
            <li>For web use, quality between 70-85% is the sweet spot — visually identical but much smaller.</li>
            <li>PNG is lossless, so the quality slider doesn't apply. Use PNG only when you need transparency.</li>
            <li>Converting large PNGs to WebP or JPEG can reduce size by 90% or more.</li>
          </ul>
        </>
      }
    >
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-6">
        {/* Upload Area */}
        {!image && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('compress-upload')?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
          >
            <div className="text-5xl mb-4">📦</div>
            <p className="text-lg text-zinc-300 mb-2">Drop an image here or click to upload</p>
            <p className="text-sm text-zinc-500">PNG, JPG, WebP, GIF — any size</p>
            <input
              id="compress-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
          </div>
        )}

        {/* Controls + Results */}
        {image && (
          <>
            {/* Controls */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-6">
                {/* Quality Slider */}
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <label className="text-sm text-zinc-400 whitespace-nowrap">Quality:</label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={e => handleQualityChange(Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-sm text-zinc-300 w-10 text-right">{quality}%</span>
                </div>

                {/* Format */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-400">Format:</label>
                  <div className="flex gap-1">
                    {FORMATS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => handleFormatChange(f.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          format === f.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Size Stats */}
              {compressedBlob && (
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-zinc-800">
                  <div className="text-sm">
                    <span className="text-zinc-500">Original: </span>
                    <span className="text-zinc-300">{formatBytes(originalSize)}</span>
                  </div>
                  <div className="text-zinc-700">→</div>
                  <div className="text-sm">
                    <span className="text-zinc-500">Compressed: </span>
                    <span className="text-zinc-300">{formatBytes(compressedBlob.size)}</span>
                  </div>
                  <div className={`text-sm font-medium px-2 py-0.5 rounded ${
                    savings > 0
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {savings > 0 ? `${savings}% smaller` : `${Math.abs(savings)}% larger`}
                  </div>

                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={reset}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
                    >
                      New Image
                    </button>
                    <button
                      onClick={download}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Original</p>
                  <div className="bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 200 }}>
                    <img
                      src={image.src}
                      alt="Original"
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Compressed</p>
                  <div className="bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 200 }}>
                    {compressedUrl && (
                      <img
                        src={compressedUrl}
                        alt="Compressed"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
