'use client'

import Link from 'next/link'
import ToolLayout from '@/components/ToolLayout'

const CONVERSIONS = [
  { slug: 'jpg-to-png', from: 'JPG', to: 'PNG' },
  { slug: 'png-to-jpg', from: 'PNG', to: 'JPG' },
  { slug: 'webp-to-png', from: 'WebP', to: 'PNG' },
  { slug: 'webp-to-jpg', from: 'WebP', to: 'JPG' },
  { slug: 'png-to-webp', from: 'PNG', to: 'WebP' },
  { slug: 'jpg-to-webp', from: 'JPG', to: 'WebP' },
  { slug: 'svg-to-png', from: 'SVG', to: 'PNG' },
  { slug: 'svg-to-jpg', from: 'SVG', to: 'JPG' },
  { slug: 'bmp-to-png', from: 'BMP', to: 'PNG' },
  { slug: 'bmp-to-jpg', from: 'BMP', to: 'JPG' },
  { slug: 'gif-to-png', from: 'GIF', to: 'PNG' },
  { slug: 'gif-to-jpg', from: 'GIF', to: 'JPG' },
  { slug: 'png-to-ico', from: 'PNG', to: 'ICO' },
  { slug: 'jpg-to-bmp', from: 'JPG', to: 'BMP' },
  { slug: 'heic-to-jpg', from: 'HEIC', to: 'JPG' },
  { slug: 'heic-to-png', from: 'HEIC', to: 'PNG' },
  { slug: 'tiff-to-jpg', from: 'TIFF', to: 'JPG' },
  { slug: 'tiff-to-png', from: 'TIFF', to: 'PNG' },
  { slug: 'webp-to-gif', from: 'WebP', to: 'GIF' },
  { slug: 'png-to-gif', from: 'PNG', to: 'GIF' },
]

export default function ConvertIndexPage() {
  return (
    <ToolLayout
      title="Image Format Converter"
      description="Convert between 20+ image formats instantly in your browser. Free, no upload, no signup. JPG, PNG, WebP, SVG, HEIC, GIF, BMP, TIFF, ICO and more."
      category="Design"
      slug="convert"
      faqs={[
        {
          question: "How do I convert an image format for free?",
          answer: "Pick the conversion you need below, upload your image, and download the converted file. Everything runs in your browser — no server upload, no signup."
        },
        {
          question: "Is my image uploaded to a server?",
          answer: "No. All conversions happen entirely in your browser using the Canvas API. Your images never leave your device."
        },
        {
          question: "What image formats are supported?",
          answer: "JPG, PNG, WebP, SVG, GIF, BMP, TIFF, HEIC, and ICO. You can convert between any supported pair listed below."
        },
      ]}
      keywords={[
        "image format converter",
        "convert image online free",
        "image converter",
        "free image converter",
        "online image converter",
        "convert image format",
      ]}
      guide={
        <>
          <h2>Free Image Format Converter</h2>
          <p>
            Convert between any popular image format instantly in your browser. No server upload, no signup, completely private. Pick a conversion below to get started.
          </p>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONVERSIONS.map(c => (
          <Link
            key={c.slug}
            href={`/tools/convert/${c.slug}`}
            className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-blue-400/40 hover:shadow-md"
          >
            <div className="flex items-center gap-2 text-lg font-medium">
              <span className="text-zinc-300 group-hover:text-blue-400 transition-colors">{c.from}</span>
              <span className="text-zinc-600">&rarr;</span>
              <span className="text-zinc-300 group-hover:text-blue-400 transition-colors">{c.to}</span>
            </div>
            <span className="ml-auto text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">Convert &rarr;</span>
          </Link>
        ))}
      </div>
    </ToolLayout>
  )
}
