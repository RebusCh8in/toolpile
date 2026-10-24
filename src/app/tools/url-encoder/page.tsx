'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "What is URL encoding?", answer: "URL encoding replaces unsafe characters with a '%' followed by their hex value. For example, a space becomes %20. This ensures URLs are transmitted correctly across the internet." },
  { question: "What's the difference between encodeURI and encodeURIComponent?", answer: "encodeURI encodes a full URL but preserves characters like :, /, ?, #, and &. encodeURIComponent encodes everything, making it suitable for query parameter values." },
]

const relatedTools: RelatedTool[] = [
  { name: "Base64 Encoder", href: "/tools/base64-encoder" },
  { name: "Hash Generator", href: "/tools/hash-generator" },
  { name: "JSON Formatter", href: "/tools/json-formatter" },
]

export default function UrlEncoder() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [componentMode, setComponentMode] = useState(true)
  const [copied, setCopied] = useState(false)

  let output = ''
  try {
    if (mode === 'encode') {
      output = componentMode ? encodeURIComponent(input) : encodeURI(input)
    } else {
      output = componentMode ? decodeURIComponent(input) : decodeURI(input)
    }
  } catch {
    output = 'Invalid input'
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout
      title="URL Encoder / Decoder"
      description="Encode and decode URLs online for free. Supports both encodeURI and encodeURIComponent modes. No upload — runs in your browser."
      category="Developer"
      slug="url-encoder"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["url encoder", "url decoder", "url encode online", "url decode online", "encode url", "decode url", "percent encoding", "url encoding tool"]}
      guide={
        <>
          <h2>URL Encoder / Decoder</h2>
          <p>Encode or decode URLs and query parameters. Supports both full URL encoding and component encoding.</p>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
          >
            Decode
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setComponentMode(true)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${componentMode ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800 text-zinc-500'}`}
            >
              Component
            </button>
            <button
              onClick={() => setComponentMode(false)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${!componentMode ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800 text-zinc-500'}`}
            >
              Full URI
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Input</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text or URL to encode...' : 'Enter encoded URL to decode...'}
            className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none focus:border-blue-500 placeholder-zinc-600"
            spellCheck={false}
          />
        </div>

        {input && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-zinc-400">Output</label>
              <button onClick={copy} className="text-xs text-zinc-600 hover:text-blue-400 transition-colors">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
