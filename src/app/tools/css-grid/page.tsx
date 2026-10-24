'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "What is CSS Grid?", answer: "CSS Grid is a two-dimensional layout system that lets you control both rows and columns simultaneously. It's ideal for complex page layouts, dashboards, and image galleries." },
  { question: "What does fr unit mean?", answer: "The fr unit represents a fraction of the available space in the grid container. '1fr 2fr' means the second column gets twice as much space as the first. It's similar to flex-grow but for grid tracks." },
  { question: "When should I use Grid vs Flexbox?", answer: "Use Grid for two-dimensional layouts (rows AND columns) like page layouts, dashboards, and galleries. Use Flexbox for one-dimensional layouts (a single row or column) like navigation bars and card rows." },
]

const relatedTools: RelatedTool[] = [
  { name: "CSS Flexbox Generator", href: "/tools/css-flexbox" },
  { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
  { name: "CSS Clip Path Generator", href: "/tools/css-clip-path" },
]

export default function CssGrid() {
  const [cols, setCols] = useState(3)
  const [rows, setRows] = useState(3)
  const [colGap, setColGap] = useState(10)
  const [rowGap, setRowGap] = useState(10)
  const [colSizes, setColSizes] = useState('1fr 1fr 1fr')
  const [rowSizes, setRowSizes] = useState('auto auto auto')
  const [justifyItems, setJustifyItems] = useState('stretch')
  const [alignItems, setAlignItems] = useState('stretch')
  const [copied, setCopied] = useState(false)

  const updateCols = (n: number) => {
    setCols(n)
    setColSizes(Array(n).fill('1fr').join(' '))
  }
  const updateRows = (n: number) => {
    setRows(n)
    setRowSizes(Array(n).fill('auto').join(' '))
  }

  const css = `.grid-container {
  display: grid;
  grid-template-columns: ${colSizes};
  grid-template-rows: ${rowSizes};
  column-gap: ${colGap}px;
  row-gap: ${rowGap}px;
  justify-items: ${justifyItems};
  align-items: ${alignItems};
}`

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: colSizes,
    gridTemplateRows: rowSizes,
    columnGap: colGap,
    rowGap: rowGap,
    justifyItems: justifyItems as React.CSSProperties['justifyItems'],
    alignItems: alignItems as React.CSSProperties['alignItems'],
    minHeight: 300,
    padding: 4,
  }

  const totalCells = cols * rows

  return (
    <ToolLayout
      title="CSS Grid Generator"
      description="Build CSS Grid layouts visually. Customize columns, rows, gaps, and alignment with a live preview."
      category="Developer"
      slug="css-grid"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["css grid", "grid generator", "css grid layout", "grid template", "css grid playground"]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preview */}
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Preview</h3>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden p-3">
            <div style={gridStyle}>
              {Array.from({ length: totalCells }, (_, i) => (
                <div key={i} className="bg-blue-600/20 border border-blue-500/40 rounded-lg p-3 text-sm text-blue-300 font-mono text-center min-h-[40px] flex items-center justify-center">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Columns</span><span>{cols}</span></label>
              <input type="range" min={1} max={8} value={cols} onChange={e => updateCols(+e.target.value)} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Rows</span><span>{rows}</span></label>
              <input type="range" min={1} max={8} value={rows} onChange={e => updateRows(+e.target.value)} className="w-full accent-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1 font-mono">grid-template-columns</label>
            <input value={colSizes} onChange={e => setColSizes(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1 font-mono">grid-template-rows</label>
            <input value={rowSizes} onChange={e => setRowSizes(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Column Gap</span><span>{colGap}px</span></label>
              <input type="range" min={0} max={40} value={colGap} onChange={e => setColGap(+e.target.value)} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="flex justify-between text-xs text-zinc-500 mb-1"><span>Row Gap</span><span>{rowGap}px</span></label>
              <input type="range" min={0} max={40} value={rowGap} onChange={e => setRowGap(+e.target.value)} className="w-full accent-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1 font-mono">justify-items</label>
            <div className="flex flex-wrap gap-1.5">
              {['start', 'end', 'center', 'stretch'].map(v => (
                <button key={v} onClick={() => setJustifyItems(v)} className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${justifyItems === v ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1 font-mono">align-items</label>
            <div className="flex flex-wrap gap-1.5">
              {['start', 'end', 'center', 'stretch'].map(v => (
                <button key={v} onClick={() => setAlignItems(v)} className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${alignItems === v ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                  {v}
                </button>
              ))}
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
