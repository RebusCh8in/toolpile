'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const conversions = [
  { label: 'UPPERCASE', fn: (s: string) => s.toUpperCase() },
  { label: 'lowercase', fn: (s: string) => s.toLowerCase() },
  { label: 'Title Case', fn: (s: string) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) },
  { label: 'Sentence case', fn: (s: string) => s.toLowerCase().replace(/(^|\.\s+)\w/g, c => c.toUpperCase()) },
  { label: 'camelCase', fn: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase()) },
  { label: 'PascalCase', fn: (s: string) => s.toLowerCase().replace(/(^|[^a-zA-Z0-9]+)(.)/g, (_, _2, c) => c.toUpperCase()) },
  { label: 'snake_case', fn: (s: string) => s.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s\-]+/g, '_').toLowerCase() },
  { label: 'kebab-case', fn: (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase() },
  { label: 'CONSTANT_CASE', fn: (s: string) => s.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s\-]+/g, '_').toUpperCase() },
  { label: 'dot.case', fn: (s: string) => s.replace(/([a-z])([A-Z])/g, '$1.$2').replace(/[\s_\-]+/g, '.').toLowerCase() },
  { label: 'aLtErNaTiNg', fn: (s: string) => s.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('') },
  { label: 'InVeRsE', fn: (s: string) => s.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('') },
]

const faqs: FAQ[] = [
  { question: "What text cases are supported?", answer: "UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, aLtErNaTiNg case, and InVeRsE case." },
  { question: "Is my text uploaded to a server?", answer: "No. All conversions happen in your browser. Your text never leaves your device." },
]

const relatedTools: RelatedTool[] = [
  { name: "Word Counter", href: "/tools/word-counter" },
  { name: "Fancy Text Generator", href: "/tools/fancy-text-generator" },
  { name: "Lorem Ipsum Generator", href: "/tools/lorem-ipsum-generator" },
]

export default function TextCaseConverter() {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <ToolLayout
      title="Text Case Converter"
      description="Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, and more. Free and instant."
      category="Text"
      slug="text-case-converter"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["text case converter", "uppercase converter", "lowercase converter", "title case converter", "camelcase converter", "snake case converter", "text case changer", "convert text case online"]}
      guide={
        <>
          <h2>Text Case Converter</h2>
          <p>Convert text between 12 different case formats. Type or paste your text and click any result to copy it.</p>
        </>
      }
    >
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 resize-y focus:outline-none focus:border-blue-500 placeholder-zinc-600"
        />

        {input && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conversions.map(c => {
              const result = c.fn(input)
              return (
                <button
                  key={c.label}
                  onClick={() => copy(result, c.label)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left hover:border-blue-400/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">{c.label}</span>
                    <span className="text-xs text-zinc-600 group-hover:text-blue-400 transition-colors">
                      {copied === c.label ? 'Copied!' : 'Click to copy'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 font-mono truncate">{result}</p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
