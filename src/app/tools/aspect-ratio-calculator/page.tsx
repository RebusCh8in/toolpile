"use client";

import { useState, useMemo } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

const presets = [
  { label: "16:9", w: 16, h: 9 },
  { label: "4:3", w: 4, h: 3 },
  { label: "1:1", w: 1, h: 1 },
  { label: "21:9", w: 21, h: 9 },
  { label: "9:16", w: 9, h: 16 },
  { label: "3:2", w: 3, h: 2 },
];

export default function AspectRatioCalculatorPage() {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [locked, setLocked] = useState(false);
  const [lockedRatio, setLockedRatio] = useState<number | null>(null);

  const ratio = useMemo(() => {
    if (width <= 0 || height <= 0) return "N/A";
    const g = gcd(width, height);
    return `${width / g}:${height / g}`;
  }, [width, height]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (locked && lockedRatio && val > 0) {
      setHeight(Math.round(val / lockedRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (locked && lockedRatio && val > 0) {
      setWidth(Math.round(val * lockedRatio));
    }
  };

  const handleLockToggle = () => {
    if (!locked && width > 0 && height > 0) {
      setLockedRatio(width / height);
    }
    setLocked(!locked);
  };

  const applyPreset = (w: number, h: number) => {
    // Keep the larger dimension and calculate the other
    const scaledH = Math.round((width * h) / w);
    setHeight(scaledH);
    setLockedRatio(w / h);
    setLocked(true);
  };

  // Visual preview dimensions (max 300px)
  const previewMax = 300;
  const previewW = width >= height ? previewMax : Math.round((previewMax * width) / height);
  const previewH = height >= width ? previewMax : Math.round((previewMax * height) / width);

  return (
    <ToolLayout
      title="Aspect Ratio Calculator"
      description="Calculate and visualize aspect ratios. Lock a ratio and auto-calculate dimensions."
      category="Design"
      slug="aspect-ratio-calculator"
      keywords={[
        "aspect ratio calculator",
        "calculate aspect ratio",
        "16:9 resolution calculator",
        "image aspect ratio",
        "video aspect ratio calculator",
        "screen resolution ratio",
        "resize image keep ratio",
        "aspect ratio from dimensions",
      ]}
      guide={
        <>
          <h2>What Is the Aspect Ratio Calculator?</h2>
          <p>
            The Aspect Ratio Calculator helps you determine the proportional relationship between width and height for any dimensions. Enter a width and height to instantly see the simplified ratio, or lock a ratio and let the tool auto-calculate the missing dimension when you change one value.
          </p>
          <p>
            This is essential for designers, video editors, photographers, and developers who need to resize content while maintaining correct proportions. The visual preview shows you exactly how the dimensions look relative to each other.
          </p>

          <h3>How to Use the Aspect Ratio Calculator</h3>
          <ul>
            <li>Enter your width and height values in pixels. The simplified aspect ratio appears instantly below the inputs.</li>
            <li>Click the lock button between the width and height fields to lock the current ratio. When locked, changing one dimension automatically updates the other to maintain the proportion.</li>
            <li>Use the preset buttons (16:9, 4:3, 1:1, 21:9, 9:16, 3:2) to quickly apply common aspect ratios. The calculator keeps your current width and adjusts the height to match.</li>
            <li>The visual preview on the right updates in real time to show you the shape of your dimensions.</li>
            <li>Unlock the ratio at any time to freely edit both dimensions independently.</li>
          </ul>

          <h3>Common Aspect Ratios Explained</h3>
          <p>
            16:9 is the standard widescreen ratio used by most monitors, TVs, and YouTube videos. 4:3 is the classic TV and presentation format. 1:1 is a perfect square, commonly used for social media profile images and Instagram posts. 21:9 is the ultrawide cinema format. 9:16 is vertical video for TikTok, Instagram Reels, and YouTube Shorts. 3:2 is the traditional photography ratio used by most DSLR cameras.
          </p>

          <h3>Use Cases</h3>
          <ul>
            <li>Calculating video export dimensions for specific platforms</li>
            <li>Resizing images for web design while preserving proportions</li>
            <li>Determining the correct resolution for monitor or display setups</li>
            <li>Planning responsive layouts that maintain visual consistency</li>
            <li>Converting between standard aspect ratios for print and digital media</li>
          </ul>

          <h3>How Aspect Ratios Are Calculated</h3>
          <p>
            The tool finds the greatest common divisor (GCD) of your width and height, then divides both values by it. For example, 1920 and 1080 share a GCD of 120, giving you 16:9. When the ratio is locked, the tool stores the decimal ratio and uses it to calculate the complementary dimension as you type.
          </p>
        </>
      }
      faqs={[
        {
          question: "How do I calculate the aspect ratio of an image?",
          answer: "Enter the image width and height in pixels into the calculator. It automatically simplifies the ratio using the greatest common divisor. For example, a 1920x1080 image returns 16:9."
        },
        {
          question: "What is the aspect ratio of 1920x1080?",
          answer: "1920x1080 has an aspect ratio of 16:9. This is the standard Full HD widescreen ratio used by most monitors, TVs, and video streaming platforms."
        },
        {
          question: "How do I resize an image without distortion?",
          answer: "Enter your current dimensions, then click the lock button to lock the ratio. Now when you change either the width or height, the other dimension adjusts automatically to maintain the exact proportion, preventing any stretching or distortion."
        },
        {
          question: "What aspect ratio should I use for YouTube videos?",
          answer: "YouTube recommends 16:9 for standard videos. Use the 16:9 preset in this calculator to find the right dimensions. For YouTube Shorts, use the 9:16 vertical preset instead."
        },
        {
          question: "What is the difference between 16:9 and 4:3?",
          answer: "16:9 is a widescreen format that is wider relative to its height, standard for modern displays and video. 4:3 is the older, more square-shaped format used by classic TVs and some presentation slides."
        },
        {
          question: "How do I find the width if I know the height and aspect ratio?",
          answer: "Select a preset ratio or enter your known dimensions to lock the ratio. Then change the height field to your target value and the width will be calculated automatically."
        },
      ] as FAQ[]}
      relatedTools={[
        { name: "Image Color Picker", href: "/tools/image-color-picker" },
        { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
        { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
        { name: "Unit Converter", href: "/tools/unit-converter" },
      ] as RelatedTool[]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-4">
          {/* Dimensions */}
          <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Width</label>
              <input
                type="number"
                min={1}
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleLockToggle}
              className={`mb-0.5 rounded-lg px-3 py-2 text-lg transition-colors ${
                locked ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
              title={locked ? "Unlock ratio" : "Lock ratio"}
            >
              {locked ? "\u{1F512}" : "\u{1F513}"}
            </button>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Height</label>
              <input
                type="number"
                min={1}
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Ratio display */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center">
            <span className="text-sm text-zinc-400">Aspect Ratio</span>
            <p className="text-3xl font-bold text-blue-400">{ratio}</p>
          </div>

          {/* Presets */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Common Ratios</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.w, p.h)}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual preview */}
        <div className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 p-6 min-h-[350px]">
          <div className="flex flex-col items-center gap-3">
            <div
              className="rounded border-2 border-blue-500 bg-blue-500/10 transition-all flex items-center justify-center"
              style={{ width: `${previewW}px`, height: `${previewH}px` }}
            >
              <span className="text-sm text-blue-400 font-mono">
                {width} x {height}
              </span>
            </div>
            <span className="text-xs text-zinc-500">{ratio}</span>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
