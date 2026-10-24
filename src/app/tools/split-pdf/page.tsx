'use client'

import { useState, useRef, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'
import { PDFDocument } from 'pdf-lib'

const faqs: FAQ[] = [
  {
    question: "How does the Split PDF tool work?",
    answer: "The tool uses the pdf-lib library to read and manipulate PDF files entirely in your browser. You upload a PDF, choose how you want to split it (by page range, every N pages, into equal parts, or individual pages), and download the resulting files. No data is ever sent to a server."
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer: "No. All PDF splitting happens 100% in your browser using JavaScript. Your file never leaves your device, so your documents remain completely private and secure. There are no uploads, no cloud processing, and no data retention."
  },
  {
    question: "What is the maximum PDF file size I can split?",
    answer: "Since processing happens in your browser, the limit depends on your device's available memory. Most modern devices can handle PDFs up to 100-200 MB without issues. Very large files with hundreds of pages may take longer to process."
  },
  {
    question: "Can I extract specific pages from a PDF?",
    answer: "Yes. Use the 'Extract Pages' mode and enter page numbers like '1,3,5-8' to extract exactly the pages you need into a single new PDF. You can mix individual page numbers with ranges separated by commas."
  },
  {
    question: "How do I split a PDF into equal parts?",
    answer: "Select the 'Equal Parts' split mode, then enter the number of parts you want. The tool will divide your PDF as evenly as possible. If the pages don't divide evenly, the last part will contain the remaining pages."
  },
  {
    question: "Can I split a PDF on my phone or tablet?",
    answer: "Yes. The Split PDF tool works on any modern browser including mobile devices. Just open the page, upload your PDF, choose your split settings, and download the results — no app installation required."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "QR Code Generator", href: "/tools/qr-code-generator" },
  { name: "Word Counter", href: "/tools/word-counter" },
]

type SplitMode = 'extract' | 'every-n' | 'equal-parts' | 'individual'

interface SplitResult {
  label: string
  pages: number[] // 0-indexed
  blob?: Blob
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function parsePageRange(input: string, totalPages: number): number[] {
  const pages = new Set<number>()
  const parts = input.split(',').map(s => s.trim()).filter(Boolean)

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/)
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10)
      const end = parseInt(rangeMatch[2], 10)
      if (start >= 1 && end <= totalPages && start <= end) {
        for (let i = start; i <= end; i++) pages.add(i - 1)
      }
    } else {
      const num = parseInt(part, 10)
      if (num >= 1 && num <= totalPages) pages.add(num - 1)
    }
  }

  return Array.from(pages).sort((a, b) => a - b)
}

function computeSplitPreview(mode: SplitMode, totalPages: number, extractInput: string, everyN: number, equalParts: number): SplitResult[] {
  const results: SplitResult[] = []

  if (mode === 'extract') {
    const pages = parsePageRange(extractInput, totalPages)
    if (pages.length > 0) {
      results.push({
        label: `Extracted pages (${pages.map(p => p + 1).join(', ')})`,
        pages,
      })
    }
  } else if (mode === 'every-n') {
    const n = Math.max(1, everyN)
    let partIndex = 1
    for (let i = 0; i < totalPages; i += n) {
      const chunk = []
      for (let j = i; j < Math.min(i + n, totalPages); j++) chunk.push(j)
      results.push({
        label: `Part ${partIndex} (pages ${chunk[0] + 1}-${chunk[chunk.length - 1] + 1})`,
        pages: chunk,
      })
      partIndex++
    }
  } else if (mode === 'equal-parts') {
    const parts = Math.max(1, Math.min(equalParts, totalPages))
    const base = Math.floor(totalPages / parts)
    const remainder = totalPages % parts
    let offset = 0
    for (let i = 0; i < parts; i++) {
      const size = base + (i < remainder ? 1 : 0)
      const chunk = []
      for (let j = offset; j < offset + size; j++) chunk.push(j)
      results.push({
        label: `Part ${i + 1} (pages ${chunk[0] + 1}-${chunk[chunk.length - 1] + 1})`,
        pages: chunk,
      })
      offset += size
    }
  } else if (mode === 'individual') {
    for (let i = 0; i < totalPages; i++) {
      results.push({
        label: `Page ${i + 1}`,
        pages: [i],
      })
    }
  }

  return results
}

