"use client";

import { useState, useEffect, useCallback } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const faqs: FAQ[] = [
  {
    question: "How do I generate a color palette?",
    answer: "Click Generate or press the spacebar to create a random 5-color palette. If you find a color you like, click the lock icon to keep it, then generate again to randomize only the unlocked colors."
  },
  {
    question: "Can I export my color palette as CSS variables?",
    answer: "Yes. Use the Export section at the bottom of the tool to copy your palette as CSS custom properties, Tailwind config values, or a plain hex list. Click Copy Export to copy the output to your clipboard."
  },
  {
    question: "How do I lock a color in the palette?",
    answer: "Hover over a color swatch and click the lock icon in the top-right corner. Locked colors stay fixed when you generate new palettes, letting you build around colors you already like."
  },
  {
    question: "What color formats are shown for each swatch?",
    answer: "Each color swatch displays its hex code, RGB values, and HSL values. Click any swatch to copy its hex code to your clipboard instantly."
  },
  {
    question: "Can I use these color palettes for my website or app?",
    answer: "Yes. The palettes are randomly generated and free to use for any purpose. Export them as CSS variables or Tailwind config values and paste directly into your project."
  },
  {
    question: "Is there a keyboard shortcut to generate new palettes?",
    answer: "Yes. Press the spacebar to instantly generate a new palette. This makes it fast to cycle through combinations until you find one you like."
  }
]

