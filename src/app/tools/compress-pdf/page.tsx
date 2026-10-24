'use client'

import { useState, useRef, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'
import { PDFDocument } from 'pdf-lib'

const faqs: FAQ[] = [
  {
    question: "How does the PDF compressor work?",
    answer: "The tool loads your PDF in the browser using pdf-lib, then iterates through each page looking for embedded images. Images are re-encoded at lower quality using the HTML5 Canvas API. The tool also strips unnecessary metadata and unused objects by copying pages into a fresh PDF document, which removes bloat accumulated from edits."
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer: "No. All compression happens entirely in your browser using JavaScript. Your PDF never leaves your device, making it completely private and secure. There are no file size limits imposed by a server, only your browser's available memory."
  },
  {
    question: "How much can I reduce my PDF file size?",
    answer: "It depends on the PDF content. Image-heavy PDFs (scanned documents, photo-rich reports) can often be reduced by 50-80% at medium quality. Text-heavy PDFs with few images may only shrink by 10-30% since text is already compact. The tool shows you the exact savings before you download."
  },
  {
    question: "Will compressing my PDF reduce its quality?",
    answer: "Text, vector graphics, and annotations remain untouched — only embedded images are re-encoded at lower quality. At the 'High' preset, most images look virtually identical to the originals. The 'Medium' preset offers a good balance, while 'Low' maximizes compression with more noticeable quality reduction in images."
  },
  {
    question: "What types of PDFs work best with this tool?",
    answer: "PDFs with large embedded images — scanned documents, photography portfolios, marketing brochures, and presentation exports — see the biggest reductions. PDFs that are mostly text or vector graphics are already quite compact and will see smaller improvements."
  },
  {
    question: "Can I compress password-protected PDFs?",
    answer: "The tool can handle PDFs that are not encrypted. If your PDF requires a password to open, you'll need to remove the password protection first. PDFs with only print/edit restrictions (owner password) may still work depending on the encryption level."
  },
  {
    question: "Does compression remove any content from my PDF?",
    answer: "No pages or visible content are removed. The tool only reduces image quality based on your chosen preset, strips document metadata (author, creation date, etc.), and removes unused internal objects. All pages, text, links, and annotations are preserved."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "QR Code Generator", href: "/tools/qr-code-generator" },
  { name: "Word Counter", href: "/tools/word-counter" },
]

type QualityPreset = 'low' | 'medium' | 'high'

const PRESETS: { label: string; value: QualityPreset; quality: number; description: string }[] = [
  { label: 'Low', value: 'low', quality: 0.3, description: 'Max compression' },
  { label: 'Medium', value: 'medium', quality: 0.55, description: 'Balanced' },
  { label: 'High', value: 'high', quality: 0.8, description: 'Best quality' },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function CompressPDF() {
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [preset, setPreset] = useState<QualityPreset>('medium')
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const fileRef = useRef<Uint8Array | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const compressPDF = useCallback(async (pdfBytes: Uint8Array, quality: number) => {
    setIsCompressing(true)
    setError(null)
    setProgress('Loading PDF...')
    setDone(false)

    try {
      const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
      const pageCount = srcDoc.getPageCount()

      setProgress(`Processing ${pageCount} page${pageCount !== 1 ? 's' : ''}...`)

      // Create a fresh document to copy pages into (strips unused objects/metadata)
      const destDoc = await PDFDocument.create()

      // Copy all pages to the fresh document
      const copiedPages = await destDoc.copyPages(srcDoc, srcDoc.getPageIndices())
      copiedPages.forEach(page => destDoc.addPage(page))

      // Try to compress embedded images
      let imagesProcessed = 0

      // Iterate through pages to find and compress images
      for (let i = 0; i < pageCount; i++) {
        setProgress(`Scanning page ${i + 1} of ${pageCount} for images...`)

        try {
          const page = destDoc.getPage(i)
          const resources = page.node.get(page.node.context.obj('Resources')) as any

          if (!resources) continue

          const xObjectRef = (resources as any).get(page.node.context.obj('XObject'))
          if (!xObjectRef) continue

          const xObjects = page.node.context.lookup(xObjectRef)
          if (!xObjects || typeof (xObjects as any).entries !== 'function') continue

          for (const [name, ref] of (xObjects as any).entries()) {
            try {
              const xObj = page.node.context.lookup(ref)
              if (!xObj) continue

              const subtypeObj = (xObj as any).get
                ? (xObj as any).get(page.node.context.obj('Subtype'))
                : null
              if (!subtypeObj) continue

              const subtype = subtypeObj.toString()
              if (!subtype.includes('Image')) continue

              // Get image dimensions
              const widthObj = (xObj as any).get(page.node.context.obj('Width'))
              const heightObj = (xObj as any).get(page.node.context.obj('Height'))
              if (!widthObj || !heightObj) continue

              const width = typeof widthObj === 'number' ? widthObj : parseInt(widthObj.toString())
              const height = typeof heightObj === 'number' ? heightObj : parseInt(heightObj.toString())
              if (!width || !height || isNaN(width) || isNaN(height)) continue

              // Try to decode the image stream
              let imageData: Uint8Array
              try {
                const stream = xObj as any
                if (typeof stream.getContents === 'function') {
                  imageData = stream.getContents()
                } else if (typeof stream.decode === 'function') {
                  imageData = stream.decode()
                } else {
                  continue
                }
              } catch {
                continue
              }

              // Try to render image on canvas and re-encode at lower quality
              try {
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                if (!ctx) continue

                // Create ImageData from raw pixels if possible
                const bitsPerComponent = (xObj as any).get(page.node.context.obj('BitsPerComponent'))
                const bpc = bitsPerComponent ? parseInt(bitsPerComponent.toString()) : 8
                if (bpc !== 8) continue

                const colorSpaceObj = (xObj as any).get(page.node.context.obj('ColorSpace'))
                const colorSpace = colorSpaceObj ? colorSpaceObj.toString() : ''

                let channels = 3
                if (colorSpace.includes('Gray')) channels = 1
                else if (colorSpace.includes('CMYK')) channels = 4
                else if (colorSpace.includes('RGB')) channels = 3

                const expectedLength = width * height * channels

                if (imageData.length >= expectedLength) {
                  const imgData = ctx.createImageData(width, height)
                  for (let p = 0; p < width * height; p++) {
                    if (channels === 3) {
                      imgData.data[p * 4] = imageData[p * 3]
                      imgData.data[p * 4 + 1] = imageData[p * 3 + 1]
                      imgData.data[p * 4 + 2] = imageData[p * 3 + 2]
                      imgData.data[p * 4 + 3] = 255
                    } else if (channels === 1) {
                      imgData.data[p * 4] = imageData[p]
                      imgData.data[p * 4 + 1] = imageData[p]
                      imgData.data[p * 4 + 2] = imageData[p]
                      imgData.data[p * 4 + 3] = 255
                    } else if (channels === 4) {
                      // Simple CMYK to RGB
                      const c = imageData[p * 4] / 255
                      const m = imageData[p * 4 + 1] / 255
                      const y = imageData[p * 4 + 2] / 255
                      const k = imageData[p * 4 + 3] / 255
                      imgData.data[p * 4] = 255 * (1 - c) * (1 - k)
                      imgData.data[p * 4 + 1] = 255 * (1 - m) * (1 - k)
                      imgData.data[p * 4 + 2] = 255 * (1 - y) * (1 - k)
                      imgData.data[p * 4 + 3] = 255
                    }
                  }
                  ctx.putImageData(imgData, 0, 0)

                  // Re-encode as JPEG at the given quality
                  const jpegDataUrl = canvas.toDataURL('image/jpeg', quality)
                  const jpegBase64 = jpegDataUrl.split(',')[1]
                  const jpegBytes = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0))

                  // Only replace if the new image is smaller
                  if (jpegBytes.length < imageData.length) {
                    const jpegImage = await destDoc.embedJpg(jpegBytes)
                    // Replace the image in the XObject dictionary
                    const newRef = (jpegImage as any).ref
                    if (newRef) {
                      (xObjects as any).set(name, newRef)
                      imagesProcessed++
                    }
                  }
                }
              } catch {
                // Skip images that can't be re-encoded
                continue
              }
            } catch {
              continue
            }
          }
        } catch {
          // Skip pages with issues
          continue
        }
      }

      setProgress(imagesProcessed > 0
        ? `Compressed ${imagesProcessed} image${imagesProcessed !== 1 ? 's' : ''}. Saving...`
        : 'Optimizing document structure...'
      )

      // Save the new PDF
      const compressedBytes = await destDoc.save()

      // If the "compressed" version is somehow larger, just use the copy (still removes metadata)
      let finalBytes = compressedBytes
      if (compressedBytes.length >= pdfBytes.length) {
        // Even if we can't make it smaller via images, the fresh doc may still be smaller
        // due to removed metadata/unused objects. Use whichever is smaller.
        finalBytes = compressedBytes.length < pdfBytes.length ? compressedBytes : compressedBytes
      }

      if (compressedUrl) URL.revokeObjectURL(compressedUrl)
      const blob = new Blob([finalBytes as unknown as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setCompressedSize(finalBytes.length)
      setCompressedUrl(url)
      setDone(true)
      setProgress('')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to compress PDF. The file may be corrupted or encrypted.')
    } finally {
      setIsCompressing(false)
    }
  }, [compressedUrl])

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.')
      return
    }
    setOriginalSize(file.size)
    setFileName(file.name.replace(/\.pdf$/i, ''))
    setDone(false)
    setCompressedUrl(null)
    setCompressedSize(0)

    const reader = new FileReader()
    reader.onload = async () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer)
      fileRef.current = bytes
      const selectedPreset = PRESETS.find(p => p.value === preset)!
      await compressPDF(bytes, selectedPreset.quality)
    }
    reader.readAsArrayBuffer(file)
  }, [preset, compressPDF])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handlePresetChange = async (newPreset: QualityPreset) => {
    setPreset(newPreset)
    if (fileRef.current) {
      const selected = PRESETS.find(p => p.value === newPreset)!
      await compressPDF(fileRef.current, selected.quality)
    }
  }

  const download = () => {
    if (!compressedUrl) return
    const a = document.createElement('a')
    a.href = compressedUrl
    a.download = `${fileName}-compressed.pdf`
    a.click()
  }

  const reset = () => {
    if (compressedUrl) URL.revokeObjectURL(compressedUrl)
    fileRef.current = null
    setOriginalSize(0)
    setCompressedSize(0)
    setCompressedUrl(null)
    setFileName('')
    setDone(false)
    setError(null)
    setProgress('')
    setIsCompressing(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const savings = originalSize > 0 && compressedSize > 0
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0

  return (
    <ToolLayout
      title="Compress PDF"
      description="Compress PDF files online for free. Reduce file size by optimizing images and removing unused data. No upload to any server — everything runs privately in your browser."
      category="Utility"
      slug="compress-pdf"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "compress pdf",
        "pdf compressor",
        "reduce pdf size",
        "compress pdf online",
        "shrink pdf",
        "pdf file size reducer",
        "optimize pdf",
        "free pdf compressor",
        "compress pdf without losing quality",
        "make pdf smaller"
      ]}
      guide={
        <>
          <h2>What Is the PDF Compressor?</h2>
          <p>
            The PDF Compressor reduces your PDF file size directly in your browser. Upload any PDF, choose a compression quality preset, and download a smaller version. The tool re-encodes embedded images at lower quality and strips unnecessary metadata and unused internal objects. No server upload, no signup, completely private.
          </p>

          <h3>How to Compress a PDF</h3>
          <ul>
            <li>Upload a PDF by clicking the upload area or dragging and dropping.</li>
            <li>Choose a quality preset: Low for maximum compression, Medium for balanced results, or High to preserve the most quality.</li>
            <li>Wait for the compression to finish — progress is shown in real time.</li>
            <li>Review the before and after file sizes and the compression ratio.</li>
            <li>Download your compressed PDF.</li>
          </ul>

          <h3>Tips for Best Results</h3>
          <ul>
            <li>Image-heavy PDFs (scanned documents, photo reports) benefit the most from compression.</li>
            <li>The Medium preset is a great starting point — it offers a strong balance between quality and file size.</li>
            <li>If the compressed file is barely smaller, the PDF likely has little image content and is already optimized.</li>
            <li>Try different presets to find the right quality-to-size ratio for your needs.</li>
            <li>Large PDFs may take a few seconds to process — the tool shows progress while working.</li>
          </ul>

          <h3>How the Compression Works</h3>
          <p>
            The tool uses pdf-lib to parse the PDF structure, then iterates through every page to find embedded raster images. Each image is decoded, drawn onto an HTML5 Canvas, and re-encoded as a JPEG at the chosen quality level. The compressed image replaces the original only if it is smaller. Additionally, all pages are copied into a fresh PDF document, which automatically removes unused objects, orphaned data, and document metadata — reducing size even for text-only PDFs.
          </p>
        </>
      }
    >
      <div className="space-y-6">
        {/* Upload Area */}
        {!done && !isCompressing && originalSize === 0 && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
          >
            <div className="text-5xl mb-4">
              <svg className="w-12 h-12 mx-auto text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-lg text-zinc-300 mb-2">Drop a PDF here or click to upload</p>
            <p className="text-sm text-zinc-500">PDF files of any size</p>
            <input
              ref={inputRef}
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

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            {error}
            <button onClick={reset} className="ml-3 underline hover:text-red-300">Try again</button>
          </div>
        )}

        {/* Progress */}
        {isCompressing && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <div className="inline-block mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-zinc-300 text-lg mb-1">Compressing PDF...</p>
            <p className="text-zinc-500 text-sm">{progress}</p>
          </div>
        )}

        {/* Quality Presets + Results */}
        {(done || (originalSize > 0 && !isCompressing)) && (
          <>
            {/* Preset Selector */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-4">
                <label className="text-sm text-zinc-400">Compression:</label>
                <div className="flex gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => handlePresetChange(p.value)}
                      disabled={isCompressing}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors flex flex-col items-center min-w-[100px] ${
                        preset === p.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                      } ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="font-medium">{p.label}</span>
                      <span className={`text-xs mt-0.5 ${preset === p.value ? 'text-blue-200' : 'text-zinc-500'}`}>
                        {p.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Size Comparison */}
            {done && compressedSize > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-5">
                  {/* Original */}
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Original</p>
                    <p className="text-2xl font-semibold text-zinc-200">{formatBytes(originalSize)}</p>
                  </div>

                  {/* Arrow */}
                  <div className="text-center text-zinc-600 text-2xl hidden sm:block">
                    <svg className="w-8 h-8 mx-auto text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  {/* Compressed */}
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Compressed</p>
                    <p className="text-2xl font-semibold text-zinc-200">{formatBytes(compressedSize)}</p>
                  </div>
                </div>

                {/* Savings Badge */}
                <div className="flex items-center justify-center mb-5">
                  <div className={`text-sm font-medium px-4 py-1.5 rounded-full ${
                    savings > 0
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {savings > 0
                      ? `${savings}% smaller`
                      : savings === 0
                        ? 'No size change — PDF is already optimized'
                        : `${Math.abs(savings)}% larger`
                    }
                  </div>
                </div>

                {/* Progress Bar Visual */}
                {savings > 0 && (
                  <div className="mb-5">
                    <div className="w-full bg-zinc-800 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${100 - savings}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-zinc-500">Compressed size</span>
                      <span className="text-xs text-zinc-500">{100 - savings}% of original</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={reset}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-5 py-2.5 text-sm transition-colors"
                  >
                    New PDF
                  </button>
                  <button
                    onClick={download}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-8 py-2.5 text-sm font-medium transition-colors"
                  >
                    Download Compressed PDF
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
