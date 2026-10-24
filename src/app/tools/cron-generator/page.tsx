'use client'

import { useState, useMemo } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const PRESETS = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every 5 minutes', cron: '*/5 * * * *' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *' },
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every day at midnight', cron: '0 0 * * *' },
  { label: 'Every day at noon', cron: '0 12 * * *' },
  { label: 'Every Monday at 9am', cron: '0 9 * * 1' },
  { label: 'Every weekday at 9am', cron: '0 9 * * 1-5' },
  { label: 'First day of month', cron: '0 0 1 * *' },
  { label: 'Every Sunday at 3am', cron: '0 3 * * 0' },
  { label: 'Every 6 hours', cron: '0 */6 * * *' },
  { label: 'Twice a day (9am, 5pm)', cron: '0 9,17 * * *' },
]

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function describeCron(cron: string): string {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid cron expression (expected 5 fields)'

  const [min, hour, dom, month, dow] = parts
  const pieces: string[] = []

  // Minute
  if (min === '*') pieces.push('every minute')
  else if (min.startsWith('*/')) pieces.push(`every ${min.slice(2)} minutes`)
  else if (min.includes(',')) pieces.push(`at minutes ${min}`)
  else pieces.push(`at minute ${min}`)

  // Hour
  if (hour === '*') { /* every hour already implied */ }
  else if (hour.startsWith('*/')) pieces.push(`every ${hour.slice(2)} hours`)
  else if (hour.includes(',')) pieces.push(`at hours ${hour.replace(/,/g, ', ')}`)
  else {
    const h = parseInt(hour)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    pieces.push(`at ${h12}:${min === '0' || min === '00' ? '00' : min} ${ampm}`)
  }

  // Day of month
  if (dom !== '*') {
    if (dom.includes(',')) pieces.push(`on days ${dom} of the month`)
    else pieces.push(`on day ${dom} of the month`)
  }

  // Month
  if (month !== '*') {
    const monthNames = month.split(',').map(m => MONTHS[parseInt(m) - 1] || m).join(', ')
    pieces.push(`in ${monthNames}`)
  }

  // Day of week
  if (dow !== '*') {
    if (dow === '1-5') pieces.push('on weekdays')
    else if (dow === '0,6') pieces.push('on weekends')
    else {
      const dayNames = dow.split(',').map(d => DAYS[parseInt(d)] || d).join(', ')
      pieces.push(`on ${dayNames}`)
    }
  }

  return pieces.join(', ')
}

function getNextRuns(cron: string, count: number = 5): string[] {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return []

  const [minF, hourF, domF, monthF, dowF] = parts
  const results: string[] = []
  const now = new Date()
  const check = new Date(now)
  check.setSeconds(0)
  check.setMilliseconds(0)
  check.setMinutes(check.getMinutes() + 1)

  const matches = (val: number, field: string, max: number): boolean => {
    if (field === '*') return true
    if (field.startsWith('*/')) return val % parseInt(field.slice(2)) === 0
    if (field.includes(',')) return field.split(',').map(Number).includes(val)
    if (field.includes('-')) {
      const [a, b] = field.split('-').map(Number)
      return val >= a && val <= b
    }
    return val === parseInt(field)
  }

  let iterations = 0
  while (results.length < count && iterations < 525600) {
    const m = check.getMinutes()
    const h = check.getHours()
    const d = check.getDate()
    const mo = check.getMonth() + 1
    const dw = check.getDay()

    if (matches(m, minF, 59) && matches(h, hourF, 23) && matches(d, domF, 31) && matches(mo, monthF, 12) && matches(dw, dowF, 6)) {
      results.push(check.toLocaleString())
    }
    check.setMinutes(check.getMinutes() + 1)
    iterations++
  }

  return results
}

const faqs: FAQ[] = [
  { question: "What is a cron expression?", answer: "A cron expression is a string of 5 fields (minute, hour, day of month, month, day of week) that defines a schedule. It's used in Unix/Linux systems and many cloud services to run tasks automatically." },
  { question: "What does * mean in cron?", answer: "An asterisk (*) means 'every'. So * in the minute field means every minute, and * in the hour field means every hour." },
  { question: "What does */5 mean?", answer: "The */N syntax means 'every N'. So */5 in the minute field means every 5 minutes (0, 5, 10, 15, ...)." },
]

const relatedTools: RelatedTool[] = [
  { name: "Unix Timestamp Converter", href: "/tools/timestamp-converter" },
  { name: "Regex Tester", href: "/tools/regex-tester" },
  { name: "JSON Formatter", href: "/tools/json-formatter" },
]

export default function CronGenerator() {
  const [cron, setCron] = useState('0 9 * * 1-5')
  const [copied, setCopied] = useState(false)

  const description = useMemo(() => describeCron(cron), [cron])
  const nextRuns = useMemo(() => getNextRuns(cron), [cron])

  const copy = () => {
    navigator.clipboard.writeText(cron)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const parts = cron.trim().split(/\s+/)
  const fields = ['Minute', 'Hour', 'Day (Month)', 'Month', 'Day (Week)']

  return (
    <ToolLayout
      title="Cron Expression Generator"
      description="Build and understand cron expressions with a visual editor. See human-readable descriptions and next run times. Free online tool."
      category="Developer"
      slug="cron-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["cron generator", "cron expression generator", "crontab generator", "cron schedule", "cron expression builder", "crontab guru", "cron maker", "cron job generator"]}
      guide={
        <>
          <h2>Cron Expression Generator</h2>
          <p>Build cron expressions visually or pick from common presets. See a plain-English description and the next 5 scheduled run times.</p>
        </>
      }
    >
      <div className="space-y-6">
        {/* Expression input */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={cron}
              onChange={e => setCron(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-lg text-zinc-200 font-mono tracking-wider text-center focus:outline-none focus:border-blue-500"
              spellCheck={false}
            />
            <button onClick={copy} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Field labels */}
          <div className="flex justify-center gap-2 text-xs">
            {parts.slice(0, 5).map((p, i) => (
              <div key={i} className="text-center" style={{ width: `${100 / 5}%`, maxWidth: 100 }}>
                <div className="text-zinc-300 font-mono mb-0.5">{p}</div>
                <div className="text-zinc-600">{fields[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Description</p>
          <p className="text-zinc-300">{description}</p>
        </div>

        {/* Presets */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Common Presets</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESETS.map(p => (
              <button
                key={p.cron}
                onClick={() => setCron(p.cron)}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  cron === p.cron ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{p.label}</span>
                <span className="font-mono text-xs text-zinc-500">{p.cron}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Next runs */}
        {nextRuns.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Next 5 Runs</p>
            <div className="space-y-1">
              {nextRuns.map((run, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-600 w-6 text-right">{i + 1}.</span>
                  <span className="text-zinc-300 font-mono">{run}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
