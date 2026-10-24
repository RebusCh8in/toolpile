'use client'

import { useState, useCallback } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

interface ExifData {
  [key: string]: string | number | undefined
}

function readExifFromBuffer(buffer: ArrayBuffer): ExifData {
  const view = new DataView(buffer)
  const data: ExifData = {}

  // Check JPEG magic bytes
  if (view.getUint16(0) !== 0xFFD8) {
    return { _error: 'Not a JPEG file. EXIF data is only available in JPEG images.' }
  }

  let offset = 2
  while (offset < view.byteLength - 1) {
    const marker = view.getUint16(offset)
    if (marker === 0xFFE1) { // APP1 = EXIF
      const length = view.getUint16(offset + 2)
      // Check "Exif\0\0"
      const exifHeader = String.fromCharCode(
        view.getUint8(offset + 4), view.getUint8(offset + 5),
        view.getUint8(offset + 6), view.getUint8(offset + 7)
      )
      if (exifHeader === 'Exif') {
        const tiffStart = offset + 10
        const littleEndian = view.getUint16(tiffStart) === 0x4949
        const ifdOffset = view.getUint32(tiffStart + 4, littleEndian)
        parseIFD(view, tiffStart, tiffStart + ifdOffset, littleEndian, data)
      }
      offset += 2 + length
    } else if ((marker & 0xFF00) === 0xFF00) {
      if (marker === 0xFFDA) break // Start of scan
      offset += 2 + view.getUint16(offset + 2)
    } else {
      break
    }
  }

  return data
}

const TAG_NAMES: Record<number, string> = {
  0x010F: 'Make', 0x0110: 'Model', 0x0112: 'Orientation',
  0x011A: 'XResolution', 0x011B: 'YResolution', 0x0128: 'ResolutionUnit',
  0x0131: 'Software', 0x0132: 'DateTime', 0x013B: 'Artist',
  0x8769: 'ExifIFDPointer', 0x8825: 'GPSInfoIFDPointer',
  0x829A: 'ExposureTime', 0x829D: 'FNumber', 0x8827: 'ISOSpeedRatings',
  0x9003: 'DateTimeOriginal', 0x9004: 'DateTimeDigitized',
  0x920A: 'FocalLength', 0xA001: 'ColorSpace',
  0xA002: 'PixelXDimension', 0xA003: 'PixelYDimension',
  0xA405: 'FocalLengthIn35mmFilm', 0x9209: 'Flash',
  0xA434: 'LensModel', 0xA433: 'LensMake',
  0x0001: 'GPSLatitudeRef', 0x0002: 'GPSLatitude',
  0x0003: 'GPSLongitudeRef', 0x0004: 'GPSLongitude',
  0x0005: 'GPSAltitudeRef', 0x0006: 'GPSAltitude',
}

function parseIFD(view: DataView, tiffStart: number, ifdStart: number, le: boolean, data: ExifData) {
  try {
    const count = view.getUint16(ifdStart, le)
    for (let i = 0; i < count; i++) {
      const entryOffset = ifdStart + 2 + i * 12
      if (entryOffset + 12 > view.byteLength) break
      const tag = view.getUint16(entryOffset, le)
      const type = view.getUint16(entryOffset + 2, le)
      const numValues = view.getUint32(entryOffset + 4, le)
      const valueOffset = entryOffset + 8

      const name = TAG_NAMES[tag] || `Tag_0x${tag.toString(16).padStart(4, '0')}`

      // Follow sub-IFD pointers
      if (tag === 0x8769 || tag === 0x8825) {
        const subIfdOffset = view.getUint32(valueOffset, le)
        parseIFD(view, tiffStart, tiffStart + subIfdOffset, le, data)
        continue
      }

      if (type === 2) { // ASCII
        const strLen = numValues - 1
        let offset = valueOffset
        if (numValues > 4) offset = tiffStart + view.getUint32(valueOffset, le)
        let str = ''
        for (let j = 0; j < strLen && offset + j < view.byteLength; j++) {
          str += String.fromCharCode(view.getUint8(offset + j))
        }
        data[name] = str
      } else if (type === 3) { // SHORT
        data[name] = view.getUint16(valueOffset, le)
      } else if (type === 4) { // LONG
        data[name] = view.getUint32(valueOffset, le)
      } else if (type === 5) { // RATIONAL
        let offset = valueOffset
        if (numValues * 8 > 4) offset = tiffStart + view.getUint32(valueOffset, le)
        if (offset + 8 <= view.byteLength) {
          const num = view.getUint32(offset, le)
          const den = view.getUint32(offset + 4, le)
          data[name] = den ? `${num}/${den}` : String(num)
        }
      }
    }
  } catch {
    // Silently handle corrupt EXIF segments
  }
}

