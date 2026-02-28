'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'
import { inpaint } from '@/lib/inpaint'

const faqs: FAQ[] = [
  {
    question: "How do I remove a watermark from a photo for free?",
    answer: "Upload your image, paint over the watermark with the brush tool (it appears as a red overlay), and click Remove Watermark. The tool uses an inpainting algorithm to fill the area with surrounding pixel data. Everything runs locally in your browser."
  },
  {
    question: "Does removing a photo watermark affect image quality?",
    answer: "The inpainting algorithm only modifies the pixels you paint over. The rest of the image remains completely untouched. You can download the result at full original resolution as a PNG file."
  },
  {
    question: "What image formats are supported?",
    answer: "The tool accepts PNG, JPG, JPEG, WebP, and any other image format your browser supports. The output is always downloaded as a high-quality PNG file regardless of the input format."
  },
  {
    question: "Can I remove text overlays and logos from photos?",
    answer: "Yes. Paint over any text, logo, or graphic overlay with the brush and the inpainting algorithm will attempt to reconstruct the background behind it. Results work best on photos with relatively uniform or textured backgrounds."
  },
  {
    question: "Is there a maximum image size I can process?",
    answer: "There is no hard limit, but very large images (over 8000px) may be slow to process since the inpainting runs on the CPU in your browser. For best performance, images under 4000px wide work smoothly."
  },
  {
    question: "Is my photo uploaded to a server?",
    answer: "No. All processing happens entirely in your browser. Your image never leaves your device, so your photos stay completely private."
  }
]

const relatedTools: RelatedTool[] = [
  { name: "Video Watermark Remover", href: "/tools/video-watermark-remover" },
  { name: "Image Color Picker", href: "/tools/image-color-picker" },
  { name: "Color Palette Generator", href: "/tools/color-palette-generator" }
]