export default function SplitPDF() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [splitMode, setSplitMode] = useState<SplitMode>('extract')
  const [extractInput, setExtractInput] = useState('')
  const [everyN, setEveryN] = useState(5)
  const [equalParts, setEqualParts] = useState(2)
  const [results, setResults] = useState<SplitResult[]>([])
  const [splitting, setSplitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const preview = totalPages > 0 ? computeSplitPreview(splitMode, totalPages, extractInput, everyN, equalParts) : []

  const handleFile = useCallback(async (file: File) => {
    setError('')
    setResults([])
    setProgress(0)

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.')
      return
    }

    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const pages = pdf.getPageCount()

      setPdfBytes(bytes)
      setFileName(file.name.replace(/\.pdf$/i, ''))
      setFileSize(file.size)
      setTotalPages(pages)
      setExtractInput(`1-${Math.min(pages, 5)}`)
      setEqualParts(Math.min(2, pages))
    } catch {
      setError('Failed to read this PDF. The file may be corrupted or encrypted.')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const splitPdf = useCallback(async () => {
    if (!pdfBytes || preview.length === 0) return

    setSplitting(true)
    setProgress(0)
    setResults([])

    try {
      const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
      const completed: SplitResult[] = []

      for (let i = 0; i < preview.length; i++) {
        const part = preview[i]
        const newPdf = await PDFDocument.create()
        const copiedPages = await newPdf.copyPages(sourcePdf, part.pages)
        copiedPages.forEach(page => newPdf.addPage(page))
        const newBytes = await newPdf.save()
        const blob = new Blob([newBytes as unknown as BlobPart], { type: 'application/pdf' })

        completed.push({ ...part, blob })
        setProgress(Math.round(((i + 1) / preview.length) * 100))
      }

      setResults(completed)
    } catch {
      setError('An error occurred while splitting the PDF.')
    } finally {
      setSplitting(false)
    }
  }, [pdfBytes, preview])

  const downloadFile = (result: SplitResult) => {
    if (!result.blob) return
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}-${result.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = () => {
    results.forEach((r, i) => {
      setTimeout(() => downloadFile(r), i * 200)
    })
  }

  const reset = () => {
    setPdfBytes(null)
    setFileName('')
    setFileSize(0)
    setTotalPages(0)
    setResults([])
    setProgress(0)
    setError('')
    setSplitMode('extract')
    setExtractInput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const MODES: { value: SplitMode; label: string; desc: string }[] = [
    { value: 'extract', label: 'Extract Pages', desc: 'Pick specific pages' },
    { value: 'every-n', label: 'Every N Pages', desc: 'Split into chunks' },
    { value: 'equal-parts', label: 'Equal Parts', desc: 'Divide evenly' },
    { value: 'individual', label: 'Individual Pages', desc: 'One PDF per page' },
  ]

  return (
    <ToolLayout
      title="Split PDF"
      description="Split PDF files online for free. Extract pages, split into chunks, divide into equal parts, or separate every page. No upload — everything runs in your browser."
      category="Utility"
      slug="split-pdf"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "split pdf",
        "split pdf online",
        "extract pages from pdf",
        "pdf splitter",
        "separate pdf pages",
        "split pdf into multiple files",
        "free pdf splitter",
        "pdf page extractor",
        "divide pdf",
        "split pdf by pages"
      ]}
      guide={
        <>
          <h2>What Is the Split PDF Tool?</h2>
          <p>
            The Split PDF tool lets you break a PDF file into smaller parts directly in your browser. Whether you need to extract a few specific pages, split a document into equal sections, or separate every page into its own file, this tool handles it all without uploading anything to a server.
          </p>

          <h3>How to Split a PDF</h3>
          <ul>
            <li>Upload a PDF by clicking the upload area or dragging and dropping the file.</li>
            <li>Choose a split mode: extract specific pages, split every N pages, divide into equal parts, or extract each page individually.</li>
            <li>Preview which pages will go into each output file.</li>
            <li>Click Split PDF to process the file.</li>
            <li>Download individual files or all files at once.</li>
          </ul>

          <h3>Split Modes Explained</h3>
          <ul>
            <li><strong>Extract Pages:</strong> Enter page numbers like &ldquo;1,3,5-8&rdquo; to pull specific pages into a single PDF.</li>
            <li><strong>Every N Pages:</strong> Splits the document into chunks of N pages each. Great for breaking a long document into manageable sections.</li>
            <li><strong>Equal Parts:</strong> Divides the PDF into a specified number of roughly equal parts. If pages don&apos;t divide evenly, the last part gets the remainder.</li>
            <li><strong>Individual Pages:</strong> Creates a separate PDF for every single page in the document.</li>
          </ul>

          <h3>Tips</h3>
          <ul>
            <li>For large PDFs with many pages, splitting into individual pages will create many files. Use the &ldquo;Download All&rdquo; button to grab them all at once.</li>
            <li>The tool preserves the original page content, formatting, and quality. No recompression or quality loss occurs.</li>
            <li>All processing happens locally in your browser, so even confidential documents stay private.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Upload Area */}
        {!pdfBytes && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
          >
            <div className="text-5xl mb-4">PDF</div>
            <p className="text-lg text-zinc-300 mb-2">Drop a PDF here or click to upload</p>
            <p className="text-sm text-zinc-500">Any PDF file — processed entirely in your browser</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* File Info + Controls */}
        {pdfBytes && totalPages > 0 && (
          <>
            {/* File info bar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center gap-4">
              <div className="text-sm">
                <span className="text-zinc-500">File: </span>
                <span className="text-zinc-300">{fileName}.pdf</span>
              </div>
              <div className="text-sm">
                <span className="text-zinc-500">Size: </span>
                <span className="text-zinc-300">{formatBytes(fileSize)}</span>
              </div>
              <div className="text-sm">
                <span className="text-zinc-500">Pages: </span>
                <span className="text-zinc-300 font-medium">{totalPages}</span>
              </div>
              <button
                onClick={reset}
                className="ml-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
              >
                New PDF
              </button>
            </div>

            {/* Split mode selector */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
              <label className="text-sm text-zinc-400 font-medium">Split Mode</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MODES.map(m => (
                  <button
                    key={m.value}
                    onClick={() => { setSplitMode(m.value); setResults([]) }}
                    className={`rounded-lg px-3 py-3 text-left transition-colors border ${
                      splitMode === m.value
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-xs mt-0.5 opacity-70">{m.desc}</div>
                  </button>
                ))}
              </div>

              {/* Mode-specific input */}
              <div className="pt-2">
                {splitMode === 'extract' && (
                  <div>
                    <label className="text-sm text-zinc-400 block mb-2">
                      Pages to extract <span className="text-zinc-600">(e.g., 1,3,5-8)</span>
                    </label>
                    <input
                      type="text"
                      value={extractInput}
                      onChange={e => { setExtractInput(e.target.value); setResults([]) }}
                      placeholder="1,3,5-8"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                )}
                {splitMode === 'every-n' && (
                  <div>
                    <label className="text-sm text-zinc-400 block mb-2">
                      Pages per chunk
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={everyN}
                      onChange={e => { setEveryN(Math.max(1, parseInt(e.target.value) || 1)); setResults([]) }}
                      className="w-32 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                )}
                {splitMode === 'equal-parts' && (
                  <div>
                    <label className="text-sm text-zinc-400 block mb-2">
                      Number of parts
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={equalParts}
                      onChange={e => { setEqualParts(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1))); setResults([]) }}
                      className="w-32 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                )}
                {splitMode === 'individual' && (
                  <p className="text-sm text-zinc-500">
                    Each page will be extracted as a separate PDF file ({totalPages} files total).
                  </p>
                )}
              </div>
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-300">
                    Output Preview — {preview.length} file{preview.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {preview.map((part, i) => (
                    <div key={i} className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-3 py-2">
                      <span className="text-xs font-mono text-blue-400 w-6 text-right shrink-0">{i + 1}</span>
                      <span className="text-sm text-zinc-300 flex-1 truncate">{part.label}</span>
                      <span className="text-xs text-zinc-500">{part.pages.length} pg{part.pages.length !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>

                {/* Split button */}
                <div className="pt-2">
                  <button
                    onClick={splitPdf}
                    disabled={splitting || preview.length === 0}
                    className={`w-full rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                      splitting
                        ? 'bg-blue-600/50 text-blue-200 cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {splitting ? 'Splitting...' : `Split PDF into ${preview.length} file${preview.length !== 1 ? 's' : ''}`}
                  </button>

                  {/* Progress bar */}
                  {splitting && (
                    <div className="mt-3 w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-green-400">
                    Split complete — {results.length} file{results.length !== 1 ? 's' : ''} ready
                  </h3>
                  {results.length > 1 && (
                    <button
                      onClick={downloadAll}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Download All
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-3 py-2">
                      <span className="text-xs font-mono text-blue-400 w-6 text-right shrink-0">{i + 1}</span>
                      <span className="text-sm text-zinc-300 flex-1 truncate">{r.label}</span>
                      <span className="text-xs text-zinc-500">{r.blob ? formatBytes(r.blob.size) : ''}</span>
                      <button
                        onClick={() => downloadFile(r)}
                        className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-md px-3 py-1 text-xs font-medium transition-colors shrink-0"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
