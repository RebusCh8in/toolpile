'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512]
const PREVIEW_SIZES = [16, 32, 64, 128]

const faqs: FAQ[] = [
  { question: "What sizes do I need for a favicon?", answer: "At minimum: 16x16 and 32x32 for browser tabs, 180x180 for Apple Touch Icon, and 192x192 + 512x512 for Android/PWA. This tool generates all common sizes." },
  { question: "What formats are supported?", answer: "Upload any image (PNG, JPG, SVG, WebP) or generate from text/emoji. The tool exports PNG favicons at all standard sizes." },
  { question: "Is my image uploaded to a server?", answer: "No. Everything runs in your browser. Your images never leave your device." },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Resizer", href: "/tools/image-resizer" },
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "QR Code Generator", href: "/tools/qr-code-generator" },
]

type Mode = 'image' | 'text'

function drawToCanvas(canvas: HTMLCanvasElement, size: number, mode: Mode, text: string, bgColor: string, textColor: string, fontSize: number, borderRadius: number, image: HTMLImageElement | null) {
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const drawRoundedRect = () => {
    const r = (borderRadius / 100) * size / 2
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(size - r, 0)
    ctx.quadraticCurveTo(size, 0, size, r)
    ctx.lineTo(size, size - r)
    ctx.quadraticCurveTo(size, size, size - r, size)
    ctx.lineTo(r, size)
    ctx.quadraticCurveTo(0, size, 0, size - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
  }

  if (mode === 'text') {
    drawRoundedRect()
    ctx.fillStyle = bgColor
    ctx.fill()
    ctx.clip()
    const fSize = Math.round(size * fontSize / 100)
    ctx.fillStyle = textColor
    ctx.font = `bold ${fSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, size / 2, size / 2 + fSize * 0.05)
  } else if (image) {
    drawRoundedRect()
    ctx.clip()
    const aspect = image.naturalWidth / image.naturalHeight
    let sx = 0, sy = 0, sw = image.naturalWidth, sh = image.naturalHeight
    if (aspect > 1) { sx = (image.naturalWidth - image.naturalHeight) / 2; sw = image.naturalHeight }
    else { sy = (image.naturalHeight - image.naturalWidth) / 2; sh = image.naturalWidth }
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, size, size)
  }
}

export default function FaviconGenerator() {
  const [mode, setMode] = useState<Mode>('text')
  const [text, setText] = useState('A')
  const [bgColor, setBgColor] = useState('#3b82f6')
  const [textColor, setTextColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(70)
  const [borderRadius, setBorderRadius] = useState(20)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [previews, setPreviews] = useState<Record<number, string>>({})
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate previews in effect
  useEffect(() => {
    const urls: Record<number, string> = {}
    PREVIEW_SIZES.forEach(size => {
      const c = document.createElement('canvas')
      drawToCanvas(c, size, mode, text, bgColor, textColor, fontSize, borderRadius, image)
      urls[size] = c.toDataURL('image/png')
    })
    setPreviews(urls)
  }, [mode, text, bgColor, textColor, fontSize, borderRadius, image])

  const handleImageUpload = useCallback((file: File) => {
    const img = new Image()
    img.onload = () => {
      setImage(img)
      setMode('image')
    }
    img.src = URL.createObjectURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleImageUpload(file)
  }, [handleImageUpload])

  const downloadSize = (size: number) => {
    const c = document.createElement('canvas')
    drawToCanvas(c, size, mode, text, bgColor, textColor, fontSize, borderRadius, image)
    const a = document.createElement('a')
    a.href = c.toDataURL('image/png')
    a.download = `favicon-${size}x${size}.png`
    a.click()
  }

  const downloadAll = () => {
    SIZES.forEach((size, i) => {
      setTimeout(() => downloadSize(size), i * 100)
    })
  }

  return (
    <ToolLayout
      title="Favicon Generator"
      description="Generate favicons from text, emoji, or image. All standard sizes included. Free, no upload — runs in your browser."
      category="Design"
      slug="favicon-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["favicon generator", "favicon maker", "create favicon", "favicon from text", "favicon generator online", "generate favicon", "favicon ico generator", "website favicon"]}
      guide={
        <>
          <h2>Favicon Generator</h2>
          <p>Create favicons from text, emoji, or any image. Download all standard sizes for browsers, Apple Touch Icon, and Android/PWA.</p>
          <h3>How to Use</h3>
          <ul>
            <li>Type a letter or emoji, or upload an image.</li>
            <li>Customize colors, font size, and corner rounding.</li>
            <li>Download individual sizes or all at once.</li>
          </ul>
        </>
      }
    >
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('text')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${mode === 'text' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
            >
              Text / Emoji
            </button>
            <button
              onClick={() => {
                if (image) setMode('image')
                else document.getElementById('favicon-upload')?.click()
              }}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${mode === 'image' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
            >
              Upload Image
            </button>
            <input
              id="favicon-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
          </div>

          {mode === 'text' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Text / Emoji</label>
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value.slice(0, 3))}
                  maxLength={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-lg text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Background</label>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-12 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Text Color</label>
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-12 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-zinc-400">Font Size</label>
                  <span className="text-sm text-zinc-300">{fontSize}%</span>
                </div>
                <input type="range" min={30} max={100} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-blue-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-zinc-400">Corner Radius</label>
                  <span className="text-sm text-zinc-300">{borderRadius}%</span>
                </div>
                <input type="range" min={0} max={100} value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} className="w-full accent-blue-500" />
              </div>
            </div>
          )}

          {mode === 'image' && (
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} className="space-y-3">
              {image && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400">Image loaded</span>
                  <button onClick={() => document.getElementById('favicon-upload')?.click()} className="text-sm text-blue-400 hover:text-blue-300">Change</button>
                </div>
              )}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-zinc-400">Corner Radius</label>
                  <span className="text-sm text-zinc-300">{borderRadius}%</span>
                </div>
                <input type="range" min={0} max={100} value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} className="w-full accent-blue-500" />
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Preview</p>
          <div className="flex items-end gap-4 flex-wrap">
            {PREVIEW_SIZES.map(size => (
              <div key={size} className="text-center">
                <div className="bg-zinc-950 rounded-lg p-2 inline-block mb-1" style={{ backgroundImage: 'repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%)', backgroundSize: '10px 10px' }}>
                  {previews[size] ? (
                    <img src={previews[size]} alt={`${size}x${size}`} width={Math.min(size, 128)} height={Math.min(size, 128)} className="block" style={{ imageRendering: size <= 32 ? 'pixelated' : 'auto' }} />
                  ) : (
                    <div style={{ width: Math.min(size, 128), height: Math.min(size, 128) }} className="bg-zinc-800 rounded" />
                  )}
                </div>
                <p className="text-xs text-zinc-500">{size}px</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Download</p>
            <button onClick={downloadAll} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors">
              Download All Sizes
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SIZES.map(size => (
              <button
                key={size}
                onClick={() => downloadSize(size)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                {size}x{size}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
