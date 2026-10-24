'use client'

import { useState, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

// Unicode character maps for text transformation
const STYLES: { name: string; transform: (text: string) => string }[] = [
  { name: "Bold Serif", transform: t => mapChars(t, 0x1D400, 0x1D41A) },
  { name: "Italic Serif", transform: t => mapChars(t, 0x1D434, 0x1D44E) },
  { name: "Bold Italic", transform: t => mapChars(t, 0x1D468, 0x1D482) },
  { name: "Script", transform: t => mapChars(t, 0x1D49C, 0x1D4B6) },
  { name: "Bold Script", transform: t => mapChars(t, 0x1D4D0, 0x1D4EA) },
  { name: "Fraktur", transform: t => mapChars(t, 0x1D504, 0x1D51E) },
  { name: "Bold Fraktur", transform: t => mapChars(t, 0x1D56C, 0x1D586) },
  { name: "Double-Struck", transform: t => mapChars(t, 0x1D538, 0x1D552) },
  { name: "Sans-Serif", transform: t => mapChars(t, 0x1D5A0, 0x1D5BA) },
  { name: "Sans Bold", transform: t => mapChars(t, 0x1D5D4, 0x1D5EE) },
  { name: "Sans Italic", transform: t => mapChars(t, 0x1D608, 0x1D622) },
  { name: "Sans Bold Italic", transform: t => mapChars(t, 0x1D63C, 0x1D656) },
  { name: "Monospace", transform: t => mapChars(t, 0x1D670, 0x1D68A) },
  { name: "Circled", transform: circled },
  { name: "Negative Circled", transform: negativeCircled },
  { name: "Squared", transform: squared },
  { name: "Fullwidth", transform: fullwidth },
  { name: "Small Caps", transform: smallCaps },
  { name: "Upside Down", transform: upsideDown },
  { name: "Strikethrough", transform: t => combining(t, '\u0336') },
  { name: "Underline", transform: t => combining(t, '\u0332') },
  { name: "Wavy", transform: t => combining(t, '\u0330') },
  { name: "Dotted", transform: t => combining(t, '\u0307') },
  { name: "Double Underline", transform: t => combining(t, '\u0333') },
  { name: "Sparkles", transform: t => t.split('').map(c => c === ' ' ? ' ' : `${c}\u2728`).join('') },
  { name: "Stars", transform: t => `\u2605 ${t.split('').join(' \u2605 ')} \u2605` },
  { name: "Brackets", transform: t => t.split('').map(c => c === ' ' ? ' ' : `\u300C${c}\u300D`).join('') },
  { name: "Aesthetic", transform: t => fullwidth(t).split('').join(' ') },
]

function mapChars(text: string, upperStart: number, lowerStart: number): string {
  return Array.from(text).map(c => {
    const code = c.charCodeAt(0)
    if (code >= 65 && code <= 90) return String.fromCodePoint(upperStart + (code - 65))
    if (code >= 97 && code <= 122) return String.fromCodePoint(lowerStart + (code - 97))
    return c
  }).join('')
}

function circled(text: string): string {
  return Array.from(text).map(c => {
    const code = c.charCodeAt(0)
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + (code - 65))
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + (code - 97))
    if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + (code - 49))
    if (code === 48) return String.fromCodePoint(0x24EA)
    return c
  }).join('')
}

function negativeCircled(text: string): string {
  return Array.from(text).map(c => {
    const code = c.charCodeAt(0)
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F150 + (code - 65))
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1F150 + (code - 97))
    return c
  }).join('')
}

function squared(text: string): string {
  return Array.from(text).map(c => {
    const code = c.charCodeAt(0)
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F130 + (code - 65))
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1F130 + (code - 97))
    return c
  }).join('')
}

function fullwidth(text: string): string {
  return Array.from(text).map(c => {
    const code = c.charCodeAt(0)
    if (code >= 33 && code <= 126) return String.fromCodePoint(0xFF01 + (code - 33))
    return c
  }).join('')
}

const SMALL_CAPS_MAP: Record<string, string> = {
  a: '\u1D00', b: '\u0299', c: '\u1D04', d: '\u1D05', e: '\u1D07',
  f: '\u0493', g: '\u0262', h: '\u029C', i: '\u026A', j: '\u1D0A',
  k: '\u1D0B', l: '\u029F', m: '\u1D0D', n: '\u0274', o: '\u1D0F',
  p: '\u1D18', q: '\u01EB', r: '\u0280', s: '\u0455', t: '\u1D1B',
  u: '\u1D1C', v: '\u1D20', w: '\u1D21', x: '\u02E3', y: '\u028F',
  z: '\u1D22',
}

function smallCaps(text: string): string {
  return Array.from(text).map(c => SMALL_CAPS_MAP[c] || c).join('')
}

