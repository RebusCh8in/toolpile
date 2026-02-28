"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

interface PickedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
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

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

export default function ImageColorPickerPage() {
  const [imageSrc, setImageSrc] = useState("");
  const [currentColor, setCurrentColor] = useState<PickedColor | null>(null);
  const [recentColors, setRecentColors] = useState<PickedColor[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageSrc(dataUrl);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Scale to fit canvas area while maintaining aspect ratio
        const maxW = 800;
        const maxH = 500;
        let w = img.width;
        let h = img.height;
        if (w > maxW) { h = (h * maxW) / w; w = maxW; }
        if (h > maxH) { w = (w * maxH) / h; h = maxH; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0], g = pixel[1], b = pixel[2];
    const color: PickedColor = {
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      hsl: rgbToHsl(r, g, b),
    };
    setCurrentColor(color);
    setRecentColors((prev) => {
      const next = [color, ...prev.filter((c) => c.hex !== color.hex)];
      return next.slice(0, 10);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  return (
    <ToolLayout
      title="Image Color Picker"
      description="Upload an image and click anywhere to pick colors. View hex, RGB, and HSL values."
      category="Design"
      slug="image-color-picker"
      keywords={[
        "image color picker",
        "pick color from image",
        "get hex color from image",
        "eyedropper tool online",
        "image to hex color",
        "RGB color picker from photo",
        "extract color from image",
      ]}
      guide={
        <>
          <h2>What Is the Image Color Picker?</h2>
          <p>
            The Image Color Picker lets you extract exact colors from any image right in your browser. Upload a photo, screenshot, or design file, then click anywhere on the image to instantly get the color value in HEX, RGB, and HSL formats. No software installation required.
          </p>
          <p>
            Whether you are matching brand colors from a logo, sampling colors from a photograph for a design project, or identifying the exact shade used on a website screenshot, this tool gives you pixel-perfect accuracy in one click.
          </p>

          <h3>How to Use the Image Color Picker</h3>
          <ul>
            <li>Drag and drop an image onto the upload area, or click to select a file from your device. PNG, JPG, GIF, and WebP formats are supported.</li>
            <li>Once the image loads, hover over it and click on any pixel. The crosshair cursor guides your selection.</li>
            <li>The picked color appears in the sidebar with its HEX, RGB, and HSL values. Click the copy button next to any format to copy it to your clipboard.</li>
            <li>Every color you pick is saved to the Recent Picks palette. Click any swatch to revisit a previously sampled color.</li>
            <li>Use the Change Image button to load a different file without refreshing the page.</li>
          </ul>

          <h3>Tips for Accurate Color Picking</h3>
          <p>
            For the best results, use high-resolution images. Compressed JPEGs may introduce color artifacts around edges. If you need a color from a specific area, zoom into your image in an editor first and then take a screenshot of the zoomed region before uploading.
          </p>
          <p>
            The tool scales large images to fit the canvas while preserving aspect ratio. The color values are sampled from the scaled image pixels, so results are consistent regardless of the original file size.
          </p>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Extracting brand colors from a client logo or marketing material</li>
            <li>Matching paint or fabric colors from a reference photo</li>
            <li>Sampling color palettes from photography or artwork for design inspiration</li>
            <li>Identifying HEX codes from website screenshots for CSS development</li>
            <li>Building a color palette from a mood board image</li>
          </ul>

          <h3>Supported Color Formats</h3>
          <p>
            Every picked color is displayed in three standard formats. HEX codes like #3b82f6 are commonly used in CSS and web design. RGB values are useful for graphic design software and digital displays. HSL values provide an intuitive way to understand a color in terms of hue, saturation, and lightness, making adjustments easier.
          </p>
        </>
      }
      faqs={[
        {
          question: "How do I pick a color from an image online?",
          answer: "Upload your image to this tool by dragging it onto the page or clicking the upload area. Once loaded, click anywhere on the image and the tool instantly shows you the HEX, RGB, and HSL color values for that pixel."
        },
        {
          question: "What image formats does the color picker support?",
          answer: "The tool supports all common web image formats including PNG, JPG/JPEG, GIF, and WebP. Any image your browser can display can be used with this color picker."
        },
        {
          question: "Can I pick multiple colors from the same image?",
          answer: "Yes. Every color you click is added to the Recent Picks palette, which stores up to 10 colors. You can click any swatch in the palette to revisit its color values and copy them."
        },
        {
          question: "Is the image color picker accurate for design work?",
          answer: "The tool samples exact pixel values from the loaded image, so it is pixel-accurate. For best results with design work, use high-resolution PNG or lossless images, since JPEG compression can alter colors slightly."
        },
        {
          question: "Does this tool upload my images to a server?",
          answer: "No. Everything runs entirely in your browser. Your images are processed locally using the HTML5 Canvas API and are never uploaded to any server."
        },
        {
          question: "How do I convert HEX color to RGB from an image?",
          answer: "Simply upload your image and click on the color you want. The tool automatically displays the color in all three formats at once: HEX, RGB, and HSL. You can copy whichever format you need."
        },
      ] as FAQ[]}
      relatedTools={[
        { name: "Color Palette Generator", href: "/tools/color-palette-generator" },
        { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
        { name: "Aspect Ratio Calculator", href: "/tools/aspect-ratio-calculator" },
        { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
      ] as RelatedTool[]}
    >
      <div className="space-y-4">
        {/* Upload area */}
        {!imageSrc && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
            }`}
          >
            <p className="text-lg text-zinc-400">Drop an image here or click to upload</p>
            <p className="mt-1 text-sm text-zinc-500">Supports PNG, JPG, GIF, WebP</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {imageSrc && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-zinc-400">Click on the image to pick a color</p>
                <button
                  onClick={() => { setImageSrc(""); setCurrentColor(null); }}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Change Image
                </button>
              </div>
              <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 inline-block">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="max-w-full cursor-crosshair"
                />
              </div>
            </div>

            {/* Color info */}
            <div className="space-y-4">
              {currentColor && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-300">Picked Color</h3>
                  <div
                    className="mb-3 h-20 w-full rounded-lg border border-zinc-700"
                    style={{ backgroundColor: currentColor.hex }}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">HEX</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-zinc-200">{currentColor.hex}</code>
                        <CopyButton text={currentColor.hex} label="Copy" className="text-xs px-2 py-0.5" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">RGB</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-zinc-200">
                          {currentColor.rgb.r}, {currentColor.rgb.g}, {currentColor.rgb.b}
                        </code>
                        <CopyButton
                          text={`rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`}
                          label="Copy"
                          className="text-xs px-2 py-0.5"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">HSL</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-zinc-200">
                          {currentColor.hsl.h}, {currentColor.hsl.s}%, {currentColor.hsl.l}%
                        </code>
                        <CopyButton
                          text={`hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`}
                          label="Copy"
                          className="text-xs px-2 py-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent colors */}
              {recentColors.length > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-300">Recent Picks</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {recentColors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentColor(c)}
                        className="group relative h-10 w-full rounded border border-zinc-700 transition-transform hover:scale-110"
                        style={{ backgroundColor: c.hex }}
                        title={c.hex}
                      >
                        <span className="absolute inset-0 flex items-center justify-center rounded bg-black/50 text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {c.hex}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
