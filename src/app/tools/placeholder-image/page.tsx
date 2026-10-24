'use client'

import { useState, useEffect, useRef } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const PRESETS = [
  { label: 'Custom', w: 0, h: 0 },
  { label: '16:9 HD', w: 1920, h: 1080 },
  { label: '4:3', w: 800, h: 600 },
  { label: 'Square', w: 500, h: 500 },
  { label: 'Social (1200×630)', w: 1200, h: 630 },
  { label: 'Thumbnail (300×200)', w: 300, h: 200 },
  { label: 'Banner (728×90)', w: 728, h: 90 },
  { label: 'Avatar (128×128)', w: 128, h: 128 },
]

const faqs: FAQ[] = [
  { question: "What is a placeholder image?", answer: "A placeholder image is a temporary image used during web development and design to represent where real images will eventually go. They help maintain layout and spacing while content is being prepared." },
  { question: "What formats can I download?", answer: "You can download placeholder images in PNG format. The image is generated in your browser using the Canvas API at the exact dimensions you specify." },
  { question: "Can I use these images commercially?", answer: "Yes. The placeholder images are generated on your device and are not copyrighted. Use them freely for any purpose — development, design mockups, presentations, or documentation." },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Resizer", href: "/tools/image-resizer" },
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "Favicon Generator", href: "/tools/favicon-generator" },
]

export default function PlaceholderImage() {
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [bgColor, setBgColor] = useState('#374151')
  const [textColor, setTextColor] = useState('#9ca3af')
  const [text, setText] = useState('')
  const [preset, setPreset] = useState('Custom')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const displayText = text || `${width} × ${height}`

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Draw at a preview scale
    const maxW = 600
    const scale = Math.min(maxW / width, 300 / height, 1)
    const dw = Math.round(width * scale)
    const dh = Math.round(height * scale)
    canvas.width = dw
    canvas.height = dh
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, dw, dh)
    // text
    const fontSize = Math.max(12, Math.min(dw / 10, dh / 3, 48))
    ctx.fillStyle = textColor
    ctx.font = `${fontSize}px -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(displayText, dw / 2, dh / 2)
    // border
    ctx.strokeStyle = textColor + '33'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, dw - 1, dh - 1)
  }, [width, height, bgColor, textColor, displayText])

  const download = () => {
    const c = document.createElement('canvas')
    c.width = width
    c.height = height
    const ctx = c.getContext('2d')!
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)
    const fontSize = Math.max(14, Math.min(width / 10, height / 3, 72))
    ctx.fillStyle = textColor
    ctx.font = `${fontSize}px -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(displayText, width / 2, height / 2)
    ctx.strokeStyle = textColor + '33'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, width - 2, height - 2)
    const a = document.createElement('a')
    a.download = `placeholder-${width}x${height}.png`
    a.href = c.toDataURL('image/png')
    a.click()
  }

  const applyPreset = (label: string) => {
    setPreset(label)
    const p = PRESETS.find(pp => pp.label === label)
    if (p && p.w > 0) { setWidth(p.w); setHeight(p.h) }
  }

  return (
    <ToolLayout
      title="Placeholder Image Generator"
      description="Generate custom placeholder images for web development and design mockups. Set any size, color, and text. Download as PNG."
      category="Design"
      slug="placeholder-image"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["placeholder image", "dummy image", "placeholder generator", "test image", "mockup image"]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Preview */}
        <div className="flex flex-col items-center">
          <div className="bg-zinc-900 rounded-xl p-6 flex items-center justify-center w-full min-h-[300px]">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
          <button onClick={download} className="mt-4 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
            Download PNG ({width}×{height})
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          {/* Presets */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2">Presets</label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.label)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    preset === p.label ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Width (px)</label>
              <input type="number" value={width} onChange={e => { setWidth(+e.target.value || 1); setPreset('Custom') }} min={1} max={4096} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Height (px)</label>
              <input type="number" value={height} onChange={e => { setHeight(+e.target.value || 1); setPreset('Custom') }} min={1} max={4096} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Background</label>
              <div className="flex gap-2">
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <input value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Text Color</label>
              <div className="flex gap-2">
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <input value={textColor} onChange={e => setTextColor(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* Custom Text */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Custom Text (leave empty for dimensions)</label>
            <input value={text} onChange={e => setText(e.target.value)} placeholder={`${width} × ${height}`} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
