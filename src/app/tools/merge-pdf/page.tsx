'use client'

import { useState, useRef, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'
import { PDFDocument } from 'pdf-lib'

interface PdfFile {
  id: string
  file: File
  name: string
  pageCount: number
}

const faqs: FAQ[] = [
  {
    question: "How does the PDF merger work?",
    answer: "The tool uses the pdf-lib library to read each PDF file entirely in your browser, then combines all pages into a single new PDF document. No files are uploaded to any server — everything runs locally on your device."
  },
  {
    question: "Is there a limit to how many PDFs I can merge?",
    answer: "There is no hard limit. You can merge as many PDF files as your browser's memory allows. For very large files (hundreds of megabytes total), performance may vary depending on your device. Most users can comfortably merge dozens of PDFs at once."
  },
  {
    question: "Can I reorder the PDFs before merging?",
    answer: "Yes. After uploading your files, you can use the up and down arrow buttons next to each file to rearrange the order. The final merged PDF will follow the order shown in the file list from top to bottom."
  },
  {
    question: "Are my PDF files uploaded to a server?",
    answer: "No. All processing happens entirely in your browser using JavaScript. Your PDF files never leave your device, making this tool completely private and secure. There is no server-side processing involved."
  },
  {
    question: "What types of PDFs are supported?",
    answer: "The tool supports standard PDF files including text documents, scanned documents, forms, and PDFs with images. Password-protected or encrypted PDFs may not work unless they are unencrypted first. The tool handles PDF versions up to 2.0."
  },
  {
    question: "Will the merged PDF preserve bookmarks, links, and form fields?",
    answer: "The merge copies all pages with their visual content intact, including text, images, and vector graphics. However, interactive features like bookmarks, hyperlinks, and fillable form fields may not be preserved in the merged output."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "QR Code Generator", href: "/tools/qr-code-generator" },
  { name: "Word Counter", href: "/tools/word-counter" },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function MergePdf() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([])
  const [merging, setMerging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mergedUrl, setMergedUrl] = useState<string | null>(null)
  const [mergedPageCount, setMergedPageCount] = useState(0)
  const [mergedSize, setMergedSize] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItemRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalPages = pdfFiles.reduce((sum, f) => sum + f.pageCount, 0)

  const loadPdfFile = useCallback(async (file: File): Promise<PdfFile | null> => {
    try {
      const buffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true })
      return {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        pageCount: pdf.getPageCount(),
      }
    } catch {
      return null
    }
  }, [])

  const addFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl)
      setMergedUrl(null)
    }

    const pdfFileList = Array.from(files).filter(
      f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    )

    if (pdfFileList.length === 0) {
      setError('Please select valid PDF files.')
      return
    }

    const loaded = await Promise.all(pdfFileList.map(loadPdfFile))
    const valid = loaded.filter((f): f is PdfFile => f !== null)
    const failed = loaded.length - valid.length

    if (failed > 0) {
      setError(`${failed} file${failed > 1 ? 's' : ''} could not be read and ${failed > 1 ? 'were' : 'was'} skipped.`)
    }

    setPdfFiles(prev => [...prev, ...valid])
  }, [loadPdfFile, mergedUrl])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id))
    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl)
      setMergedUrl(null)
    }
  }

  const moveFile = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= pdfFiles.length) return
    const updated = [...pdfFiles]
    const [moved] = updated.splice(index, 1)
    updated.splice(newIndex, 0, moved)
    setPdfFiles(updated)
    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl)
      setMergedUrl(null)
    }
  }

  const handleDragStart = (index: number) => {
    dragItemRef.current = index
  }

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDropItem = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    const dragIndex = dragItemRef.current
    if (dragIndex === null || dragIndex === dropIndex) return
    const updated = [...pdfFiles]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(dropIndex, 0, moved)
    setPdfFiles(updated)
    dragItemRef.current = null
    if (mergedUrl) {
      URL.revokeObjectURL(mergedUrl)
      setMergedUrl(null)
    }
  }

  const handleDragEndItem = () => {
    setDragOverIndex(null)
    dragItemRef.current = null
  }

  const mergePdfs = async () => {
    if (pdfFiles.length < 2) return
    setMerging(true)
    setProgress(0)
    setError(null)

    try {
      const merged = await PDFDocument.create()
      let processed = 0

      for (const pdfFile of pdfFiles) {
        const buffer = await pdfFile.file.arrayBuffer()
        const source = await PDFDocument.load(buffer, { ignoreEncryption: true })
        const indices = source.getPageIndices()
        const copiedPages = await merged.copyPages(source, indices)
        copiedPages.forEach(page => merged.addPage(page))
        processed++
        setProgress(Math.round((processed / pdfFiles.length) * 100))
      }

      const mergedBytes = await merged.save()
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' })

      if (mergedUrl) URL.revokeObjectURL(mergedUrl)
      const url = URL.createObjectURL(blob)
      setMergedUrl(url)
      setMergedPageCount(merged.getPageCount())
      setMergedSize(mergedBytes.byteLength)
    } catch {
      setError('An error occurred while merging the PDFs. Please try again.')
    } finally {
      setMerging(false)
    }
  }

  const download = () => {
    if (!mergedUrl) return
    const a = document.createElement('a')
    a.href = mergedUrl
    a.download = 'merged.pdf'
    a.click()
  }

  const reset = () => {
    if (mergedUrl) URL.revokeObjectURL(mergedUrl)
    setPdfFiles([])
    setMergedUrl(null)
    setMergedPageCount(0)
    setMergedSize(0)
    setProgress(0)
    setError(null)
  }

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one document for free. Reorder pages, preview file details, and download the merged result. No upload — everything runs in your browser."
      category="Utility"
      slug="merge-pdf"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "merge pdf",
        "combine pdf files",
        "pdf merger online",
        "join pdf documents",
        "merge pdf free",
        "combine multiple pdfs",
        "pdf combiner tool",
        "merge pdf online free",
        "concatenate pdf files",
        "pdf joiner"
      ]}
      guide={
        <>
          <h2>What Is the PDF Merger?</h2>
          <p>
            The PDF Merger lets you combine multiple PDF files into a single document directly in your browser.
            Upload your files, arrange them in the order you want, and merge them with one click. No server
            upload, no signup, completely private.
          </p>

          <h3>How to Merge PDFs</h3>
          <ul>
            <li>Upload PDF files by clicking the upload area or dragging and dropping.</li>
            <li>Review the file list — each file shows its name and page count.</li>
            <li>Reorder files using the up/down buttons or by dragging them into position.</li>
            <li>Remove any files you do not want included.</li>
            <li>Click the Merge button to combine all files into one PDF.</li>
            <li>Download the merged result.</li>
          </ul>

          <h3>Tips for Best Results</h3>
          <ul>
            <li>Make sure your PDFs are not password-protected — encrypted files may fail to load.</li>
            <li>The final page order matches the file list from top to bottom.</li>
            <li>You can add more files at any time before merging.</li>
            <li>For very large files, give the merge process a moment to complete — a progress bar will show the status.</li>
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
          <div className="text-5xl mb-4">
            <svg className="w-12 h-12 mx-auto text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-lg text-zinc-300 mb-2">Drop PDF files here or click to upload</p>
          <p className="text-sm text-zinc-500">Select multiple PDF files to merge</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={e => {
              if (e.target.files?.length) addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* File List */}
        {pdfFiles.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                {pdfFiles.length} file{pdfFiles.length !== 1 ? 's' : ''} — {totalPages} total page{totalPages !== 1 ? 's' : ''}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
              >
                + Add more
              </button>
            </div>

            <ul className="divide-y divide-zinc-800">
              {pdfFiles.map((pdf, index) => (
                <li
                  key={pdf.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={e => handleDragOverItem(e, index)}
                  onDrop={e => handleDropItem(e, index)}
                  onDragEnd={handleDragEndItem}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    dragOverIndex === index ? 'bg-blue-500/10' : 'hover:bg-zinc-800/50'
                  }`}
                >
                  {/* Drag handle */}
                  <div className="cursor-grab text-zinc-600 hover:text-zinc-400 shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <circle cx="5" cy="3" r="1.5" />
                      <circle cx="11" cy="3" r="1.5" />
                      <circle cx="5" cy="8" r="1.5" />
                      <circle cx="11" cy="8" r="1.5" />
                      <circle cx="5" cy="13" r="1.5" />
                      <circle cx="11" cy="13" r="1.5" />
                    </svg>
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{pdf.name}</p>
                    <p className="text-xs text-zinc-500">
                      {pdf.pageCount} page{pdf.pageCount !== 1 ? 's' : ''} — {formatBytes(pdf.file.size)}
                    </p>
                  </div>

                  {/* Reorder buttons */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => moveFile(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveFile(index, 1)}
                      disabled={index === pdfFiles.length - 1}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFile(pdf.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress Bar */}
        {merging && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Merging PDFs...</span>
              <span className="text-sm text-zinc-300">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Merge Result */}
        {mergedUrl && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-zinc-200 font-medium">Merge complete</p>
                  <p className="text-xs text-zinc-500">
                    {mergedPageCount} page{mergedPageCount !== 1 ? 's' : ''} — {formatBytes(mergedSize)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={reset}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={download}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {pdfFiles.length >= 2 && !mergedUrl && !merging && (
          <div className="flex gap-3 justify-end">
            <button
              onClick={reset}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={mergePdfs}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-8 py-2.5 text-sm font-medium transition-colors"
            >
              Merge {pdfFiles.length} PDFs ({totalPages} pages)
            </button>
          </div>
        )}

        {pdfFiles.length === 1 && !mergedUrl && (
          <p className="text-sm text-zinc-500 text-center">Add at least one more PDF to merge.</p>
        )}
      </div>
    </ToolLayout>
  )
}
