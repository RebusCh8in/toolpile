'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "What does the Claude Code Text Formatter do?", answer: "It cleans up raw text copied from a terminal or from Claude Code's output. It strips ANSI color/escape codes, removes line-number gutters (like the '123→' prefixes from file reads), deletes invisible control and zero-width characters, optionally removes box-drawing characters from tables, normalizes line endings, and trims trailing whitespace. The result is clean, plain text you can paste anywhere." },
  { question: "Is my text uploaded to a server?", answer: "No. Everything runs entirely in your browser using JavaScript. Your text never leaves your device, nothing is stored, and no network request is made. It works offline once the page has loaded." },
  { question: "What are ANSI escape codes?", answer: "ANSI escape codes are invisible sequences (starting with the ESC character, often shown as \\x1b or ^[) that terminals use to add color, bold text, and cursor movement. When you copy colored terminal output into a plain document, these codes can come along as garbage like '[0;32m'. This tool removes them." },
  { question: "Why does text copied from Claude Code have numbers at the start of each line?", answer: "When Claude Code reads a file, it shows line numbers in a 'cat -n' style — a number followed by a tab or an arrow (→) before each line of content. Those gutters are great for reading but break the code if you paste it back into an editor. The 'Remove line-number gutters' option strips them so you get the original content back." },
  { question: "Will it remove indentation from my code?", answer: "No. It only removes leading line-number gutters and trailing whitespace at the end of lines. Meaningful leading indentation (spaces and tabs that are part of your code) is preserved, so formatting stays intact." },
  { question: "What does 'Strip box-drawing characters' do?", answer: "Terminal tables and tree views use characters like ─, │, ┌, and └ to draw borders. If you only want the text content from a table, enabling this option removes those drawing characters. It is off by default because sometimes you want to keep the table layout." },
]

const relatedTools: RelatedTool[] = [
  { name: "Word Counter", href: "/tools/word-counter" },
  { name: "Diff Checker", href: "/tools/diff-checker" },
  { name: "Text Case Converter", href: "/tools/text-case-converter" },
  { name: "JSON Formatter", href: "/tools/json-formatter" },
  { name: "Markdown Preview", href: "/tools/markdown-preview" },
]

interface Options {
  stripAnsi: boolean
  removeGutters: boolean
  stripControl: boolean
  stripBox: boolean
  trimTrailing: boolean
  collapseBlank: boolean
}

const defaultOptions: Options = {
  stripAnsi: true,
  removeGutters: true,
  stripControl: true,
  stripBox: false,
  trimTrailing: true,
  collapseBlank: false,
}

function formatText(text: string, opts: Options): string {
  // Normalize line endings (handles Windows CRLF and stray carriage returns)
  let out = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  if (opts.stripAnsi) {
    // CSI sequences (colors, cursor moves) and simple escape sequences
    out = out.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -\/]*[@-~])/g, '')
  }

  if (opts.stripControl) {
    // Non-printing control chars (keep \t and \n), plus zero-width characters
    out = out.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    out = out.replace(/[\u200B-\u200D\uFEFF]/g, '')
  }

  if (opts.removeGutters) {
    out = out
      .split('\n')
      .map((line) =>
        line
          .replace(/^\s*\d+→/, '')       // "  123→content"  (Claude Code read format)
          .replace(/^\s*\d+\t/, '')            // "  123\tcontent" (cat -n style)
          .replace(/^\s*\d+\s*\|\s?/, '')      // "123 | content"  (pipe gutters)
      )
      .join('\n')
  }

  if (opts.stripBox) {
    // Box-drawing + block element characters used for terminal tables/trees
    out = out.replace(/[\u2500-\u257F\u2580-\u259F]/g, '')
  }

  if (opts.trimTrailing) {
    out = out.replace(/[ \t]+$/gm, '')
  }

  if (opts.collapseBlank) {
    out = out.replace(/\n{3,}/g, '\n\n')
  }

  return out
}

const toggleLabels: { key: keyof Options; label: string; hint: string }[] = [
  { key: 'stripAnsi', label: 'Strip ANSI codes', hint: 'Remove color & escape sequences' },
  { key: 'removeGutters', label: 'Remove line numbers', hint: 'Strip "123→" / "123|" gutters' },
  { key: 'stripControl', label: 'Remove control chars', hint: 'Invisible & zero-width characters' },
  { key: 'trimTrailing', label: 'Trim trailing space', hint: 'Whitespace at end of lines' },
  { key: 'collapseBlank', label: 'Collapse blank lines', hint: 'Max one empty line in a row' },
  { key: 'stripBox', label: 'Strip box characters', hint: 'Table borders like ─ │ ┌ └' },
]

export default function ClaudeCodeTextFormatter() {
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<Options>(defaultOptions)
  const [copied, setCopied] = useState(false)

  const output = formatText(input, options)

  const toggle = (key: keyof Options) =>
    setOptions((o) => ({ ...o, [key]: !o[key] }))

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const charsRemoved = Math.max(0, input.length - output.length)
  const lineCount = input ? output.split('\n').length : 0

  return (
    <ToolLayout
      title="Claude Code Text Formatter"
      description="Paste messy text from your terminal or Claude Code and get clean, plain output. Strips ANSI color codes, line-number gutters, and invisible control characters. Runs 100% in your browser."
      category="Developer"
      slug="claude-code-text-formatter"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["claude code text formatter", "terminal output cleaner", "strip ansi codes", "remove ansi escape codes", "clean terminal output", "remove line numbers from text", "format terminal text", "cli output formatter"]}
      guide={
        <>
          <h2>Clean up terminal and Claude Code output</h2>
          <p>
            Copying text out of a terminal often brings along invisible junk — ANSI color codes,
            cursor-control characters, and line-number gutters that break the moment you paste them
            into a document, a ticket, or an AI prompt. This tool removes all of it and gives you
            clean plain text. Paste your text below, pick what to clean, and copy the result.
          </p>
        </>
      }
    >
      <div className="space-y-4">
        {/* Options */}
        <div className="flex flex-wrap gap-2">
          {toggleLabels.map(({ key, label, hint }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              title={hint}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                options[key]
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Paste your terminal / Claude Code text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw output here…"
            className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none focus:border-blue-500 placeholder-zinc-600"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        {input && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-zinc-400">
                Cleaned output{' '}
                <span className="text-zinc-600">
                  · {lineCount} line{lineCount === 1 ? '' : 's'}
                  {charsRemoved > 0 && ` · ${charsRemoved} char${charsRemoved === 1 ? '' : 's'} removed`}
                </span>
              </label>
              <button onClick={copy} className="text-xs text-zinc-600 hover:text-blue-400 transition-colors">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none"
            />
          </div>
        )}

        {!input && (
          <p className="text-xs text-zinc-600">
            Everything runs in your browser — your text is never uploaded or stored.
          </p>
        )}
      </div>
    </ToolLayout>
  )
}
