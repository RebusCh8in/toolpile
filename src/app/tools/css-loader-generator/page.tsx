'use client'

import { useState } from 'react'
import ToolLayout, { FAQ, RelatedTool } from '@/components/ToolLayout'

interface Loader {
  label: string
  html: string
  css: string
}

const LOADERS: Loader[] = [
  {
    label: 'Spinner',
    html: '<div class="loader"></div>',
    css: `.loader {
  width: VAR_SIZE;
  height: VAR_SIZE;
  border: VAR_BORDER solid VAR_BG;
  border-top: VAR_BORDER solid VAR_COLOR;
  border-radius: 50%;
  animation: spin VAR_SPEED linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
  },
  {
    label: 'Dots',
    html: '<div class="loader"><div></div><div></div><div></div></div>',
    css: `.loader {
  display: flex;
  gap: calc(VAR_SIZE / 4);
}
.loader div {
  width: calc(VAR_SIZE / 3);
  height: calc(VAR_SIZE / 3);
  background: VAR_COLOR;
  border-radius: 50%;
  animation: bounce VAR_SPEED ease-in-out infinite;
}
.loader div:nth-child(2) { animation-delay: 0.15s; }
.loader div:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}`,
  },
  {
    label: 'Pulse',
    html: '<div class="loader"></div>',
    css: `.loader {
  width: VAR_SIZE;
  height: VAR_SIZE;
  background: VAR_COLOR;
  border-radius: 50%;
  animation: pulse VAR_SPEED ease-in-out infinite;
}
@keyframes pulse {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}`,
  },
  {
    label: 'Bars',
    html: '<div class="loader"><div></div><div></div><div></div><div></div></div>',
    css: `.loader {
  display: flex;
  align-items: center;
  gap: calc(VAR_SIZE / 10);
  height: VAR_SIZE;
}
.loader div {
  width: calc(VAR_SIZE / 8);
  height: 100%;
  background: VAR_COLOR;
  animation: bars VAR_SPEED ease-in-out infinite;
}
.loader div:nth-child(1) { animation-delay: 0s; }
.loader div:nth-child(2) { animation-delay: 0.1s; }
.loader div:nth-child(3) { animation-delay: 0.2s; }
.loader div:nth-child(4) { animation-delay: 0.3s; }
@keyframes bars {
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
}`,
  },
  {
    label: 'Ring',
    html: '<div class="loader"></div>',
    css: `.loader {
  width: VAR_SIZE;
  height: VAR_SIZE;
  border: VAR_BORDER solid transparent;
  border-top: VAR_BORDER solid VAR_COLOR;
  border-right: VAR_BORDER solid VAR_COLOR;
  border-radius: 50%;
  animation: spin VAR_SPEED linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
  },
  {
    label: 'Dual Ring',
    html: '<div class="loader"></div>',
    css: `.loader {
  width: VAR_SIZE;
  height: VAR_SIZE;
  border: VAR_BORDER solid VAR_BG;
  border-top: VAR_BORDER solid VAR_COLOR;
  border-bottom: VAR_BORDER solid VAR_COLOR;
  border-radius: 50%;
  animation: spin VAR_SPEED linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
  },
]

const faqs: FAQ[] = [
  {
    question: "How do I use a CSS loader?",
    answer: "Copy the HTML and CSS, paste the CSS into your stylesheet and the HTML where you want the loader to appear. Show it while content is loading and hide it when ready."
  },
  {
    question: "Are these loaders pure CSS?",
    answer: "Yes. All loaders use only HTML and CSS with keyframe animations. No JavaScript or images required. They work in all modern browsers."
  },
  {
    question: "Can I customize the colors and size?",
    answer: "Yes. Use the controls to adjust the color, size, speed, and border width. The CSS updates in real time. You can also edit the CSS directly after copying."
  },
]

const relatedTools: RelatedTool[] = [
  { name: "Glassmorphism Generator", href: "/tools/glassmorphism-generator" },
  { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
]

export default function CssLoaderGenerator() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [color, setColor] = useState('#3b82f6')
  const [size, setSize] = useState(48)
  const [speed, setSpeed] = useState(1)
  const [borderWidth, setBorderWidth] = useState(4)
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [copiedCss, setCopiedCss] = useState(false)

  const loader = LOADERS[activeIdx]

  const bgColor = color + '33'
  const finalCss = loader.css
    .replace(/VAR_COLOR/g, color)
    .replace(/VAR_BG/g, bgColor)
    .replace(/VAR_SIZE/g, `${size}px`)
    .replace(/VAR_SPEED/g, `${speed}s`)
    .replace(/VAR_BORDER/g, `${borderWidth}px`)

  const copyHtml = () => {
    navigator.clipboard.writeText(loader.html)
    setCopiedHtml(true)
    setTimeout(() => setCopiedHtml(false), 2000)
  }

  const copyCss = () => {
    navigator.clipboard.writeText(finalCss)
    setCopiedCss(true)
    setTimeout(() => setCopiedCss(false), 2000)
  }

  return (
    <ToolLayout
      title="CSS Loader Generator"
      description="Generate pure CSS loading spinners and animations. Customize color, size, and speed. Copy HTML + CSS with one click."
      category="Developer"
      slug="css-loader-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "css loader generator",
        "css spinner",
        "loading animation css",
        "css loading spinner",
        "css loader",
        "pure css loader",
        "loading spinner generator",
        "css animation loader",
        "css spinner generator",
        "loading animation generator",
      ]}
      guide={
        <>
          <h2>CSS Loader Generator</h2>
          <p>
            Generate pure CSS loading spinners and animations for your website. Choose from multiple loader styles, customize colors, size, and speed, then copy the HTML and CSS.
          </p>
          <h3>How to Use</h3>
          <ul>
            <li>Pick a loader style from the options.</li>
            <li>Customize the color, size, speed, and border width.</li>
            <li>Preview the animation in real time.</li>
            <li>Copy the HTML and CSS separately.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex items-center justify-center" style={{ minHeight: 200 }}>
          <style dangerouslySetInnerHTML={{ __html: finalCss }} />
          <div dangerouslySetInnerHTML={{ __html: loader.html }} />
        </div>

        {/* Loader type */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Style</p>
          <div className="flex flex-wrap gap-2">
            {LOADERS.map((l, i) => (
              <button
                key={l.label}
                onClick={() => setActiveIdx(i)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeIdx === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-zinc-400">Size</label>
                <span className="text-sm text-zinc-300">{size}px</span>
              </div>
              <input
                type="range"
                min={16}
                max={96}
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-zinc-400">Speed</label>
                <span className="text-sm text-zinc-300">{speed}s</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.1}
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-zinc-400">Border Width</label>
                <span className="text-sm text-zinc-300">{borderWidth}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={borderWidth}
                onChange={e => setBorderWidth(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-400">Color:</label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
              />
              <span className="text-sm text-zinc-300 font-mono">{color}</span>
            </div>
          </div>
        </div>

        {/* Code Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">HTML</p>
              <button
                onClick={copyHtml}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1 text-sm transition-colors"
              >
                {copiedHtml ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-zinc-950 rounded-lg p-3 text-sm text-zinc-300 font-mono overflow-x-auto">
              {loader.html}
            </pre>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">CSS</p>
              <button
                onClick={copyCss}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1 text-sm transition-colors"
              >
                {copiedCss ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-zinc-950 rounded-lg p-3 text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap">
              {finalCss}
            </pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
