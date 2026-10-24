'use client'

import { useState, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  { question: "What is OCR?", answer: "OCR (Optical Character Recognition) is technology that converts images of text into editable, searchable text. It works on screenshots, photos of documents, scanned pages, and any image containing text." },
  { question: "What languages are supported?", answer: "English, Spanish, French, German, Portuguese, Chinese (Simplified), and Japanese. Select your language before processing for best results." },
  { question: "Is the text extraction accurate?", answer: "Accuracy depends on image quality. Clear, high-contrast text with good resolution gives the best results (95%+ accuracy). Handwritten text, very small fonts, or low-quality images may have lower accuracy." },
  { question: "Is my image uploaded to a server?", answer: "No. The OCR engine (Tesseract.js) runs entirely in your browser. Your images never leave your device. The language model is downloaded once and cached." },
  { question: "Can I extract text from a PDF?", answer: "This tool works with images. For PDFs, first take a screenshot of the page or use our PDF to Word converter to extract text directly from PDF files." },
  { question: "Why is the first extraction slow?", answer: "The first time you use a language, the OCR model (~5-15 MB) needs to download. After that it's cached in your browser and subsequent extractions are faster." },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "PDF to Word Converter", href: "/tools/pdf-to-word" },
  { name: "Text Case Converter", href: "/tools/text-case-converter" },
]

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'por', label: 'Portuguese' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
  { code: 'jpn', label: 'Japanese' },
]

export default function ImageToText() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [text, setText] = useState('')
  const [lang, setLang] = useState('eng')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = useCallback((f: File) => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setText('')
    setError('')
  }, [preview])

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imgType = item.types.find(t => t.startsWith('image/'))
        if (imgType) {
          const blob = await item.getType(imgType)
          const f = new File([blob], 'pasted-image.png', { type: imgType })
          handleUpload(f)
          return
        }
      }
    } catch { /* ignore */ }
  }, [handleUpload])

  const extract = async () => {
    if (!file) return
    setProcessing(true)
    setProgress(0)
    setError('')
    setText('')

    try {
      setStatusMsg('Loading OCR engine...')

      // Dynamic import of Tesseract.js
      const Tesseract = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js' as string)

      setStatusMsg('Recognizing text...')
      const result = await Tesseract.recognize(preview, lang, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
            setStatusMsg(`Recognizing text... ${Math.round(m.progress * 100)}%`)
          } else {
            setStatusMsg(m.status)
          }
        },
      })

      setText(result.data.text)
      setProgress(100)
    } catch (err) {
      // Fallback: load via script tag if ESM import fails
      try {
        setStatusMsg('Loading OCR engine (fallback)...')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).Tesseract) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
            s.onload = () => resolve()
            s.onerror = () => reject(new Error('Failed to load OCR engine'))
            document.head.appendChild(s)
          })
        }

        setStatusMsg('Recognizing text...')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Tesseract = (window as any).Tesseract
        const result = await Tesseract.recognize(preview, lang, {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100))
              setStatusMsg(`Recognizing text... ${Math.round(m.progress * 100)}%`)
            } else {
              setStatusMsg(m.status)
            }
          },
        })

        setText(result.data.text)
        setProgress(100)
      } catch (err2) {
        console.error(err, err2)
        setError(`OCR failed: ${err2 instanceof Error ? err2.message : String(err2)}`)
      }
    } finally {
      setProcessing(false)
    }
  }

  const copyText = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'extracted-text.txt'
    a.click()
  }

  const btn = "px-4 py-2 rounded-lg text-sm font-medium transition-colors"

  return (
    <ToolLayout title="Image to Text (OCR)" description="Extract text from images for free using OCR. Upload a screenshot, photo, or scanned document and get editable text instantly. No upload, no signup." category="Productivity" slug="image-to-text" faqs={faqs} relatedTools={relatedTools} keywords={["image to text", "ocr online", "extract text from image", "photo to text", "screenshot to text", "ocr converter"]} guide={
      <div className="space-y-4 text-sm text-zinc-300">
        <h2 className="text-lg font-semibold text-zinc-100">How to use:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Upload an image or paste from clipboard.</li>
          <li>Select the text language.</li>
          <li>Click &quot;Extract Text&quot; and wait for processing.</li>
          <li>Copy or download the extracted text.</li>
        </ol>
      </div>
    }>
      {!file ? (
        <div className="space-y-4">
          <div onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleUpload(f) }} onDragOver={e => e.preventDefault()} onClick={() => document.getElementById('ocr-in')?.click()} className="border-2 border-dashed border-zinc-600 rounded-xl p-16 text-center cursor-pointer hover:border-zinc-500 transition-colors">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-zinc-300 font-medium">Drop an image here or click to upload</p>
            <p className="text-zinc-500 text-sm mt-1">PNG, JPG, WebP, BMP — screenshots, photos, scans</p>
            <input id="ocr-in" type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </div>
          <button onClick={handlePaste} className={`${btn} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 w-full`}>📋 Paste from Clipboard</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <select value={lang} onChange={e => setLang(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <button onClick={extract} disabled={processing} className={`${btn} bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50`}>
              {processing ? 'Extracting...' : 'Extract Text'}
            </button>
            <button onClick={() => { setFile(null); setPreview(''); setText('') }} className={`${btn} bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}>New Image</button>
          </div>

          {processing && (
            <div>
              <p className="text-sm text-zinc-400 mb-1">{statusMsg}</p>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          {error && <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-300">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-2">Source Image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Source" className="w-full rounded-lg border border-zinc-700" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">Extracted Text</p>
                {text && (
                  <div className="flex gap-2">
                    <button onClick={copyText} className="text-xs text-blue-400 hover:text-blue-300">{copied ? 'Copied!' : 'Copy'}</button>
                    <button onClick={downloadTxt} className="text-xs text-blue-400 hover:text-blue-300">Download .txt</button>
                  </div>
                )}
              </div>
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Extracted text will appear here..." className="w-full h-80 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
