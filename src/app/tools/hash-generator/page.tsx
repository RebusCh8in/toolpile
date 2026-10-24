'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const
type Algorithm = typeof ALGORITHMS[number]

async function computeHash(text: string, algo: Algorithm): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algo, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const faqs: FAQ[] = [
  { question: "What hash algorithms are supported?", answer: "SHA-1, SHA-256, SHA-384, and SHA-512. These are computed using the browser's native Web Crypto API, which is fast and secure." },
  { question: "Is my data uploaded to a server?", answer: "No. All hashing happens entirely in your browser using the Web Crypto API. Your data never leaves your device." },
  { question: "What about MD5?", answer: "MD5 is not available in the Web Crypto API because it's considered insecure. For most use cases, SHA-256 is the recommended replacement." },
]

const relatedTools: RelatedTool[] = [
  { name: "Base64 Encoder", href: "/tools/base64-encoder" },
  { name: "Password Generator", href: "/tools/password-generator" },
  { name: "UUID Generator", href: "/tools/uuid-generator" },
]

export default function HashGenerator() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const generate = async () => {
    const results: Record<string, string> = {}
    for (const algo of ALGORITHMS) {
      results[algo] = await computeHash(input, algo)
    }
    setHashes(results)
  }

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly. Uses native Web Crypto API. Free and private."
      category="Developer"
      slug="hash-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["hash generator", "sha256 generator", "sha1 hash", "sha512 hash", "hash generator online", "sha256 online", "text to hash", "hash calculator"]}
      guide={
        <>
          <h2>Hash Generator</h2>
          <p>Generate cryptographic hashes from any text using the browser's native Web Crypto API. Supports SHA-1, SHA-256, SHA-384, and SHA-512.</p>
        </>
      }
    >
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none focus:border-blue-500 placeholder-zinc-600"
          spellCheck={false}
        />

        <button onClick={generate} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors">
          Generate Hashes
        </button>

        {Object.keys(hashes).length > 0 && (
          <div className="space-y-3">
            {ALGORITHMS.map(algo => (
              <div key={algo} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{algo}</span>
                  <button
                    onClick={() => copy(hashes[algo], algo)}
                    className="text-xs text-zinc-600 hover:text-blue-400 transition-colors"
                  >
                    {copied === algo ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-zinc-300 font-mono break-all">{hashes[algo]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
