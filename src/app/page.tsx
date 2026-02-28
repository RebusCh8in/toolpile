"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Tool {
  name: string;
  description: string;
  href: string;
  icon: string;
  category: string;
}

const tools: Tool[] = [
  { name: "Video Watermark Remover", description: "Remove watermarks from videos of any length. No time limits, no upload, free forever.", href: "/tools/video-watermark-remover", icon: "\uD83C\uDFAC", category: "Design" },
  { name: "Photo Watermark Remover", description: "Remove watermarks from photos for free. No signup, no limits, 100% private.", href: "/tools/photo-watermark-remover", icon: "\u2702", category: "Design" },
  { name: "QR Code Generator", description: "Generate customizable QR codes from any text or URL", href: "/tools/qr-code-generator", icon: "\u25A3", category: "Utility" },
  { name: "Color Palette Generator", description: "Create beautiful random color palettes with lock and export", href: "/tools/color-palette-generator", icon: "\u25D0", category: "Design" },
  { name: "CSS Gradient Generator", description: "Build linear, radial, and conic CSS gradients visually", href: "/tools/css-gradient-generator", icon: "\u25C8", category: "Design" },
  { name: "Box Shadow Generator", description: "Design CSS box shadows with a live visual editor", href: "/tools/box-shadow-generator", icon: "\u25FB", category: "Design" },
  { name: "Password Generator", description: "Generate strong, secure passwords with customizable options", href: "/tools/password-generator", icon: "\u26BF", category: "Utility" },
  { name: "JSON Formatter", description: "Prettify, minify, and validate JSON with syntax highlighting", href: "/tools/json-formatter", icon: "{}", category: "Developer" },
  { name: "Base64 Encoder", description: "Encode and decode text and files to and from Base64", href: "/tools/base64-encoder", icon: "\u29C9", category: "Developer" },
  { name: "Lorem Ipsum Generator", description: "Generate placeholder text in paragraphs, sentences, or words", href: "/tools/lorem-ipsum-generator", icon: "\u00B6", category: "Text" },
  { name: "UUID Generator", description: "Generate random UUID v4 identifiers, single or in bulk", href: "/tools/uuid-generator", icon: "\u2B22", category: "Developer" },
  { name: "Word Counter", description: "Count words, characters, sentences, and analyze text", href: "/tools/word-counter", icon: "\u2263", category: "Text" },
  { name: "Image Color Picker", description: "Upload an image and pick any color with an eyedropper", href: "/tools/image-color-picker", icon: "\u2740", category: "Design" },
  { name: "Aspect Ratio Calculator", description: "Calculate and visualize aspect ratios with presets", href: "/tools/aspect-ratio-calculator", icon: "\u25AD", category: "Design" },
  { name: "Unit Converter", description: "Convert between length, weight, temperature, data, and time units", href: "/tools/unit-converter", icon: "\u21C4", category: "Utility" },
  { name: "Regex Tester", description: "Test regular expressions with live highlighting and match info", href: "/tools/regex-tester", icon: ".*", category: "Developer" },
  { name: "Markdown Preview", description: "Write and preview Markdown with a live split-pane editor", href: "/tools/markdown-preview", icon: "\u24DC", category: "Text" },
];

const categories = ["All", "Developer", "Design", "Text", "Utility"];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <div className="mb-14 text-center">
        <h1 className="mb-4 font-display text-6xl tracking-tight text-zinc-100 sm:text-7xl">
          <span className="text-blue-500">&#9670;</span> ToolPile
        </h1>
        <p className="mx-auto max-w-lg text-lg text-zinc-400 leading-relaxed">
          Free developer &amp; design tools, right in your browser.
          <br />
          <span className="text-zinc-500">No signup. No data stored. Ever.</span>
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-8 max-w-xl">
        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3.5 text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
        />
      </div>

      {/* Category filters */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tool grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl border border-zinc-700 bg-zinc-900 p-6 transition-all hover:border-blue-400/40 hover:shadow-md"
          >
            <div className="mb-3 text-2xl">{tool.icon}</div>
            <h2 className="mb-1.5 text-lg font-semibold text-zinc-100 group-hover:text-blue-500 transition-colors">
              {tool.name}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{tool.description}</p>
            <span className="mt-3 inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-500 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-colors">
              {tool.category}
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-zinc-500">
          No tools found. Try a different search or category.
        </p>
      )}
    </div>
  );
}
