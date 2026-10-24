'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const PRESETS: Record<string, number[]> = {
  'Square': [0, 0, 0, 0, 0, 0, 0, 0],
  'Circle': [50, 50, 50, 50, 50, 50, 50, 50],
  'Pill': [50, 50, 50, 50, 0, 0, 0, 0],
  'Blob 1': [30, 70, 70, 30, 30, 30, 70, 70],
  'Blob 2': [60, 40, 30, 70, 70, 30, 40, 60],
  'Blob 3': [40, 60, 70, 30, 60, 40, 30, 70],
  'Leaf': [0, 50, 0, 50, 0, 50, 0, 50],
  'Drop': [0, 50, 50, 50, 0, 50, 50, 50],
}

const faqs: FAQ[] = [
  { question: "What is CSS border-radius?", answer: "border-radius is a CSS property that rounds the corners of an element. It can take 1-8 values to control each corner independently. The shorthand with '/' creates asymmetric (elliptical) corner radii for organic shapes." },
  { question: "How does the 8-value syntax work?", answer: "The 8-value syntax is: border-radius: TL TR BR BL / TL TR BR BL. Values before the '/' control horizontal radii, values after control vertical radii. This creates elliptical corners rather than circular ones, enabling organic blob-like shapes." },
  { question: "Can I animate border-radius?", answer: "Yes. border-radius is animatable with CSS transitions and animations. Animating between different blob shapes creates smooth morphing effects popular in modern web design." },
]

const relatedTools: RelatedTool[] = [
  { name: "SVG Blob Generator", href: "/tools/svg-blob-generator" },
  { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
  { name: "Glassmorphism Generator", href: "/tools/glassmorphism-generator" },
]

export default function CssBorderRadius() {
  // 8 values: [TL-h, TR-h, BR-h, BL-h, TL-v, TR-v, BR-v, BL-v]
  const [values, setValues] = useState([30, 70, 70, 30, 30, 30, 70, 70])
  const [bgColor, setBgColor] = useState('#3b82f6')
  const [size, setSize] = useState(250)
  const [copied, setCopied] = useState(false)

  const update = (idx: number, val: number) => {
    const next = [...values]
    next[idx] = val
    setValues(next)
  }

  const css = `border-radius: ${values[0]}% ${values[1]}% ${values[2]}% ${values[3]}% / ${values[4]}% ${values[5]}% ${values[6]}% ${values[7]}%;`

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const randomize = () => {
    setValues(Array.from({ length: 8 }, () => Math.round(Math.random() * 80 + 10)))
  }

  const labels = ['TL-h', 'TR-h', 'BR-h', 'BL-h', 'TL-v', 'TR-v', 'BR-v', 'BL-v']

  return (
    <ToolLayout
      title="CSS Border Radius Generator"
      description="Create fancy border-radius shapes with the 8-value syntax. Generate organic blobs, leaves, and asymmetric corners visually."
      category="Developer"
      slug="css-border-radius"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["css border radius", "border radius generator", "fancy border radius", "blob shape css", "css rounded corners"]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Preview */}
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-zinc-900 rounded-xl p-10 flex items-center justify-center w-full min-h-[350px]">
            <div
              style={{
                width: size,
                height: size,
                background: bgColor,
                borderRadius: `${values[0]}% ${values[1]}% ${values[2]}% ${values[3]}% / ${values[4]}% ${values[5]}% ${values[6]}% ${values[7]}%`,
                transition: 'border-radius 0.3s ease',
              }}
            />
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(PRESETS).map(([name, vals]) => (
              <button key={name} onClick={() => setValues([...vals])} className="px-3 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">
                {name}
              </button>
            ))}
            <button onClick={randomize} className="px-3 py-1.5 rounded-lg text-xs bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 transition-colors">
              Random
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Corner Values (%)</h3>

          <div className="grid grid-cols-2 gap-3">
            {labels.map((label, i) => (
              <div key={label}>
                <label className="flex justify-between text-xs text-zinc-500 mb-1"><span className="font-mono">{label}</span><span>{values[i]}%</span></label>
                <input type="range" min={0} max={100} value={values[i]} onChange={e => update(i, +e.target.value)} className="w-full accent-blue-500" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Color</label>
              <div className="flex gap-2">
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <input value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Size</span><span>{size}px</span></label>
              <input type="range" min={100} max={350} value={size} onChange={e => setSize(+e.target.value)} className="w-full accent-blue-500 mt-3" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">CSS</h3>
            <button onClick={copy} className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              {copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
          <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap">{css}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