const UPSIDE_DOWN_MAP: Record<string, string> = {
  a: '\u0250', b: 'q', c: '\u0254', d: 'p', e: '\u01DD', f: '\u025F',
  g: '\u0253', h: '\u0265', i: '\u0131', j: '\u027E', k: '\u029E',
  l: 'l', m: '\u026F', n: 'u', o: 'o', p: 'd', q: 'b', r: '\u0279',
  s: 's', t: '\u0287', u: 'n', v: '\u028C', w: '\u028D', x: 'x',
  y: '\u028E', z: 'z',
  A: '\u2200', B: '\u15FA', C: '\u0186', D: '\u15E1', E: '\u018E',
  F: '\u2132', G: '\u2141', H: 'H', I: 'I', J: '\u017F', K: '\u22CA',
  L: '\u2142', M: 'W', N: 'N', O: 'O', P: '\u0500', Q: '\u038C',
  R: '\u1D1A', S: 'S', T: '\u22A5', U: '\u2229', V: '\u039B',
  W: 'M', X: 'X', Y: '\u2144', Z: 'Z',
  '1': '\u21C2', '2': '\u1105', '3': '\u0190', '4': '\u3123',
  '5': '\u078E', '6': '9', '7': '\u3125', '8': '8', '9': '6', '0': '0',
  '.': '\u02D9', ',': "'", "'": ',', '"': ',,', '!': '\u00A1',
  '?': '\u00BF', '(': ')', ')': '(', '[': ']', ']': '[',
  '{': '}', '}': '{', '<': '>', '>': '<', '&': '\u214B',
  '_': '\u203E',
}

function upsideDown(text: string): string {
  return Array.from(text).reverse().map(c => UPSIDE_DOWN_MAP[c] || c).join('')
}

function combining(text: string, combiner: string): string {
  return Array.from(text).map(c => c === ' ' ? ' ' : c + combiner).join('')
}

const faqs: FAQ[] = [
  {
    question: "How does the fancy text generator work?",
    answer: "It converts your text into special Unicode characters that look like different fonts. These characters are part of the Unicode standard, so they work everywhere that supports Unicode — social media bios, messages, comments, and more."
  },
  {
    question: "Can I use fancy text on Instagram, TikTok, and Twitter?",
    answer: "Yes. The generated text uses Unicode characters that work on Instagram bios and captions, TikTok bios, Twitter/X posts, Facebook, YouTube, Discord, and virtually any platform that supports text input."
  },
  {
    question: "Why do some characters look different on different devices?",
    answer: "Unicode characters are rendered by each device's font system. Some older devices or browsers may not support all Unicode blocks, which can cause certain styles to display as boxes or question marks. The most widely supported styles are Bold, Italic, and Circled."
  },
  {
    question: "Is there a character limit?",
    answer: "There is no limit in this tool. However, keep in mind that some Unicode characters count as 2-4 characters on platforms with character limits (like Twitter's 280 character limit), since they use multi-byte encoding."
  },
  {
    question: "Are these actual fonts?",
    answer: "No — these are Unicode characters that visually resemble different font styles. Real fonts require CSS or font files. The advantage of Unicode text is that it can be pasted anywhere without any special formatting."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Word Counter", href: "/tools/word-counter" },
  { name: "Lorem Ipsum Generator", href: "/tools/lorem-ipsum-generator" },
  { name: "Markdown Preview", href: "/tools/markdown-preview" },
]

export default function FancyTextGenerator() {
  const [text, setText] = useState('Type something here...')
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = useCallback((styled: string, name: string) => {
    navigator.clipboard.writeText(styled)
    setCopied(name)
    setTimeout(() => setCopied(null), 1500)
  }, [])

  return (
    <ToolLayout
      title="Fancy Text Generator"
      description="Convert text into stylish Unicode fonts for Instagram, TikTok, Twitter, and more. Just type, click to copy, and paste anywhere."
      category="Text"
      slug="fancy-text-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "fancy text generator",
        "stylish text",
        "unicode text generator",
        "instagram fonts",
        "cool text fonts",
        "fancy font copy paste",
        "text styler online",
        "tiktok bio fonts",
        "twitter font generator",
        "aesthetic text generator"
      ]}
      guide={
        <>
          <h2>What Is the Fancy Text Generator?</h2>
          <p>
            The Fancy Text Generator converts your regular text into stylish Unicode characters that look like different fonts. You can copy and paste the styled text into Instagram bios, TikTok profiles, Twitter posts, YouTube comments, Discord messages, and anywhere else that accepts text.
          </p>
          <p>
            Everything runs instantly in your browser. No signup, no server processing, no data collection.
          </p>

          <h3>How to Use It</h3>
          <ul>
            <li>Type or paste your text in the input box at the top.</li>
            <li>Browse through all the available styles below.</li>
            <li>Click any style to copy it to your clipboard.</li>
            <li>Paste it wherever you want — social media, messages, documents.</li>
          </ul>

          <h3>Available Styles</h3>
          <p>
            The tool offers 28 different text styles including Bold, Italic, Script, Fraktur, Double-Struck, Circled, Squared, Small Caps, Upside Down, Monospace, Fullwidth, and decorative styles with strikethrough, underlines, sparkles, and more.
          </p>

          <h3>Tips</h3>
          <ul>
            <li>Bold and Italic styles have the widest device support.</li>
            <li>Some Unicode characters count as multiple characters on platforms with limits.</li>
            <li>Combine styles by running output through the tool again for layered effects.</li>
            <li>Numbers are supported in Circled, Fullwidth, and Upside Down styles.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Input */}
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onFocus={e => { if (e.target.value === 'Type something here...') setText('') }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
            placeholder="Type something here..."
          />
        </div>

        {/* Style Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STYLES.map(({ name, transform }) => {
            const styled = transform(text || 'Type something here...')
            const isCopied = copied === name
            return (
              <button
                key={name}
                onClick={() => copyToClipboard(styled, name)}
                className="group text-left bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-zinc-900/80 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded transition-all ${isCopied ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'}`}>
                    {isCopied ? 'Copied!' : 'Click to copy'}
                  </span>
                </div>
                <p className="text-zinc-200 text-base break-all leading-relaxed">{styled}</p>
              </button>
            )
          })}
        </div>
      </div>
    </ToolLayout>
  )
}
