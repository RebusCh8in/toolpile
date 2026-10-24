'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(c1: [number, number, number], c2: [number, number, number]): number {
  const l1 = relativeLuminance(c1)
  const l2 = relativeLuminance(c2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

interface WcagResult {
  level: string
  normalText: boolean
  largeText: boolean
  uiComponents: boolean
}

function checkWcag(ratio: number): WcagResult[] {
  return [
    {
      level: 'AA',
      normalText: ratio >= 4.5,
      largeText: ratio >= 3,
      uiComponents: ratio >= 3,
    },
    {
      level: 'AAA',
      normalText: ratio >= 7,
      largeText: ratio >= 4.5,
      uiComponents: ratio >= 4.5,
    },
  ]
}

const faqs: FAQ[] = [
  { question: "What is WCAG color contrast?", answer: "WCAG (Web Content Accessibility Guidelines) defines minimum contrast ratios between text and background colors. AA requires 4.5:1 for normal text and 3:1 for large text. AAA requires 7:1 for normal text and 4.5:1 for large text." },
  { question: "What counts as large text?", answer: "Large text is defined as 18pt (24px) or larger for regular weight, or 14pt (18.66px) or larger for bold weight." },
  { question: "Why does color contrast matter?", answer: "Good contrast ensures text is readable for people with low vision or color deficiencies. It's also a legal requirement under ADA and similar accessibility laws in many countries." },
]

const relatedTools: RelatedTool[] = [
  { name: "Color Palette Generator", href: "/tools/color-palette-generator" },
  { name: "Image Color Picker", href: "/tools/image-color-picker" },
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
]

export default function ColorContrastChecker() {
  const [fg, setFg] = useState('#ffffff')
  const [bg, setBg] = useState('#1e3a5f')

  const ratio = contrastRatio(hexToRgb(fg), hexToRgb(bg))
  const wcag = checkWcag(ratio)

  const swap = () => {
    setFg(bg)
    setBg(fg)
  }

  const PassFail = ({ pass }: { pass: boolean }) => (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${pass ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
      {pass ? 'Pass' : 'Fail'}
    </span>
  )

  return (
    <ToolLayout
      title="Color Contrast Checker"
      description="Check WCAG color contrast ratios between text and background colors. Verify AA and AAA accessibility compliance."
      category="Design"
      slug="color-contrast-checker"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["color contrast checker", "wcag contrast checker", "contrast ratio", "accessibility contrast", "color contrast", "wcag color contrast", "contrast checker online", "aa aaa contrast", "text contrast checker", "accessibility color checker"]}
      guide={
        <>
          <h2>WCAG Color Contrast Checker</h2>
          <p>Check if your text and background color combinations meet WCAG accessibility standards. Test for AA and AAA compliance for normal text, large text, and UI components.</p>
          <h3>How to Use</h3>
          <ul>
            <li>Pick a foreground (text) color and background color.</li>
            <li>See the contrast ratio and WCAG compliance results instantly.</li>
            <li>Use the swap button to reverse the colors.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Color pickers */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-400">Text:</label>
              <input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-12 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
              <input
                type="text"
                value={fg}
                onChange={e => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setFg(e.target.value) }}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono w-24 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button onClick={swap} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg px-3 py-2 text-sm transition-colors">
              Swap
            </button>

            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-400">Background:</label>
              <input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-12 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
              <input
                type="text"
                value={bg}
                onChange={e => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setBg(e.target.value) }}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono w-24 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl overflow-hidden border border-zinc-800">
          <div className="p-8 text-center" style={{ backgroundColor: bg }}>
            <p className="text-sm mb-2" style={{ color: fg }}>Normal text (16px)</p>
            <p className="text-2xl font-bold mb-2" style={{ color: fg }}>Large text (24px bold)</p>
            <p className="text-lg" style={{ color: fg }}>The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>

        {/* Ratio */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <p className="text-sm text-zinc-500 mb-1">Contrast Ratio</p>
          <p className={`text-5xl font-bold ${ratio >= 4.5 ? 'text-green-400' : ratio >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
            {ratio.toFixed(2)}:1
          </p>
        </div>

        {/* WCAG Results */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-zinc-400 font-medium">WCAG Level</th>
                <th className="px-4 py-3 text-center text-zinc-400 font-medium">Normal Text</th>
                <th className="px-4 py-3 text-center text-zinc-400 font-medium">Large Text</th>
                <th className="px-4 py-3 text-center text-zinc-400 font-medium">UI Components</th>
              </tr>
            </thead>
            <tbody>
              {wcag.map(w => (
                <tr key={w.level} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-3 text-zinc-300 font-medium">{w.level}</td>
                  <td className="px-4 py-3 text-center"><PassFail pass={w.normalText} /></td>
                  <td className="px-4 py-3 text-center"><PassFail pass={w.largeText} /></td>
                  <td className="px-4 py-3 text-center"><PassFail pass={w.uiComponents} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  )
}
