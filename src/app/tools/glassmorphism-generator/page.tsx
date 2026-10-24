'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  {
    question: "What is glassmorphism?",
    answer: "Glassmorphism is a modern UI design trend that creates a frosted glass effect using background blur, transparency, and subtle borders. It was popularized by Apple's iOS design and is now widely used in web and app design."
  },
  {
    question: "Does glassmorphism work in all browsers?",
    answer: "The backdrop-filter CSS property is supported in all modern browsers including Chrome, Firefox, Safari, and Edge. Older browsers will show the background color without the blur effect, which is a graceful fallback."
  },
  {
    question: "How do I use the generated CSS?",
    answer: "Click the Copy CSS button and paste it into your stylesheet. Apply the class to any element that sits on top of a colorful background — the frosted glass effect needs background content to blur."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
  { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
  { name: "Color Palette Generator", href: "/tools/color-palette-generator" },
]

export default function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(16)
  const [opacity, setOpacity] = useState(20)
  const [borderOpacity, setBorderOpacity] = useState(30)
  const [color, setColor] = useState('#ffffff')
  const [borderRadius, setBorderRadius] = useState(16)
  const [copied, setCopied] = useState(false)

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  const rgb = hexToRgb(color)

  const css = `background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(opacity / 100).toFixed(2)});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: ${borderRadius}px;
border: 1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(borderOpacity / 100).toFixed(2)});`

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout
      title="Glassmorphism Generator"
      description="Create frosted glass CSS effects with a live visual editor. Adjust blur, transparency, and borders. Copy the CSS with one click."
      category="Developer"
      slug="glassmorphism-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "glassmorphism generator",
        "glassmorphism css",
        "frosted glass css",
        "glass effect css",
        "glassmorphism",
        "backdrop filter generator",
        "css glass effect",
        "glassmorphism css generator",
        "frosted glass effect",
        "glass ui generator",
      ]}
      guide={
        <>
          <h2>CSS Glassmorphism Generator</h2>
          <p>
            Create beautiful frosted glass effects for your UI with this visual editor. Adjust blur intensity, transparency, border opacity, and border radius in real time.
          </p>
          <h3>How to Use</h3>
          <ul>
            <li>Adjust the sliders to customize the glass effect.</li>
            <li>Pick a glass tint color.</li>
            <li>See the live preview against a colorful background.</li>
            <li>Copy the generated CSS code with one click.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Preview */}
        <div
          className="rounded-xl p-8 flex items-center justify-center"
          style={{
            minHeight: 350,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
          }}
        >
          <div
            style={{
              background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              borderRadius: `${borderRadius}px`,
              border: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${borderOpacity / 100})`,
            }}
            className="w-full max-w-md p-8 text-center"
          >
            <h3 className="text-white text-xl font-semibold mb-2">Glass Card</h3>
            <p className="text-white/80 text-sm">
              This is a glassmorphism effect created with backdrop-filter and transparency.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-zinc-400">Blur</label>
                <span className="text-sm text-zinc-300">{blur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={blur}
                onChange={e => setBlur(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-zinc-400">Transparency</label>
                <span className="text-sm text-zinc-300">{opacity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={e => setOpacity(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-zinc-400">Border Opacity</label>
                <span className="text-sm text-zinc-300">{borderOpacity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={borderOpacity}
                onChange={e => setBorderOpacity(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-zinc-400">Border Radius</label>
                <span className="text-sm text-zinc-300">{borderRadius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={48}
                value={borderRadius}
                onChange={e => setBorderRadius(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-400">Color:</label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
            />
            <span className="text-sm text-zinc-300 font-mono">{color}</span>
          </div>
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
          <pre className="bg-zinc-950 rounded-lg p-4 text-sm text-zinc-300 font-mono overflow-x-auto">
            {css}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
