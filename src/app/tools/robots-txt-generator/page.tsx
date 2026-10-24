'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

interface Rule {
  id: number
  userAgent: string
  disallow: string[]
  allow: string[]
  crawlDelay: string
}

let nextId = 1

const COMMON_BOTS = ['*', 'Googlebot', 'Bingbot', 'GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Applebot', 'Twitterbot', 'facebookexternalhit']

const PRESETS: Record<string, () => Rule[]> = {
  'Allow All': () => [{ id: nextId++, userAgent: '*', disallow: [], allow: ['/'], crawlDelay: '' }],
  'Block All': () => [{ id: nextId++, userAgent: '*', disallow: ['/'], allow: [], crawlDelay: '' }],
  'Block AI Bots': () => [
    { id: nextId++, userAgent: 'GPTBot', disallow: ['/'], allow: [], crawlDelay: '' },
    { id: nextId++, userAgent: 'ChatGPT-User', disallow: ['/'], allow: [], crawlDelay: '' },
    { id: nextId++, userAgent: 'ClaudeBot', disallow: ['/'], allow: [], crawlDelay: '' },
    { id: nextId++, userAgent: 'PerplexityBot', disallow: ['/'], allow: [], crawlDelay: '' },
    { id: nextId++, userAgent: '*', disallow: [], allow: ['/'], crawlDelay: '' },
  ],
  'Standard WordPress': () => [{ id: nextId++, userAgent: '*', disallow: ['/wp-admin/', '/wp-includes/', '/wp-content/plugins/'], allow: ['/wp-admin/admin-ajax.php'], crawlDelay: '' }],
}

const faqs: FAQ[] = [
  { question: "What is robots.txt?", answer: "robots.txt is a text file placed in your website's root directory that tells search engine crawlers which pages they can and cannot access. It follows the Robots Exclusion Protocol standard." },
  { question: "Does robots.txt block pages from appearing in Google?", answer: "No. robots.txt prevents crawling, not indexing. Google can still index a URL if it finds links to it, even without crawling the content. To prevent indexing, use a noindex meta tag instead." },
  { question: "Should I block AI bots with robots.txt?", answer: "It depends. If you don't want your content used for AI training, you can block bots like GPTBot, ClaudeBot, and PerplexityBot. However, blocking them also prevents your content from appearing in AI-powered search answers." },
]

const relatedTools: RelatedTool[] = [
  { name: "Meta Tag Generator", href: "/tools/meta-tag-generator" },
  { name: "HTML Minifier", href: "/tools/html-minifier" },
  { name: "URL Encoder", href: "/tools/url-encoder" },
]

