'use client'

import { useState, useRef, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const PRESETS = [
  { label: "Custom", w: 0, h: 0 },
  { label: "Instagram Post", w: 1080, h: 1080 },
  { label: "Instagram Story", w: 1080, h: 1920 },
  { label: "Facebook Cover", w: 820, h: 312 },
  { label: "Twitter Header", w: 1500, h: 500 },
  { label: "YouTube Thumbnail", w: 1280, h: 720 },
  { label: "LinkedIn Banner", w: 1584, h: 396 },
  { label: "Pinterest Pin", w: 1000, h: 1500 },
  { label: "TikTok Video", w: 1080, h: 1920 },
  { label: "Twitch Banner", w: 1200, h: 480 },
  { label: "Desktop Wallpaper", w: 1920, h: 1080 },
  { label: "Phone Wallpaper", w: 1080, h: 2340 },
  { label: "Favicon", w: 512, h: 512 },
]

const faqs: FAQ[] = [
  {
    question: "How do I resize an image online for free?",
    answer: "Upload your image, enter the desired width and height (or pick a social media preset), and click Download. The tool resizes your image instantly in your browser — no upload to any server."
  },
  {
    question: "Can I resize images for Instagram, YouTube, and other social platforms?",
    answer: "Yes. The tool includes preset sizes for Instagram Post (1080x1080), Instagram Story (1080x1920), YouTube Thumbnail (1280x720), Facebook Cover (820x312), Twitter Header (1500x500), LinkedIn Banner, Pinterest Pin, TikTok, and more."
  },
  {
    question: "Does resizing reduce image quality?",
    answer: "Enlarging an image can reduce sharpness since new pixels must be interpolated. Shrinking an image generally preserves quality well. The tool exports as high-quality PNG for best results."
  },
  {
    question: "Is there a file size or dimension limit?",
    answer: "There is no hard limit. Very large images (over 10000px) may be slow to process since everything runs on your CPU in the browser. For best performance, images under 5000px work smoothly."
  },
  {
    question: "Is my image uploaded to a server?",
    answer: "No. All processing happens entirely in your browser. Your image never leaves your device."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "Photo Watermark Remover", href: "/tools/photo-watermark-remover" },
  { name: "Aspect Ratio Calculator", href: "/tools/aspect-ratio-calculator" },
]

export default function ImageResizer() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [origW, setOrigW] = useState(0)
  const [origH, setOrigH] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [lockRatio, setLockRatio] = useState(true)
  const [preset, setPreset] = useState("Custom")
  const [fileName, setFileName] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = useCallback((file: File) => {
    setFileName(file.name.replace(/\.[^.]+$/, ''))
    const img = new Image()
    img.onload = () => {
      setImage(img)
      setOrigW(img.naturalWidth)
      setOrigH(img.naturalHeight)
      setWidth(img.naturalWidth)
      setHeight(img.naturalHeight)
      setPreset("Custom")
    }
    img.src = URL.createObjectURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleImageUpload(file)
  }, [handleImageUpload])

  const handleWidthChange = (w: number) => {
    setWidth(w)
    if (lockRatio && origW > 0) setHeight(Math.round(w * origH / origW))
    setPreset("Custom")
  }

  const handleHeightChange = (h: number) => {
    setHeight(h)
    if (lockRatio && origH > 0) setWidth(Math.round(h * origW / origH))
    setPreset("Custom")
  }

  const applyPreset = (p: typeof PRESETS[number]) => {
    setPreset(p.label)
    if (p.w > 0) {
      setWidth(p.w)
      setHeight(p.h)
      setLockRatio(false)
    }
  }

  const download = () => {
    if (!image || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, 0, 0, width, height)

    const link = document.createElement('a')
    link.download = `${fileName}-${width}x${height}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const reset = () => {
    setImage(null)
    setWidth(0)
    setHeight(0)
    setOrigW(0)
    setOrigH(0)
    setPreset("Custom")
  }

  const scalePercent = origW > 0 ? Math.round((width / origW) * 100) : 100

  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images online for free. Preset sizes for Instagram, YouTube, Facebook, Twitter, and more. No upload — runs in your browser."
      category="Design"
      slug="image-resizer"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "image resizer",
        "resize image online",
        "image resizer online free",
        "resize photo",
        "resize image for instagram",
        "resize image for youtube thumbnail",
        "social media image resizer",
        "bulk image resizer",
        "photo resizer free",
        "resize image pixels"
      ]}
      guide={
        <>
          <h2>What Is the Image Resizer?</h2>
          <p>
            The Image Resizer lets you change the dimensions of any image directly in your browser. Enter custom pixel dimensions or pick from social media presets for Instagram, YouTube, Facebook, Twitter, LinkedIn, Pinterest, TikTok, and more.
          </p>
          <p>
            Everything runs locally. Your image is never uploaded to any server.
          </p>

          <h3>How to Resize an Image</h3>
          <ul>
            <li>Upload your image by clicking the upload area or dragging and dropping.</li>
            <li>Pick a social media preset or enter custom width and height in pixels.</li>
            <li>Toggle the lock icon to maintain or break the aspect ratio.</li>
            <li>Click Download to save your resized image as a PNG.</li>
          </ul>

          <h3>Social Media Size Presets</h3>
          <ul>
            <li>Instagram Post: 1080 x 1080px</li>
            <li>Instagram Story: 1080 x 1920px</li>
            <li>YouTube Thumbnail: 1280 x 720px</li>
            <li>Facebook Cover: 820 x 312px</li>
            <li>Twitter Header: 1500 x 500px</li>
            <li>LinkedIn Banner: 1584 x 396px</li>
            <li>Pinterest Pin: 1000 x 1500px</li>
          </ul>
        </>
      }
    >
      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-6">
        {/* Upload */}
        {!image && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('resize-upload')?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
          >
            <div className="text-5xl mb-4">📐</div>
            <p className="text-lg text-zinc-300 mb-2">Drop an image here or click to upload</p>
            <p className="text-sm text-zinc-500">PNG, JPG, WebP — any size</p>
            <input
              id="resize-upload"
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

        {image && (
          <>
            {/* Presets */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Social Media Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.filter(p => p.w > 0).map(p => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      preset === p.label
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-400">W:</label>
                  <input
                    type="number"
                    value={width}
                    onChange={e => handleWidthChange(Number(e.target.value))}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 w-24 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-sm text-zinc-500">px</span>
                </div>

                <button
                  onClick={() => setLockRatio(!lockRatio)}
                  className={`text-lg px-2 py-1 rounded transition-colors ${
                    lockRatio ? 'text-blue-400' : 'text-zinc-600'
                  }`}
                  title={lockRatio ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                >
                  {lockRatio ? '🔗' : '🔓'}
                </button>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-400">H:</label>
                  <input
                    type="number"
                    value={height}
                    onChange={e => handleHeightChange(Number(e.target.value))}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 w-24 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-sm text-zinc-500">px</span>
                </div>

                <div className="text-sm text-zinc-500">
                  Original: {origW} x {origH} &middot; Scale: {scalePercent}%
                </div>

                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={reset}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
                  >
                    New Image
                  </button>
                  <button
                    onClick={download}
                    disabled={width < 1 || height < 1}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Preview</p>
              <div className="bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 200 }}>
                <img
                  src={image.src}
                  alt="Preview"
                  className="max-w-full max-h-[500px] object-contain"
                  style={{
                    width: Math.min(width, 800),
                    height: Math.min(height, 500),
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
