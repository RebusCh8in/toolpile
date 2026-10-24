'use client'

import { useState, useRef, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'
import jsPDF from 'jspdf'

const faqs: FAQ[] = [
  {
    question: "How does the PNG to PDF converter work?",
    answer: "The tool reads your PNG images directly in your browser and uses the jsPDF library to generate a PDF document client-side. Each image is placed on its own page with your chosen page size, orientation, margins, and fit settings. No files are uploaded to any server — everything runs locally in your browser."
  },
  {
    question: "Can I combine multiple PNG images into one PDF?",
    answer: "Yes! You can upload as many PNG images as you like and they will all be combined into a single PDF document. Each image gets its own page. You can reorder the images using the up/down buttons before converting to arrange pages in your preferred order."
  },
  {
    question: "Is my data private? Are images uploaded to a server?",
    answer: "Your images never leave your device. All processing happens entirely in your browser using JavaScript. No images are uploaded, no data is sent to any server, and nothing is stored. This makes it completely safe for sensitive or confidential images."
  },
  {
    question: "What page sizes are supported?",
    answer: "The converter supports A4, Letter, Legal, A3, and custom page sizes. You can also choose between portrait and landscape orientation, and set margins from none to large. The custom size option lets you specify exact width and height in millimeters."
  },
  {
    question: "How does the image fit option work?",
    answer: "There are three fit modes: 'Fit to page' scales the image to fit within the page margins while preserving its aspect ratio. 'Stretch to fill' stretches the image to fill the entire printable area (may distort). 'Original size' places the image at its native resolution, centered on the page."
  },
  {
    question: "What happens to transparent areas in my PNG?",
    answer: "By default, transparent areas are filled with a white background for PDF compatibility. You can toggle the 'White background' option off if you want to preserve transparency, though note that PDF transparency support varies across viewers."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "QR Code Generator", href: "/tools/qr-code-generator" },
  { name: "Image Color Picker", href: "/tools/image-color-picker" },
]

type PageSize = 'a4' | 'letter' | 'legal' | 'a3' | 'custom'
type Orientation = 'portrait' | 'landscape'
type MarginSize = 'none' | 'small' | 'medium' | 'large'
type ImageFit = 'fit' | 'stretch' | 'original'

interface ImageEntry {
  id: string
  file: File
  url: string
  width: number
  height: number
}

const PAGE_SIZES: { label: string; value: PageSize }[] = [
  { label: 'A4', value: 'a4' },
  { label: 'Letter', value: 'letter' },
  { label: 'Legal', value: 'legal' },
  { label: 'A3', value: 'a3' },
  { label: 'Custom', value: 'custom' },
]

const PAGE_DIMENSIONS: Record<string, [number, number]> = {
  a4: [210, 297],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
  a3: [297, 420],
}

const MARGINS: { label: string; value: MarginSize; mm: number }[] = [
  { label: 'None', value: 'none', mm: 0 },
  { label: 'Small', value: 'small', mm: 10 },
  { label: 'Medium', value: 'medium', mm: 20 },
  { label: 'Large', value: 'large', mm: 30 },
]

const FIT_OPTIONS: { label: string; value: ImageFit }[] = [
  { label: 'Fit to page', value: 'fit' },
  { label: 'Stretch to fill', value: 'stretch' },
  { label: 'Original size', value: 'original' },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function PngToPdf() {
  const [images, setImages] = useState<ImageEntry[]>([])
  const [pageSize, setPageSize] = useState<PageSize>('a4')
  const [customWidth, setCustomWidth] = useState(210)
  const [customHeight, setCustomHeight] = useState(297)
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [marginSize, setMarginSize] = useState<MarginSize>('medium')
  const [imageFit, setImageFit] = useState<ImageFit>('fit')
  const [whiteBackground, setWhiteBackground] = useState(true)
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadImage = (file: File): Promise<ImageEntry> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        resolve({
          id: crypto.randomUUID(),
          file,
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = url
    })
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const pngFiles = Array.from(files).filter(
      f => f.type === 'image/png' || f.name.toLowerCase().endsWith('.png')
    )
    if (pngFiles.length === 0) return

    const entries = await Promise.all(pngFiles.map(f => loadImage(f)))
    setImages(prev => [...prev, ...entries])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeImage = (id: string) => {
    setImages(prev => {
      const entry = prev.find(e => e.id === id)
      if (entry) URL.revokeObjectURL(entry.url)
      return prev.filter(e => e.id !== id)
    })
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages(prev => {
      const newArr = [...prev]
      const target = index + direction
      if (target < 0 || target >= newArr.length) return prev
      ;[newArr[index], newArr[target]] = [newArr[target], newArr[index]]
      return newArr
    })
  }

  const clearAll = () => {
    images.forEach(e => URL.revokeObjectURL(e.url))
    setImages([])
    setProgress(0)
  }

  const getPageDimensions = (): [number, number] => {
    let [w, h] = pageSize === 'custom'
      ? [customWidth, customHeight]
      : PAGE_DIMENSIONS[pageSize]

    if (orientation === 'landscape') {
      ;[w, h] = [h, w]
    }
    return [w, h]
  }

  const convertToPdf = async () => {
    if (images.length === 0) return
    setConverting(true)
    setProgress(0)

    try {
      const [pageW, pageH] = getPageDimensions()
      const margin = MARGINS.find(m => m.value === marginSize)!.mm

      const pdf = new jsPDF({
        orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: pageSize === 'custom' ? [pageW, pageH] : pageSize,
      })

      for (let i = 0; i < images.length; i++) {
        if (i > 0) {
          pdf.addPage()
        }

        setProgress(Math.round(((i) / images.length) * 100))

        const entry = images[i]

        // Load image data through canvas to get base64
        const imgData = await new Promise<string>((resolve) => {
          const canvas = document.createElement('canvas')
          const img = new Image()
          img.onload = () => {
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext('2d')!
            if (whiteBackground) {
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
          }
          img.src = entry.url
        })

        const printW = pageW - margin * 2
        const printH = pageH - margin * 2
        const imgAspect = entry.width / entry.height

        let drawX = margin
        let drawY = margin
        let drawW = printW
        let drawH = printH

        if (imageFit === 'fit') {
          const pageAspect = printW / printH
          if (imgAspect > pageAspect) {
            drawW = printW
            drawH = printW / imgAspect
          } else {
            drawH = printH
            drawW = printH * imgAspect
          }
          drawX = margin + (printW - drawW) / 2
          drawY = margin + (printH - drawH) / 2
        } else if (imageFit === 'original') {
          // Convert pixels to mm (assume 96 DPI)
          const pxToMm = 25.4 / 96
          drawW = entry.width * pxToMm
          drawH = entry.height * pxToMm
          drawX = margin + (printW - drawW) / 2
          drawY = margin + (printH - drawH) / 2
        }
        // 'stretch' uses full printable area (drawW/drawH already set)

        pdf.addImage(imgData, 'PNG', drawX, drawY, drawW, drawH)
      }

      setProgress(100)

      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = images.length === 1
        ? images[0].file.name.replace(/\.png$/i, '') + '.pdf'
        : 'converted-images.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF conversion failed:', err)
    } finally {
      setConverting(false)
    }
  }

  return (
    <ToolLayout
      title="PNG to PDF Converter"
      description="Convert PNG images to PDF for free. Combine multiple PNGs into a single PDF with custom page size, orientation, and margins. Everything runs in your browser — no uploads."
      category="Utility"
      slug="png-to-pdf"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "png to pdf",
        "png to pdf converter",
        "convert png to pdf",
        "png to pdf online",
        "combine png to pdf",
        "merge png to pdf",
        "image to pdf",
        "free png to pdf converter",
        "png to pdf no upload",
        "multiple png to pdf"
      ]}
      guide={
        <>
          <h2>What Is the PNG to PDF Converter?</h2>
          <p>
            This free tool converts one or more PNG images into a PDF document directly in your browser. No files are uploaded to any server. Choose your page size, orientation, margins, and how images are fitted to each page, then download the resulting PDF instantly.
          </p>

          <h3>How to Convert PNG to PDF</h3>
          <ul>
            <li>Upload one or more PNG images by clicking the upload area or dragging and dropping.</li>
            <li>Reorder images using the up/down arrows to arrange PDF pages.</li>
            <li>Choose your page size (A4, Letter, Legal, A3, or custom dimensions).</li>
            <li>Select portrait or landscape orientation.</li>
            <li>Set margins and choose how images should fit on the page.</li>
            <li>Click "Convert to PDF" and download your file.</li>
          </ul>

          <h3>Tips for Best Results</h3>
          <ul>
            <li>Use "Fit to page" for most cases — it preserves your image aspect ratio while maximizing size.</li>
            <li>"Stretch to fill" is useful for full-bleed images but may distort non-matching aspect ratios.</li>
            <li>"Original size" is ideal for screenshots or precise-dimension images.</li>
            <li>Enable the white background option if your PNG has transparency and you want a clean print.</li>
            <li>Use custom page size when your images have unusual dimensions.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
        >
          <div className="text-5xl mb-4">📄</div>
          <p className="text-lg text-zinc-300 mb-2">
            {images.length === 0
              ? 'Drop PNG images here or click to upload'
              : 'Drop more PNGs to add them'}
          </p>
          <p className="text-sm text-zinc-500">PNG files only. Multiple files supported.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,.png"
            multiple
            className="hidden"
            onChange={e => {
              if (e.target.files) handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>

        {/* Image Thumbnails */}
        {images.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-300">
                {images.length} image{images.length !== 1 ? 's' : ''} selected
              </h3>
              <button
                onClick={clearAll}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {images.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-2"
                >
                  <span className="text-xs text-zinc-500 w-6 text-center font-mono">
                    {index + 1}
                  </span>
                  <div className="w-12 h-12 rounded overflow-hidden bg-zinc-950 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={entry.url}
                      alt={entry.file.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">{entry.file.name}</p>
                    <p className="text-xs text-zinc-500">
                      {entry.width} x {entry.height} px &middot; {formatBytes(entry.file.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveImage(index, -1) }}
                      disabled={index === 0}
                      className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveImage(index, 1) }}
                      disabled={index === images.length - 1}
                      className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(entry.id) }}
                      className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-700 transition-colors ml-1"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        {images.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-5">
            {/* Page Size */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Page Size</label>
              <div className="flex flex-wrap gap-2">
                {PAGE_SIZES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setPageSize(s.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      pageSize === s.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {pageSize === 'custom' && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-500">W (mm)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={e => setCustomWidth(Number(e.target.value))}
                      min={50}
                      max={1000}
                      className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <span className="text-zinc-600">x</span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-500">H (mm)</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={e => setCustomHeight(Number(e.target.value))}
                      min={50}
                      max={1000}
                      className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Orientation */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Orientation</label>
              <div className="flex gap-2">
                {(['portrait', 'landscape'] as Orientation[]).map(o => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors capitalize ${
                      orientation === o
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Margins */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Margins</label>
              <div className="flex flex-wrap gap-2">
                {MARGINS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMarginSize(m.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      marginSize === m.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {m.label}{m.mm > 0 ? ` (${m.mm}mm)` : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Fit */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Image Fit</label>
              <div className="flex flex-wrap gap-2">
                {FIT_OPTIONS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setImageFit(f.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      imageFit === f.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* White Background Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <div>
                <p className="text-sm text-zinc-300">White background</p>
                <p className="text-xs text-zinc-500">Fill transparent areas with white</p>
              </div>
              <button
                onClick={() => setWhiteBackground(!whiteBackground)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  whiteBackground ? 'bg-blue-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    whiteBackground ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Convert Button + Progress */}
        {images.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={convertToPdf}
              disabled={converting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 text-sm font-medium transition-colors"
            >
              {converting ? 'Converting...' : `Convert ${images.length} image${images.length !== 1 ? 's' : ''} to PDF`}
            </button>

            {converting && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Converting...</span>
                  <span className="text-sm text-zinc-300 font-mono">{progress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
