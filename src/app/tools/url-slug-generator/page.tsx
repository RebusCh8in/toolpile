'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

function slugify(text: string, separator: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric
    .replace(/[\s-]+/g, separator) // collapse whitespace + hyphens
    .replace(new RegExp(`^${escapeRegex(separator)}+|${escapeRegex(separator)}+$`, 'g'), '') // trim separators
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const faqs: FAQ[] = [
  { question: "What is a URL slug?", answer: "A URL slug is the part of a web address that identifies a specific page in human-readable form. For example, in 'example.com/blog/my-first-post', the slug is 'my-first-post'. Good slugs improve SEO and user experience." },
  { question: "How does slugification work?", answer: "The tool converts text to lowercase, removes diacritics (é→e, ñ→n), strips special characters, and replaces spaces with hyphens or your chosen separator. This creates clean, URL-safe strings." },
  { question: "Does the slug affect SEO?", answer: "Yes. Google uses URL slugs as a ranking signal. Short, descriptive slugs with relevant keywords perform better than long or auto-generated slugs. Keep slugs under 3-5 words for best results." },
]

const relatedTools: RelatedTool[] = [
  { name: "Text Case Converter", href: "/tools/text-case-converter" },
  { name: "URL Encoder", href: "/tools/url-encoder" },
  { name: "Meta Tag Generator", href: "/tools/meta-tag-generator" },
]

export default function UrlSlugGenerator() {
  const [input, setInput] = useState('')
  const [separator, setSeparator] = useState('-')
  const [copied, setCopied] = useState(false)

  const slug = slugify(input, separator)

  const copy = () => {
    navigator.clipboard.writeText(slug)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Bulk mode
  const lines = input.split('\n').filter(l => l.trim())
  const bulkSlugs = lines.map(l => slugify(l, separator))
  const isBulk = lines.length > 1

  return (
    <ToolLayout
      title="URL Slug Generator"
      description="Convert text to URL-friendly slugs. Handles accented characters, special characters, and bulk conversion. Free SEO tool."
      category="Developer"
      slug="url-slug-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["url slug generator", "slugify", "url friendly", "seo slug", "permalink generator"]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Separator */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">Separator:</span>
          {['-', '_', '.'].map(s => (
            <button
              key={s}
              onClick={() => setSeparator(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ${separator === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {s === '-' ? 'hyphen (-)' : s === '_' ? 'underscore (_)' : 'dot (.)'}
            </button>
          ))}
        </div>

        {/* Input */}
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Text (one per line for bulk)</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="How to Optimize Images for Shopify: A Complete Guide"
            rows={4}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-zinc-500">{isBulk ? `Slugs (${bulkSlugs.length})` : 'Slug'}</label>
            <button onClick={copy} className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          {isBulk ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-1">
              {bulkSlugs.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-600 text-xs w-6 text-right">{i + 1}.</span>
                  <code className="text-blue-300 font-mono">{s}</code>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
              <code className="text-blue-300 font-mono text-sm">{slug || '...'}</code>
            </div>
          )}
        </div>

        {/* Live URL preview */}
        {slug && !isBulk && (
          <div className="text-sm text-zinc-500">
            <span className="text-zinc-600">example.com/blog/</span>
            <span className="text-blue-400">{slug}</span>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
