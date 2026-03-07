"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function MemeGeneratorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [topText, setTopText] = useState("TOP TEXT");
  const [bottomText, setBottomText] = useState("BOTTOM TEXT");
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [font, setFont] = useState("Impact");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageSrc(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const renderMeme = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // Size canvas to image
    const maxW = 800;
    const scale = Math.min(maxW / img.width, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Text settings
    ctx.textAlign = "center";
    ctx.fillStyle = textColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = fontSize / 8;
    ctx.lineJoin = "round";
    ctx.font = `bold ${fontSize * scale}px ${font}, sans-serif`;

    const wrapText = (text: string, y: number, maxWidth: number, lineHeight: number, fromBottom: boolean) => {
      const words = text.split(" ");
      const lines: string[] = [];
      let line = "";

      for (const word of words) {
        const test = line + (line ? " " : "") + word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);

      if (fromBottom) lines.reverse();

      lines.forEach((l, i) => {
        const yPos = fromBottom ? y - i * lineHeight : y + i * lineHeight;
        ctx.strokeText(l, canvas.width / 2, yPos);
        ctx.fillText(l, canvas.width / 2, yPos);
      });
    };

    const maxWidth = canvas.width * 0.9;
    const lineHeight = fontSize * scale * 1.2;
    const padding = fontSize * scale * 0.6;

    if (topText.trim()) {
      wrapText(topText.toUpperCase(), padding + lineHeight * 0.5, maxWidth, lineHeight, false);
    }
    if (bottomText.trim()) {
      wrapText(bottomText.toUpperCase(), canvas.height - padding, maxWidth, lineHeight, true);
    }
  }, [topText, bottomText, fontSize, textColor, strokeColor, font]);

  useEffect(() => {
    if (imageSrc) renderMeme();
  }, [imageSrc, topText, bottomText, fontSize, textColor, strokeColor, font, renderMeme]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "meme.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }, []);

  const copyToClipboard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } catch { /* clipboard not available */ }
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <ToolLayout
      title="Meme Generator"
      slug="meme-generator"
      category="Design"
      description="Create memes with custom text, fonts, and colors. No watermark, no signup, runs in your browser."
      faqs={[
        { question:"Is this meme generator free?", answer:"Yes. No watermark, no signup, no limits. Create as many memes as you want." },
        { question:"Can I use my own images?", answer:"Yes. Upload any image — photos, screenshots, or existing meme templates. All common formats are supported (JPG, PNG, GIF, WebP)." },
        { question:"What format is the output?", answer:"Memes are downloaded as PNG files. You can also copy directly to clipboard for pasting into Discord, Slack, or social media." },
        { question:"Is my image uploaded anywhere?", answer:"No. Everything runs locally in your browser using the Canvas API. Your images never leave your device." },
        { question:"Can I change the font?", answer:"Yes. Choose from Impact (classic meme font), Arial, Comic Sans, or Times New Roman. You can also adjust font size, text color, and outline color." },
      ]}
      relatedTools={[
        { name: "Image Compressor", href: "/tools/image-compressor" },
        { name: "Image Resizer", href: "/tools/image-resizer" },
      ]}
      keywords={["meme generator", "meme maker", "create memes", "meme creator", "free meme tool", "add text to image"]}
    >
      <div className="space-y-5">
        {!imageSrc ? (
          <label
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-12 cursor-pointer hover:border-zinc-500 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <span className="text-4xl">😂</span>
            <span className="text-sm text-zinc-400">Drop an image or click to upload</span>
            <span className="text-xs text-zinc-500">JPG, PNG, GIF, WebP</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        ) : (
          <>
            <canvas ref={canvasRef} className="w-full rounded-lg" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Top Text</label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Bottom Text</label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Font</label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Impact">Impact</option>
                  <option value="Arial">Arial</option>
                  <option value="Comic Sans MS">Comic Sans</option>
                  <option value="Times New Roman">Times</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Size: {fontSize}px</label>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Outline</label>
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setImageSrc(null); imageRef.current = null; setTopText("TOP TEXT"); setBottomText("BOTTOM TEXT"); }}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-zinc-300 transition-colors"
              >
                New Image
              </button>
              <div className="flex-1" />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium text-zinc-200 transition-colors"
              >
                Copy
              </button>
              <button
                onClick={download}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
              >
                Download PNG
              </button>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
