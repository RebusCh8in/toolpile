'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

function decodeJwt(token: string): { header: string; payload: string; signature: string; error?: string; expired?: boolean } {
  try {
    const parts = token.trim().split('.')
    if (parts.length !== 3) return { header: '', payload: '', signature: '', error: 'Invalid JWT: must have 3 parts separated by dots.' }

    const decodeBase64 = (s: string) => {
      const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - s.length % 4) % 4)
      return JSON.parse(atob(padded))
    }

    const header = decodeBase64(parts[0])
    const payload = decodeBase64(parts[1])

    let expired = false
    if (payload.exp) {
      expired = payload.exp * 1000 < Date.now()
    }

    return {
      header: JSON.stringify(header, null, 2),
      payload: JSON.stringify(payload, null, 2),
      signature: parts[2],
      expired,
    }
  } catch {
    return { header: '', payload: '', signature: '', error: 'Failed to decode JWT. Check the format.' }
  }
}

const faqs: FAQ[] = [
  { question: "What is a JWT?", answer: "A JSON Web Token (JWT) is a compact, URL-safe means of representing claims between two parties. It consists of three parts: header, payload, and signature, separated by dots." },
  { question: "Does this tool verify the signature?", answer: "No. This tool only decodes and displays the JWT contents. Signature verification requires the secret key or public key, which should never be entered in a web tool." },
  { question: "Is my token uploaded to a server?", answer: "No. All decoding happens in your browser. Your JWT never leaves your device." },
]

const relatedTools: RelatedTool[] = [
  { name: "Base64 Encoder", href: "/tools/base64-encoder" },
  { name: "JSON Formatter", href: "/tools/json-formatter" },
  { name: "Hash Generator", href: "/tools/hash-generator" },
]

export default function JwtDecoder() {
  const [input, setInput] = useState('')

  const result = input.trim() ? decodeJwt(input) : null

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode JSON Web Tokens instantly. View header, payload, and expiration status. Free, no upload — runs in your browser."
      category="Developer"
      slug="jwt-decoder"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["jwt decoder", "jwt decode", "jwt token decoder", "decode jwt online", "jwt parser", "json web token decoder", "jwt debugger", "jwt viewer"]}
      guide={
        <>
          <h2>JWT Decoder</h2>
          <p>Paste a JSON Web Token to decode and inspect its header, payload, and expiration status. No signature verification — your secret stays safe.</p>
        </>
      }
    >
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste your JWT here (eyJhbG...)"
          className="w-full h-28 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none focus:border-blue-500 placeholder-zinc-600"
          spellCheck={false}
        />

        {result?.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">{result.error}</p>
          </div>
        )}

        {result && !result.error && (
          <div className="space-y-4">
            {result.expired !== undefined && (
              <div className={`rounded-xl p-3 text-sm font-medium ${result.expired ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {result.expired ? 'Token is expired' : 'Token is not expired'}
              </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Header</p>
              <pre className="bg-zinc-950 rounded-lg p-4 text-sm text-blue-400 font-mono overflow-x-auto">{result.header}</pre>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Payload</p>
              <pre className="bg-zinc-950 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto">{result.payload}</pre>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Signature</p>
              <p className="text-sm text-zinc-400 font-mono break-all bg-zinc-950 rounded-lg p-4">{result.signature}</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
