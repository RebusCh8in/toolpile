'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

function encodeEntities(input: string, useNamed: boolean): string {
  const named: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '\u00A0': '&nbsp;', '\u00A9': '&copy;', '\u00AE': '&reg;', '\u2122': '&trade;', '\u2013': '&ndash;', '\u2014': '&mdash;', '\u2018': '&lsquo;', '\u2019': '&rsquo;', '\u201C': '&ldquo;', '\u201D': '&rdquo;', '\u2026': '&hellip;' }
  return input.split('').map(c => {
    if (useNamed && named[c]) return named[c]
    const code = c.charCodeAt(0)
    if (code > 127) return `&#${code};`
    if ('<>&"\''.includes(c)) return useNamed ? named[c] : `&#${code};`
    return c
  }).join('')
}

function decodeEntities(input: string): string {
  const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null
  if (!textarea) return input
  textarea.innerHTML = input
  return textarea.value
}

const faqs: FAQ[] = [
  { question: "What are HTML entities?", answer: "HTML entities are special codes that represent characters that have meaning in HTML (like < and >) or characters that can't be typed easily. For example, &lt; represents < and &amp; represents &." },
  { question: "When should I use HTML entities?", answer: "Use them when displaying special characters in HTML that could be interpreted as code (< > & \" '), or for special symbols (©, ®, ™, em dashes, curly quotes)." },
]

const relatedTools: RelatedTool[] = [
  { name: "URL Encoder / Decoder", href: "/tools/url-encoder" },
  { name: "Base64 Encoder", href: "/tools/base64-encoder" },
  { name: "HTML Minifier", href: "/tools/html-minifier" },
]

export default function HtmlEntityEncoder() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [useNamed, setUseNamed] = useState(true)
  const [copied, setCopied] = useState(false)

  const output = mode === 'encode' ? encodeEntities(input, useNamed) : decodeEntities(input)

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <ToolLayout
      title="HTML Entity Encoder / Decoder"
      description="Encode and decode HTML entities online. Convert special characters to HTML entities and back. Free and instant."
      category="Developer"
      slug="html-entity-encoder"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["html entity encoder", "html entity decoder", "html entities", "encode html entities", "decode html entities", "html special characters", "html entity converter"]}
      guide={<><h2>HTML Entity Encoder / Decoder</h2><p>Convert special characters to HTML entities and back. Supports named entities (&amp;amp;) and numeric entities (&amp;#38;).</p></>}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>Encode</button>
          <button onClick={() => setMode('decode')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>Decode</button>
          {mode === 'encode' && (
            <label className="flex items-center gap-2 ml-auto cursor-pointer">
              <input type="checkbox" checked={useNamed} onChange={e => setUseNamed(e.target.checked)} className="accent-blue-500" />
              <span className="text-sm text-zinc-400">Named entities</span>
            </label>
          )}
        </div>

        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Input</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={mode === 'encode' ? 'Enter HTML or text with special characters...' : 'Enter text with HTML entities...'} className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none focus:border-blue-500 placeholder-zinc-600" spellCheck={false} />
        </div>

        {input && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-zinc-400">Output</label>
              <button onClick={copy} className="text-xs text-zinc-600 hover:text-blue-400 transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <textarea value={output} readOnly className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none" />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