export default function RobotsTxtGenerator() {
  const [rules, setRules] = useState<Rule[]>([{ id: nextId++, userAgent: '*', disallow: [], allow: ['/'], crawlDelay: '' }])
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [hostUrl, setHostUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [newPath, setNewPath] = useState<Record<number, string>>({})

  const addRule = () => {
    setRules([...rules, { id: nextId++, userAgent: '*', disallow: [], allow: [], crawlDelay: '' }])
  }

  const removeRule = (id: number) => {
    if (rules.length > 1) setRules(rules.filter(r => r.id !== id))
  }

  const updateRule = (id: number, update: Partial<Rule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...update } : r))
  }

  const addPath = (id: number, type: 'disallow' | 'allow') => {
    const path = newPath[id]?.trim()
    if (!path) return
    setRules(rules.map(r => r.id === id ? { ...r, [type]: [...r[type], path] } : r))
    setNewPath({ ...newPath, [id]: '' })
  }

  const removePath = (ruleId: number, type: 'disallow' | 'allow', idx: number) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, [type]: r[type].filter((_, i) => i !== idx) } : r))
  }

  const output = [
    ...rules.map(r => [
      `User-agent: ${r.userAgent}`,
      ...r.disallow.map(d => `Disallow: ${d}`),
      ...r.allow.map(a => `Allow: ${a}`),
      ...(r.crawlDelay ? [`Crawl-delay: ${r.crawlDelay}`] : []),
      '',
    ].join('\n')),
    ...(sitemapUrl ? [`Sitemap: ${sitemapUrl}`] : []),
    ...(hostUrl ? [`Host: ${hostUrl}`] : []),
  ].join('\n').trim()

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const applyPreset = (name: string) => {
    setRules(PRESETS[name]())
  }

  return (
    <ToolLayout
      title="Robots.txt Generator"
      description="Generate a robots.txt file for your website. Control search engine and AI bot access with an easy visual builder."
      category="Developer"
      slug="robots-txt-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["robots.txt generator", "robots txt", "block crawlers", "seo robots", "block ai bots"]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Builder */}
        <div className="space-y-4">
          {/* Presets */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Quick Presets</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map(name => (
                <button key={name} onClick={() => applyPreset(name)} className="px-3 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Rules */}
          {rules.map(rule => (
            <div key={rule.id} className="border border-zinc-700 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500 shrink-0">User-Agent:</label>
                <select
                  value={COMMON_BOTS.includes(rule.userAgent) ? rule.userAgent : '__custom__'}
                  onChange={e => {
                    if (e.target.value === '__custom__') return
                    updateRule(rule.id, { userAgent: e.target.value })
                  }}
                  className="flex-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-blue-500"
                >
                  {COMMON_BOTS.map(bot => <option key={bot} value={bot}>{bot}</option>)}
                  <option value="__custom__">Custom...</option>
                </select>
                {rules.length > 1 && (
                  <button onClick={() => removeRule(rule.id)} className="text-zinc-600 hover:text-red-400 text-sm">✕</button>
                )}
              </div>

              {/* Disallow paths */}
              <div>
                <span className="text-xs text-red-400">Disallow:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {rule.disallow.map((d, i) => (
                    <span key={i} className="bg-red-900/30 text-red-300 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                      {d} <button onClick={() => removePath(rule.id, 'disallow', i)} className="hover:text-white">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Allow paths */}
              <div>
                <span className="text-xs text-green-400">Allow:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {rule.allow.map((a, i) => (
                    <span key={i} className="bg-green-900/30 text-green-300 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                      {a} <button onClick={() => removePath(rule.id, 'allow', i)} className="hover:text-white">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Add path */}
              <div className="flex gap-2">
                <input
                  value={newPath[rule.id] || ''}
                  onChange={e => setNewPath({ ...newPath, [rule.id]: e.target.value })}
                  placeholder="/path/"
                  className="flex-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-blue-500"
                  onKeyDown={e => e.key === 'Enter' && addPath(rule.id, 'disallow')}
                />
                <button onClick={() => addPath(rule.id, 'disallow')} className="text-xs px-2 py-1 rounded bg-red-600/20 text-red-300 hover:bg-red-600/30">+ Disallow</button>
                <button onClick={() => addPath(rule.id, 'allow')} className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-300 hover:bg-green-600/30">+ Allow</button>
              </div>

              {/* Crawl delay */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500">Crawl-delay:</label>
                <input
                  value={rule.crawlDelay}
                  onChange={e => updateRule(rule.id, { crawlDelay: e.target.value })}
                  placeholder="(seconds)"
                  type="number"
                  min="0"
                  className="w-24 rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}

          <button onClick={addRule} className="w-full py-2 rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-500 hover:border-blue-500/50 hover:text-zinc-300 transition-colors">
            + Add Rule
          </button>

          {/* Sitemap + Host */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Sitemap URL</label>
              <input value={sitemapUrl} onChange={e => setSitemapUrl(e.target.value)} placeholder="https://example.com/sitemap.xml" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Host (optional)</label>
              <input value={hostUrl} onChange={e => setHostUrl(e.target.value)} placeholder="https://example.com" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">Generated robots.txt</h3>
            <button onClick={copy} className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap min-h-[300px]">{output}</pre>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-xs text-zinc-500 space-y-1">
            <p><strong className="text-zinc-400">How to use:</strong> Save this as <code className="bg-zinc-700 px-1 rounded">robots.txt</code> in your website&apos;s root directory (e.g., <code className="bg-zinc-700 px-1 rounded">https://example.com/robots.txt</code>).</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
