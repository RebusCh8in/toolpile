'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const JUSTIFY = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'] as const
const ALIGN = ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'] as const
const DIRECTION = ['row', 'row-reverse', 'column', 'column-reverse'] as const
const WRAP = ['nowrap', 'wrap', 'wrap-reverse'] as const

const faqs: FAQ[] = [
  { question: "What is CSS Flexbox?", answer: "Flexbox (Flexible Box Layout) is a CSS layout model that distributes space and aligns items in a container. It's ideal for one-dimensional layouts — laying out items in a row or column." },
  { question: "When should I use Flexbox vs Grid?", answer: "Use Flexbox for one-dimensional layouts (a row or column of items). Use CSS Grid for two-dimensional layouts (rows AND columns). Flexbox is better for navigation bars, card rows, and centering. Grid is better for full page layouts and complex grids." },
  { question: "What does flex-grow do?", answer: "flex-grow determines how much an item grows relative to its siblings. A value of 0 means it won't grow. A value of 1 means it takes its proportional share of available space. A value of 2 means it takes twice as much space as items with flex-grow: 1." },
]

const relatedTools: RelatedTool[] = [
  { name: "CSS Grid Generator", href: "/tools/css-grid" },
  { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
  { name: "CSS Clip Path Generator", href: "/tools/css-clip-path" },
]

export default function CssFlexbox() {
  const [direction, setDirection] = useState<typeof DIRECTION[number]>('row')
  const [justify, setJustify] = useState<typeof JUSTIFY[number]>('flex-start')
  const [align, setAlign] = useState<typeof ALIGN[number]>('stretch')
  const [wrap, setWrap] = useState<typeof WRAP[number]>('nowrap')
  const [gap, setGap] = useState(10)
  const [itemCount, setItemCount] = useState(4)
  const [copied, setCopied] = useState(false)

  const css = `.container {
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justify};
  align-items: ${align};
  flex-wrap: ${wrap};
  gap: ${gap}px;
}`

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap,
    gap,
    minHeight: 300,
    padding: 16,
  }

  return (
    <ToolLayout
      title="CSS Flexbox Generator"
      description="Build CSS Flexbox layouts visually. Adjust direction, alignment, wrapping, and gap with a live preview."
      category="Developer"
      slug="css-flexbox"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["css flexbox", "flexbox generator", "flex layout", "css flex", "flexbox playground"]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preview */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Preview</h3>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden" style={containerStyle}>
            {Array.from({ length: itemCount }, (_, i) => (
              <div key={i} className="bg-blue-600/20 border border-blue-500/40 rounded-lg px-4 py-3 text-sm text-blue-300 font-mono shrink-0">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <SelectControl label="flex-direction" value={direction} options={DIRECTION} onChange={v => setDirection(v as typeof direction)} />
          <SelectControl label="justify-content" value={justify} options={JUSTIFY} onChange={v => setJustify(v as typeof justify)} />
          <SelectControl label="align-items" value={align} options={ALIGN} onChange={v => setAlign(v as typeof align)} />
          <SelectControl label="flex-wrap" value={wrap} options={WRAP} onChange={v => setWrap(v as typeof wrap)} />

          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>gap</span><span>{gap}px</span></label>
            <input type="range" min={0} max={40} value={gap} onChange={e => setGap(+e.target.value)} className="w-full accent-blue-500" />
          </div>

          <div>
            <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Items</span><span>{itemCount}</span></label>
            <input type="range" min={1} max={12} value={itemCount} onChange={e => setItemCount(+e.target.value)} className="w-full accent-blue-500" />
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

function SelectControl({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1 font-mono">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${value === opt ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
