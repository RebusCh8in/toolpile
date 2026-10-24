'use client'

import { useState, useRef, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

interface Filter {
  name: string
  css: string
}

const FILTERS: Filter[] = [
  { name: 'None', css: 'none' },
  { name: 'Grayscale', css: 'grayscale(100%)' },
  { name: 'Sepia', css: 'sepia(80%)' },
  { name: 'Vintage', css: 'sepia(40%) contrast(110%) brightness(105%) saturate(80%)' },
  { name: 'Warm', css: 'sepia(20%) saturate(140%) brightness(105%)' },
  { name: 'Cool', css: 'saturate(80%) hue-rotate(20deg) brightness(105%)' },
  { name: 'Noir', css: 'grayscale(100%) contrast(140%) brightness(90%)' },
  { name: 'Dramatic', css: 'contrast(150%) saturate(130%) brightness(95%)' },
  { name: 'Fade', css: 'brightness(115%) saturate(70%) contrast(85%)' },
  { name: 'High Contrast', css: 'contrast(170%)' },
  { name: 'Vivid', css: 'saturate(200%) contrast(110%)' },
  { name: 'Invert', css: 'invert(100%)' },
  { name: 'Blur', css: 'blur(3px)' },
  { name: 'Hue Rotate', css: 'hue-rotate(90deg)' },
  { name: 'Bright', css: 'brightness(140%)' },
  { name: 'Dark', css: 'brightness(60%)' },
]

const faqs: FAQ[] = [
  { question: "How do these filters work?", answer: "These filters use CSS filter functions applied via the Canvas API. They modify brightness, contrast, saturation, hue, and other properties to create Instagram-style effects entirely in your browser." },
  { question: "Will the filter reduce image quality?", answer: "The filters are applied at the original image resolution and exported as PNG, so there's no resolution loss. Some filters like blur will soften details by design." },
  { question: "Can I combine multiple filters?", answer: "The presets are pre-configured combinations of CSS filter functions. For custom combinations, you can adjust the individual sliders (brightness, contrast, saturation) in addition to choosing a preset." },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "Image Resizer", href: "/tools/image-resizer" },
  { name: "Background Remover", href: "/tools/background-remover" },
]

export default function ImageFilters() {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [filter, setFilter] = useState('None')
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => setImg(image)
    image.src = url
  }

  const activeFilter = FILTERS.find(f => f.name === filter)!
  const customCSS = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  const fullFilter = activeFilter.css === 'none' ? customCSS : `${activeFilter.css} ${customCSS}`

  useEffect(() => {
    if (!img || !canvasRef.current) return
    const canvas = canvasRef.current
    const maxW = 600
    const scale = Math.min(maxW / img.width, 400 / img.height, 1)
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')!
    ctx.filter = fullFilter
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }, [img, fullFilter])

  const download = () => {
    if (!img) return
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d')!
    ctx.filter = fullFilter
    ctx.drawImage(img, 0, 0)
    const a = document.createElement('a')
    a.download = `filtered-${filter.toLowerCase().replace(/\s/g, '-')}.png`
    a.href = c.toDataURL('image/png')
    a.click()
  }

  return (
    <ToolLayout
      title="Image Filter Effects"
      description="Apply Instagram-style filters to your photos. Vintage, sepia, noir, and 13 more effects. Free, private, no upload."
      category="Design"
      slug="image-filters"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["image filters", "photo effects", "instagram filter", "photo filter online", "css filters"]}
    >
      {!img ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl p-16 cursor-pointer hover:border-blue-500/50 transition-colors">
          <span className="text-4xl mb-3">🎨</span>
          <span className="text-zinc-400 mb-1">Drop an image here or click to upload</span>
          <span className="text-xs text-zinc-600">JPG, PNG, WebP, GIF</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-zinc-900 rounded-xl p-4 flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full rounded-lg" />
          </div>

          {/* Filter presets */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f.name}
                onClick={() => setFilter(f.name)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  filter === f.name ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Adjustments */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Brightness</span><span>{brightness}%</span></label>
              <input type="range" min={20} max={200} value={brightness} onChange={e => setBrightness(+e.target.value)} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Contrast</span><span>{contrast}%</span></label>
              <input type="range" min={20} max={200} value={contrast} onChange={e => setContrast(+e.target.value)} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Saturation</span><span>{saturation}%</span></label>
              <input type="range" min={0} max={300} value={saturation} onChange={e => setSaturation(+e.target.value)} className="w-full accent-blue-500" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => { setImg(null); setFilter('None'); setBrightness(100); setContrast(100); setSaturation(100) }} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
              New Image
            </button>
            <button onClick={download} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
              Download Filtered Image
            </button>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
