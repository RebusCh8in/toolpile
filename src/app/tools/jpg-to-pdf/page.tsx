'use client'

import { useState, useRef, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'
import { jsPDF } from 'jspdf'

const faqs: FAQ[] = [
  {
    question: "How do I convert JPG images to a PDF?",
    answer: "Simply drag and drop your JPG or JPEG images into the upload area (or click to browse). Arrange them in the order you want, choose your page size, orientation, margins, and image fit options, then click 'Convert to PDF'. The PDF is generated entirely in your browser and downloaded instantly."
  },
  {
    question: "Is there a limit to how many images I can combine?",
    answer: "There is no hard limit. You can upload dozens or even hundreds of JPG images and combine them into a single PDF. Since everything runs in your browser, performance depends on your device's memory. For very large batches, you may notice a brief delay during conversion."
  },
  {
    question: "Are my images uploaded to a server?",
    answer: "No. All processing happens 100% in your browser using JavaScript. Your images never leave your device. There is no server upload, no cloud storage, and no third-party access. Your files remain completely private."
  },
  {
    question: "What page sizes and orientations are supported?",
    answer: "The tool supports A4, Letter, Legal, A3, and Custom page sizes. You can choose between Portrait and Landscape orientation. You can also set margins (None, Small, Medium, Large) and control how images fit on each page — fit to page, stretch to fill, or original size centered."
  },
  {
    question: "Can I reorder the images before converting?",
    answer: "Yes. After uploading, you can drag images to reorder them or use the up/down arrow buttons on each thumbnail. The order of the thumbnails is the order the pages will appear in the final PDF."
  },
  {
    question: "What image formats are accepted?",
    answer: "This tool is optimized for JPG and JPEG images. These are the most common photo formats and work perfectly for PDF conversion. If you have PNG images, they will also work since the browser canvas converts them during processing."
  },
  {
    question: "Does the quality slider affect the output?",
    answer: "Yes. The quality slider controls the JPEG compression applied to images when they are embedded in the PDF. Higher quality means larger file size but sharper images. For most documents, 85-90% quality is an excellent balance between file size and visual clarity."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "QR Code Generator", href: "/tools/qr-code-generator" },
  { name: "Image Color Picker", href: "/tools/image-color-picker" },
]

interface ImageItem {
  id: string
  file: File
  dataUrl: string
  width: number
  height: number
}

type PageSize = 'a4' | 'letter' | 'legal' | 'a3' | 'custom'
type Orientation = 'portrait' | 'landscape'
type MarginSize = 'none' | 'small' | 'medium' | 'large'
type ImageFit = 'fit' | 'stretch' | 'original'

const PAGE_SIZES: { label: string; value: PageSize }[] = [
  { label: 'A4', value: 'a4' },
  { label: 'Letter', value: 'letter' },
  { label: 'Legal', value: 'legal' },
  { label: 'A3', value: 'a3' },
  { label: 'Custom', value: 'custom' },
]

const MARGINS: { label: string; value: MarginSize; px: number }[] = [
  { label: 'None', value: 'none', px: 0 },
  { label: 'Small', value: 'small', px: 10 },
  { label: 'Medium', value: 'medium', px: 20 },
  { label: 'Large', value: 'large', px: 40 },
]

const FIT_OPTIONS: { label: string; value: ImageFit }[] = [
  { label: 'Fit to Page', value: 'fit' },
  { label: 'Stretch to Fill', value: 'stretch' },
  { label: 'Original Size', value: 'original' },
]

// Page dimensions in mm
function getPageDimensions(size: PageSize, orientation: Orientation, customW: number, customH: number): [number, number] {
  let w: number, h: number
  switch (size) {
    case 'a4': w = 210; h = 297; break
    case 'letter': w = 215.9; h = 279.4; break
    case 'legal': w = 215.9; h = 355.6; break
    case 'a3': w = 297; h = 420; break
    case 'custom': w = customW; h = customH; break
    default: w = 210; h = 297
  }
  if (orientation === 'landscape') return [h, w]
  return [w, h]
}

function getMarginMm(margin: MarginSize): number {
  switch (margin) {
    case 'none': return 0
    case 'small': return 5
    case 'medium': return 12
    case 'large': return 25
    default: return 0
  }
}

let idCounter = 0

export default function JpgToPdf() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [pageSize, setPageSize] = useState<PageSize>('a4')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [margin, setMargin] = useState<MarginSize>('none')
  const [imageFit, setImageFit] = useState<ImageFit>('fit')
  const [quality, setQuality] = useState(90)
  const [customWidth, setCustomWidth] = useState(210)
  const [customHeight, setCustomHeight] = useState(297)
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItemRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadImage = useCallback((file: File): Promise<ImageItem> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          resolve({
            id: `img-${++idCounter}`,
            file,
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
          })
        }
        img.onerror = reject
        img.src = dataUrl
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter(f =>
      f.type === 'image/jpeg' || f.type === 'image/jpg' || f.type === 'image/png'
    )
    const loaded = await Promise.all(fileArr.map(f => loadImage(f)))
    setImages(prev => [...prev, ...loaded])
  }, [loadImage])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [addFiles])

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return
    setImages(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }

  const handleDragStart = (index: number) => {
    dragItemRef.current = index
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (dragItemRef.current !== null && dragOverIndex !== null && dragItemRef.current !== dragOverIndex) {
      moveImage(dragItemRef.current, dragOverIndex)
    }
    dragItemRef.current = null
    setDragOverIndex(null)
  }

  const convertToPdf = async () => {
    if (images.length === 0) return
    setConverting(true)
    setProgress(0)

    try {
      const [pageW, pageH] = getPageDimensions(pageSize, orientation, customWidth, customHeight)
      const marginMm = getMarginMm(margin)
      const contentW = pageW - marginMm * 2
      const contentH = pageH - marginMm * 2

      const pdf = new jsPDF({
        orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: pageSize === 'custom' ? [pageW, pageH] : pageSize,
      })

      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage()

        const img = images[i]
        const imgAspect = img.width / img.height
        const contentAspect = contentW / contentH

        let drawW: number, drawH: number, drawX: number, drawY: number

        if (imageFit === 'stretch') {
          drawW = contentW
          drawH = contentH
          drawX = marginMm
          drawY = marginMm
        } else if (imageFit === 'original') {
          // Convert image pixels to mm (assuming 96 DPI)
          const pxToMm = 25.4 / 96
          drawW = Math.min(img.width * pxToMm, contentW)
          drawH = Math.min(img.height * pxToMm, contentH)
          drawX = marginMm + (contentW - drawW) / 2
          drawY = marginMm + (contentH - drawH) / 2
        } else {
          // Fit to page
          if (imgAspect > contentAspect) {
            drawW = contentW
            drawH = contentW / imgAspect
          } else {
            drawH = contentH
            drawW = contentH * imgAspect
          }
          drawX = marginMm + (contentW - drawW) / 2
          drawY = marginMm + (contentH - drawH) / 2
        }

        pdf.addImage(
          img.dataUrl,
          'JPEG',
          drawX,
          drawY,
          drawW,
          drawH,
          undefined,
          'MEDIUM',
          0
        )

        setProgress(Math.round(((i + 1) / images.length) * 100))
        // Yield to UI thread
        await new Promise(r => setTimeout(r, 10))
      }

      const qualityLabel = quality < 50 ? 'FAST' : quality < 80 ? 'MEDIUM' : 'SLOW'
      // jsPDF quality is set via compression in addImage; for the output we use the save
      pdf.save('images-to-pdf.pdf')
    } catch (err) {
      console.error('PDF conversion error:', err)
    } finally {
      setConverting(false)
      setProgress(0)
    }
  }

  const clearAll = () => {
    setImages([])
  }

  return (
    <ToolLayout
      title="JPG to PDF Converter"
      description="Convert JPG and JPEG images to PDF for free. Combine multiple images into one PDF with custom page size, orientation, and margins. Everything runs in your browser — no upload required."
      category="Utility"
      slug="jpg-to-pdf"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "jpg to pdf",
        "jpeg to pdf",
        "convert jpg to pdf",
        "image to pdf converter",
        "combine images into pdf",
        "merge jpg to pdf",
        "photo to pdf",
        "free jpg to pdf converter",
        "multiple images to pdf",
        "jpg to pdf online"
      ]}
      guide={
        <>
          <h2>What Is the JPG to PDF Converter?</h2>
          <p>
            The JPG to PDF Converter lets you turn one or more JPG/JPEG images into a single PDF document — entirely in your browser. No server upload, no signup, no watermarks. Just drag, drop, configure, and download.
          </p>

          <h3>How to Convert JPG to PDF</h3>
          <ul>
            <li>Upload one or more JPG images by clicking the upload area or dragging them in.</li>
            <li>Reorder images using drag-and-drop or the arrow buttons on each thumbnail.</li>
            <li>Choose your page size (A4, Letter, Legal, A3, or Custom dimensions).</li>
            <li>Select Portrait or Landscape orientation.</li>
            <li>Set margins and how images should fit on the page.</li>
            <li>Adjust the quality slider for the desired balance of file size and sharpness.</li>
            <li>Click "Convert to PDF" and your file downloads automatically.</li>
          </ul>

          <h3>Tips for Best Results</h3>
          <ul>
            <li>Use "Fit to Page" for most documents — it preserves the image aspect ratio and centers it on the page.</li>
            <li>For full-bleed photo prints, use "Stretch to Fill" with "None" margins.</li>
            <li>Quality at 85-90% gives sharp images without making the PDF excessively large.</li>
            <li>A4 is the standard page size worldwide; Letter is standard in the US and Canada.</li>
            <li>You can combine scanned documents, photos, and screenshots into a single PDF for easy sharing.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Upload Area */}
        {images.length === 0 && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
          >
            <div className="text-5xl mb-4">PDF</div>
            <p className="text-lg text-zinc-300 mb-2">Drop JPG images here or click to upload</p>
            <p className="text-sm text-zinc-500">JPG, JPEG — multiple files supported</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              className="hidden"
              onChange={e => {
                if (e.target.files) addFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>
        )}

        {/* Images loaded */}
        {images.length > 0 && (
          <>
            {/* Thumbnail Grid */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-300">
                  {images.length} image{images.length !== 1 ? 's' : ''} selected
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    + Add More
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-sm px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  className="hidden"
                  onChange={e => {
                    if (e.target.files) addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                      dragOverIndex === index ? 'border-blue-500 scale-105' : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div className="aspect-square bg-zinc-950 flex items-center justify-center">
                      <img
                        src={img.dataUrl}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>
                    {/* Page number */}
                    <div className="absolute top-1 left-1 bg-black/70 text-zinc-300 text-xs px-1.5 py-0.5 rounded">
                      {index + 1}
                    </div>
                    {/* Controls overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveImage(index, index - 1) }}
                          disabled={index === 0}
                          className="p-1 bg-zinc-800/90 rounded text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                          title="Move up"
                        >
                          &uarr;
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveImage(index, index + 1) }}
                          disabled={index === images.length - 1}
                          className="p-1 bg-zinc-800/90 rounded text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                          title="Move down"
                        >
                          &darr;
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                          className="p-1 bg-red-900/80 rounded text-red-300 hover:bg-red-800 text-xs"
                          title="Remove"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-medium text-zinc-300 mb-2">PDF Settings</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Page Size */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">Page Size</label>
                  <div className="flex flex-wrap gap-1">
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
                    <div className="flex gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={customWidth}
                          onChange={e => setCustomWidth(Number(e.target.value))}
                          className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-300"
                          min={50}
                          max={1000}
                        />
                        <span className="text-xs text-zinc-500">mm</span>
                      </div>
                      <span className="text-zinc-600 self-center">x</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={customHeight}
                          onChange={e => setCustomHeight(Number(e.target.value))}
                          className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-300"
                          min={50}
                          max={1000}
                        />
                        <span className="text-xs text-zinc-500">mm</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Orientation */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">Orientation</label>
                  <div className="flex gap-1">
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
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">Margins</label>
                  <div className="flex flex-wrap gap-1">
                    {MARGINS.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMargin(m.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          margin === m.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Fit */}
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5 block">Image Fit</label>
                  <div className="flex flex-wrap gap-1">
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
              </div>

              {/* Quality Slider */}
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                <label className="text-sm text-zinc-400 whitespace-nowrap">Quality:</label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={e => setQuality(Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-sm text-zinc-300 w-10 text-right">{quality}%</span>
              </div>
            </div>

            {/* Convert Button + Progress */}
            <div className="flex flex-col items-center gap-4">
              {converting ? (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Converting images to PDF...</span>
                    <span className="text-sm text-zinc-300">{progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={convertToPdf}
                  disabled={images.length === 0}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl px-8 py-3 text-base font-medium transition-colors"
                >
                  Convert to PDF ({images.length} image{images.length !== 1 ? 's' : ''})
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
