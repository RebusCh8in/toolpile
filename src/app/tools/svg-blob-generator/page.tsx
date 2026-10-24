'use client'

import { useState, useMemo } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

function generateBlob(complexity: number, seed: number): string {
  const points: [number, number][] = []
  const n = Math.max(3, Math.round(complexity))
  const rng = (s: number) => {
    s = Math.sin(s * 127.1 + seed * 311.7) * 43758.5453123
    return s - Math.floor(s)
  }

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2
    const r = 150 + (rng(i + seed * 7) * 2 - 1) * 60
    points.push([
      250 + r * Math.cos(angle),
      250 + r * Math.sin(angle),
    ])
  }

  // Smooth closed curve using cubic bezier
  let d = ''
  for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length]
    const p1 = points[i]
    const p2 = points[(i + 1) % points.length]
    const p3 = points[(i + 2) % points.length]

    const tension = 0.3
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension

    if (i === 0) d += `M ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} `
    d += `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `
  }
  d += 'Z'
  return d
}

const faqs: FAQ[] = [
  { question: "What is an SVG blob?", answer: "An SVG blob is an organic, randomly-generated shape commonly used as a design element in modern web design for backgrounds, hero sections, and decorative elements." },
  { question: "Can I use these blobs in my projects?", answer: "Yes. The generated SVG code is free to use in any project — personal or commercial. Just copy the SVG code and paste it into your HTML or design tool." },
]

const relatedTools: RelatedTool[] = [
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
  { name: "Color Palette Generator", href: "/tools/color-palette-generator" },
  { name: "Glassmorphism Generator", href: "/tools/glassmorphism-generator" },
]

export default function SvgBlobGenerator() {
  const [complexity, setComplexity] = useState(8)
  const [seed, setSeed] = useState(1)
  const [color1, setColor1] = useState('#3b82f6')
  const [color2, setColor2] = useState('#8b5cf6')
  const [copied, setCopied] = useState(false)

  const path = useMemo(() => generateBlob(complexity, seed), [complexity, seed])

  const gradientId = 'blob-grad'
  const svgCode = `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <path d="${path}" fill="url(#grad)" />
</svg>`

  const copy = () => {
    navigator.clipboard.writeText(svgCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const randomize = () => setSeed(Math.floor(Math.random() * 10000))

  const download = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'blob.svg'
    a.click()
  }

  return (
    <ToolLayout
      title="SVG Blob Generator"
      description="Generate organic SVG blob shapes with custom colors and complexity. Copy SVG code or download. Free online tool."
      category="Design"
      slug="svg-blob-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["svg blob generator", "blob maker", "blob shape generator", "svg blob", "organic shape generator", "random blob svg", "blob generator online"]}
      guide={
        <>
          <h2>SVG Blob Generator</h2>
          <p>Generate organic, randomly-shaped SVG blobs for your designs. Customize complexity, colors, and randomize until you find the perfect shape.</p>
        </>
      }
    >
      <div className="space-y-6">
        {/* Preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex items-center justify-center">
          <svg viewBox="0 0 500 500" className="w-80 h-80">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color1} />
                <stop offset="100%" stopColor={color2} />
              </linearGradient>
            </defs>
            <path d={path} fill={`url(#${gradientId})`} />
          </svg>
        </div>

        {/* Controls */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-zinc-400">Complexity</label>
                <span className="text-sm text-zinc-300">{complexity}</span>
              </div>
              <input type="range" min={3} max={16} value={complexity} onChange={e => setComplexity(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Color 1</label>
                <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-12 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Color 2</label>
                <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-12 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={randomize} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors">
              Randomize
            </button>
            <button onClick={copy} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors">
              {copied ? 'Copied!' : 'Copy SVG'}
            </button>
            <button onClick={download} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors">
              Download SVG
            </button>
          </div>
        </div>

        {/* Code */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">SVG Code</p>
          <pre className="bg-zinc-950 rounded-lg p-4 text-xs text-zinc-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
            {svgCode}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