const faqs: FAQ[] = [
  { question: "What is EXIF data?", answer: "EXIF (Exchangeable Image File Format) is metadata embedded in photos by cameras and phones. It includes camera settings (shutter speed, aperture, ISO), date/time, GPS location, and device information." },
  { question: "Can I remove EXIF data for privacy?", answer: "Yes. EXIF data can contain your GPS location. Removing it before sharing photos online protects your privacy. This tool shows you what data exists — to remove it, re-save the image using the Image Compressor or an image editor." },
  { question: "Which image formats contain EXIF data?", answer: "EXIF data is primarily found in JPEG images. PNG, WebP, and other formats may have different metadata standards (like XMP or IPTC) which this tool doesn't read." },
]

const relatedTools: RelatedTool[] = [
  { name: "Image Compressor", href: "/tools/image-compressor" },
  { name: "Image Resizer", href: "/tools/image-resizer" },
  { name: "Background Remover", href: "/tools/background-remover" },
]

export default function ExifViewer() {
  const [exif, setExif] = useState<ExifData | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [preview, setPreview] = useState('')

  const handleFile = useCallback((file: File) => {
    setFileName(file.name)
    setFileSize(file.size)
    setPreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        setExif(readExifFromBuffer(reader.result))
      }
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const hasError = exif && '_error' in exif
  const entries = exif ? Object.entries(exif).filter(([k]) => k !== '_error') : []

  return (
    <ToolLayout
      title="EXIF Data Viewer"
      description="View photo metadata including camera settings, date, GPS location, and device info. 100% private — runs in your browser."
      category="Design"
      slug="exif-viewer"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={["exif viewer", "photo metadata", "image exif data", "gps location photo", "camera settings viewer"]}
    >
      {!exif ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl p-16 cursor-pointer hover:border-blue-500/50 transition-colors">
          <span className="text-4xl mb-3">📷</span>
          <span className="text-zinc-400 mb-1">Drop a JPEG image here or click to upload</span>
          <span className="text-xs text-zinc-600">EXIF data is available in JPEG photos from cameras and phones</span>
          <input type="file" accept="image/jpeg,image/jpg" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="space-y-6">
          {/* File info */}
          <div className="flex items-start gap-4">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
            )}
            <div>
              <h3 className="text-zinc-100 font-medium">{fileName}</h3>
              <p className="text-sm text-zinc-500">{formatSize(fileSize)}</p>
              <button onClick={() => { setExif(null); setPreview('') }} className="text-xs text-blue-400 hover:text-blue-300 mt-2">Upload another image</button>
            </div>
          </div>

          {hasError ? (
            <p className="text-sm text-yellow-400">{String(exif._error)}</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-zinc-400">No EXIF data found in this image. The metadata may have been stripped already.</p>
          ) : (
            <div className="border border-zinc-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-800">
                    <th className="px-4 py-2 text-left text-zinc-400 font-medium">Property</th>
                    <th className="px-4 py-2 text-left text-zinc-400 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(([key, val]) => (
                    <tr key={key} className="border-t border-zinc-800">
                      <td className="px-4 py-2 text-zinc-400 font-mono text-xs">{key}</td>
                      <td className="px-4 py-2 text-zinc-200 font-mono text-xs break-all">{String(val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
