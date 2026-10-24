'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

const PRESETS: Record<string, { w: number; h: number }> = {
  'Free': { w: 0, h: 0 },
  '1:1 Square': { w: 1, h: 1 },
  '4:3': { w: 4, h: 3 },
  '3:4': { w: 3, h: 4 },
  '16:9': { w: 16, h: 9 },
  '9:16': { w: 9, h: 16 },
  'Instagram Post (1:1)': { w: 1, h: 1 },
  'Instagram Story (9:16)': { w: 9, h: 16 },
  'YouTube Thumbnail (16:9)': { w: 16, h: 9 },
  'Facebook Cover (205:78)': { w: 205, h: 78 },
  'Twitter Header (3:1)': { w: 3, h: 1 },
  'LinkedIn Banner (4:1)': { w: 4, h: 1 },
}

const faqs: FAQ[] = [
  { question: "How does this image crop tool work?", answer: "Upload an image, drag to select a crop region, and download the cropped result. Everything runs in your browser — your images never leave your device." },
  { question: "Can I crop to specific aspect ratios?", answer: "Yes. Choose from presets like 1:1 (square), 16:9, 9:16, or social media formats (Instagram Post, YouTube Thumbnail, Facebook Cover, Twitter Header, LinkedIn Banner). You can also crop freely." },
  { question: "What image formats are supported?", answer: "JPG, PNG, WebP, GIF, BMP, and any other format your browser supports. The output is always PNG for lossless quality." },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Resizer", href: "/tools/image-resizer" },
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "Background Remover", href: "/tools/background-remover" },
]

