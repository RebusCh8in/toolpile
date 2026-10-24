'use client'

import { useState, useMemo } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  {
    question: "How does the diff checker work?",
    answer: "The tool compares two blocks of text line by line and highlights the differences. Green lines are additions (only in the right text), red lines are removals (only in the left text), and white lines are unchanged."
  },
  {
    question: "Can I compare code with this tool?",
    answer: "Yes. The diff checker works with any text including code, JSON, CSV, markdown, configuration files, and more. It preserves whitespace and formatting exactly."
  },
  {
    question: "Is my text uploaded to a server?",
    answer: "No. All comparison happens entirely in your browser. Your text never leaves your device."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "JSON Formatter", href: "/tools/json-formatter" },
  { name: "Word Counter", href: "/tools/word-counter" },
  { name: "Markdown Preview", href: "/tools/markdown-preview" },
]

interface DiffLine {
  type: 'equal' | 'add' | 'remove'
  leftNum?: number
  rightNum?: number
  text: string
}

function computeDiff(a: string, b: string): DiffLine[] {
  const linesA = a.split('\n')
  const linesB = b.split('\n')
  const m = linesA.length
  const n = linesB.length

  // LCS DP
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack
  const result: DiffLine[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      result.unshift({ type: 'equal', leftNum: i, rightNum: j, text: linesA[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'add', rightNum: j, text: linesB[j - 1] })
      j--
    } else {
      result.unshift({ type: 'remove', leftNum: i, text: linesA[i - 1] })
      i--
    }
  }

  return result
}

export default function DiffChecker() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')

  const diff = useMemo(() => {
    if (!left && !right) return []
    return computeDiff(left, right)
  }, [left, right])

  const stats = useMemo(() => {
    const adds = diff.filter(d => d.type === 'add').length
    const removes = diff.filter(d => d.type === 'remove').length
    const equal = diff.filter(d => d.type === 'equal').length
    return { adds, removes, equal }
  }, [diff])

  const swap = () => {
    setLeft(right)
    setRight(left)
  }

  const clear = () => {
    setLeft('')
    setRight('')
  }

  return (
    <ToolLayout
      title="Diff Checker"
      description="Compare two blocks of text and see the differences highlighted. Free online diff tool — no upload, runs in your browser."
      category="Developer"
      slug="diff-checker"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "diff checker",
        "text compare",
        "diff tool online",
        "compare two texts",
        "text diff",
        "code diff",
        "online diff checker",
        "compare text online",
        "file comparison tool",
        "diff checker online free",
      ]}
      guide={
        <>
          <h2>Online Diff Checker</h2>
          <p>
            Compare two blocks of text side by side and instantly see what changed. Works with code, JSON, config files, or any text. Everything runs in your browser.
          </p>
          <h3>How to Use</h3>
          <ul>
            <li>Paste your original text on the left and the modified text on the right.</li>
            <li>Differences are highlighted instantly: red for removed lines, green for added lines.</li>
            <li>Use the Swap button to reverse the comparison.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-4">
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Original</label>
            <textarea
              value={left}
              onChange={e => setLeft(e.target.value)}
              placeholder="Paste original text here..."
              className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none focus:border-blue-500 placeholder-zinc-600"
              spellCheck={false}
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Modified</label>
            <textarea
              value={right}
              onChange={e => setRight(e.target.value)}
              placeholder="Paste modified text here..."
              className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono resize-y focus:outline-none focus:border-blue-500 placeholder-zinc-600"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={swap}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Swap
          </button>
          <button
            onClick={clear}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Clear
          </button>
          {diff.length > 0 && (
            <div className="flex gap-3 ml-auto text-sm">
              <span className="text-green-400">+{stats.adds} added</span>
              <span className="text-red-400">-{stats.removes} removed</span>
              <span className="text-zinc-500">{stats.equal} unchanged</span>
            </div>
          )}
        </div>

        {/* Diff output */}
        {diff.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <tbody>
                  {diff.map((line, i) => (
                    <tr
                      key={i}
                      className={
                        line.type === 'add'
                          ? 'bg-green-500/10'
                          : line.type === 'remove'
                          ? 'bg-red-500/10'
                          : ''
                      }
                    >
                      <td className="px-3 py-0.5 text-zinc-600 text-right select-none w-12 border-r border-zinc-800">
                        {line.leftNum ?? ''}
                      </td>
                      <td className="px-3 py-0.5 text-zinc-600 text-right select-none w-12 border-r border-zinc-800">
                        {line.rightNum ?? ''}
                      </td>
                      <td className="px-2 py-0.5 select-none w-6 text-center">
                        {line.type === 'add' ? (
                          <span className="text-green-400">+</span>
                        ) : line.type === 'remove' ? (
                          <span className="text-red-400">-</span>
                        ) : (
                          <span className="text-zinc-700">&nbsp;</span>
                        )}
                      </td>
                      <td className="px-3 py-0.5 whitespace-pre text-zinc-300">
                        {line.text || '\u00A0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
