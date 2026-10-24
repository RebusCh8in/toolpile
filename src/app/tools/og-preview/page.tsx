'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "What are Open Graph tags?", answer: "Open Graph (OG) tags are HTML meta tags that control how your page appears when shared on Facebook, Twitter, LinkedIn, Slack, Discord, and other platforms. They define the title, description, and image shown in link previews." },
  { question: "What image size should I use for OG images?", answer: "The recommended size is 1200×630 pixels. This works well across Facebook, Twitter (summary_large_image), LinkedIn, and Slack. Keep file size under 5MB. Use JPG or PNG format." },
  { question: "Why doesn't my link preview update?", answer: "Social platforms cache link previews. After updating your OG tags, use Facebook's Sharing Debugger, Twitter's Card Validator, or LinkedIn's Post Inspector to force a refresh of the cached preview." },
]

const relatedTools: RelatedTool[] = [
  { name: "Meta Tag Generator", href: "/tools/meta-tag-generator" },
  { name: "Favicon Generator", href: "/tools/favicon-generator" },
  { name: "Image Resizer", href: "/tools/image-resizer" },
]

export default function OgPreview() {
  const [title, setTitle] = useState('My Awesome Page — ToolPile')
  const [description, setDescription] = useState('A free online tool that helps you get things done faster. No signup required.')
  const [url, setUrl] = useState('https://toolpile.app')
  const [siteName, setSiteName] = useState('ToolPile')
  const [imageUrl, setImageUrl] = useState('')

  return (
    <ToolLayout
      title="Open Graph Preview"
      description="Preview how your page looks when shared on Google, Facebook, Twitter, LinkedIn, Slack, and Discord. Check OG tags before publishing."
      category="Developer"
      slug="og-preview"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["open graph preview", "og tags preview", "social card preview", "link preview checker", "twitter card preview"]}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400">Enter Your OG Tags</h3>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">og:title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">og:description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">og:url</label>
            <input value={url} onChange={e => setUrl(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">og:site_name</label>
            <input value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">og:image (URL)</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/og-image.jpg" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* Previews */}
        <div className="space-y-6">
          {/* Google */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Google</h3>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-green-700 truncate">{url || 'https://example.com'}</div>
              <div className="text-xl text-blue-800 hover:underline cursor-pointer leading-snug">{title || 'Page Title'}</div>
              <div className="text-sm text-gray-600 line-clamp-2 mt-1">{description || 'Page description'}</div>
            </div>
          </div>

          {/* Facebook */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Facebook</h3>
            <div className="border border-zinc-700 rounded-lg overflow-hidden">
              <div className="bg-zinc-700 h-[170px] flex items-center justify-center text-zinc-500 text-sm">
                {imageUrl ? '🖼 Image preview' : 'No og:image set'}
              </div>
              <div className="bg-[#f0f2f5] px-3 py-2">
                <div className="text-[11px] text-[#65676b] uppercase">{new URL(url || 'https://example.com').hostname}</div>
                <div className="text-[15px] font-semibold text-[#1c1e21] leading-tight truncate">{title || 'Page Title'}</div>
                <div className="text-[13px] text-[#65676b] line-clamp-1">{description || 'Description'}</div>
              </div>
            </div>
          </div>

          {/* Twitter */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Twitter / X</h3>
            <div className="border border-zinc-700 rounded-2xl overflow-hidden">
              <div className="bg-zinc-800 h-[150px] flex items-center justify-center text-zinc-500 text-sm">
                {imageUrl ? '🖼 Image preview' : 'No og:image set'}
              </div>
              <div className="bg-zinc-900 px-3 py-2">
                <div className="text-[13px] text-zinc-500">{new URL(url || 'https://example.com').hostname}</div>
                <div className="text-[15px] text-zinc-100 truncate">{title || 'Page Title'}</div>
                <div className="text-[13px] text-zinc-500 line-clamp-2">{description || 'Description'}</div>
              </div>
            </div>
          </div>

          {/* Slack */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Slack</h3>
            <div className="border-l-4 border-zinc-500 pl-3 py-1">
              <div className="text-xs text-zinc-500 font-medium">{siteName || 'Site Name'}</div>
              <div className="text-sm text-blue-400 font-medium">{title || 'Page Title'}</div>
              <div className="text-sm text-zinc-400 line-clamp-2">{description || 'Description'}</div>
            </div>
          </div>

          {/* Discord */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Discord</h3>
            <div className="bg-[#2f3136] border-l-4 border-blue-500 rounded-r-lg p-3 max-w-sm">
              <div className="text-xs text-zinc-400">{siteName || 'Site Name'}</div>
              <div className="text-sm text-blue-400 font-medium mt-0.5">{title || 'Page Title'}</div>
              <div className="text-xs text-zinc-300 mt-1 line-clamp-3">{description || 'Description'}</div>
              {imageUrl && <div className="mt-2 bg-zinc-700 h-20 rounded text-zinc-500 text-xs flex items-center justify-center">Image preview</div>}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
