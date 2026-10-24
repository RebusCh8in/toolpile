"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export default function Page() {
  const [color1, setColor1] = useState("#FF0000");
  const [color2, setColor2] = useState("#0000FF");
  const [ratio, setRatio] = useState(50);
  const [steps, setSteps] = useState(5);
  const [copied, setCopied] = useState("");

  const mixed = useMemo(() => {
    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    const t = ratio / 100;
    const r = Math.round(r1 * (1 - t) + r2 * t);
    const g = Math.round(g1 * (1 - t) + g2 * t);
    const b = Math.round(b1 * (1 - t) + b2 * t);
    return rgbToHex(r, g, b);
  }, [color1, color2, ratio]);

  const gradient = useMemo(() => {
    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    const result = [];
    for (let i = 0; i <= steps + 1; i++) {
      const t = i / (steps + 1);
      const r = Math.round(r1 * (1 - t) + r2 * t);
      const g = Math.round(g1 * (1 - t) + g2 * t);
      const b = Math.round(b1 * (1 - t) + b2 * t);
      result.push(rgbToHex(r, g, b));
    }
    return result;
  }, [color1, color2, steps]);

  const copy = (val: string) => { navigator.clipboard.writeText(val); setCopied(val); setTimeout(() => setCopied(""), 2000); };

  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Color Mixer"
      description="Mix two colors together at any ratio. Generate smooth color gradients with adjustable steps."
      slug="color-mixer"
      category="Design"
      keywords={["color mixer", "color blender", "mix colors online", "color gradient generator", "blend two colors"]}
      faqs={[
        { question: "How does color mixing work?", answer: "Colors are mixed using linear interpolation in RGB color space. At 50%, each RGB channel is the average of the two input colors. At 25%, the result is 75% of color 1 and 25% of color 2." },
        { question: "What is a color gradient?", answer: "A gradient is a smooth transition between two or more colors. The steps setting controls how many intermediate colors are generated between the start and end colors." },
      ]}
      relatedTools={[
        { name: "Color Palette Generator", href: "/tools/color-palette-generator" },
        { name: "Color Converter", href: "/tools/color-converter" },
        { name: "Color Shades Generator", href: "/tools/color-shades-generator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Color 1</label>
              <div className="flex gap-2">
                <input type="color" value={color1} onChange={e => setColor1(e.target.value)} className="w-12 h-10 rounded border border-zinc-700 cursor-pointer bg-transparent" />
                <input type="text" value={color1} onChange={e => setColor1(e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Color 2</label>
              <div className="flex gap-2">
                <input type="color" value={color2} onChange={e => setColor2(e.target.value)} className="w-12 h-10 rounded border border-zinc-700 cursor-pointer bg-transparent" />
                <input type="text" value={color2} onChange={e => setColor2(e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm font-mono focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>Mix Ratio: {ratio}%</label>
            <input type="range" value={ratio} onChange={e => setRatio(+e.target.value)} min={0} max={100} className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-zinc-500"><span>100% Color 1</span><span>100% Color 2</span></div>
          </div>
          <div>
            <label className={labelCls}>Gradient Steps</label>
            <input type="number" value={steps} onChange={e => setSteps(Math.max(1, Math.min(20, +e.target.value)))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500" min={1} max={20} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Mixed result */}
          <div className="rounded-xl overflow-hidden border border-zinc-700">
            <div className="h-24" style={{ backgroundColor: mixed }} />
            <div className="bg-zinc-800/50 p-3 flex justify-between items-center">
              <div>
                <p className="text-sm text-zinc-400">Mixed Color</p>
                <p className="text-lg font-mono font-semibold text-zinc-100">{mixed}</p>
              </div>
              <button onClick={() => copy(mixed)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors">{copied === mixed ? "Copied!" : "Copy"}</button>
            </div>
          </div>

          {/* Gradient */}
          <div>
            <p className="text-sm text-zinc-400 mb-2">Color Gradient ({gradient.length} colors)</p>
            <div className="flex rounded-lg overflow-hidden h-16">
              {gradient.map((c, i) => (
                <div key={i} className="flex-1 cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: c }} onClick={() => copy(c)} title={c} />
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {gradient.map((c, i) => (
                <button key={i} onClick={() => copy(c)} className={`text-xs font-mono px-2 py-1 rounded transition-colors ${copied === c ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
