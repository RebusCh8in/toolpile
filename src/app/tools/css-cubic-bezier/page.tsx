'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const PRESETS: Record<string, [number, number, number, number]> = {
  'ease': [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  'linear': [0, 0, 1, 1],
  'ease-in-back': [0.6, -0.28, 0.74, 0.05],
  'ease-out-back': [0.18, 0.89, 0.32, 1.28],
  'ease-in-out-back': [0.68, -0.55, 0.27, 1.55],
  'fast-out-slow-in': [0.4, 0, 0.2, 1],
  'bounce': [0.68, -0.6, 0.32, 1.6],
}

const faqs: FAQ[] = [
  { question: "What is a cubic bezier curve?", answer: "A cubic bezier curve defines the speed of a CSS transition or animation over time. It's controlled by two points (P1 and P2) that shape the acceleration curve. The CSS function cubic-bezier(x1, y1, x2, y2) takes these two control points." },
  { question: "What do the four values mean?", answer: "The four values are x1, y1, x2, y2 — the coordinates of two control points. x values must be between 0 and 1 (time axis). y values can go outside 0-1 to create overshoot/bounce effects. P1 controls the start of the animation, P2 controls the end." },
  { question: "Can y values be negative or greater than 1?", answer: "Yes. y values outside 0-1 create overshoot and bounce effects. A negative y1 makes the animation start by moving backward. A y2 greater than 1 makes it overshoot the target before settling." },
]

const relatedTools: RelatedTool[] = [
  { name: "CSS Loader Generator", href: "/tools/css-loader-generator" },
  { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
]

export default function CssCubicBezier() {
  const [p1x, setP1x] = useState(0.25)
  const [p1y, setP1y] = useState(0.1)
  const [p2x, setP2x] = useState(0.25)
  const [p2y, setP2y] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [copied, setCopied] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<null | 1 | 2>(null)

  const W = 280, H = 280, PAD = 30
  const toSvgX = (v: number) => PAD + v * (W - 2 * PAD)
  const toSvgY = (v: number) => H - PAD - v * (H - 2 * PAD)
  const fromSvgX = (x: number) => Math.max(0, Math.min(1, (x - PAD) / (W - 2 * PAD)))
  const fromSvgY = (y: number) => Math.max(-0.5, Math.min(1.5, (H - PAD - y) / (H - 2 * PAD)))

  const handleMouseDown = (point: 1 | 2) => (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(point)
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = fromSvgX((e.clientX - rect.left) / rect.width * W)
    const y = fromSvgY((e.clientY - rect.top) / rect.height * H)
    if (dragging === 1) { setP1x(Math.round(x * 100) / 100); setP1y(Math.round(y * 100) / 100) }
    else { setP2x(Math.round(x * 100) / 100); setP2y(Math.round(y * 100) / 100) }
  }, [dragging])

  const handleMouseUp = () => setDragging(null)

  const css = `cubic-bezier(${p1x}, ${p1y}, ${p2x}, ${p2y})`
  const transitionCss = `transition: all 0.6s ${css};`

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const playAnimation = () => {
    setAnimating(false)
    requestAnimationFrame(() => setAnimating(true))
  }

  useEffect(() => {
    if (animating) {
      const timer = setTimeout(() => setAnimating(false), 700)
      return () => clearTimeout(timer)
    }
  }, [animating])

  const applyPreset = (name: string) => {
    const [x1, y1, x2, y2] = PRESETS[name]
    setP1x(x1); setP1y(y1); setP2x(x2); setP2y(y2)
  }

  return (
    <ToolLayout
      title="CSS Cubic Bezier Generator"
      description="Create custom CSS animation easing curves visually. Drag control points, preview animations, and copy the cubic-bezier() value."
      category="Developer"
      slug="css-cubic-bezier"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["cubic bezier", "css easing", "animation timing", "cubic bezier generator", "css transition curve"]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Curve editor */}
        <div className="space-y-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full bg-zinc-900 rounded-xl border border-zinc-700 cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <g key={v}>
                <line x1={toSvgX(v)} y1={toSvgY(0)} x2={toSvgX(v)} y2={toSvgY(1)} stroke="#27272a" strokeWidth={1} />
                <line x1={toSvgX(0)} y1={toSvgY(v)} x2={toSvgX(1)} y2={toSvgY(v)} stroke="#27272a" strokeWidth={1} />
              </g>
            ))}
            {/* Diagonal (linear) */}
            <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(1)} y2={toSvgY(1)} stroke="#3f3f46" strokeWidth={1} strokeDasharray="4 4" />
            {/* Bezier curve */}
            <path
              d={`M ${toSvgX(0)} ${toSvgY(0)} C ${toSvgX(p1x)} ${toSvgY(p1y)}, ${toSvgX(p2x)} ${toSvgY(p2y)}, ${toSvgX(1)} ${toSvgY(1)}`}
              fill="none" stroke="#3b82f6" strokeWidth={2.5}
            />
            {/* Control lines */}
            <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(p1x)} y2={toSvgY(p1y)} stroke="#3b82f680" strokeWidth={1} />
            <line x1={toSvgX(1)} y1={toSvgY(1)} x2={toSvgX(p2x)} y2={toSvgY(p2y)} stroke="#ef444480" strokeWidth={1} />
            {/* Control points */}
            <circle cx={toSvgX(p1x)} cy={toSvgY(p1y)} r={7} fill="#3b82f6" stroke="#fff" strokeWidth={2} onMouseDown={handleMouseDown(1)} className="cursor-grab" />
            <circle cx={toSvgX(p2x)} cy={toSvgY(p2y)} r={7} fill="#ef4444" stroke="#fff" strokeWidth={2} onMouseDown={handleMouseDown(2)} className="cursor-grab" />
            {/* Endpoints */}
            <circle cx={toSvgX(0)} cy={toSvgY(0)} r={4} fill="#71717a" />
            <circle cx={toSvgX(1)} cy={toSvgY(1)} r={4} fill="#71717a" />
          </svg>

          {/* Animation preview */}
          <div className="bg-zinc-900 rounded-lg p-4 h-14 relative">
            <div
              className="w-10 h-10 bg-blue-500 rounded-lg absolute top-2"
              style={{
                left: animating ? 'calc(100% - 56px)' : '8px',
                transition: `left 0.6s ${css}`,
              }}
            />
          </div>
          <button onClick={playAnimation} className="w-full py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
            Play Animation
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Presets</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map(name => (
              <button key={name} onClick={() => applyPreset(name)} className="px-3 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors font-mono">
                {name}
              </button>
            ))}
          </div>

          <h3 className="text-sm font-medium text-zinc-400 mt-4">Control Points</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-blue-400 mb-1 font-mono">P1 x</label>
              <input type="number" step={0.01} min={0} max={1} value={p1x} onChange={e => setP1x(+e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-blue-400 mb-1 font-mono">P1 y</label>
              <input type="number" step={0.01} min={-0.5} max={1.5} value={p1y} onChange={e => setP1y(+e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-red-400 mb-1 font-mono">P2 x</label>
              <input type="number" step={0.01} min={0} max={1} value={p2x} onChange={e => setP2x(+e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-red-400 mb-1 font-mono">P2 y</label>
              <input type="number" step={0.01} min={-0.5} max={1.5} value={p2y} onChange={e => setP2y(+e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <h3 className="text-sm font-medium text-zinc-400">CSS</h3>
            <button onClick={copy} className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap">{transitionCss}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
