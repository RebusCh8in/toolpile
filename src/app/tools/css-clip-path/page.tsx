'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const PRESETS: { label: string; path: string }[] = [
  { label: 'Triangle', path: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
  { label: 'Rhombus', path: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
  { label: 'Pentagon', path: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' },
  { label: 'Hexagon', path: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' },
  { label: 'Octagon', path: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' },
  { label: 'Star', path: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' },
  { label: 'Cross', path: 'polygon(33% 0%, 67% 0%, 67% 33%, 100% 33%, 100% 67%, 67% 67%, 67% 100%, 33% 100%, 33% 67%, 0% 67%, 0% 33%, 33% 33%)' },
  { label: 'Arrow Right', path: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)' },
  { label: 'Arrow Left', path: 'polygon(40% 0%, 40% 20%, 100% 20%, 100% 80%, 40% 80%, 40% 100%, 0% 50%)' },
  { label: 'Trapezoid', path: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' },
  { label: 'Parallelogram', path: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' },
  { label: 'Circle', path: 'circle(50% at 50% 50%)' },
  { label: 'Ellipse', path: 'ellipse(50% 35% at 50% 50%)' },
  { label: 'Inset', path: 'inset(10% 10% 10% 10% round 10px)' },
]

const faqs: FAQ[] = [
  {
    question: "What is CSS clip-path?",
    answer: "CSS clip-path is a property that creates a clipping region to define what part of an element is visible. Anything outside the clip path is hidden. It supports shapes like polygons, circles, ellipses, and insets."
  },
  {
    question: "Is clip-path supported in all browsers?",
    answer: "Yes. CSS clip-path with polygon(), circle(), ellipse(), and inset() is supported in all modern browsers including Chrome, Firefox, Safari, and Edge."
  },
  {
    question: "Can I animate clip-path?",
    answer: "Yes. CSS clip-path can be animated with CSS transitions and animations. Transitioning between paths with the same number of points creates smooth morphing effects."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
  { name: "Glassmorphism Generator", href: "/tools/glassmorphism-generator" },
]

export default function CssClipPath() {
  const [clipPath, setClipPath] = useState(PRESETS[0].path)
  const [activePreset, setActivePreset] = useState(PRESETS[0].label)
  const [copied, setCopied] = useState(false)

  const css = `clip-path: ${clipPath};`

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout
      title="CSS Clip Path Generator"
      description="Create CSS clip-path shapes visually. Pick from preset shapes or enter custom paths. Copy the CSS with one click."
      category="Developer"
      slug="css-clip-path"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "css clip path generator",
        "clip path maker",
        "css clip path",
        "clip path polygon",
        "css shapes",
        "css clip path shapes",
        "clip path generator online",
        "css polygon generator",
        "clip path css",
        "css shape generator",
      ]}
      guide={
        <>
          <h2>CSS Clip Path Generator</h2>
          <p>
            Create clip-path shapes for CSS with preset shapes or custom polygon paths. Preview your shape in real time and copy the CSS.
          </p>
          <h3>How to Use</h3>
          <ul>
            <li>Click a preset shape to apply it instantly.</li>
            <li>Edit the clip-path value directly to customize it.</li>
            <li>See the live preview update in real time.</li>
            <li>Copy the CSS code with one click.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex items-center justify-center" style={{ minHeight: 350 }}>
          <div className="relative">
            {/* Ghost (shows full shape outline) */}
            <div
              className="w-64 h-64 rounded-lg"
              style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px dashed rgba(59, 130, 246, 0.3)' }}
            />
            {/* Clipped shape */}
            <div
              className="absolute inset-0 w-64 h-64"
              style={{
                clipPath: clipPath,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              }}
            />
          </div>
        </div>

        {/* Presets */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => {
                  setClipPath(p.path)
                  setActivePreset(p.label)
                }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activePreset === p.label
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <label className="text-sm text-zinc-400 mb-2 block">clip-path value:</label>
          <input
            type="text"
            value={clipPath}
            onChange={e => {
              setClipPath(e.target.value)
              setActivePreset('')
            }}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 font-mono focus:outline-none focus:border-blue-500"
            spellCheck={false}
          />
        </div>

        {/* CSS Output */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">CSS</p>
            <button
              onClick={copy}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
            >
              {copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
          <pre className="bg-zinc-950 rounded-lg p-4 text-sm text-zinc-300 font-mono">
            {css}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
