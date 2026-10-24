'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "What are meta tags?", answer: "Meta tags are HTML elements that provide metadata about your web page to search engines and social media platforms. They control how your page appears in Google search results, Facebook shares, Twitter cards, and more." },
  { question: "Do meta tags affect SEO?", answer: "Yes. The title tag and meta description directly affect click-through rates from search results. Open Graph and Twitter Card tags control how your content appears when shared on social media, which affects engagement." },
  { question: "What length should meta titles and descriptions be?", answer: "Keep titles under 60 characters and descriptions under 160 characters to avoid truncation in Google search results. For Open Graph, titles can be longer since social platforms display more text." },
]

const relatedTools: RelatedTool[] = [
  { name: "Robots.txt Generator", href: "/tools/robots-txt-generator" },
  { name: "Favicon Generator", href: "/tools/favicon-generator" },
  { name: "HTML Minifier", href: "/tools/html-minifier" },
]

export default function MetaTagGenerator() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [siteName, setSiteName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [author, setAuthor] = useState('')
  const [keywords, setKeywords] = useState('')
  const [twitterCard, setTwitterCard] = useState<'summary' | 'summary_large_image'>('summary_large_image')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [robots, setRobots] = useState('index, follow')
  const [copied, setCopied] = useState(false)

  const output = [
    `<meta charset="UTF-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    title && `<title>${title}</title>`,
    description && `<meta name="description" content="${description}">`,
    keywords && `<meta name="keywords" content="${keywords}">`,
    author && `<meta name="author" content="${author}">`,
    `<meta name="robots" content="${robots}">`,
    '',
    '<!-- Open Graph / Facebook -->',
    `<meta property="og:type" content="website">`,
    title && `<meta property="og:title" content="${title}">`,
    description && `<meta property="og:description" content="${description}">`,
    url && `<meta property="og:url" content="${url}">`,
    siteName && `<meta property="og:site_name" content="${siteName}">`,
    imageUrl && `<meta property="og:image" content="${imageUrl}">`,
    '',
    '<!-- Twitter -->',
    `<meta name="twitter:card" content="${twitterCard}">`,
    title && `<meta name="twitter:title" content="${title}">`,
    description && `<meta name="twitter:description" content="${description}">`,
    imageUrl && `<meta name="twitter:image" content="${imageUrl}">`,
    twitterHandle && `<meta name="twitter:site" content="${twitterHandle}">`,
    '',
    '<!-- Canonical -->',
    url && `<link rel="canonical" href="${url}">`,
  ].filter(Boolean).join('\n')

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout
      title="Meta Tag Generator"
      description="Generate HTML meta tags for SEO, Open Graph, and Twitter Cards. Preview how your page appears in Google, Facebook, and Twitter."
      category="Developer"
      slug="meta-tag-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["meta tag generator", "og tags", "twitter card", "seo meta tags", "open graph generator"]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input form */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Page Information</h3>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Page Title <span className="text-zinc-600">({title.length}/60)</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="My Awesome Page" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Meta Description <span className="text-zinc-600">({description.length}/160)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description of your page..." rows={3} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Page URL</label>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/page" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Site Name</label>
            <input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="My Website" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Social Image URL</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/og-image.jpg" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Author</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="John Doe" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Keywords</label>
              <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="seo, web, tools" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Twitter Card Type</label>
              <select value={twitterCard} onChange={e => setTwitterCard(e.target.value as 'summary' | 'summary_large_image')} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500">
                <option value="summary_large_image">Summary Large Image</option>
                <option value="summary">Summary</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Twitter Handle</label>
              <input value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} placeholder="@yourhandle" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Robots</label>
            <select value={robots} onChange={e => setRobots(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500">
              <option value="index, follow">index, follow (default)</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </div>
        </div>

        {/* Preview + Output */}
        <div className="space-y-4">
          {/* Google Preview */}
          <h3 className="text-sm font-medium text-zinc-400">Google Preview</h3>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-green-700 truncate">{url || 'https://example.com'}</div>
            <div className="text-xl text-blue-800 hover:underline cursor-pointer truncate">{title || 'Page Title'}</div>
            <div className="text-sm text-gray-600 line-clamp-2">{description || 'Add a meta description to see how it appears in search results.'}</div>
          </div>

          {/* Social Preview */}
          <h3 className="text-sm font-medium text-zinc-400">Social Media Preview</h3>
          <div className="border border-zinc-700 rounded-lg overflow-hidden">
            {imageUrl && (
              <div className="bg-zinc-800 h-40 flex items-center justify-center text-zinc-600 text-sm">
                Image preview
              </div>
            )}
            <div className="p-3 bg-zinc-800">
              <div className="text-xs text-zinc-500 uppercase">{siteName || 'example.com'}</div>
              <div className="text-sm font-semibold text-zinc-200 truncate">{title || 'Page Title'}</div>
              <div className="text-xs text-zinc-400 line-clamp-2">{description || 'Description'}</div>
            </div>
          </div>

          {/* Generated Code */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">Generated HTML</h3>
            <button onClick={copy} className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>
          <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-300 overflow-auto max-h-80 whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