const relatedTools: RelatedTool[] = [
  { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
  { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
  { name: "Image Color Picker", href: "/tools/image-color-picker" },
  { name: "Photo Watermark Remover", href: "/tools/photo-watermark-remover" }
]

interface PaletteColor {
  hex: string;
  locked: boolean;
}

function randomHex(): string {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

type ExportFormat = "css" | "tailwind" | "hex";

export default function ColorPaletteGeneratorPage() {
  const [colors, setColors] = useState<PaletteColor[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");

  const generate = useCallback(() => {
    setColors((prev) => {
      if (prev.length === 0) {
        return Array.from({ length: 5 }, () => ({ hex: randomHex(), locked: false }));
      }
      return prev.map((c) => (c.locked ? c : { ...c, hex: randomHex() }));
    });
  }, []);

  useEffect(() => {
    generate();
  }, [generate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [generate]);

  const toggleLock = (idx: number) => {
    setColors((prev) => prev.map((c, i) => (i === idx ? { ...c, locked: !c.locked } : c)));
  };

  const copyHex = async (hex: string, idx: number) => {
    await navigator.clipboard.writeText(hex);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const getExportText = (): string => {
    switch (exportFormat) {
      case "css":
        return `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join("\n")}\n}`;
      case "tailwind":
        return `colors: {\n${colors.map((c, i) => `  'palette-${i + 1}': '${c.hex}',`).join("\n")}\n}`;
      case "hex":
        return colors.map((c) => c.hex).join("\n");
      default:
        return "";
    }
  };

  return (
    <ToolLayout
      title="Color Palette Generator"
      description="Generate beautiful 5-color palettes. Lock colors you like, press spacebar to regenerate."
      category="Design"
      slug="color-palette-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "color palette generator",
        "random color palette",
        "color scheme generator",
        "color palette maker",
        "generate color palette online",
        "css color palette",
        "tailwind color palette",
        "website color scheme"
      ]}
      guide={
        <>
          <h2>What Is the Color Palette Generator?</h2>
          <p>
            The Color Palette Generator creates random 5-color palettes that you can use in web design, graphic design, illustration, and branding projects. Each swatch displays its hex, RGB, and HSL values, and you can lock individual colors while regenerating the rest.
          </p>
          <p>
            The tool runs entirely in your browser with no signup or account required. Palettes can be exported as CSS custom properties, Tailwind configuration values, or a plain hex list — ready to paste directly into your project.
          </p>

          <h3>How to Generate a Color Palette</h3>
          <p>Creating a palette is fast and intuitive:</p>
          <ul>
            <li>Click Generate or press the spacebar to create a new random 5-color palette.</li>
            <li>Click any color swatch to copy its hex code to your clipboard.</li>
            <li>Hover over a swatch and click the lock icon to keep that color fixed.</li>
            <li>Press spacebar again — only unlocked colors will change, letting you build around your favorite colors.</li>
            <li>Use the Export section to copy the palette in your preferred format.</li>
          </ul>

          <h3>Export Formats</h3>
          <p>The tool supports three export formats for easy integration into your workflow:</p>
          <ul>
            <li><strong>CSS Variables</strong> — Generates a :root block with custom properties you can drop into any stylesheet.</li>
            <li><strong>Tailwind</strong> — Produces a colors object ready for your tailwind.config.js file.</li>
            <li><strong>Hex List</strong> — A simple newline-separated list of hex values, useful for design tools and documentation.</li>
          </ul>

          <h3>Tips for Building Great Palettes</h3>
          <ul>
            <li>Lock one or two colors that match your brand, then generate to find complementary accents.</li>
            <li>Look at the HSL lightness values to ensure good contrast between your text and background colors.</li>
            <li>For accessible designs, pair colors with at least a 4.5:1 contrast ratio for text.</li>
            <li>Generate several palettes and screenshot your favorites for comparison before committing.</li>
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Finding color schemes for websites, apps, and landing pages.</li>
            <li>Creating brand color palettes for logos and marketing materials.</li>
            <li>Exploring color combinations for illustrations and digital art.</li>
            <li>Generating themed palettes for presentations and slide decks.</li>
            <li>Rapid prototyping with ready-to-use CSS or Tailwind values.</li>
          </ul>
        </>
      }
    >
      {/* Palette display */}
      <div className="mb-6 grid grid-cols-5 gap-2 overflow-hidden rounded-lg">
        {colors.map((c, i) => {
          const rgb = hexToRgb(c.hex);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          const isLight = hsl.l > 55;
          return (
            <div
              key={i}
              className="group relative flex min-h-[200px] cursor-pointer flex-col items-center justify-end p-4 transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: c.hex }}
              onClick={() => copyHex(c.hex, i)}
            >
              {/* Lock button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleLock(i); }}
                className={`absolute top-3 right-3 rounded-full p-1.5 text-xs transition-all ${
                  c.locked
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                } ${isLight ? "bg-black/20 text-black" : "bg-white/20 text-white"}`}
              >
                {c.locked ? "\u{1F512}" : "\u{1F513}"}
              </button>

              {/* Copied indicator */}
              {copiedIdx === i && (
                <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-sm font-medium ${isLight ? "bg-black/70 text-white" : "bg-white/70 text-black"}`}>
                  Copied!
                </span>
              )}

              {/* Color info */}
              <div className={`space-y-0.5 text-center text-xs font-mono ${isLight ? "text-black/80" : "text-white/80"}`}>
                <div className="text-sm font-bold">{c.hex.toUpperCase()}</div>
                <div>rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
                <div>hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={generate}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          Generate
        </button>
        <span className="text-xs text-zinc-500">or press spacebar</span>
      </div>

      {/* Export */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-3 flex items-center gap-3">
          <h3 className="text-sm font-medium text-zinc-300">Export as:</h3>
          {(["css", "tailwind", "hex"] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setExportFormat(fmt)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                exportFormat === fmt
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {fmt === "css" ? "CSS Variables" : fmt === "tailwind" ? "Tailwind" : "Hex List"}
            </button>
          ))}
        </div>
        <pre className="rounded-lg bg-zinc-800 p-4 text-sm text-zinc-300 overflow-x-auto">
          {getExportText()}
        </pre>
        <div className="mt-3">
          <CopyButton text={getExportText()} label="Copy Export" />
        </div>
      </div>
    </ToolLayout>
  );
}
