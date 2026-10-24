'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

interface Shadow {
  id: number
  x: number
  y: number
  blur: number
  color: string
}

let nextId = 1

const PRESETS: Record<string, Shadow[]> = {
  'Simple Drop': [{ id: nextId++, x: 2, y: 2, blur: 4, color: '#00000066' }],
  'Neon Glow': [{ id: nextId++, x: 0, y: 0, blur: 10, color: '#00ff88' }, { id: nextId++, x: 0, y: 0, blur: 40, color: '#00ff8855' }],
  'Fire': [{ id: nextId++, x: 0, y: -2, blur: 4, color: '#ff6600' }, { id: nextId++, x: 0, y: -6, blur: 12, color: '#ff330088' }, { id: nextId++, x: 0, y: -10, blur: 20, color: '#ff000044' }],
  'Retro 3D': [{ id: nextId++, x: 1, y: 1, blur: 0, color: '#ff4444' }, { id: nextId++, x: 2, y: 2, blur: 0, color: '#cc3333' }, { id: nextId++, x: 3, y: 3, blur: 0, color: '#aa2222' }, { id: nextId++, x: 4, y: 4, blur: 0, color: '#881111' }],
  'Emboss': [{ id: nextId++, x: -1, y: -1, blur: 1, color: '#ffffff44' }, { id: nextId++, x: 1, y: 1, blur: 1, color: '#00000044' }],
  'Double': [{ id: nextId++, x: 3, y: 3, blur: 0, color: '#3b82f6' }, { id: nextId++, x: -3, y: -3, blur: 0, color: '#ef4444' }],
}

const faqs: FAQ[] = [
  { question: "What is CSS text-shadow?", answer: "text-shadow is a CSS property that adds shadow effects to text. It takes horizontal offset, vertical offset, blur radius, and color as values. Multiple shadows can be comma-separated for layered effects." },
  { question: "Can I use multiple text shadows?", answer: "Yes. CSS supports multiple comma-separated text-shadow values. This tool lets you add multiple layers to create complex effects like neon glows, 3D text, and fire effects." },
  { question: "Does text-shadow affect performance?", answer: "Text-shadow is generally performant for static text. However, large blur values or many shadow layers on animated text can impact rendering performance. Use sparingly on frequently re-rendered elements." },
]

const relatedTools: RelatedTool[] = [
  { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
  { name: "Glassmorphism Generator", href: "/tools/glassmorphism-generator" },
]

export default function CssTextShadow() {
  const [shadows, setShadows] = useState<Shadow[]>([{ id: nextId++, x: 2, y: 2, blur: 4, color: '#00000066' }])
  const [textContent, setTextContent] = useState('Shadow Text')
  const [fontSize, setFontSize] = useState(48)
  const [textColor, setTextColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#18181b')
  const [copied, setCopied] = useState(false)

  const shadowCSS = shadows.map(s => `${s.x}px ${s.y}px ${s.blur}px ${s.color}`).join(',\n             ')
  const fullCSS = `text-shadow: ${shadowCSS};`

  const previewStyle: React.CSSProperties = {
    fontSize,
    color: textColor,
    textShadow: shadows.map(s => `${s.x}px ${s.y}px ${s.blur}px ${s.color}`).join(', '),
    fontWeight: 'bold',
  }

  const updateShadow = (id: number, update: Partial<Shadow>) => {
    setShadows(shadows.map(s => s.id === id ? { ...s, ...update } : s))
  }

  const addShadow = () => {
    setShadows([...shadows, { id: nextId++, x: 2, y: 2, blur: 4, color: '#00000066' }])
  }

  const removeShadow = (id: number) => {
    if (shadows.length > 1) setShadows(shadows.filter(s => s.id !== id))
  }

  const copy = () => {
    navigator.clipboard.writeText(fullCSS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const applyPreset = (name: string) => {
    setShadows(PRESETS[name].map(s => ({ ...s, id: nextId++ })))
  }

  return (
    <ToolLayout
      title="CSS Text Shadow Generator"
      description="Create CSS text-shadow effects with a live visual editor. Multiple layers, presets for neon glow, 3D, fire, and more."
      category="Developer"
      slug="css-text-shadow"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["css text shadow", "text shadow generator", "neon text css", "3d text css", "text glow effect"]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preview */}
        <div className="space-y-4">
          <div className="rounded-xl p-12 flex items-center justify-center min-h-[250px]" style={{ background: bgColor }}>
            <div style={previewStyle} className="text-center break-words max-w-full">{textContent}</div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map(name => (
              <button key={name} onClick={() => applyPreset(name)} className="px-3 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">
                {name}
              </button>
            ))}
          </div>

          {/* Text controls */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Preview Text</label>
              <input value={textContent} onChange={e => setTextContent(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Text Color</label>
              <div className="flex gap-1">
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                <input value={textColor} onChange={e => setTextColor(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Background</label>
              <div className="flex gap-1">
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                <input value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Font Size</span><span>{fontSize}px</span></label>
            <input type="range" min={16} max={120} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full accent-blue-500" />
          </div>
        </div>

        {/* Shadow layers */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Shadow Layers</h3>

          {shadows.map((s, i) => (
            <div key={s.id} className="border border-zinc-700 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Layer {i + 1}</span>
                {shadows.length > 1 && (
                  <button onClick={() => removeShadow(s.id)} className="text-xs text-zinc-600 hover:text-red-400">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs text-zinc-600">X</label>
                  <input type="number" value={s.x} onChange={e => updateShadow(s.id, { x: +e.target.value })} className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600">Y</label>
                  <input type="number" value={s.y} onChange={e => updateShadow(s.id, { y: +e.target.value })} className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600">Blur</label>
                  <input type="number" min={0} value={s.blur} onChange={e => updateShadow(s.id, { blur: +e.target.value })} className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600">Color</label>
                  <div className="flex gap-1">
                    <input type="color" value={s.color.slice(0, 7)} onChange={e => updateShadow(s.id, { color: e.target.value + s.color.slice(7) })} className="w-8 h-8 rounded cursor-pointer border-0" />
                    <input value={s.color} onChange={e => updateShadow(s.id, { color: e.target.value })} className="flex-1 rounded bg-zinc-800 border border-zinc-700 px-1 py-1 text-xs text-zinc-100 outline-none min-w-0" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={addShadow} className="w-full py-2 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-500 hover:border-blue-500/50 hover:text-zinc-300 transition-colors">
            + Add Shadow Layer
          </button>

          {/* Output */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">CSS</h3>
            <button onClick={copy} className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              {copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
          <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap">{fullCSS}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
