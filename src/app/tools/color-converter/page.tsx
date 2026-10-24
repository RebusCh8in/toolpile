'use client'

import { useState, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

interface ColorValues {
  hex: string
  r: number; g: number; b: number
  h: number; s: number; l: number
  hsvH: number; hsvS: number; hsvV: number
  c: number; m: number; y: number; k: number
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  const l = (max+min)/2
  if (max === min) return [0, 0, Math.round(l*100)]
  const d = max - min
  const s = l > 0.5 ? d/(2-max-min) : d/(max+min)
  let h = 0
  if (max === r) h = ((g-b)/d + (g<b?6:0))/6
  else if (max === g) h = ((b-r)/d + 2)/6
  else h = ((r-g)/d + 4)/6
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)]
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  const d = max - min
  const v = max
  const s = max === 0 ? 0 : d/max
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g-b)/d + (g<b?6:0))/6
    else if (max === g) h = ((b-r)/d + 2)/6
    else h = ((r-g)/d + 4)/6
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(v*100)]
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (r===0 && g===0 && b===0) return [0, 0, 0, 100]
  const c = 1 - r/255, m = 1 - g/255, y = 1 - b/255
  const k = Math.min(c, m, y)
  return [Math.round((c-k)/(1-k)*100), Math.round((m-k)/(1-k)*100), Math.round((y-k)/(1-k)*100), Math.round(k*100)]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100
  if (s === 0) { const v = Math.round(l*255); return [v,v,v] }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1/6) return p + (q-p)*6*t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q-p)*(2/3-t)*6
    return p
  }
  const q = l < 0.5 ? l*(1+s) : l+s-l*s
  const p = 2*l - q
  return [Math.round(hue2rgb(p,q,h+1/3)*255), Math.round(hue2rgb(p,q,h)*255), Math.round(hue2rgb(p,q,h-1/3)*255)]
}

const faqs: FAQ[] = [
  { question: "What color formats are supported?", answer: "HEX, RGB, HSL, HSB/HSV, and CMYK. Enter a value in any format and all others update instantly. Supports 3 and 6 digit hex codes." },
  { question: "What is the difference between HSL and HSV?", answer: "HSL (Hue, Saturation, Lightness) and HSV (Hue, Saturation, Value/Brightness) are both cylindrical representations of color. HSL is more intuitive for web design (used in CSS), while HSV is common in design tools like Photoshop and Figma." },
  { question: "Why is CMYK different from what I see on screen?", answer: "CMYK is a subtractive color model used for printing. RGB screens can display colors that CMYK cannot reproduce and vice versa. The CMYK values shown are approximations — for accurate print colors, use a calibrated color management system." },
]

const relatedTools: RelatedTool[] = [
  { name: "Color Palette Generator", href: "/tools/color-palette-generator" },
  { name: "Color Shades Generator", href: "/tools/color-shades-generator" },
  { name: "Color Contrast Checker", href: "/tools/color-contrast-checker" },
]

export default function ColorConverter() {
  const [color, setColor] = useState<ColorValues>({
    hex: '#3b82f6', r: 59, g: 130, b: 246,
    h: 217, s: 91, l: 60,
    hsvH: 217, hsvS: 76, hsvV: 96,
    c: 76, m: 47, y: 0, k: 4,
  })
  const [copied, setCopied] = useState('')

  const updateFromRgb = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b)
    const [h, s, l] = rgbToHsl(r, g, b)
    const [hsvH, hsvS, hsvV] = rgbToHsv(r, g, b)
    const [c, m, y, k] = rgbToCmyk(r, g, b)
    setColor({ hex, r, g, b, h, s, l, hsvH, hsvS, hsvV, c, m, y, k })
  }

  const updateFromHex = (hex: string) => {
    const rgb = hexToRgb(hex)
    if (rgb) updateFromRgb(...rgb)
    else setColor(c => ({ ...c, hex }))
  }

  const updateFromHsl = (h: number, s: number, l: number) => {
    const [r, g, b] = hslToRgb(h, s, l)
    updateFromRgb(r, g, b)
  }

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(label)
    setTimeout(() => setCopied(''), 1500)
  }

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
      <span className="text-xs text-zinc-500 font-mono">{label}</span>
      <div className="flex items-center gap-2">
        <code className="text-sm text-zinc-200 font-mono">{value}</code>
        <button onClick={() => copy(label, value)} className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-400 hover:bg-zinc-600 transition-colors">
          {copied === label ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  )

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert colors between HEX, RGB, HSL, HSV, and CMYK. Enter any format and get all others instantly."
      category="Design"
      slug="color-converter"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["color converter", "hex to rgb", "rgb to hsl", "color format converter", "cmyk converter"]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Color preview */}
        <div className="flex gap-4 items-start">
          <div className="w-32 h-32 rounded-xl border border-zinc-700 shrink-0" style={{ background: color.hex }} />
          <div className="flex-1 space-y-2">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">HEX</label>
              <div className="flex gap-2">
                <input type="color" value={color.hex} onChange={e => updateFromHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <input value={color.hex} onChange={e => updateFromHex(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">R</label>
                <input type="number" min={0} max={255} value={color.r} onChange={e => updateFromRgb(+e.target.value, color.g, color.b)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">G</label>
                <input type="number" min={0} max={255} value={color.g} onChange={e => updateFromRgb(color.r, +e.target.value, color.b)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">B</label>
                <input type="number" min={0} max={255} value={color.b} onChange={e => updateFromRgb(color.r, color.g, +e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* HSL sliders */}
        <div className="space-y-2">
          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Hue</span><span>{color.h}°</span></label>
            <input type="range" min={0} max={360} value={color.h} onChange={e => updateFromHsl(+e.target.value, color.s, color.l)} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Saturation</span><span>{color.s}%</span></label>
            <input type="range" min={0} max={100} value={color.s} onChange={e => updateFromHsl(color.h, +e.target.value, color.l)} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Lightness</span><span>{color.l}%</span></label>
            <input type="range" min={0} max={100} value={color.l} onChange={e => updateFromHsl(color.h, color.s, +e.target.value)} className="w-full accent-blue-500" />
          </div>
        </div>

        {/* All formats */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-400">All Formats</h3>
          <Row label="HEX" value={color.hex} />
          <Row label="RGB" value={`rgb(${color.r}, ${color.g}, ${color.b})`} />
          <Row label="HSL" value={`hsl(${color.h}, ${color.s}%, ${color.l}%)`} />
          <Row label="HSV" value={`hsv(${color.hsvH}, ${color.hsvS}%, ${color.hsvV}%)`} />
          <Row label="CMYK" value={`cmyk(${color.c}%, ${color.m}%, ${color.y}%, ${color.k}%)`} />
        </div>
      </div>
    </ToolLayout>
  )
}
