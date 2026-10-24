'use client'

import { useState, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "What is a Unix timestamp?", answer: "A Unix timestamp (or epoch time) is the number of seconds that have elapsed since January 1, 1970 00:00:00 UTC. It's widely used in programming and databases to represent dates and times." },
  { question: "What's the difference between seconds and milliseconds?", answer: "Unix timestamps in seconds are 10 digits (e.g., 1709251200). JavaScript and some APIs use milliseconds (13 digits, e.g., 1709251200000). This tool handles both automatically." },
]

const relatedTools: RelatedTool[] = [
  { name: "UUID Generator", href: "/tools/uuid-generator" },
  { name: "JSON Formatter", href: "/tools/json-formatter" },
  { name: "Base64 Encoder", href: "/tools/base64-encoder" },
]

export default function TimestampConverter() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  const [tsInput, setTsInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [tsResult, setTsResult] = useState<string | null>(null)
  const [dateResult, setDateResult] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(interval)
  }, [])

  const convertTimestamp = () => {
    let ts = parseInt(tsInput)
    if (isNaN(ts)) { setDateResult('Invalid timestamp'); return }
    // Auto-detect ms vs seconds
    if (ts > 9999999999) ts = Math.floor(ts / 1000)
    const d = new Date(ts * 1000)
    if (isNaN(d.getTime())) { setDateResult('Invalid timestamp'); return }
    setDateResult(
      `UTC: ${d.toUTCString()}\nLocal: ${d.toLocaleString()}\nISO: ${d.toISOString()}`
    )
  }

  const convertDate = () => {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) { setTsResult('Invalid date'); return }
    const ts = Math.floor(d.getTime() / 1000)
    setTsResult(
      `Seconds: ${ts}\nMilliseconds: ${ts * 1000}\nISO: ${d.toISOString()}`
    )
  }

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const nowDate = new Date(now * 1000)

  return (
    <ToolLayout
      title="Unix Timestamp Converter"
      description="Convert Unix timestamps to human-readable dates and vice versa. Live current timestamp display. Free online tool."
      category="Developer"
      slug="timestamp-converter"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["unix timestamp converter", "epoch converter", "timestamp to date", "date to timestamp", "unix time converter", "epoch time converter", "unix timestamp", "timestamp converter online"]}
      guide={
        <>
          <h2>Unix Timestamp Converter</h2>
          <p>Convert between Unix timestamps and human-readable dates. See the current timestamp in real time. Handles both seconds and milliseconds automatically.</p>
        </>
      }
    >
      <div className="space-y-6">
        {/* Current time */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Current Unix Timestamp</p>
          <button
            onClick={() => copy(String(now), 'now')}
            className="text-4xl font-mono text-blue-400 hover:text-blue-300 transition-colors"
          >
            {now}
          </button>
          <p className="text-sm text-zinc-400 mt-2">{nowDate.toUTCString()}</p>
          <p className="text-xs text-zinc-600 mt-1">{copied === 'now' ? 'Copied!' : 'Click to copy'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timestamp to Date */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <p className="text-sm text-zinc-400 font-medium">Timestamp &rarr; Date</p>
            <input
              type="text"
              value={tsInput}
              onChange={e => setTsInput(e.target.value)}
              placeholder="e.g. 1709251200"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 font-mono focus:outline-none focus:border-blue-500 placeholder-zinc-600"
            />
            <button onClick={convertTimestamp} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors w-full">
              Convert
            </button>
            {dateResult && (
              <pre className="bg-zinc-950 rounded-lg p-3 text-sm text-zinc-300 font-mono whitespace-pre-wrap">{dateResult}</pre>
            )}
          </div>

          {/* Date to Timestamp */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <p className="text-sm text-zinc-400 font-medium">Date &rarr; Timestamp</p>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
            />
            <button onClick={convertDate} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors w-full">
              Convert
            </button>
            {tsResult && (
              <pre className="bg-zinc-950 rounded-lg p-3 text-sm text-zinc-300 font-mono whitespace-pre-wrap">{tsResult}</pre>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
