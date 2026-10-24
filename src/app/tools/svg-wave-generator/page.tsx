'use client'

import { useState, useMemo } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

function generateWave(layers: number, complexity: number, seed: number, height: number, flip: boolean): string[] {
  const rng = (s: number) => {
    s = Math.sin(s * 127.1 + seed * 311.7) * 43758.5453123
    return s - Math.floor(s)
  }

  const paths: string[] = []
  for (let l = 0; l < layers; l++) {
    const yBase = 200 + (l * height) / layers
    const points: number[] = []
    const segments = complexity + 2

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 1200
      const amplitude = 30 + rng(l * 100 + i + seed * 13) * 40
      const phase = rng(l * 50 + i * 7 + seed * 3) * Math.PI * 2
      const y = yBase + Math.sin((i / segments) * Math.PI * complexity * 0.5 + phase) * amplitude
      points.push(x, y)
    }

    let d = `M 0 ${flip ? 0 : 400} L ${points[0]} ${points[1]}`
    for (let i = 2; i < points.length - 2; i += 2) {
      const cpx = (points[i] + points[i + 2]) / 2
      const cpy = (points[i + 1] + points[i + 3]) / 2
      d += ` Q ${points[i]} ${points[i + 1]} ${cpx} ${cpy}`
    }
    d += ` L 1200 ${points[points.length - 1]} L 1200 ${flip ? 0 : 400} Z`
    paths.push(d)
  }
  return paths
}

const faqs: FAQ[] = [
  { question: "What are SVG waves used for?", answer: "SVG waves are commonly used as section dividers on websites — the curved shape between two content sections. They add visual interest and a modern feel to web pages." },
  { question: "Can I use these waves in my projects?", answer: "Yes. The generated SVG code is free to use in any project. Copy the SVG and paste it into your HTML, or download the file." },
]

const relatedTools: RelatedTool[] = [
  { name: "SVG Blob Generator", href: "/tools/svg-blob-generator" },
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
  { name: "Glassmorphism Generator", href: "/tools/glassmorphism-generator" },
]

export default function SvgWaveGenerator() {
  const [layers, setLayers] = useState(3)
  const [complexity, setComplexity] = useState(4)
  const [seed, setSeed] = useState(1)
  const [height, setHeight] = useState(120)
  const [flip, setFlip] = useState(false)
  const [color1, setColor1] = useState('#3b82f6')
  const [color2, setColor2] = useState('#8b5cf6')
  const [copied, setCopied] = useState(false)

  const paths = useMemo(() => generateWave(layers, complexity, seed, height, flip), [layers, complexity, seed, height, flip])

  const svgContent = paths.map((d, i) => {
    const opacity = 0.3 + (i / paths.length) * 0.7
    return `  <path d="${d}" fill="url(#waveGrad)" opacity="${opacity.toFixed(2)}" />`
  }).join('\n')

  const svgCode = `<svg viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
  <defs>
    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
${svgContent}
</svg>`

  const copy = () => { navigator.clipboard.writeText(svgCode); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const randomize = () => setSeed(Math.floor(Math.random() * 10000))
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([svgCode], { type: 'image/svg+xml' })); a.download = 'wave.svg'; a.click() }

  return (
    <ToolLayout
      title="SVG Wave Generator"
      description="Generate SVG wave section dividers with custom colors, layers, and complexity. Copy SVG or download. Free online tool."
      category="Design"
      slug="svg-wave-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["svg wave generator", "wave divider", "section divider svg", "css wave", "wave generator", "svg wave", "wave background generator"]}
      guide={<><h2>SVG Wave Generator</h2><p>Create layered wave shapes for section dividers. Customize layers, complexity, colors, and direction.</p></>}
    >
      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-48">
            <defs>
              <linearGradient id="previewGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color1} />
                <stop offset="100%" stopColor={color2} />
              </linearGradient>
            </defs>
            {paths.map((d, i) => (
              <path key={i} d={d} fill="url(#previewGrad)" opacity={0.3 + (i / paths.length) * 0.7} />
            ))}
          </svg>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2"><label className="text-sm text-zinc-400">Layers</label><span className="text-sm text-zinc-300">{layers}</span></div>
              <input type="range" min={1} max={5} value={layers} onChange={e => setLayers(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label className="text-sm text-zinc-400">Complexity</label><span className="text-sm text-zinc-300">{complexity}</span></div>
              <input type="range" min={1} max={10} value={complexity} onChange={e => setComplexity(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div>
              <div className="flex justify-between mb-2"><label className="text-sm text-zinc-400">Height</label><span className="text-sm text-zinc-300">{height}px</span></div>
              <input type="range" min={40} max={200} value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div className="flex items-center gap-4">
              <div><label className="text-sm text-zinc-400 mb-1 block">Color 1</label><input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-12 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" /></div>
              <div><label className="text-sm text-zinc-400 mb-1 block">Color 2</label><input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-12 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" /></div>
              <label className="flex items-center gap-2 cursor-pointer ml-2">
                <input type="checkbox" checked={flip} onChange={e => setFlip(e.target.checked)} className="accent-blue-500" />
                <span className="text-sm text-zinc-400">Flip</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={randomize} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors">Randomize</button>
            <button onClick={copy} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors">{copied ? 'Copied!' : 'Copy SVG'}</button>
            <button onClick={download} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors">Download SVG</button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">SVG Code</p>
          <pre className="bg-zinc-950 rounded-lg p-4 text-xs text-zinc-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-48">{svgCode}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
