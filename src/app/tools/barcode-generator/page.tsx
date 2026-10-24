'use client'

import { useState, useEffect, useRef } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

// Simple Code128B barcode encoder (no npm dependency)
const CODE128B_START = 104
const CODE128_STOP = 106

const CODE128_PATTERNS = [
  '11011001100','11001101100','11001100110','10010011000','10010001100','10001001100',
  '10011001000','10011000100','10001100100','11001001000','11001000100','11000100100',
  '10110011100','10011011100','10011001110','10111001100','10011101100','10011100110',
  '11001110010','11001011100','11001001110','11011100100','11001110100','11001110010',
  '11011101000','11011100010','11011101000','11101101000','11101100010','11100101100',
  '11100100110','11101100100','11100110100','11100110010','11011011000','11011000110',
  '11000110110','10100011000','10001011000','10001000110','10110001000','10001101000',
  '10001100010','11010001000','11000101000','11000100010','10110111000','10110001110',
  '10001101110','10111011000','10111000110','10001110110','11101110110','11010001110',
  '11000101110','11011101110','11101011000','11101000110','11100010110','11101101000',
  '11101100010','11100011010','11101111010','11001000010','11110001010','10100110000',
  '10100001100','10010110000','10010000110','10000101100','10000100110','10110010000',
  '10110000100','10011010000','10011000010','10000110100','10000110010','11000010010',
  '11001010000','11110111010','11000010100','10001111010','10100111100','10010111100',
  '10010011110','10111100100','10011110100','10011110010','11110100100','11110010100',
  '11110010010','11011011110','11011110110','11110110110','10101111000','10100011110',
  '10001011110','10111101000','10111100010','11110101000','11110100010','10111011110',
  '10111101110','11101011110','11110101110','11010000100','11010010000','11010011100',
  '1100011101011',
]

function encodeCode128B(text: string): string {
  let checksum = CODE128B_START
  let pattern = CODE128_PATTERNS[CODE128B_START]

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32
    if (code < 0 || code > 94) continue
    pattern += CODE128_PATTERNS[code]
    checksum += code * (i + 1)
  }

  pattern += CODE128_PATTERNS[checksum % 103]
  pattern += CODE128_PATTERNS[CODE128_STOP]
  return pattern
}

const faqs: FAQ[] = [
  { question: "What barcode format is generated?", answer: "This tool generates Code 128B barcodes, which support all standard ASCII characters (letters, numbers, symbols). Code 128 is widely used in shipping, packaging, and inventory management." },
  { question: "Can I use these barcodes commercially?", answer: "Yes. The barcodes are generated client-side and are free to use for any purpose — labels, products, documents, or inventory." },
]

const relatedTools: RelatedTool[] = [
  { name: "QR Code Generator", href: "/tools/qr-code-generator" },
  { name: "UUID Generator", href: "/tools/uuid-generator" },
  { name: "Password Generator", href: "/tools/password-generator" },
]

export default function BarcodeGenerator() {
  const [text, setText] = useState('TOOLPILE-123')
  const [barWidth, setBarWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [showText, setShowText] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !text) return

    const pattern = encodeCode128B(text)
    const width = pattern.length * barWidth + 20
    const totalHeight = showText ? height + 30 : height + 10

    canvas.width = width
    canvas.height = totalHeight
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, totalHeight)

    ctx.fillStyle = '#000000'
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '1') {
        ctx.fillRect(10 + i * barWidth, 5, barWidth, height)
      }
    }

    if (showText) {
      ctx.fillStyle = '#000000'
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(text, width / 2, height + 22)
    }
  }, [text, barWidth, height, showText])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `barcode-${text}.png`
    a.click()
  }

  return (
    <ToolLayout
      title="Barcode Generator"
      description="Generate Code 128 barcodes from any text. Download as PNG. Free, no upload — runs in your browser."
      category="Utility"
      slug="barcode-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["barcode generator", "barcode maker", "generate barcode online", "code 128 barcode", "barcode generator free", "create barcode", "barcode generator online free"]}
      guide={<><h2>Barcode Generator</h2><p>Generate Code 128B barcodes from any text. Customize bar width, height, and download as PNG.</p></>}
    >
      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Text</label>
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Enter text..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 font-mono focus:outline-none focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between mb-1"><label className="text-sm text-zinc-400">Bar Width</label><span className="text-sm text-zinc-300">{barWidth}px</span></div>
              <input type="range" min={1} max={4} value={barWidth} onChange={e => setBarWidth(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div>
              <div className="flex justify-between mb-1"><label className="text-sm text-zinc-400">Height</label><span className="text-sm text-zinc-300">{height}px</span></div>
              <input type="range" min={40} max={200} value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showText} onChange={e => setShowText(e.target.checked)} className="accent-blue-500" />
              <span className="text-sm text-zinc-400">Show text</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 flex justify-center">
          <canvas ref={canvasRef} />
        </div>

        <button onClick={download} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors">
          Download PNG
        </button>
      </div>
    </ToolLayout>
  )
}
