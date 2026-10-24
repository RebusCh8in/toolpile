'use client'

import { useState, useRef, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "How does the pixel art converter work?", answer: "It downscales your image to a low resolution (pixel size), then upscales it back using nearest-neighbor interpolation. This creates the blocky pixel art effect. You can limit the color palette for a more retro look." },
  { question: "What pixel size should I use?", answer: "For a subtle pixelated effect, use 4-8. For classic retro game style, use 10-20. For very blocky abstract art, use 20-40. Experiment to find what works best for your image." },
  { question: "Can I limit the color palette?", answer: "Yes. Reduce the color count to get a more authentic retro look. 16 colors gives a classic NES/SNES feel. 8 colors creates a Game Boy style. 4 colors creates very stylized results." },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Filters", href: "/tools/image-filters" },
  { name: "Image Resizer", href: "/tools/image-resizer" },
  { name: "Image Compressor", href: "/tools/image-compressor" },
]

function quantizeColor(r: number, g: number, b: number, levels: number): [number, number, number] {
  const step = 255 / (levels - 1)
  return [
    Math.round(Math.round(r / step) * step),
    Math.round(Math.round(g / step) * step),
    Math.round(Math.round(b / step) * step),
  ]
}

export default function PixelArt() {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [pixelSize, setPixelSize] = useState(10)
  const [colorLevels, setColorLevels] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => setImg(image)
    image.src = url
  }

  useEffect(() => {
    if (!img || !canvasRef.current) return
    const canvas = canvasRef.current
    const maxW = 600
    const scale = Math.min(maxW / img.width, 400 / img.height, 1)
    const dw = Math.round(img.width * scale)
    const dh = Math.round(img.height * scale)
    canvas.width = dw
    canvas.height = dh
    const ctx = canvas.getContext('2d')!

    // Draw small then upscale
    const sw = Math.ceil(dw / pixelSize)
    const sh = Math.ceil(dh / pixelSize)
    const temp = document.createElement('canvas')
    temp.width = sw
    temp.height = sh
    const tctx = temp.getContext('2d')!
    tctx.drawImage(img, 0, 0, sw, sh)

    // Color quantization
    if (colorLevels > 0) {
      const imageData = tctx.getImageData(0, 0, sw, sh)
      const d = imageData.data
      const levels = colorLevels
      for (let i = 0; i < d.length; i += 4) {
        const [r, g, b] = quantizeColor(d[i], d[i+1], d[i+2], levels)
        d[i] = r; d[i+1] = g; d[i+2] = b
      }
      tctx.putImageData(imageData, 0, 0)
    }

    // Upscale with nearest-neighbor
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(temp, 0, 0, dw, dh)
  }, [img, pixelSize, colorLevels])

  const download = () => {
    if (!img) return
    const c = document.createElement('canvas')
    const sw = Math.ceil(img.width / pixelSize)
    const sh = Math.ceil(img.height / pixelSize)
    const temp = document.createElement('canvas')
    temp.width = sw; temp.height = sh
    const tctx = temp.getContext('2d')!
    tctx.drawImage(img, 0, 0, sw, sh)
    if (colorLevels > 0) {
      const imageData = tctx.getImageData(0, 0, sw, sh)
      const d = imageData.data
      for (let i = 0; i < d.length; i += 4) {
        const [r, g, b] = quantizeColor(d[i], d[i+1], d[i+2], colorLevels)
        d[i] = r; d[i+1] = g; d[i+2] = b
      }
      tctx.putImageData(imageData, 0, 0)
    }
    c.width = img.width; c.height = img.height
    const ctx = c.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(temp, 0, 0, img.width, img.height)
    const a = document.createElement('a')
    a.download = 'pixel-art.png'
    a.href = c.toDataURL('image/png')
    a.click()
  }

  return (
    <ToolLayout
      title="Pixel Art Converter"
      description="Convert any image to pixel art. Adjustable pixel size and color palette. Download at full resolution. Free and private."
      category="Design"
      slug="pixel-art"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["pixel art converter", "pixelate image", "retro pixel", "8 bit image", "pixel art generator"]}
    >
      {!img ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl p-16 cursor-pointer hover:border-blue-500/50 transition-colors">
          <span className="text-4xl mb-3">👾</span>
          <span className="text-zinc-400 mb-1">Drop an image here or click to upload</span>
          <span className="text-xs text-zinc-600">JPG, PNG, WebP</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-xl p-4 flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full rounded-lg" style={{ imageRendering: 'pixelated' }} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Pixel Size</span><span>{pixelSize}px</span></label>
              <input type="range" min={2} max={40} value={pixelSize} onChange={e => setPixelSize(+e.target.value)} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Color Levels</span><span>{colorLevels === 0 ? 'Full' : colorLevels}</span></label>
              <input type="range" min={0} max={32} value={colorLevels} onChange={e => setColorLevels(+e.target.value)} className="w-full accent-blue-500" />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setImg(null); setPixelSize(10); setColorLevels(0) }} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
              New Image
            </button>
            <button onClick={download} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
              Download Pixel Art
            </button>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
