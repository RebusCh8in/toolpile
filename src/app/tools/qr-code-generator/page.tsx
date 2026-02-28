"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const faqs: FAQ[] = [
  {
    question: "How do I create a QR code for a URL?",
    answer: "Paste your URL into the text field and the QR code generates instantly. You can customize the size, colors, and error correction level, then download it as a PNG or copy it to your clipboard."
  },
  {
    question: "What is QR code error correction and which level should I use?",
    answer: "Error correction allows a QR code to be scanned even if part of it is damaged or obscured. Medium (15%) is a good default. Use High (30%) if you plan to place a logo over the QR code or print it on materials that may get scratched."
  },
  {
    question: "Can I customize the colors of my QR code?",
    answer: "Yes. You can set both the foreground and background colors using the color pickers or by entering hex values directly. Make sure there is enough contrast between the two colors for scanners to read the code reliably."
  },
  {
    question: "What is the maximum amount of data a QR code can hold?",
    answer: "A QR code can store up to about 4,296 alphanumeric characters or 7,089 numeric digits. For practical use, URLs under 500 characters work best and produce QR codes that are easy to scan."
  },
  {
    question: "Is this QR code generator free to use?",
    answer: "Yes, it is completely free with no signup required. The QR codes are generated in your browser and there are no limits on how many you can create or download."
  },
  {
    question: "Can I use the generated QR codes for commercial purposes?",
    answer: "Yes. The QR codes you generate are yours to use however you like, including on printed materials, products, business cards, and marketing campaigns. There are no restrictions."
  }
]

const relatedTools: RelatedTool[] = [
  { name: "Base64 Encoder", href: "/tools/base64-encoder" },
  { name: "UUID Generator", href: "/tools/uuid-generator" },
  { name: "Password Generator", href: "/tools/password-generator" },
  { name: "Color Palette Generator", href: "/tools/color-palette-generator" }
]

export default function QRCodeGeneratorPage() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");
  const [dataUrl, setDataUrl] = useState("");

  const generateQR = useCallback(async () => {
    if (!text.trim()) {
      setDataUrl("");
      return;
    }
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: ecLevel,
        color: { dark: fgColor, light: bgColor },
      });
      setDataUrl(url);
    } catch {
      setDataUrl("");
    }
  }, [text, size, ecLevel, fgColor, bgColor]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = dataUrl;
    link.click();
  };

  const handleCopyImage = async () => {
    if (!dataUrl) return;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate customizable QR codes from any text or URL. Adjust size, colors, and error correction level."
      category="Utility"
      slug="qr-code-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "qr code generator",
        "free qr code maker",
        "create qr code online",
        "qr code from url",
        "custom qr code generator",
        "qr code with colors",
        "qr code download png"
      ]}
      guide={
        <>
          <h2>What Is the QR Code Generator?</h2>
          <p>
            This QR Code Generator lets you create customizable QR codes from any text or URL instantly. You can adjust the output size, foreground and background colors, and error correction level. The generated QR code can be downloaded as a PNG image or copied directly to your clipboard.
          </p>
          <p>
            QR codes are two-dimensional barcodes that can be scanned by smartphones and dedicated readers. They are widely used for sharing URLs, contact information, Wi-Fi credentials, and other data quickly.
          </p>

          <h3>How to Create a QR Code</h3>
          <p>Creating a QR code takes seconds:</p>
          <ul>
            <li>Type or paste your text or URL into the input field. The QR code generates automatically as you type.</li>
            <li>Choose a size from the dropdown (128px to 1024px).</li>
            <li>Select an error correction level. Medium (15%) is the recommended default.</li>
            <li>Optionally customize the foreground and background colors using the color pickers.</li>
            <li>Click Download PNG to save the image, or Copy Image to place it on your clipboard.</li>
          </ul>

          <h3>Understanding Error Correction Levels</h3>
          <p>
            QR codes include redundant data that allows them to be read even when partially damaged. The four error correction levels determine how much damage a code can tolerate:
          </p>
          <ul>
            <li><strong>Low (7%)</strong> — Smallest code size, least redundancy. Use when the QR code will always be displayed on a clean screen.</li>
            <li><strong>Medium (15%)</strong> — Good balance of size and reliability. Best for most use cases.</li>
            <li><strong>Quartile (25%)</strong> — Higher redundancy. Good for printed materials that may get scratched.</li>
            <li><strong>High (30%)</strong> — Maximum redundancy. Required if you plan to overlay a logo on the QR code.</li>
          </ul>

          <h3>Tips for Creating Effective QR Codes</h3>
          <ul>
            <li>Keep your URLs short. Shorter data produces simpler QR codes that scan faster and more reliably.</li>
            <li>Maintain high contrast between foreground and background colors. Dark on light is most reliable.</li>
            <li>Test your QR code on multiple devices before printing or publishing.</li>
            <li>Use at least 256px for print materials and 512px or larger for posters and signage.</li>
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Business cards linking to a website or contact page.</li>
            <li>Restaurant menus accessible via table QR codes.</li>
            <li>Event tickets and check-in systems.</li>
            <li>Product packaging linking to instructions or warranty registration.</li>
            <li>Marketing materials with trackable URLs.</li>
          </ul>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Text / URL</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              placeholder="Enter text or URL..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500"
              >
                <option value={128}>128 x 128</option>
                <option value={256}>256 x 256</option>
                <option value={512}>512 x 512</option>
                <option value={1024}>1024 x 1024</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Error Correction</label>
              <select
                value={ecLevel}
                onChange={(e) => setEcLevel(e.target.value as "L" | "M" | "Q" | "H")}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Foreground Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleDownload}
              disabled={!dataUrl}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download PNG
            </button>
            <button
              onClick={handleCopyImage}
              disabled={!dataUrl}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Copy Image
            </button>
            <CopyButton text={text} label="Copy Text" className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200" />
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="QR Code"
              width={size > 512 ? 512 : size}
              height={size > 512 ? 512 : size}
              className="rounded"
            />
          ) : (
            <p className="text-zinc-500">Enter text to generate a QR code</p>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