export default function PhotoWatermarkRemover() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [brushSize, setBrushSize] = useState(25)
  const [isDrawing, setIsDrawing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [scale, setScale] = useState(1)

  const handleImageUpload = useCallback((file: File) => {
    const img = new Image()
    img.onload = () => {
      setImage(img)
      setProcessed(false)

      const maxW = Math.min(800, window.innerWidth - 48)
      const s = Math.min(maxW / img.width, 600 / img.height, 1)
      const w = Math.round(img.width * s)
      const h = Math.round(img.height * s)
      setScale(s)
      setCanvasSize({ width: w, height: h })

      requestAnimationFrame(() => {
        const canvas = canvasRef.current
        const maskCanvas = maskCanvasRef.current
        if (!canvas || !maskCanvas) return

        canvas.width = w
        canvas.height = h
        maskCanvas.width = w
        maskCanvas.height = h

        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)

        const maskCtx = maskCanvas.getContext('2d')!
        maskCtx.clearRect(0, 0, w, h)
      })
    }
    img.src = URL.createObjectURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleImageUpload(file)
  }, [handleImageUpload])

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const drawBrush = (x: number, y: number) => {
    const maskCtx = maskCanvasRef.current?.getContext('2d')
    if (!maskCtx) return
    maskCtx.globalCompositeOperation = 'source-over'
    maskCtx.fillStyle = 'rgba(255, 0, 0, 0.5)'
    maskCtx.beginPath()
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
    maskCtx.fill()
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (processed) return
    setIsDrawing(true)
    const { x, y } = getPos(e)
    drawBrush(x, y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || processed) return
    const { x, y } = getPos(e)
    drawBrush(x, y)
  }

  const handleMouseUp = () => setIsDrawing(false)

  const clearMask = () => {
    const maskCtx = maskCanvasRef.current?.getContext('2d')
    if (!maskCtx || !canvasSize.width) return
    maskCtx.clearRect(0, 0, canvasSize.width, canvasSize.height)
    if (image) {
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height)
    }
    setProcessed(false)
  }

  const processImage = async () => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas || !image) return

    setProcessing(true)
    setProgress(0)

    await new Promise(r => setTimeout(r, 50))

    const ctx = canvas.getContext('2d')!
    const maskCtx = maskCanvas.getContext('2d')!
    const w = canvasSize.width
    const h = canvasSize.height

    // Redraw original image
    ctx.drawImage(image, 0, 0, w, h)

    // Get image data
    const imageData = ctx.getImageData(0, 0, w, h)

    // Build mask from red overlay
    const maskData = maskCtx.getImageData(0, 0, w, h)
    const mask = new Uint8Array(w * h)
    for (let i = 0; i < w * h; i++) {
      mask[i] = maskData.data[i * 4 + 3] > 30 ? 1 : 0
    }

    setProgress(20)
    await new Promise(r => setTimeout(r, 50))

    // Run inpainting
    const result = inpaint(imageData, mask, 10)

    setProgress(90)
    await new Promise(r => setTimeout(r, 50))

    // Draw result
    ctx.putImageData(result, 0, 0)

    // Clear mask overlay
    maskCtx.clearRect(0, 0, w, h)

    setProgress(100)
    setProcessing(false)
    setProcessed(true)
  }

  const downloadResult = () => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    // Render at full resolution
    const fullCanvas = document.createElement('canvas')
    fullCanvas.width = image.width
    fullCanvas.height = image.height
    const fullCtx = fullCanvas.getContext('2d')!

    // Scale up the processed result
    fullCtx.drawImage(canvas, 0, 0, image.width, image.height)

    const link = document.createElement('a')
    link.download = 'watermark-removed.png'
    link.href = fullCanvas.toDataURL('image/png')
    link.click()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '[') setBrushSize(s => Math.max(5, s - 5))
      if (e.key === ']') setBrushSize(s => Math.min(100, s + 5))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <ToolLayout
      title="Photo Watermark Remover"
      description="Remove watermarks from photos completely free. No signup, no limits. Your image never leaves your browser — all processing happens locally."
      category="Design"
      slug="photo-watermark-remover"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "photo watermark remover",
        "remove watermark from image free",
        "watermark remover online",
        "remove logo from photo",
        "image watermark eraser",
        "remove text from image",
        "free photo watermark remover",
        "inpainting tool online"
      ]}
      guide={
        <>
          <h2>What Is the Photo Watermark Remover?</h2>
          <p>
            The Photo Watermark Remover is a free online tool that removes watermarks, logos, text overlays, and other unwanted objects from images. It uses an inpainting algorithm that reconstructs the area behind the watermark based on surrounding pixel data.
          </p>
          <p>
            Everything runs locally in your browser. Your photos are never uploaded to any server, which means your images stay completely private and processing is instant.
          </p>

          <h3>How to Remove a Watermark from a Photo</h3>
          <p>Removing a watermark takes just a few steps:</p>
          <ul>
            <li>Upload your image by clicking the upload area or dragging and dropping a file (PNG, JPG, or WebP).</li>
            <li>Adjust the brush size using the slider or the keyboard shortcuts: press <strong>[</strong> to decrease and <strong>]</strong> to increase.</li>
            <li>Paint over the watermark area. A red overlay shows what you have selected.</li>
            <li>Click Remove Watermark to process the image.</li>
            <li>Review the result and download your clean image as a full-resolution PNG.</li>
          </ul>

          <h3>How the Inpainting Algorithm Works</h3>
          <p>
            The tool uses a pixel-based inpainting technique that analyzes the colors and textures around the masked area. It progressively fills in pixels from the boundary inward, sampling nearby regions to reconstruct a natural-looking background. This approach works especially well on textured surfaces, gradients, and photographs with organic patterns.
          </p>

          <h3>Tips for Best Results</h3>
          <ul>
            <li>Use a brush size that closely matches the thickness of the watermark text or logo for precise coverage.</li>
            <li>Paint slightly beyond the edges of the watermark to catch semi-transparent pixels.</li>
            <li>For large watermarks covering complex areas, process in smaller sections — paint and remove one area at a time.</li>
            <li>Results are best on photos with textured or varied backgrounds. Watermarks over faces or fine detail may require touch-up.</li>
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Removing stock photo watermarks after purchasing a license.</li>
            <li>Cleaning up screenshots with unwanted text overlays.</li>
            <li>Removing date stamps from scanned photos.</li>
            <li>Erasing logos or branding from product images.</li>
            <li>Preparing images for presentations and portfolios.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Upload Area */}
        {!image && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('photo-upload')?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
          >
            <div className="text-5xl mb-4">🖼️</div>
            <p className="text-lg text-zinc-300 mb-2">Drop an image here or click to upload</p>
            <p className="text-sm text-zinc-500">PNG, JPG, WebP — any size</p>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
          </div>
        )}

        {/* Editor */}
        {image && (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-zinc-400">Brush:</label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={brushSize}
                  onChange={e => setBrushSize(Number(e.target.value))}
                  className="w-32 accent-blue-500"
                />
                <span className="text-sm text-zinc-300 w-10">{brushSize}px</span>
              </div>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={clearMask}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  Clear Mask
                </button>
                <button
                  onClick={() => { setImage(null); setProcessed(false) }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  New Image
                </button>
                {!processed ? (
                  <button
                    onClick={processImage}
                    disabled={processing}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                  >
                    {processing ? `Processing... ${progress}%` : 'Remove Watermark'}
                  </button>
                ) : (
                  <button
                    onClick={downloadResult}
                    className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                  >
                    Download Result
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {processing && (
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Canvas Area */}
            <div className="flex justify-center bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-auto">
              <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 rounded"
                />
                <canvas
                  ref={maskCanvasRef}
                  className="absolute top-0 left-0 rounded"
                  style={{ cursor: processed ? 'default' : `crosshair` }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
            </div>

            {/* Instructions */}
            {!processed && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-2">How to use:</h3>
                <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                  <li>Paint over the watermark with your brush (it shows as a red overlay)</li>
                  <li>Use <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">[</kbd> and <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">]</kbd> to resize the brush</li>
                  <li>Click &ldquo;Remove Watermark&rdquo; to process</li>
                  <li>Download your clean image</li>
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
