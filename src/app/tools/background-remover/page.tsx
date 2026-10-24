'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const faqs: FAQ[] = [
  {
    question: "How does the background remover work?",
    answer: "The tool offers two modes. AI Mode uses an ISNet model that runs in your browser to detect subjects (people, products, animals) and remove the background. Color Mode lets you click any color to remove it — perfect for solid-color backgrounds, graphics, and logos."
  },
  {
    question: "Is my image uploaded to a server?",
    answer: "No. Everything runs 100% in your browser. Your image never leaves your device."
  },
  {
    question: "Which mode should I use?",
    answer: "Use AI Mode for photos with clear subjects (people, products, animals). Use Color Mode for graphics, logos, solid-color backgrounds, or when AI mode doesn't give good results."
  },
  {
    question: "What types of images work best?",
    answer: "AI Mode works best with photos that have clear subjects. Color Mode works best with solid or near-solid backgrounds. Between the two modes, virtually any image can be handled."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "Image Resizer", href: "/tools/image-resizer" },
  { name: "Photo Watermark Remover", href: "/tools/photo-watermark-remover" },
]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function removeColorFloodFill(
  imageData: ImageData,
  startX: number,
  startY: number,
  tolerance: number,
  feather: number
): ImageData {
  const { width, height } = imageData
  const data = new Uint8ClampedArray(imageData.data)
  const maxDist = tolerance * 4.42

  // Get target color from click point
  const idx = (startY * width + startX) * 4
  const tR = data[idx], tG = data[idx + 1], tB = data[idx + 2]

  // Flood fill mask: 0 = unvisited, 1 = matched (remove), 2 = feather edge
  const mask = new Uint8Array(width * height)
  const distMap = new Float32Array(width * height)

  // BFS flood fill from click point
  const queue: number[] = [startX, startY]
  const visited = new Uint8Array(width * height)
  visited[startY * width + startX] = 1

  while (queue.length > 0) {
    const cy = queue.pop()!
    const cx = queue.pop()!
    const ci = cy * width + cx
    const pi = ci * 4

    const dist = colorDistance(data[pi], data[pi + 1], data[pi + 2], tR, tG, tB)
    distMap[ci] = dist

    if (dist <= maxDist) {
      mask[ci] = 1 // mark for removal

      // Check 4 neighbors
      const neighbors = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = ny * width + nx
          if (!visited[ni]) {
            visited[ni] = 1
            queue.push(nx, ny)
          }
        }
      }
    } else if (feather > 0 && dist <= maxDist + feather * 4.42) {
      mask[ci] = 2 // feather zone — only if adjacent to a filled pixel
    }
  }

  // Second pass: expand feather from mask edges
  if (feather > 0) {
    const featherDist = feather * 4.42
    // Find edge pixels (mask=1 with a non-mask neighbor)
    const edgeQueue: number[] = []
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x
        if (mask[i] === 1) {
          const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const ni = ny * width + nx
              if (mask[ni] === 0) {
                // This neighbor is outside the fill — mark as feather candidate
                const pi2 = ni * 4
                const d = colorDistance(data[pi2], data[pi2 + 1], data[pi2 + 2], tR, tG, tB)
                if (d <= maxDist + featherDist) {
                  mask[ni] = 2
                  distMap[ni] = d
                }
              }
            }
          }
        }
      }
    }
  }

  // Apply mask to alpha channel
  for (let i = 0; i < width * height; i++) {
    if (mask[i] === 1) {
      data[i * 4 + 3] = 0
    } else if (mask[i] === 2 && feather > 0) {
      const dist = distMap[i]
      const featherDist = feather * 4.42
      const alpha = Math.round(((dist - maxDist) / featherDist) * 255)
      data[i * 4 + 3] = Math.min(data[i * 4 + 3], Math.max(0, alpha))
    }
  }

  return new ImageData(data, width, height)
}

