'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * Math.max(0, Math.min(1, color))).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generatePalette(hex: string): { hex: string; label: string }[] {
  const [h, s, l] = hexToHsl(hex)
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
  const lightnesses = [97, 93, 86, 76, 64, 50, 40, 32, 24, 17, 10]

  return steps.map((step, i) => ({
    hex: hslToHex(h, Math.min(100, s + (i > 5 ? 10 : 0)), lightnesses[i]),
    label: String(step),
  }))
}

const faqs: FAQ[] = [
  { question: "How are the shades generated?", answer: "The tool converts your color to HSL, then generates 11 variations by adjusting the lightness value from very light (50) to very dark (950), similar to how Tailwind CSS generates its color palette." },
  { question: "Can I use these colors in Tailwind CSS?", answer: "Yes! The 11-step scale (50-950) matches Tailwind's color format exactly. Copy individual hex values or use them as custom colors in your tailwind.config.js." },
]

const relatedTools: RelatedTool[] = [
  { name: "Color Palette Generator", href: "/tools/color-palette-generator" },
  { name: "Color Contrast Checker", href: "/tools/color-contrast-checker" },
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
]

export default function ColorShadesGenerator() {
  const [color, setColor] = useState('#3b82f6')
  const [copied, setCopied] = useState<string | null>(null)

  const palette = generatePalette(color)

  const copy = (hex: string, label: string) => {
    navigator.clipboard.writeText(hex)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const copyAll = () => {
    const text = palette.map(p => `${p.label}: '${p.hex}'`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied('all')
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <ToolLayout
      title="Color Shades Generator"
      description="Generate a Tailwind-style color palette from any color. Get 11 shades from light to dark. Free and instant."
      category="Design"
      slug="color-shades-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["color shades generator", "color tints and shades", "tailwind color generator", "color palette from hex", "generate color shades", "color shade maker", "tailwind color palette"]}
      guide={<><h2>Color Shades Generator</h2><p>Pick any color and get a full Tailwind-style palette with 11 shades from light to dark. Click any swatch to copy its hex code.</p></>}
    >
      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-14 h-14 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
          <input
            type="text"
            value={color}
            onChange={e => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setColor(e.target.value) }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 font-mono w-28 focus:outline-none focus:border-blue-500"
          />
          <button onClick={copyAll} className="ml-auto bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm transition-colors">
            {copied === 'all' ? 'Copied!' : 'Copy All'}
          </button>
        </div>

        <div className="grid grid-cols-11 gap-0 rounded-xl overflow-hidden">
          {palette.map(p => (
            <button
              key={p.label}
              onClick={() => copy(p.hex, p.label)}
              className="group flex flex-col items-center"
            >
              <div className="w-full aspect-square" style={{ backgroundColor: p.hex }} />
              <div className="w-full bg-zinc-900 py-2 text-center">
                <p className="text-xs text-zinc-500">{p.label}</p>
                <p className="text-xs text-zinc-400 font-mono">{copied === p.label ? '✓' : p.hex}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Vertical list for mobile */}
        <div className="sm:hidden space-y-1">
          {palette.map(p => (
            <button
              key={p.label}
              onClick={() => copy(p.hex, p.label)}
              className="flex items-center w-full gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3"
            >
              <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: p.hex }} />
              <span className="text-sm text-zinc-500 w-10">{p.label}</span>
              <span className="text-sm text-zinc-300 font-mono">{p.hex}</span>
              <span className="ml-auto text-xs text-zinc-600">{copied === p.label ? 'Copied!' : 'Copy'}</span>
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  )
}
