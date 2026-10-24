'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

function bionicize(text: string, fixation: number): string {
  return text.replace(/\b(\w+)\b/g, (word) => {
    if (word.length <= 1) return `<b>${word}</b>`
    const boldLen = Math.max(1, Math.ceil(word.length * (fixation / 100)))
    return `<b>${word.slice(0, boldLen)}</b>${word.slice(boldLen)}`
  })
}

const faqs: FAQ[] = [
  { question: "What is Bionic Reading?", answer: "Bionic Reading is a reading method that bolds the beginning of each word to guide the eye. The theory is that your brain fills in the rest of each word, allowing faster and more focused reading." },
  { question: "Does Bionic Reading actually work?", answer: "Research is mixed. Some people report faster reading and better focus, while studies have not consistently shown measurable speed improvements. It may help people with ADHD or reading difficulties maintain focus. Try it yourself to see if it helps you." },
  { question: "Can I adjust the fixation strength?", answer: "Yes. Use the fixation slider to control how much of each word is bolded. Higher fixation means more of each word is emphasized. Most people find 40-50% works well." },
]

const relatedTools: RelatedTool[] = [
  { name: "Word Counter", href: "/tools/word-counter" },
  { name: "Text Case Converter", href: "/tools/text-case-converter" },
  { name: "Markdown Preview", href: "/tools/markdown-preview" },
]

export default function BionicReading() {
  const [input, setInput] = useState('')
  const [fixation, setFixation] = useState(45)
  const [copied, setCopied] = useState(false)

  const html = bionicize(input, fixation)

  const copyPlain = () => {
    // Copy with bold markers for pasting into rich text
    const el = document.createElement('div')
    el.innerHTML = html.replace(/\n/g, '<br>')
    document.body.appendChild(el)
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)
    document.execCommand('copy')
    sel.removeAllRanges()
    document.body.removeChild(el)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ToolLayout
      title="Bionic Reading Converter"
      description="Convert text to Bionic Reading format. Bold the beginning of each word to guide your eyes for faster, more focused reading."
      category="Text"
      slug="bionic-reading"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["bionic reading", "bionic text", "speed reading", "reading aid", "bold text converter"]}
    >
      <div className="space-y-6">
        {/* Fixation slider */}
        <div>
          <label className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>Fixation Strength</span>
            <span>{fixation}%</span>
          </label>
          <input type="range" min={20} max={80} value={fixation} onChange={e => setFixation(+e.target.value)} className="w-full accent-blue-500" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Paste your text</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste any text here to convert it to Bionic Reading format..."
              rows={12}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-zinc-500">Bionic Reading Output</label>
              {input && (
                <button onClick={copyPlain} className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                  {copied ? 'Copied!' : 'Copy (Rich Text)'}
                </button>
              )}
            </div>
            <div
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 min-h-[280px] leading-relaxed whitespace-pre-wrap [&_b]:text-zinc-100 [&_b]:font-bold"
              dangerouslySetInnerHTML={{ __html: html.replace(/\n/g, '<br>') || '<span class="text-zinc-600">Your converted text will appear here...</span>' }}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