export default function BackgroundRemover() {
  const [mode, setMode] = useState<'ai' | 'color'>('ai')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [fileName, setFileName] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)
  const compareRef = useRef<HTMLDivElement>(null)

  // Color mode state
  const [pickedColor, setPickedColor] = useState<[number, number, number] | null>(null)
  const [clickPos, setClickPos] = useState<[number, number] | null>(null)
  const [tolerance, setTolerance] = useState(30)
  const [feather, setFeather] = useState(5)
  const [colorPicking, setColorPicking] = useState(false)
  const colorCanvasRef = useRef<HTMLCanvasElement>(null)
  const colorImgRef = useRef<HTMLImageElement | null>(null)

  const loadImage = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    setOriginalUrl(url)
    setOriginalFile(file)
    setOriginalSize(file.size)
    setFileName(file.name.replace(/\.[^.]+$/, ''))
    setResultUrl(null)
    setResultBlob(null)
    setError(null)
    setCompareMode(false)
    setPickedColor(null)

    if (mode === 'ai') {
      processAI(file, url)
    } else {
      setColorPicking(true)
    }
  }, [mode])

  const processAI = useCallback(async (file: File, url?: string) => {
    setProcessing(true)
    setProgress('Loading AI model (~6MB first time)...')
    setResultUrl(null)
    setResultBlob(null)

    try {
      const { pipeline, env, RawImage } = await import('@huggingface/transformers')
      env.allowLocalModels = false

      setProgress('Initializing segmentation model...')
      const segmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
        device: 'webgpu' in navigator ? 'webgpu' as any : 'wasm',
      })

      setProgress('Removing background...')
      const image = await RawImage.fromURL(URL.createObjectURL(file))
      const output = await segmenter(image)

      // output is array of { label, mask, score }
      const maskResult = (output as any[])[0]
      if (!maskResult?.mask) throw new Error('No mask returned')
      const mask = maskResult.mask as any

      // Composite: apply mask alpha to original image
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')!

      // Draw original
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Apply mask to alpha channel
      const maskData = mask.data
      const maskW = mask.width
      const maskH = mask.height
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const srcX = Math.floor(x * maskW / canvas.width)
          const srcY = Math.floor(y * maskH / canvas.height)
          const maskVal = maskData[srcY * maskW + srcX]
          const alpha = Math.round(maskVal * 255)
          imageData.data[(y * canvas.width + x) * 4 + 3] = alpha
        }
      }
      ctx.putImageData(imageData, 0, 0)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed to create blob')), 'image/png')
      })

      const resultUrl = URL.createObjectURL(blob)
      setResultBlob(blob)
      setResultUrl(resultUrl)
      setProgress('')
    } catch (err) {
      console.error(err)
      setError('Failed to process image. Try Color Mode or refresh the page.')
      setProgress('')
    } finally {
      setProcessing(false)
    }
  }, [])

  const processColor = useCallback(() => {
    if (!clickPos || !originalUrl) return

    setProcessing(true)
    setProgress('Removing background...')

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const result = removeColorFloodFill(imageData, clickPos[0], clickPos[1], tolerance, feather)
      ctx.putImageData(result, 0, 0)

      canvas.toBlob(blob => {
        if (blob) {
          if (resultUrl) URL.revokeObjectURL(resultUrl)
          const url = URL.createObjectURL(blob)
          setResultBlob(blob)
          setResultUrl(url)
        }
        setProcessing(false)
        setProgress('')
        setColorPicking(false)
      }, 'image/png')
    }
    img.src = originalUrl
  }, [clickPos, originalUrl, tolerance, feather])

  // Re-process when tolerance or feather changes (with color picked)
  useEffect(() => {
    if (mode === 'color' && clickPos && originalUrl && !colorPicking) {
      processColor()
    }
  }, [tolerance, feather])

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'color' || !colorPicking) return
    const canvas = colorCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)

    const ctx = canvas.getContext('2d')!
    const pixel = ctx.getImageData(x, y, 1, 1).data
    setPickedColor([pixel[0], pixel[1], pixel[2]])
    setClickPos([x, y])
  }, [mode, colorPicking])

  // Draw image to canvas for color picking
  useEffect(() => {
    if (mode !== 'color' || !originalUrl || !colorPicking) return
    const canvas = colorCanvasRef.current
    if (!canvas) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      colorImgRef.current = img
    }
    img.src = originalUrl
  }, [mode, originalUrl, colorPicking])

  // Process color removal when color is first picked
  useEffect(() => {
    if (clickPos && mode === 'color' && colorPicking) {
      processColor()
    }
  }, [clickPos])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) loadImage(file)
  }, [loadImage])

  const download = () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${fileName}-no-bg.png`
    a.click()
  }

  const reset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setOriginalUrl(null)
    setOriginalFile(null)
    setResultUrl(null)
    setResultBlob(null)
    setProcessing(false)
    setProgress('')
    setError(null)
    setCompareMode(false)
    setPickedColor(null)
    setColorPicking(false)
  }

  const switchMode = (newMode: 'ai' | 'color') => {
    if (newMode === mode) return
    setMode(newMode)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setResultUrl(null)
    setResultBlob(null)
    setError(null)
    setCompareMode(false)
    setPickedColor(null)
    setClickPos(null)

    if (originalFile && newMode === 'ai') {
      processAI(originalFile)
    } else if (originalUrl && newMode === 'color') {
      setColorPicking(true)
    }
  }

  const handleSlider = (e: React.MouseEvent | React.TouchEvent) => {
    if (!compareRef.current) return
    const rect = compareRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setSliderPos(pos)
  }

  return (
    <ToolLayout
      title="Background Remover"
      description="Remove image backgrounds with AI or by color. 100% free, no upload to any server. Runs entirely in your browser."
      category="Design"
      slug="background-remover"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "background remover", "remove background from image", "background remover free",
        "remove bg", "transparent background", "remove image background",
        "background eraser", "photo background remover", "remove background online free",
        "ai background remover", "remove color from image",
      ]}
      guide={
        <>
          <h2>Free Background Remover</h2>
          <p>Remove backgrounds from any image using AI or color-based removal, entirely in your browser.</p>
          <h3>Two Modes</h3>
          <ul>
            <li><strong>AI Mode</strong> — Best for photos with subjects (people, products, animals). Uses a neural network to detect and isolate the subject.</li>
            <li><strong>Color Mode</strong> — Best for graphics, logos, and solid-color backgrounds. Click the background color to remove it, then fine-tune with tolerance and feather sliders.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => switchMode('ai')}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === 'ai' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            AI Mode — Photos &amp; Subjects
          </button>
          <button
            onClick={() => switchMode('color')}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === 'color' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            Color Mode — Solid Backgrounds
          </button>
        </div>

        {/* Upload */}
        {!originalUrl && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('bg-upload')?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-zinc-900/50 transition-all"
          >
            <div className="text-5xl mb-4">{mode === 'ai' ? '✂️' : '🎨'}</div>
            <p className="text-lg text-zinc-300 mb-2">Drop an image here or click to upload</p>
            <p className="text-sm text-zinc-500">
              {mode === 'ai' ? 'Best for photos with people, products, or animals' : 'Best for graphics, logos, and solid-color backgrounds'}
            </p>
            <input
              id="bg-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) loadImage(file)
              }}
            />
          </div>
        )}

        {/* Color Picking Mode */}
        {mode === 'color' && colorPicking && originalUrl && !processing && (
          <div className="space-y-4">
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4 text-center">
              <p className="text-blue-300 text-sm font-medium">Click on the background color you want to remove</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <canvas
                ref={colorCanvasRef}
                onClick={handleImageClick}
                className="max-w-full max-h-[500px] mx-auto cursor-crosshair rounded-lg"
                style={{ display: 'block' }}
              />
            </div>
            {pickedColor && (
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <div className="w-8 h-8 rounded border border-zinc-600" style={{ backgroundColor: `rgb(${pickedColor[0]},${pickedColor[1]},${pickedColor[2]})` }} />
                <span className="text-sm text-zinc-400">Selected: rgb({pickedColor.join(', ')})</span>
              </div>
            )}
          </div>
        )}

        {/* Processing */}
        {processing && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-zinc-300">{progress}</p>
            {mode === 'ai' && <p className="text-sm text-zinc-500 mt-2">First use downloads a ~88MB AI model (cached for next time)</p>}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-red-400">{error}</p>
            <button onClick={reset} className="mt-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors">
              Try Again
            </button>
          </div>
        )}

        {/* Result */}
        {resultUrl && originalUrl && !colorPicking && (
          <>
            {/* Controls */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-sm">
                  <span className="text-zinc-500">Original: </span>
                  <span className="text-zinc-300">{formatBytes(originalSize)}</span>
                </div>
                {resultBlob && (
                  <>
                    <div className="text-zinc-700">&rarr;</div>
                    <div className="text-sm">
                      <span className="text-zinc-500">Result: </span>
                      <span className="text-zinc-300">{formatBytes(resultBlob.size)}</span>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => setCompareMode(false)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${!compareMode ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>Result</button>
                  <button onClick={() => setCompareMode(true)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${compareMode ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>Compare</button>
                </div>

                <div className="flex gap-2 ml-auto">
                  {mode === 'color' && (
                    <button
                      onClick={() => { setColorPicking(true); setResultUrl(null); setResultBlob(null); setPickedColor(null); setClickPos(null); }}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors"
                    >
                      Re-pick Color
                    </button>
                  )}
                  <button onClick={reset} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm transition-colors">New Image</button>
                  <button onClick={download} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors">Download PNG</button>
                </div>
              </div>
            </div>

            {/* Color mode fine-tune sliders */}
            {mode === 'color' && pickedColor && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded border border-zinc-600" style={{ backgroundColor: `rgb(${pickedColor[0]},${pickedColor[1]},${pickedColor[2]})` }} />
                  <span className="text-sm text-zinc-400">Removing: rgb({pickedColor.join(', ')})</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <label className="text-zinc-400">Tolerance</label>
                    <span className="text-zinc-500">{tolerance}</span>
                  </div>
                  <input type="range" min={1} max={80} value={tolerance} onChange={e => setTolerance(+e.target.value)} className="w-full accent-blue-500" />
                  <p className="text-xs text-zinc-600 mt-0.5">How similar colors need to be to get removed</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <label className="text-zinc-400">Edge Feather</label>
                    <span className="text-zinc-500">{feather}</span>
                  </div>
                  <input type="range" min={0} max={30} value={feather} onChange={e => setFeather(+e.target.value)} className="w-full accent-blue-500" />
                  <p className="text-xs text-zinc-600 mt-0.5">Smooth transition at edges (anti-aliasing)</p>
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              {!compareMode ? (
                <div
                  className="rounded-lg overflow-hidden flex items-center justify-center"
                  style={{
                    minHeight: 300,
                    backgroundImage: 'repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  <img src={resultUrl} alt="Background removed" className="max-w-full max-h-[500px] object-contain" />
                </div>
              ) : (
                <div
                  ref={compareRef}
                  className="relative rounded-lg overflow-hidden cursor-col-resize select-none"
                  style={{ minHeight: 300 }}
                  onMouseMove={e => { if (e.buttons === 1) handleSlider(e) }}
                  onMouseDown={handleSlider}
                  onTouchMove={handleSlider}
                  onTouchStart={handleSlider}
                >
                  <div className="flex items-center justify-center bg-zinc-950" style={{ minHeight: 300 }}>
                    <img src={originalUrl} alt="Original" className="max-w-full max-h-[500px] object-contain" />
                  </div>
                  <div
                    className="absolute inset-0 overflow-hidden flex items-center justify-center"
                    style={{ width: `${sliderPos}%`, backgroundImage: 'repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%)', backgroundSize: '20px 20px' }}
                  >
                    <img src={resultUrl} alt="Result" className="max-h-[500px] object-contain" style={{ position: 'absolute' }} />
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white/80" style={{ left: `${sliderPos}%` }}>
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-zinc-800 text-xs font-bold">&harr;</span>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">Result</div>
                  <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">Original</div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Original preview while processing */}
        {processing && originalUrl && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Original</p>
            <div className="bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 200 }}>
              <img src={originalUrl} alt="Original" className="max-w-full max-h-[400px] object-contain" />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
