"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [skewX, setSkewX] = useState(0);
  const [skewY, setSkewY] = useState(0);
  const [copied, setCopied] = useState(false);

  const transform = useMemo(() => {
    const parts: string[] = [];
    if (translateX !== 0 || translateY !== 0) parts.push(`translate(${translateX}px, ${translateY}px)`);
    if (rotate !== 0) parts.push(`rotate(${rotate}deg)`);
    if (scaleX !== 1 || scaleY !== 1) parts.push(`scale(${scaleX}, ${scaleY})`);
    if (skewX !== 0 || skewY !== 0) parts.push(`skew(${skewX}deg, ${skewY}deg)`);
    return parts.length ? parts.join(" ") : "none";
  }, [translateX, translateY, rotate, scaleX, scaleY, skewX, skewY]);

  const css = `transform: ${transform};`;
  const copy = () => { navigator.clipboard.writeText(css); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const reset = () => { setTranslateX(0); setTranslateY(0); setRotate(0); setScaleX(1); setScaleY(1); setSkewX(0); setSkewY(0); };

  const labelCls = "block text-xs text-zinc-400 mb-0.5";

  return (
    <ToolLayout
      title="CSS Transform Generator"
      description="Build CSS transforms visually. Translate, rotate, scale, and skew with live preview."
      slug="css-transform-generator"
      category="Developer"
      keywords={["css transform generator", "css transform", "css rotate", "css scale", "css translate", "css skew"]}
      faqs={[
        { question: "What is CSS transform?", answer: "The CSS transform property lets you rotate, scale, skew, or translate an element. Transforms don't affect document flow — other elements don't move. Multiple transforms can be combined." },
        { question: "Does transform order matter?", answer: "Yes! Transforms are applied right to left. rotate(45deg) translate(100px) first translates, then rotates. translate(100px) rotate(45deg) first rotates, then translates. The results are different." },
      ]}
      relatedTools={[
        { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
        { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
        { name: "CSS Cubic Bezier", href: "/tools/css-cubic-bezier" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Translate X (px)</label><input type="range" value={translateX} onChange={e => setTranslateX(+e.target.value)} min={-200} max={200} className="w-full accent-blue-500" /><span className="text-xs text-zinc-500">{translateX}px</span></div>
            <div><label className={labelCls}>Translate Y (px)</label><input type="range" value={translateY} onChange={e => setTranslateY(+e.target.value)} min={-200} max={200} className="w-full accent-blue-500" /><span className="text-xs text-zinc-500">{translateY}px</span></div>
          </div>
          <div><label className={labelCls}>Rotate (deg)</label><input type="range" value={rotate} onChange={e => setRotate(+e.target.value)} min={-360} max={360} className="w-full accent-blue-500" /><span className="text-xs text-zinc-500">{rotate}°</span></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Scale X</label><input type="range" value={scaleX} onChange={e => setScaleX(+e.target.value)} min={0} max={3} step={0.1} className="w-full accent-blue-500" /><span className="text-xs text-zinc-500">{scaleX}</span></div>
            <div><label className={labelCls}>Scale Y</label><input type="range" value={scaleY} onChange={e => setScaleY(+e.target.value)} min={0} max={3} step={0.1} className="w-full accent-blue-500" /><span className="text-xs text-zinc-500">{scaleY}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Skew X (deg)</label><input type="range" value={skewX} onChange={e => setSkewX(+e.target.value)} min={-90} max={90} className="w-full accent-blue-500" /><span className="text-xs text-zinc-500">{skewX}°</span></div>
            <div><label className={labelCls}>Skew Y (deg)</label><input type="range" value={skewY} onChange={e => setSkewY(+e.target.value)} min={-90} max={90} className="w-full accent-blue-500" /><span className="text-xs text-zinc-500">{skewY}°</span></div>
          </div>
          <button onClick={reset} className="text-sm text-zinc-400 hover:text-zinc-200">Reset All</button>
        </div>

        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl h-64 flex items-center justify-center overflow-hidden">
            <div className="relative">
              <div className="w-24 h-24 border-2 border-dashed border-zinc-600 rounded-lg absolute" />
              <div className="w-24 h-24 bg-blue-500/30 border-2 border-blue-500 rounded-lg" style={{ transform }} />
            </div>
          </div>

          {/* CSS Output */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-zinc-500">CSS</span>
              <button onClick={copy} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors">{copied ? "Copied!" : "Copy"}</button>
            </div>
            <pre className="text-sm font-mono text-blue-300 whitespace-pre-wrap">{css}</pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
