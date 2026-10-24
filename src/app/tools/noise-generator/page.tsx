'use client'

import { useState, useRef, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "What is a noise texture?", answer: "Noise textures are random patterns of pixels used as backgrounds, overlays, or design elements. They add visual depth and tactile quality to flat designs. Common in modern web design, app interfaces, and print." },
  { question: "Can I tile this texture seamlessly?", answer: "The generated textures tile seamlessly because the noise is applied uniformly. You can set it as a CSS background-image with repeat and it will tile without visible seams." },
  { question: "What formats can I download?", answer: "You can download the noise texture as a PNG image or copy the inline CSS with the texture encoded as a base64 data URI for instant use in your stylesheets." },
]

const relatedTools: RelatedTool[] = [
  { name: "SVG Blob Generator", href: "/tools/svg-blob-generator" },
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
  { name: "SVG Wave Generator", href: "/tools/svg-wave-generator" },
]

export default function NoiseGenerator() {
  const [density, setDensity] = useState(30)
  const [opacity, setOpacity] = useState(15)
  const [size, setSize] = useState(200)
  const [baseColor, setBaseColor] = useState('#18181b')
  const [noiseColor, setNoiseColor] = useState('#ffffff')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // Parse colors
    const hexToRgb = (hex: string) => ({
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    })
    const bg = hexToRgb(baseColor)
    const nc = hexToRgb(noiseColor)
    const alpha = opacity / 100

    const imageData = ctx.createImageData(size, size)
    const d = imageData.data
    for (let i = 0; i < d.length; i += 4) {
      const hasNoise = Math.random() * 100 < density
      if (hasNoise) {
        const blend = alpha
        d[i] = Math.round(bg.r * (1 - blend) + nc.r * blend)
        d[i + 1] = Math.round(bg.g * (1 - blend) + nc.g * blend)
        d[i + 2] = Math.round(bg.b * (1 - blend) + nc.b * blend)
      } else {
        d[i] = bg.r
        d[i + 1] = bg.g
        d[i + 2] = bg.b
      }
      d[i + 3] = 255
    }
    ctx.putImageData(imageData, 0, 0)

    // Draw tiled preview
    const prev = previewRef.current
    if (prev) {
      prev.width = 400
      prev.height = 300
      const pctx = prev.getContext('2d')!
      const pattern = pctx.createPattern(canvas, 'repeat')!
      pctx.fillStyle = pattern
      pctx.fillRect(0, 0, 400, 300)
    }
  }, [density, opacity, size, baseColor, noiseColor])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = `noise-${size}x${size}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const copyCSS = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const css = `background-color: ${baseColor};\nbackground-image: url("${dataUrl}");\nbackground-repeat: repeat;`
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout
      title="Noise Texture Generator"
      description="Generate seamless noise and grain textures for web backgrounds. Customize density, opacity, color, and size. Download PNG or copy CSS."
      category="Design"
      slug="noise-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["noise texture", "grain texture generator", "background noise css", "noise overlay", "texture generator"]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Tiled Preview</h3>
          <div className="rounded-xl overflow-hidden border border-zinc-700">
            <canvas ref={previewRef} className="w-full" />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-3">
            <button onClick={download} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
              Download PNG
            </button>
            <button onClick={copyCSS} className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
              {copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Density</span><span>{density}%</span></label>
            <input type="range" min={1} max={100} value={density} onChange={e => setDensity(+e.target.value)} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Opacity</span><span>{opacity}%</span></label>
            <input type="range" min={1} max={100} value={opacity} onChange={e => setOpacity(+e.target.value)} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Tile Size</span><span>{size}px</span></label>
            <input type="range" min={50} max={500} step={10} value={size} onChange={e => setSize(+e.target.value)} className="w-full accent-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Base Color</label>
              <div className="flex gap-2">
                <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <input value={baseColor} onChange={e => setBaseColor(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Noise Color</label>
              <div className="flex gap-2">
                <input type="color" value={noiseColor} onChange={e => setNoiseColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <input value={noiseColor} onChange={e => setNoiseColor(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
