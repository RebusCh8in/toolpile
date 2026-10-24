'use client'

import { useState, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "How do I convert a PDF to Word for free?", answer: "Upload your PDF to this tool and click Convert. It extracts all text content and generates a Word-compatible .doc file you can download and edit in Microsoft Word, Google Docs, or LibreOffice." },
  { question: "Does this preserve PDF formatting?", answer: "The tool extracts text content with basic paragraph structure. Complex layouts, tables, and images are converted to their text equivalents. For best results with heavily formatted PDFs, consider using desktop software." },
  { question: "Is my PDF uploaded to a server?", answer: "No. The entire conversion happens in your browser using PDF.js. Your document never leaves your device — nothing is uploaded, nothing is stored." },
  { question: "Can I convert scanned PDFs?", answer: "This tool works with text-based PDFs where text was typed or generated digitally. For scanned PDFs (which are images), you'll need OCR first — try our Image to Text tool to extract text from scanned pages." },
  { question: "What's the maximum PDF size?", answer: "There's no hard limit since processing happens locally, but very large PDFs (100+ pages) may take longer and use more memory. For best performance, split large PDFs first using our PDF Splitter." },
  { question: "Can I convert password-protected PDFs?", answer: "No. Password-protected PDFs must be unlocked before conversion. Remove the password using the original PDF software or your PDF viewer's security settings." },
]

const relatedTools: RelatedTool[] = [
  { name: "Merge PDF", href: "/tools/merge-pdf" },
  { name: "Compress PDF", href: "/tools/compress-pdf" },
  { name: "Split PDF", href: "/tools/split-pdf" },
]

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<'upload' | 'processing' | 'done'>('upload')
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [previewText, setPreviewText] = useState('')
  const [docBlob, setDocBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')

  const handleUpload = useCallback((f: File) => {
    setFile(f)
    setError('')
    setDocBlob(null)
    setPreviewText('')
  }, [])

  const convert = async () => {
    if (!file) return
    setStep('processing')
    setProgress(0)
    setError('')

    try {
      setStatusMsg('Loading PDF engine...')

      // Load pdf.js from CDN
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjsLib = await import(/* webpackIgnore: true */ 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs' as string) as any
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs'

      setStatusMsg('Reading PDF...')
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const totalPages = pdf.numPages
      setPageCount(totalPages)

      const pages: string[] = []

      for (let i = 1; i <= totalPages; i++) {
        setStatusMsg(`Extracting page ${i} of ${totalPages}...`)
        setProgress(Math.round((i / totalPages) * 90))

        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()

        let lastY: number | null = null
        let pageText = ''

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const item of textContent.items as any[]) {
          if (!item.str && item.str !== '') continue
          const y = Math.round(item.transform?.[5] || 0)
          if (lastY !== null && Math.abs(y - lastY) > 2) {
            pageText += '\n'
          }
          pageText += item.str
          lastY = y
        }

        pages.push(pageText.trim())
      }

      setStatusMsg('Generating Word document...')
      setProgress(95)

      const fullText = pages.join('\n\n')
      setPreviewText(fullText)

      // Generate .doc as HTML (Word opens HTML .doc files natively)
      const htmlContent = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>${esc(file.name.replace(/\.pdf$/i, ''))}</title>
<style>
body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; margin: 1in; }
p { margin: 0 0 6pt 0; }
.page-break { page-break-after: always; }
h1 { font-size: 16pt; margin: 12pt 0 6pt; }
</style></head><body>
${pages.map((p, i) => {
  const paragraphs = p.split('\n').filter(Boolean).map(line => `<p>${esc(line)}</p>`).join('\n')
  return paragraphs + (i < pages.length - 1 ? '\n<div class="page-break"></div>' : '')
}).join('\n')}
</body></html>`

      const blob = new Blob([htmlContent], { type: 'application/msword' })
      setDocBlob(blob)
      setProgress(100)
      setStep('done')
    } catch (err) {
      console.error(err)
      setError(`Conversion failed: ${err instanceof Error ? err.message : String(err)}`)
      setStep('upload')
    }
  }

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const download = () => {
    if (!docBlob || !file) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(docBlob)
    a.download = file.name.replace(/\.pdf$/i, '') + '.doc'
    a.click()
  }

  const btn = "px-4 py-2 rounded-lg text-sm font-medium transition-colors"

  return (
    <ToolLayout title="PDF to Word Converter" description="Convert PDF to Word document for free. Extract text from any PDF and download as an editable .doc file. No upload, no signup — runs in your browser." category="Productivity" slug="pdf-to-word" faqs={faqs} relatedTools={relatedTools} keywords={["pdf to word", "pdf to doc", "convert pdf to word", "pdf converter", "pdf to word online free", "pdf to docx"]} guide={
      <div className="space-y-4 text-sm text-zinc-300">
        <h2 className="text-lg font-semibold text-zinc-100">How to use:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Upload your PDF file.</li>
          <li>Click &quot;Convert to Word&quot; to extract text.</li>
          <li>Preview the extracted content.</li>
          <li>Download as .doc file (opens in Word, Google Docs, LibreOffice).</li>
        </ol>
      </div>
    }>
      {step === 'upload' && (
        <div className="space-y-4">
          <div onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') handleUpload(f) }} onDragOver={e => e.preventDefault()} onClick={() => document.getElementById('pdf-in')?.click()} className="border-2 border-dashed border-zinc-600 rounded-xl p-16 text-center cursor-pointer hover:border-zinc-500 transition-colors">
            <div className="text-4xl mb-4">📑</div>
            <p className="text-zinc-300 font-medium">Drop a PDF here or click to upload</p>
            <p className="text-zinc-500 text-sm mt-1">PDF files only — any size</p>
            <input id="pdf-in" type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </div>
          {file && (
            <div className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <div>
                <p className="text-sm text-zinc-200">{file.name}</p>
                <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={convert} className={`${btn} bg-blue-600 hover:bg-blue-500 text-white`}>Convert to Word</button>
            </div>
          )}
          {error && <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-300">{error}</div>}
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-zinc-100 mb-2">Converting PDF</h3>
          <p className="text-zinc-400 mb-6">{statusMsg}</p>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-zinc-400 mb-1"><span>Progress</span><span>{progress}%</span></div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>
      )}

      {step === 'done' && file && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-1">Conversion Complete</h3>
            <p className="text-zinc-400 text-sm">{pageCount} page{pageCount !== 1 ? 's' : ''} extracted</p>
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={download} className={`${btn} bg-green-600 hover:bg-green-500 text-white px-6 py-3`}>Download .doc</button>
            <button onClick={() => { setStep('upload'); setFile(null); setDocBlob(null); setPreviewText('') }} className={`${btn} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 py-3`}>New PDF</button>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">Text Preview</p>
            <textarea readOnly value={previewText} className="w-full h-64 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 resize-none" />
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
