'use client'

import { useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const CONVERSIONS: Record<string, { from: string; fromMime: string; to: string; toMime: string; toExt: string }> = {
  'jpg-to-png': { from: 'JPG', fromMime: 'image/jpeg', to: 'PNG', toMime: 'image/png', toExt: 'png' },
  'png-to-jpg': { from: 'PNG', fromMime: 'image/png', to: 'JPG', toMime: 'image/jpeg', toExt: 'jpg' },
  'webp-to-png': { from: 'WebP', fromMime: 'image/webp', to: 'PNG', toMime: 'image/png', toExt: 'png' },
  'webp-to-jpg': { from: 'WebP', fromMime: 'image/webp', to: 'JPG', toMime: 'image/jpeg', toExt: 'jpg' },
  'png-to-webp': { from: 'PNG', fromMime: 'image/png', to: 'WebP', toMime: 'image/webp', toExt: 'webp' },
  'jpg-to-webp': { from: 'JPG', fromMime: 'image/jpeg', to: 'WebP', toMime: 'image/webp', toExt: 'webp' },
  'svg-to-png': { from: 'SVG', fromMime: 'image/svg+xml', to: 'PNG', toMime: 'image/png', toExt: 'png' },
  'svg-to-jpg': { from: 'SVG', fromMime: 'image/svg+xml', to: 'JPG', toMime: 'image/jpeg', toExt: 'jpg' },
  'bmp-to-png': { from: 'BMP', fromMime: 'image/bmp', to: 'PNG', toMime: 'image/png', toExt: 'png' },
  'bmp-to-jpg': { from: 'BMP', fromMime: 'image/bmp', to: 'JPG', toMime: 'image/jpeg', toExt: 'jpg' },
  'gif-to-png': { from: 'GIF', fromMime: 'image/gif', to: 'PNG', toMime: 'image/png', toExt: 'png' },
  'gif-to-jpg': { from: 'GIF', fromMime: 'image/gif', to: 'JPG', toMime: 'image/jpeg', toExt: 'jpg' },
  'png-to-ico': { from: 'PNG', fromMime: 'image/png', to: 'ICO', toMime: 'image/png', toExt: 'ico' },
  'jpg-to-bmp': { from: 'JPG', fromMime: 'image/jpeg', to: 'BMP', toMime: 'image/bmp', toExt: 'bmp' },
  'heic-to-jpg': { from: 'HEIC', fromMime: 'image/heic', to: 'JPG', toMime: 'image/jpeg', toExt: 'jpg' },
  'heic-to-png': { from: 'HEIC', fromMime: 'image/heic', to: 'PNG', toMime: 'image/png', toExt: 'png' },
  'tiff-to-jpg': { from: 'TIFF', fromMime: 'image/tiff', to: 'JPG', toMime: 'image/jpeg', toExt: 'jpg' },
  'tiff-to-png': { from: 'TIFF', fromMime: 'image/tiff', to: 'PNG', toMime: 'image/png', toExt: 'png' },
  'webp-to-gif': { from: 'WebP', fromMime: 'image/webp', to: 'GIF', toMime: 'image/gif', toExt: 'gif' },
  'png-to-gif': { from: 'PNG', fromMime: 'image/png', to: 'GIF', toMime: 'image/gif', toExt: 'gif' },
}

const ALL_SLUGS = Object.keys(CONVERSIONS)

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function ConvertPage() {
  const params = useParams()
  const slug = params.slug as string
  const conv = CONVERSIONS[slug]

  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null)
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [quality, setQuality] = useState(92)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const convert = useCallback((img: HTMLImageElement, q: number) => {
    if (!conv) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    if (conv.toMime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(img, 0, 0)
    const mime = conv.toMime
    canvas.toBlob(
      blob => {
        if (!blob) return
        if (convertedUrl) URL.revokeObjectURL(convertedUrl)
        setConvertedBlob(blob)
        setConvertedUrl(URL.createObjectURL(blob))
      },
      mime,
      mime === 'image/png' || mime === 'image/bmp' || mime === 'image/gif' ? undefined : q / 100
    )
  }, [conv, convertedUrl])

  const handleUpload = useCallback((file: File) => {
    setOriginalSize(file.size)
    setFileName(file.name.replace(/\.[^.]+$/, ''))
    const img = new Image()
    img.onload = () => {
      setImage(img)
      convert(img, quality)
    }
    img.src = URL.createObjectURL(file)
  }, [quality, convert])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleUpload(file)
  }, [handleUpload])

  const download = () => {
    if (!convertedUrl || !conv) return
    const a = document.createElement('a')
    a.href = convertedUrl
    a.download = `${fileName}.${conv.toExt}`
    a.click()
  }

  const reset = () => {
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    setImage(null)
    setConvertedBlob(null)
    setConvertedUrl(null)
  }

  if (!conv) {
    return <div className="p-8 text-center text-zinc-400">Conversion not found.</div>
  }

  const title = `${conv.from} to ${conv.to} Converter`
  const savings = convertedBlob && originalSize > 0 ? Math.round((1 - convertedBlob.size / originalSize) * 100) : 0
  const showQuality = conv.toMime === 'image/jpeg' || conv.toMime === 'image/webp'

  const otherConversions: RelatedTool[] = ALL_SLUGS
    .filter(s => s !== slug)
    .slice(0, 5)
    .map(s => ({
      name: `${CONVERSIONS[s].from} to ${CONVERSIONS[s].to}`,
      href: `/tools/convert/${s}`,
    }))

  const faqs: FAQ[] = [
    {
      question: `How do I convert ${conv.from} to ${conv.to} for free?`,
      answer: `Upload your ${conv.from} file, and the tool instantly converts it to ${conv.to} format in your browser. Click Download to save the converted file. No signup, no server upload needed.`
    },
    {
      question: `Does converting ${conv.from} to ${conv.to} lose quality?`,
      answer: conv.toMime === 'image/png'
        ? `No. PNG is a lossless format, so converting to PNG preserves full quality.`
        : conv.toMime === 'image/jpeg'
        ? `JPEG uses lossy compression, so there may be a small quality reduction. At 90%+ quality, the difference is virtually invisible.`
        : `${conv.to} uses efficient compression. At high quality settings (85%+), the difference from the original is virtually invisible.`
    },
    {
      question: "Is my image uploaded to a server?",
      answer: "No. The entire conversion happens in your browser using the Canvas API. Your image never leaves your device."
    },
  ]

  return (
    <ToolLayout
      title={title}
      description={`Convert ${conv.from} to ${conv.to} online for free. No upload, no signup. Instant conversion in your browser.`}
      category="Design"
      slug={`convert/${slug}`}
      faqs={faqs}
      relatedTools={otherConversions}
      keywords={[
        `${conv.from.toLowerCase()} to ${conv.to.toLowerCase()}`,
        `convert ${conv.from.toLowerCase()} to ${conv.to.toLowerCase()}`,
        `${conv.from.toLowerCase()} to ${conv.to.toLowerCase()} converter`,
        `${conv.from.toLowerCase()} to ${conv.to.toLowerCase()} online free`,
        `change ${conv.from.toLowerCase()} to ${conv.to.toLowerCase()}`,
      ]}
      guide={
        <>
          <h2>How to Convert {conv.from} to {conv.to}</h2>
          <p>
            This free tool converts {conv.from} images to {conv.to} format instantly in your browser. No server upload needed — your files stay completely private.
          </p>
          <ul>
            <li>Upload your {conv.from} file by clicking the upload area or dragging and dropping.</li>
            {showQuality && <li>Adjust the quality slider to balance file size and image quality.</li>}
            <li>Click Download to save your converted {conv.to} file.</li>
          </ul>
        </>
      }
    >
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-6">
        {!image && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('convert-upload')?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
          >
            <div className="text-5xl mb-4">🔄</div>
            <p className="text-lg text-zinc-300 mb-2">Drop a {conv.from} image here or click to upload</p>
            <p className="text-sm text-zinc-500">Converts to {conv.to} instantly in your browser</p>
            <input
              id="convert-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
            />
          </div>
        )}

        {image && (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-4">
                {showQuality && (
                  <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                    <label className="text-sm text-zinc-400">Quality:</label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={quality}
                      onChange={e => {
                        const q = Number(e.target.value)
                        setQuality(q)
                        if (image) convert(image, q)
                      }}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-sm text-zinc-300 w-10 text-right">{quality}%</span>
                  </div>
                )}

                {convertedBlob && (
                  <>
                    <div className="text-sm">
                      <span className="text-zinc-500">Original: </span>
                      <span className="text-zinc-300">{formatBytes(originalSize)}</span>
                    </div>
                    <div className="text-zinc-700">→</div>
                    <div className="text-sm">
                      <span className="text-zinc-500">{conv.to}: </span>
                      <span className="text-zinc-300">{formatBytes(convertedBlob.size)}</span>
                    </div>
                    {savings !== 0 && (
                      <div className={`text-sm font-medium px-2 py-0.5 rounded ${
                        savings > 0 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {savings > 0 ? `${savings}% smaller` : `${Math.abs(savings)}% larger`}
                      </div>
                    )}
                  </>
                )}

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
                    Download {conv.to}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 200 }}>
                <img
                  src={convertedUrl || image.src}
                  alt="Preview"
                  className="max-w-full max-h-[500px] object-contain"
                />
              </div>
            </div>

            {/* Other conversions */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-3">Other image conversions:</p>
              <div className="flex flex-wrap gap-2">
                {ALL_SLUGS.filter(s => s !== slug).map(s => (
                  <a
                    key={s}
                    href={`/tools/convert/${s}`}
                    className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
                  >
                    {CONVERSIONS[s].from} → {CONVERSIONS[s].to}
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