export default function ImageCrop() {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [preset, setPreset] = useState('Free')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // crop selection in image coordinates
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [dragging, setDragging] = useState<null | 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'create'>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cropStart, setCropStart] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [scale, setScale] = useState(1)

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      setImg(image)
      setCrop({ x: 0, y: 0, w: image.width, h: image.height })
    }
    image.src = url
  }

  // compute display scale
  useEffect(() => {
    if (!img || !containerRef.current) return
    const maxW = containerRef.current.clientWidth
    const maxH = 500
    const s = Math.min(maxW / img.width, maxH / img.height, 1)
    setScale(s)
  }, [img])

  // apply preset when changed
  useEffect(() => {
    if (!img) return
    const p = PRESETS[preset]
    if (p.w === 0) {
      setCrop({ x: 0, y: 0, w: img.width, h: img.height })
      return
    }
    const ratio = p.w / p.h
    let cw = img.width
    let ch = cw / ratio
    if (ch > img.height) {
      ch = img.height
      cw = ch * ratio
    }
    setCrop({ x: Math.round((img.width - cw) / 2), y: Math.round((img.height - ch) / 2), w: Math.round(cw), h: Math.round(ch) })
  }, [preset, img])

  // draw
  useEffect(() => {
    if (!img || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    const dw = Math.round(img.width * scale)
    const dh = Math.round(img.height * scale)
    canvasRef.current.width = dw
    canvasRef.current.height = dh
    ctx.drawImage(img, 0, 0, dw, dh)
    // darken outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, dw, dh)
    // draw bright crop area
    const sx = crop.x * scale, sy = crop.y * scale, sw = crop.w * scale, sh = crop.h * scale
    ctx.clearRect(sx, sy, sw, sh)
    ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, sx, sy, sw, sh)
    // crop border
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.strokeRect(sx, sy, sw, sh)
    // grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(sx + sw * i / 3, sy)
      ctx.lineTo(sx + sw * i / 3, sy + sh)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(sx, sy + sh * i / 3)
      ctx.lineTo(sx + sw, sy + sh * i / 3)
      ctx.stroke()
    }
    // corner handles
    const hs = 8
    ctx.fillStyle = '#3b82f6'
    for (const [cx, cy] of [[sx, sy], [sx + sw, sy], [sx, sy + sh], [sx + sw, sy + sh]]) {
      ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs)
    }
  }, [img, crop, scale])

  const getImageCoords = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    }
  }, [scale])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!img) return
    e.preventDefault()
    const { x, y } = getImageCoords(e)
    const hs = 12 / scale // handle size in image coords
    const cx = crop.x, cy = crop.y, cw = crop.w, ch = crop.h

    // check corners
    if (Math.abs(x - cx) < hs && Math.abs(y - cy) < hs) { setDragging('nw'); setDragStart({ x, y }); setCropStart({ ...crop }); return }
    if (Math.abs(x - (cx + cw)) < hs && Math.abs(y - cy) < hs) { setDragging('ne'); setDragStart({ x, y }); setCropStart({ ...crop }); return }
    if (Math.abs(x - cx) < hs && Math.abs(y - (cy + ch)) < hs) { setDragging('sw'); setDragStart({ x, y }); setCropStart({ ...crop }); return }
    if (Math.abs(x - (cx + cw)) < hs && Math.abs(y - (cy + ch)) < hs) { setDragging('se'); setDragStart({ x, y }); setCropStart({ ...crop }); return }

    // inside crop = move
    if (x >= cx && x <= cx + cw && y >= cy && y <= cy + ch) {
      setDragging('move')
      setDragStart({ x, y })
      setCropStart({ ...crop })
      return
    }

    // outside = create new crop
    setDragging('create')
    setDragStart({ x, y })
    setCrop({ x: Math.round(x), y: Math.round(y), w: 0, h: 0 })
  }, [img, crop, getImageCoords, scale])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !img) return
    e.preventDefault()
    const { x, y } = getImageCoords(e)
    const dx = x - dragStart.x
    const dy = y - dragStart.y
    const p = PRESETS[preset]
    const locked = p.w !== 0

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

    if (dragging === 'move') {
      const nx = clamp(Math.round(cropStart.x + dx), 0, img.width - cropStart.w)
      const ny = clamp(Math.round(cropStart.y + dy), 0, img.height - cropStart.h)
      setCrop({ x: nx, y: ny, w: cropStart.w, h: cropStart.h })
    } else if (dragging === 'create') {
      let w = Math.round(x - dragStart.x)
      let h = Math.round(y - dragStart.y)
      if (locked) {
        const ratio = p.w / p.h
        h = Math.round(Math.abs(w) / ratio) * Math.sign(h || 1)
      }
      const nx = w < 0 ? Math.round(dragStart.x + w) : Math.round(dragStart.x)
      const ny = h < 0 ? Math.round(dragStart.y + h) : Math.round(dragStart.y)
      const aw = Math.abs(w), ah = Math.abs(h)
      setCrop({
        x: clamp(nx, 0, img.width - aw),
        y: clamp(ny, 0, img.height - ah),
        w: Math.min(aw, img.width),
        h: Math.min(ah, img.height),
      })
    } else {
      // corner resize
      let { x: sx, y: sy, w: sw, h: sh } = cropStart
      if (dragging === 'se') { sw += dx; sh += dy }
      else if (dragging === 'nw') { sx += dx; sy += dy; sw -= dx; sh -= dy }
      else if (dragging === 'ne') { sw += dx; sy += dy; sh -= dy }
      else if (dragging === 'sw') { sx += dx; sw -= dx; sh += dy }

      if (locked) {
        const ratio = p.w / p.h
        sh = sw / ratio
      }

      sw = Math.max(20, sw)
      sh = Math.max(20, sh)
      sx = clamp(Math.round(sx), 0, img.width - 20)
      sy = clamp(Math.round(sy), 0, img.height - 20)
      sw = Math.min(Math.round(sw), img.width - sx)
      sh = Math.min(Math.round(sh), img.height - sy)
      setCrop({ x: sx, y: sy, w: sw, h: sh })
    }
  }, [dragging, dragStart, cropStart, getImageCoords, img, preset])

  const handleMouseUp = () => setDragging(null)

  const download = () => {
    if (!img) return
    const c = document.createElement('canvas')
    c.width = Math.round(crop.w)
    c.height = Math.round(crop.h)
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h)
    const a = document.createElement('a')
    a.download = 'cropped-image.png'
    a.href = c.toDataURL('image/png')
    a.click()
  }

  return (
    <ToolLayout
      title="Image Crop Tool"
      description="Crop images to any size or aspect ratio. Presets for Instagram, YouTube, Facebook, Twitter, and LinkedIn. Free, private, no upload."
      category="Design"
      slug="image-crop"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["image crop", "crop photo online", "instagram crop", "youtube thumbnail crop", "aspect ratio crop"]}
    >
      {!img ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl p-16 cursor-pointer hover:border-blue-500/50 transition-colors">
          <span className="text-4xl mb-3">🖼</span>
          <span className="text-zinc-400 mb-1">Drop an image here or click to upload</span>
          <span className="text-xs text-zinc-600">JPG, PNG, WebP, GIF, BMP</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Preset selector */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map(name => (
              <button
                key={name}
                onClick={() => setPreset(name)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  preset === name ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div
            ref={containerRef}
            className="relative bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              className="cursor-crosshair"
              onMouseDown={handleMouseDown}
            />
          </div>

          {/* Info and actions */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-zinc-400 space-x-4">
              <span>Crop: {Math.round(crop.w)} × {Math.round(crop.h)} px</span>
              <span>Original: {img.width} × {img.height} px</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setImg(null); setCrop({ x: 0, y: 0, w: 0, h: 0 }) }}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
              >
                New Image
              </button>
              <button
                onClick={download}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
              >
                Download Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
