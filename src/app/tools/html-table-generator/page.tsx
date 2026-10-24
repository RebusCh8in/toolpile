'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "What output formats are supported?", answer: "HTML table markup, Markdown table syntax, and CSV. All three formats are generated simultaneously from the same data, so you can switch between them instantly." },
  { question: "Can I paste data from Excel or Google Sheets?", answer: "Yes. Copy cells from a spreadsheet, paste into the first cell, and the data will fill across cells and rows automatically (tab-separated values are parsed)." },
  { question: "Is there a limit on table size?", answer: "No hard limit. The tool supports up to 20 columns and 50 rows. Larger tables may slow down the browser since everything runs client-side." },
]

const relatedTools: RelatedTool[] = [
  { name: "Markdown Preview", href: "/tools/markdown-preview" },
  { name: "JSON Formatter", href: "/tools/json-formatter" },
  { name: "HTML Minifier", href: "/tools/html-minifier" },
]

export default function HtmlTableGenerator() {
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(3)
  const [data, setData] = useState<string[][]>(() => Array.from({ length: 4 }, () => Array(3).fill('')))
  const [hasHeader, setHasHeader] = useState(true)
  const [format, setFormat] = useState<'html' | 'markdown' | 'csv'>('html')
  const [copied, setCopied] = useState(false)

  const updateCell = (r: number, c: number, val: string) => {
    // Handle paste of tab-separated data
    if (val.includes('\t') || val.includes('\n')) {
      const lines = val.split('\n').map(line => line.split('\t'))
      const next = data.map(row => [...row])
      for (let i = 0; i < lines.length && r + i < rows; i++) {
        for (let j = 0; j < lines[i].length && c + j < cols; j++) {
          next[r + i][c + j] = lines[i][j].trim()
        }
      }
      setData(next)
      return
    }
    const next = data.map(row => [...row])
    next[r][c] = val
    setData(next)
  }

  const addRow = () => {
    if (rows >= 50) return
    setRows(rows + 1)
    setData([...data, Array(cols).fill('')])
  }

  const addCol = () => {
    if (cols >= 20) return
    setCols(cols + 1)
    setData(data.map(row => [...row, '']))
  }

  const removeRow = () => {
    if (rows <= 1) return
    setRows(rows - 1)
    setData(data.slice(0, -1))
  }

  const removeCol = () => {
    if (cols <= 1) return
    setCols(cols - 1)
    setData(data.map(row => row.slice(0, -1)))
  }

  const generateHtml = () => {
    const headerRow = hasHeader ? data[0] : null
    const bodyRows = hasHeader ? data.slice(1) : data
    let html = '<table>\n'
    if (headerRow) {
      html += '  <thead>\n    <tr>\n'
      headerRow.forEach(cell => { html += `      <th>${cell || ''}</th>\n` })
      html += '    </tr>\n  </thead>\n'
    }
    html += '  <tbody>\n'
    bodyRows.forEach(row => {
      html += '    <tr>\n'
      row.forEach(cell => { html += `      <td>${cell || ''}</td>\n` })
      html += '    </tr>\n'
    })
    html += '  </tbody>\n</table>'
    return html
  }

  const generateMarkdown = () => {
    const pad = (s: string, len: number) => s.padEnd(len)
    const colWidths = Array.from({ length: cols }, (_, c) =>
      Math.max(3, ...data.map(row => (row[c] || '').length))
    )
    const lines: string[] = []
    data.forEach((row, i) => {
      lines.push('| ' + row.map((cell, c) => pad(cell || '', colWidths[c])).join(' | ') + ' |')
      if (i === 0 && hasHeader) {
        lines.push('| ' + colWidths.map(w => '-'.repeat(w)).join(' | ') + ' |')
      }
    })
    return lines.join('\n')
  }

  const generateCsv = () => {
    return data.map(row =>
      row.map(cell => {
        const s = cell || ''
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
      }).join(',')
    ).join('\n')
  }

  const output = format === 'html' ? generateHtml() : format === 'markdown' ? generateMarkdown() : generateCsv()

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout
      title="HTML Table Generator"
      description="Create HTML, Markdown, and CSV tables with a spreadsheet-like editor. Paste from Excel, customize, and copy the output."
      category="Developer"
      slug="html-table-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["html table generator", "markdown table", "csv generator", "table creator", "html table maker"]}
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={removeCol} className="w-8 h-8 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700">-</button>
            <span className="text-sm text-zinc-400">{cols} cols</span>
            <button onClick={addCol} className="w-8 h-8 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700">+</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={removeRow} className="w-8 h-8 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700">-</button>
            <span className="text-sm text-zinc-400">{rows} rows</span>
            <button onClick={addRow} className="w-8 h-8 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700">+</button>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} className="accent-blue-500" />
            First row is header
          </label>
        </div>

        {/* Spreadsheet editor */}
        <div className="overflow-auto border border-zinc-700 rounded-lg">
          <table className="w-full">
            <tbody>
              {data.map((row, r) => (
                <tr key={r} className={r === 0 && hasHeader ? 'bg-zinc-800' : ''}>
                  {row.map((cell, c) => (
                    <td key={c} className="border border-zinc-700 p-0">
                      <input
                        value={cell}
                        onChange={e => updateCell(r, c, e.target.value)}
                        onPaste={e => {
                          const text = e.clipboardData.getData('text')
                          if (text.includes('\t') || text.includes('\n')) {
                            e.preventDefault()
                            updateCell(r, c, text)
                          }
                        }}
                        placeholder={r === 0 && hasHeader ? `Header ${c + 1}` : ''}
                        className={`w-full px-3 py-2 text-sm outline-none bg-transparent text-zinc-100 min-w-[120px] ${
                          r === 0 && hasHeader ? 'font-medium' : ''
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Format + Output */}
        <div className="flex items-center gap-3">
          {(['html', 'markdown', 'csv'] as const).map(f => (
            <button key={f} onClick={() => setFormat(f)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${format === f ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              {f.toUpperCase()}
            </button>
          ))}
          <button onClick={copy} className="ml-auto text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap overflow-auto max-h-80">{output}</pre>
      </div>
    </ToolLayout>
  )
}
