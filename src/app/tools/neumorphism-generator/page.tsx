'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

type Shape = 'flat' | 'concave' | 'convex' | 'pressed'

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function adjustBrightness(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r + amount, g + amount, b + amount)
}

const faqs: FAQ[] = [
  { question: "What is neumorphism?", answer: "Neumorphism (or neomorphism) is a UI design style that creates soft, extruded plastic-like effects using subtle shadows. It combines flat design with skeuomorphic depth to create a tactile, embossed appearance." },
  { question: "When should I use neumorphism?", answer: "Neumorphism works best for cards, buttons, toggles, and sliders in dashboard UIs and personal projects. Use it sparingly — it can reduce contrast and accessibility if overused. Pair it with high-contrast text." },
  { question: "Is neumorphism accessible?", answer: "Neumorphism can be problematic for accessibility because elements blend into the background. Ensure sufficient color contrast for text and interactive elements. Avoid using it for critical UI components." },
]

const relatedTools: RelatedTool[] = [
  { name: "Glassmorphism Generator", href: "/tools/glassmorphism-generator" },
  { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
]

export default function NeumorphismGenerator() {
  const [bgColor, setBgColor] = useState('#e0e0e0')
  const [size, setSize] = useState(200)
  const [radius, setRadius] = useState(30)
  const [distance, setDistance] = useState(10)
  const [intensity, setIntensity] = useState(25)
  const [blur, setBlur] = useState(20)
  const [shape, setShape] = useState<Shape>('flat')
  const [copied, setCopied] = useState(false)

  const lightShadow = adjustBrightness(bgColor, intensity)
  const darkShadow = adjustBrightness(bgColor, -intensity)

  const isInset = shape === 'pressed'
  const prefix = isInset ? 'inset ' : ''

  let gradient = ''
  if (shape === 'concave') {
    gradient = `background: linear-gradient(145deg, ${adjustBrightness(bgColor, -10)}, ${adjustBrightness(bgColor, 10)});`
  } else if (shape === 'convex') {
    gradient = `background: linear-gradient(145deg, ${adjustBrightness(bgColor, 10)}, ${adjustBrightness(bgColor, -10)});`
  }

  const css = [
    `border-radius: ${radius}px;`,
    gradient || `background: ${bgColor};`,
    `box-shadow: ${prefix}${distance}px ${distance}px ${blur}px ${darkShadow},`,
    `             ${prefix}${-distance}px ${-distance}px ${blur}px ${lightShadow};`,
  ].join('\n')

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const boxStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    background: gradient
      ? shape === 'concave'
        ? `linear-gradient(145deg, ${adjustBrightness(bgColor, -10)}, ${adjustBrightness(bgColor, 10)})`
        : `linear-gradient(145deg, ${adjustBrightness(bgColor, 10)}, ${adjustBrightness(bgColor, -10)})`
      : bgColor,
    boxShadow: `${prefix}${distance}px ${distance}px ${blur}px ${darkShadow}, ${prefix}${-distance}px ${-distance}px ${blur}px ${lightShadow}`,
  }

  return (
    <ToolLayout
      title="Neumorphism Generator"
      description="Generate soft UI / neumorphic CSS effects. Customize shadow depth, blur, shape, and color with a live preview."
      category="Developer"
      slug="neumorphism-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["neumorphism generator", "soft ui", "neumorphic css", "neomorphism", "css shadows"]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Preview */}
        <div className="flex flex-col items-center">
          <div className="w-full rounded-xl p-12 flex items-center justify-center min-h-[400px]" style={{ background: bgColor }}>
            <div style={boxStyle} />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Background Color</label>
            <div className="flex gap-2">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
              <input value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Shape</label>
            <div className="flex gap-2">
              {(['flat', 'concave', 'convex', 'pressed'] as Shape[]).map(s => (
                <button key={s} onClick={() => setShape(s)} className={`flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-colors ${shape === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Size</span><span>{size}px</span></label>
            <input type="range" min={50} max={350} value={size} onChange={e => setSize(+e.target.value)} className="w-full accent-blue-500" />
          </div>

          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Border Radius</span><span>{radius}px</span></label>
            <input type="range" min={0} max={175} value={radius} onChange={e => setRadius(+e.target.value)} className="w-full accent-blue-500" />
          </div>

          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Distance</span><span>{distance}px</span></label>
            <input type="range" min={1} max={50} value={distance} onChange={e => setDistance(+e.target.value)} className="w-full accent-blue-500" />
          </div>

          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Intensity</span><span>{intensity}</span></label>
            <input type="range" min={5} max={60} value={intensity} onChange={e => setIntensity(+e.target.value)} className="w-full accent-blue-500" />
          </div>

          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Blur</span><span>{blur}px</span></label>
            <input type="range" min={0} max={80} value={blur} onChange={e => setBlur(+e.target.value)} className="w-full accent-blue-500" />
          </div>

          {/* Output */}
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
