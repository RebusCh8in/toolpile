'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const PERMS = ['Read', 'Write', 'Execute'] as const
const ROLES = ['Owner', 'Group', 'Others'] as const

const PRESETS = [
  { label: '755', desc: 'Standard directory / executable', owner: [true, true, true], group: [true, false, true], others: [true, false, true] },
  { label: '644', desc: 'Standard file', owner: [true, true, false], group: [true, false, false], others: [true, false, false] },
  { label: '777', desc: 'Full access (dangerous)', owner: [true, true, true], group: [true, true, true], others: [true, true, true] },
  { label: '600', desc: 'Private file', owner: [true, true, false], group: [false, false, false], others: [false, false, false] },
  { label: '700', desc: 'Private directory', owner: [true, true, true], group: [false, false, false], others: [false, false, false] },
  { label: '444', desc: 'Read-only for everyone', owner: [true, false, false], group: [true, false, false], others: [true, false, false] },
]

const faqs: FAQ[] = [
  { question: "What is chmod?", answer: "chmod (change mode) is a Unix/Linux command that sets file permissions. It controls who can read, write, or execute a file. Permissions are set for three roles: owner, group, and others." },
  { question: "What do the numbers mean?", answer: "Each digit represents permissions for owner, group, and others. Read=4, Write=2, Execute=1. They're added together: 7=rwx, 6=rw-, 5=r-x, 4=r--, etc." },
]

const relatedTools: RelatedTool[] = [
  { name: "Cron Expression Generator", href: "/tools/cron-generator" },
  { name: "Password Generator", href: "/tools/password-generator" },
  { name: "Regex Tester", href: "/tools/regex-tester" },
]

export default function ChmodCalculator() {
  const [perms, setPerms] = useState([
    [true, true, true],   // owner
    [true, false, true],  // group
    [true, false, true],  // others
  ])
  const [copied, setCopied] = useState(false)

  const toggle = (role: number, perm: number) => {
    const next = perms.map(r => [...r])
    next[role][perm] = !next[role][perm]
    setPerms(next)
  }

  const octalDigit = (role: boolean[]) => (role[0] ? 4 : 0) + (role[1] ? 2 : 0) + (role[2] ? 1 : 0)
  const octal = perms.map(octalDigit).join('')
  const symbolic = perms.map(r => (r[0] ? 'r' : '-') + (r[1] ? 'w' : '-') + (r[2] ? 'x' : '-')).join('')

  const applyPreset = (p: typeof PRESETS[0]) => {
    setPerms([p.owner, p.group, p.others])
  }

  const copy = () => { navigator.clipboard.writeText(`chmod ${octal}`); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <ToolLayout
      title="Chmod Calculator"
      description="Calculate Unix file permissions visually. Convert between octal and symbolic chmod notation. Free online tool."
      category="Developer"
      slug="chmod-calculator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["chmod calculator", "chmod permissions", "file permissions calculator", "unix permissions", "chmod converter", "chmod 755", "chmod 644", "linux permissions calculator"]}
      guide={<><h2>Chmod Calculator</h2><p>Calculate Unix/Linux file permissions with a visual checkbox grid. See octal and symbolic notation in real time.</p></>}
    >
      <div className="space-y-6">
        {/* Result */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-6 mb-2">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Octal</p>
              <p className="text-4xl font-mono font-bold text-blue-400">{octal}</p>
            </div>
            <div className="text-zinc-700 text-2xl">=</div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Symbolic</p>
              <p className="text-4xl font-mono font-bold text-zinc-300">{symbolic}</p>
            </div>
          </div>
          <button onClick={copy} className="mt-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-1.5 text-sm transition-colors">
            {copied ? 'Copied!' : `Copy chmod ${octal}`}
          </button>
        </div>

        {/* Grid */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-zinc-400 font-medium"></th>
                {PERMS.map(p => (
                  <th key={p} className="px-4 py-3 text-center text-zinc-400 font-medium">{p}</th>
                ))}
                <th className="px-4 py-3 text-center text-zinc-400 font-medium">Octal</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role, ri) => (
                <tr key={role} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-3 text-zinc-300 font-medium">{role}</td>
                  {PERMS.map((_, pi) => (
                    <td key={pi} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={perms[ri][pi]}
                        onChange={() => toggle(ri, pi)}
                        className="w-5 h-5 accent-blue-500 cursor-pointer"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-mono text-zinc-300">{octalDigit(perms[ri])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Presets */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Common Presets</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  octal === p.label ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="font-mono">{p.label}</span>
                <span className="text-xs text-zinc-500 ml-2">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Command */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Command</p>
          <pre className="bg-zinc-950 rounded-lg p-3 text-sm text-green-400 font-mono">chmod {octal} filename</pre>
        </div>
      </div>
    </ToolLayout>
  )
}
