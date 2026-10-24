'use client'

import { useState, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const faqs: FAQ[] = [
  { question: "Why convert an image to Base64?", answer: "Base64 encoding lets you embed images directly in HTML, CSS, or JSON without separate file requests. Useful for small icons, email templates, and reducing HTTP requests." },
  { question: "Is my image uploaded to a server?", answer: "No. The conversion happens entirely in your browser using the FileReader API. Your image never leaves your device." },
  { question: "Is there a size limit?", answer: "There's no hard limit, but Base64 increases file size by ~33%. It's best for small images (under 50KB). Large images should be served as files instead." },
]

const relatedTools: RelatedTool[] = [
  { name: "Base64 Encoder", href: "/tools/base64-encoder" },
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "Image Format Converter", href: "/tools/convert" },
]

export default function ImageToBase64() {
  const [base64, setBase64] = useState('')
  const [dataUri, setDataUri] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const processFile = useCallback((file: File) => {
    setFileName(file.name)
    setFileSize(file.size)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setDataUri(result)
      setBase64(result.split(',')[1])
      setPreview(result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) processFile(file)
  }, [processFile])

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const cssOutput = preview ? `background-image: url(${dataUri});` : ''
  const htmlOutput = preview ? `<img src="${dataUri}" alt="${fileName}" />` : ''

  return (
    <ToolLayout
      title="Image to Base64 Converter"
      description="Convert images to Base64 encoding for embedding in HTML, CSS, or JSON. Free, no upload — runs in your browser."
      category="Developer"
      slug="image-to-base64"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["image to base64", "base64 image encoder", "convert image to base64", "image base64 converter", "base64 encode image", "image to data uri"]}
      guide={<><h2>Image to Base64 Converter</h2><p>Upload an image to get its Base64 encoding. Copy as raw Base64, data URI, CSS background, or HTML img tag.</p></>}
    >
      <div className="space-y-4">
        {!preview && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('b64-upload')?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
          >
            <div className="text-4xl mb-3">🖼️</div>
            <p className="text-zinc-300 mb-1">Drop an image or click to upload</p>
            <p className="text-sm text-zinc-500">PNG, JPG, SVG, GIF, WebP</p>
            <input id="b64-upload" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
          </div>
        )}

        {preview && (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm">
                  <span className="text-zinc-500">File: </span><span className="text-zinc-300">{fileName}</span>
                  <span className="text-zinc-700 mx-2">|</span>
                  <span className="text-zinc-500">Size: </span><span className="text-zinc-300">{formatBytes(fileSize)}</span>
                  <span className="text-zinc-700 mx-2">|</span>
                  <span className="text-zinc-500">Base64: </span><span className="text-zinc-300">{formatBytes(base64.length)}</span>
                </div>
                <button onClick={() => { setPreview(null); setBase64(''); setDataUri('') }} className="text-sm text-zinc-500 hover:text-zinc-300">New Image</button>
              </div>
              <div className="bg-zinc-950 rounded-lg p-4 flex justify-center" style={{ backgroundImage: 'repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%)', backgroundSize: '16px 16px' }}>
                <img src={preview} alt="Preview" className="max-w-full max-h-48 object-contain" />
              </div>
            </div>

            {[
              { label: 'Base64 (raw)', value: base64 },
              { label: 'Data URI', value: dataUri },
              { label: 'CSS', value: cssOutput },
              { label: 'HTML', value: htmlOutput },
            ].map(item => (
              <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{item.label}</span>
                  <button onClick={() => copy(item.value, item.label)} className="text-xs text-zinc-600 hover:text-blue-400 transition-colors">
                    {copied === item.label ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-zinc-950 rounded-lg p-3 text-xs text-zinc-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-24">{item.value.length > 500 ? item.value.slice(0, 500) + '...' : item.value}</pre>
              </div>
            ))}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
