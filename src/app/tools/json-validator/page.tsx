'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

interface ValidationResult {
  valid: boolean
  error?: string
  line?: number
  col?: number
  formatted?: string
}

function validate(input: string): ValidationResult {
  if (!input.trim()) return { valid: false, error: 'Enter JSON to validate' }
  try {
    const parsed = JSON.parse(input)
    return { valid: true, formatted: JSON.stringify(parsed, null, 2) }
  } catch (e) {
    const msg = (e as Error).message
    // Try to extract position info
    const posMatch = msg.match(/position (\d+)/)
    if (posMatch) {
      const pos = parseInt(posMatch[1])
      const lines = input.substring(0, pos).split('\n')
      return { valid: false, error: msg, line: lines.length, col: lines[lines.length - 1].length + 1 }
    }
    return { valid: false, error: msg }
  }
}

const faqs: FAQ[] = [
  { question: "What does this JSON validator check?", answer: "It checks that your JSON is syntactically valid according to the JSON specification (RFC 8259). It detects missing commas, unclosed brackets, trailing commas, single quotes, unquoted keys, and other common errors." },
  { question: "Can it fix invalid JSON?", answer: "This tool detects and locates errors but doesn't auto-fix them. It shows the line and column number of the error so you can fix it manually. For formatting valid JSON, it can pretty-print with proper indentation." },
  { question: "What's the difference between this and JSON Formatter?", answer: "JSON Formatter focuses on formatting (pretty-print/minify) valid JSON. This JSON Validator focuses on finding and locating errors in invalid JSON, with detailed error messages and line numbers." },
]

const relatedTools: RelatedTool[] = [
  { name: "JSON Formatter", href: "/tools/json-formatter" },
  { name: "JSON to CSV", href: "/tools/json-to-csv" },
  { name: "Diff Checker", href: "/tools/diff-checker" },
]

export default function JsonValidator() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleValidate = () => {
    setResult(validate(input))
  }

  const handlePrettify = () => {
    const r = validate(input)
    if (r.valid && r.formatted) {
      setInput(r.formatted)
    }
    setResult(r)
  }

  const handleMinify = () => {
    const r = validate(input)
    if (r.valid) {
      setInput(JSON.stringify(JSON.parse(input)))
    }
    setResult(r)
  }

  const copy = () => {
    navigator.clipboard.writeText(input)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lineCount = input.split('\n').length

  return (
    <ToolLayout
      title="JSON Validator"
      description="Validate JSON syntax with detailed error messages and line numbers. Also prettify and minify valid JSON."
      category="Developer"
      slug="json-validator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["json validator", "validate json", "json checker", "json lint", "json syntax check"]}
    >
      <div className="space-y-4">
        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleValidate} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
            Validate
          </button>
          <button onClick={handlePrettify} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
            Prettify
          </button>
          <button onClick={handleMinify} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
            Minify
          </button>
          <button onClick={() => { setInput(''); setResult(null) }} className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
            Clear
          </button>
          {input && (
            <button onClick={copy} className="ml-auto text-xs px-3 py-1.5 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {/* Status */}
        {result && (
          <div className={`rounded-lg px-4 py-3 text-sm ${result.valid ? 'bg-green-900/30 border border-green-700/50 text-green-300' : 'bg-red-900/30 border border-red-700/50 text-red-300'}`}>
            {result.valid ? (
              <span>Valid JSON</span>
            ) : (
              <div>
                <span className="font-medium">Invalid JSON</span>
                {result.line && <span className="text-red-400 ml-2">Line {result.line}, Column {result.col}</span>}
                <p className="mt-1 text-xs opacity-80">{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Editor */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-10 h-full bg-zinc-900 border-r border-zinc-700 rounded-l-lg flex flex-col items-end pt-3 pr-2 text-xs text-zinc-600 font-mono overflow-hidden select-none">
            {Array.from({ length: Math.max(lineCount, 10) }, (_, i) => (
              <div key={i} className={`leading-[20px] ${result && !result.valid && result.line === i + 1 ? 'text-red-400 font-bold' : ''}`}>
                {i + 1}
              </div>
            ))}
          </div>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null) }}
            placeholder='{"key": "value"}'
            rows={18}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-12 pr-4 py-3 text-sm text-zinc-100 font-mono outline-none focus:border-blue-500 resize-none leading-[20px]"
            spellCheck={false}
          />
        </div>

        <div className="text-xs text-zinc-600">
          {input.length.toLocaleString()} characters &middot; {lineCount} lines
        </div>
      </div>
    </ToolLayout>
  )
}
