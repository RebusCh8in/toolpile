'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

type Mode = 'json-to-csv' | 'csv-to-json'

function jsonToCsv(json: string): string {
  const data = JSON.parse(json)
  const arr = Array.isArray(data) ? data : [data]
  if (arr.length === 0) return ''
  const headers = [...new Set(arr.flatMap(obj => Object.keys(obj)))]
  const escape = (val: unknown) => {
    const s = val === null || val === undefined ? '' : String(val)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = arr.map(obj => headers.map(h => escape(obj[h])).join(','))
  return [headers.join(','), ...rows].join('\n')
}

function csvToJson(csv: string): string {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return '[]'
  const parseRow = (line: string) => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      if (inQuotes) {
        if (line[i] === '"' && line[i + 1] === '"') { current += '"'; i++ }
        else if (line[i] === '"') inQuotes = false
        else current += line[i]
      } else {
        if (line[i] === '"') inQuotes = true
        else if (line[i] === ',') { result.push(current); current = '' }
        else current += line[i]
      }
    }
    result.push(current)
    return result
  }
  const headers = parseRow(lines[0])
  const rows = lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = parseRow(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
  return JSON.stringify(rows, null, 2)
}

const faqs: FAQ[] = [
  { question: "What JSON formats are supported?", answer: "The tool expects an array of objects (e.g., [{\"name\": \"Alice\"}, {\"name\": \"Bob\"}]). Nested objects are flattened to their string representation. Single objects are treated as a one-row array." },
  { question: "Can I convert CSV back to JSON?", answer: "Yes. Toggle the mode to 'CSV to JSON' and paste your CSV data. The first row is treated as headers, and each subsequent row becomes a JSON object." },
  { question: "Is my data uploaded anywhere?", answer: "No. All conversion happens in your browser. Your data never leaves your device." },
]

const relatedTools: RelatedTool[] = [
  { name: "JSON Formatter", href: "/tools/json-formatter" },
  { name: "Diff Checker", href: "/tools/diff-checker" },
  { name: "Base64 Encoder", href: "/tools/base64-encoder" },
]

export default function JsonToCsv() {
  const [mode, setMode] = useState<Mode>('json-to-csv')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const convert = () => {
    setError('')
    try {
      if (mode === 'json-to-csv') {
        setOutput(jsonToCsv(input))
      } else {
        setOutput(csvToJson(input))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input')
      setOutput('')
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const ext = mode === 'json-to-csv' ? 'csv' : 'json'
    const type = mode === 'json-to-csv' ? 'text/csv' : 'application/json'
    const blob = new Blob([output], { type })
    const a = document.createElement('a')
    a.download = `converted.${ext}`
    a.href = URL.createObjectURL(blob)
    a.click()
  }

  const swap = () => {
    setMode(mode === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv')
    setInput(output)
    setOutput('')
    setError('')
  }

  const placeholder = mode === 'json-to-csv'
    ? '[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob", "age": 25 }\n]'
    : 'name,age\nAlice,30\nBob,25'

  return (
    <ToolLayout
      title="JSON to CSV Converter"
      description="Convert between JSON and CSV formats. Bidirectional conversion with download support. Free and private."
      category="Developer"
      slug="json-to-csv"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["json to csv", "csv to json", "convert json csv", "data converter", "json csv online"]}
    >
      <div className="space-y-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setMode('json-to-csv'); setInput(''); setOutput(''); setError('') }}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${mode === 'json-to-csv' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            JSON → CSV
          </button>
          <button onClick={swap} className="text-zinc-500 hover:text-zinc-300 text-lg">⇄</button>
          <button
            onClick={() => { setMode('csv-to-json'); setInput(''); setOutput(''); setError('') }}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${mode === 'csv-to-json' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            CSV → JSON
          </button>
        </div>

        {/* Input / Output */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">{mode === 'json-to-csv' ? 'JSON Input' : 'CSV Input'}</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={placeholder}
              rows={14}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-zinc-500">{mode === 'json-to-csv' ? 'CSV Output' : 'JSON Output'}</label>
              {output && (
                <div className="flex gap-2">
                  <button onClick={copy} className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600">{copied ? 'Copied!' : 'Copy'}</button>
                  <button onClick={download} className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600">Download</button>
                </div>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              rows={14}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 font-mono outline-none resize-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button onClick={convert} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
          Convert
        </button>
      </div>
    </ToolLayout>
  )
}
