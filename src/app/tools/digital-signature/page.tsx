"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

type Mode = "draw" | "type" | "upload";

const FONTS = [
  { name: "Script", family: "'Brush Script MT', 'Segoe Script', cursive" },
  { name: "Elegant", family: "Georgia, 'Times New Roman', serif" },
  { name: "Modern", family: "'Trebuchet MS', 'Lucida Sans', sans-serif" },
  { name: "Classic", family: "'Palatino Linotype', 'Book Antiqua', serif" },
];

const COLORS = ["#000000", "#1a365d", "#1e3a5f", "#4a1a2e", "#2d3748"];

export default function DigitalSignaturePage() {
  const [mode, setMode] = useState<Mode>("draw");
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    clearCanvas();
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasSignature(false);
  }, []);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== "draw") return;
    e.preventDefault();
    setIsDrawing(true);
    lastPosRef.current = getPos(e);
  }, [mode, getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || mode !== "draw" || !lastPosRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPosRef.current = pos;
    setHasSignature(true);
  }, [isDrawing, mode, selectedColor, getPos]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  const renderTyped = useCallback(() => {
    if (!typedName.trim()) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const font = FONTS[selectedFont];
    ctx.fillStyle = selectedColor;
    ctx.font = `italic 42px ${font.family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName, canvas.offsetWidth / 2, canvas.offsetHeight / 2);
    setHasSignature(true);
  }, [typedName, selectedFont, selectedColor]);

  useEffect(() => {
    if (mode === "type") renderTyped();
  }, [mode, typedName, selectedFont, selectedColor, renderTyped]);

  const handleUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      const scale = Math.min(canvas.offsetWidth / img.width, canvas.offsetHeight / img.height) * 0.8;
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (canvas.offsetWidth - w) / 2, (canvas.offsetHeight - h) / 2, w, h);
      setHasSignature(true);
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current!;
    const a = document.createElement("a");
    a.download = "signature.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }, []);

  const downloadSVG = useCallback(() => {
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL("image/png");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.offsetWidth}" height="${canvas.offsetHeight}">
      <image href="${dataUrl}" width="${canvas.offsetWidth}" height="${canvas.offsetHeight}"/>
    </svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.download = "signature.svg";
    a.href = URL.createObjectURL(blob);
    a.click();
  }, []);

  const copyToClipboard = useCallback(async () => {
    const canvas = canvasRef.current!;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } catch { /* clipboard may not be available */ }
    });
  }, []);

  return (
    <ToolLayout
      title="Digital Signature Creator"
      slug="digital-signature"
      category="Utility"
      description="Create a digital signature by drawing, typing, or uploading. Download as PNG or SVG. Free, no signup, 100% private."
      faqs={[
        { question:"Is this a legally binding signature?", answer:"This tool creates a signature image. Legal validity depends on your jurisdiction and the platform accepting the signature. For legally binding e-signatures, you typically need a service that provides an audit trail and identity verification." },
        { question:"Can I use this signature on PDFs?", answer:"Yes. Download as PNG with transparent background and insert it into any PDF using Preview (Mac), Adobe Reader, or any PDF editor. Most PDF tools have an 'Add Image' or 'Stamp' feature." },
        { question:"Is my signature stored anywhere?", answer:"No. Everything runs in your browser. Your signature is never uploaded to any server. When you close the page, the signature exists only in your downloaded file." },
        { question:"What format should I download?", answer:"PNG is best for most uses — it supports transparency so the signature overlays cleanly on documents. SVG is vector format, useful if you need to scale the signature to any size without quality loss." },
        { question:"Can I change the color?", answer:"Yes. Choose from preset colors including black, navy, and dark red. The color applies to both drawn and typed signatures." },
      ]}
      relatedTools={[
        { name: "PDF to Word Converter", href: "/tools/pdf-to-word" },
        { name: "Invoice Generator", href: "/tools/invoice-generator" },
      ]}
      keywords={["digital signature", "e-signature", "signature maker", "signature generator", "create signature online", "free signature tool"]}
    >
      <div className="space-y-5">
        {/* Mode tabs */}
        <div className="flex gap-2">
          {(["draw", "type", "upload"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); if (m !== "type") clearCanvas(); }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {m === "draw" ? "Draw" : m === "type" ? "Type" : "Upload"}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">Color:</span>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                selectedColor === c ? "border-blue-500 scale-110" : "border-zinc-600"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Type mode controls */}
        {mode === "type" && (
          <div className="space-y-3">
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Type your name..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-lg text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex gap-2">
              {FONTS.map((f, i) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFont(i)}
                  className={`flex-1 py-2 px-2 rounded-lg text-sm transition-colors ${
                    selectedFont === i
                      ? "bg-zinc-700 border border-blue-500"
                      : "bg-zinc-800 border border-zinc-700 hover:border-zinc-500"
                  }`}
                  style={{ fontFamily: f.family, fontStyle: "italic" }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upload mode */}
        {mode === "upload" && (
          <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-6 cursor-pointer hover:border-zinc-500 transition-colors">
            <span className="text-sm text-zinc-400">Upload a signature image</span>
            <span className="text-xs text-zinc-500">PNG, JPG, SVG</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
          </label>
        )}

        {/* Canvas */}
        <div className="relative rounded-xl border-2 border-zinc-700 bg-white overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            className="w-full h-48 sm:h-56 cursor-crosshair touch-none"
          />
          {!hasSignature && mode === "draw" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-zinc-400 text-sm">Draw your signature here</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-zinc-300 transition-colors"
          >
            Clear
          </button>
          <div className="flex-1" />
          <button
            onClick={copyToClipboard}
            disabled={!hasSignature}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-sm font-medium text-zinc-200 transition-colors"
          >
            Copy
          </button>
          <button
            onClick={downloadSVG}
            disabled={!hasSignature}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-sm font-medium text-zinc-200 transition-colors"
          >
            SVG
          </button>
          <button
            onClick={downloadPNG}
            disabled={!hasSignature}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-sm font-medium text-white transition-colors"
          >
            Download PNG
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}
