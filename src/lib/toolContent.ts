import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Editable content for a tool page lives in content/tools/<slug>.md as YAML
// frontmatter + a markdown body (the guide). This keeps SEO/marketing copy
// fully separate from the tool's interactive code, so content can be bulk-
// edited (by hand or an automated workflow) with zero risk to tool logic.

export interface ToolFAQ {
  question: string
  answer: string
}

export interface ToolRelated {
  name: string
  href: string
}

export interface ToolContent {
  title: string
  seoTitle: string // the <title> tag — distinct per tool; falls back to title
  description: string
  category: string
  keywords: string[]
  faqs: ToolFAQ[]
  relatedTools: ToolRelated[]
  body: string // markdown guide
}

export function getToolContent(slug: string): ToolContent {
  const file = path.join(process.cwd(), 'content', 'tools', `${slug}.md`)
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  return {
    title: data.title ?? '',
    seoTitle: data.seoTitle ?? data.title ?? '',
    description: data.description ?? '',
    category: data.category ?? 'Tools',
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    faqs: Array.isArray(data.faqs) ? data.faqs : [],
    relatedTools: Array.isArray(data.relatedTools) ? data.relatedTools : [],
    body: content.trim(),
  }
}
