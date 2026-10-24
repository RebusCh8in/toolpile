'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

function minifyCss(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s*!important/g, '!important')
    .trim()
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  return (bytes / 1024).toFixed(1) + ' KB'
}

const faqs: FAQ[] = [
  { question: "What does CSS minification do?", answer: "It removes unnecessary whitespace, comments, line breaks, and redundant semicolons from CSS code. This reduces file size and improves page load speed." },
  { question: "Is my code uploaded to a server?", answer: "No. All minification happens entirely in your browser. Your code never leaves your device." },
  { question: "Will minification break my CSS?", answer: "No. The minifier only removes whitespace and comments. All selectors, properties, and values remain intact." },
]

const relatedTools: RelatedTool[] = [
  { name: "HTML Minifier", href: "/tools/html-minifier" },
  { name: "JS Minifier", href: "/tools/js-minifier" },
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
]

export default function CssMinifier() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleMinify = () => {
    setOutput(minifyCss(input))
  }

  const originalSize = new Blob([input]).size
  const minifiedSize = new Blob([output]).size
  const savings = originalSize > 0 && output ? Math.round((1 - minifiedSize / originalSize) * 100) : 0

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout
      title="CSS Minifier"
      description="Minify CSS code online for free. Remove whitespace and comments to reduce file size. No upload — runs in your browser."
      category="Developer"
      slug="css-minifier"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["css minifier", "minify css", "css minifier online", "compress css", "css compressor", "minify css online free"]}
      guide={
        <>
          <h2>CSS Minifier</h2>
          <p>Paste your CSS code, click Minify, and get a smaller version with whitespace and comments removed.</p>
          <h3>How to Use</h3>
          <ul>
            <li>Paste your CSS code in the input area.</li>
            <li>Click Minify to compress it.</li>
            <li>Copy the minified output.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Input CSS</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your CSS here..."
            className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none focus:border-blue-500 placeholder-zinc-600"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleMinify} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors">
            Minify
          </button>
          {output && (
            <>
              <button onClick={copy} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors">
                {copied ? 'Copied!' : 'Copy Output'}
              </button>
              <div className="flex gap-3 ml-auto text-sm">
                <span className="text-zinc-500">{formatBytes(originalSize)}</span>
                <span className="text-zinc-700">&rarr;</span>
                <span className="text-zinc-300">{formatBytes(minifiedSize)}</span>
                {savings > 0 && <span className="text-green-400">{savings}% smaller</span>}
              </div>
            </>
          )}
        </div>

        {output && (
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Minified Output</label>
            <textarea
              value={output}
              readOnly
              className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
