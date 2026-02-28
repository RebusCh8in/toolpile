"use client";

import { useState } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

interface Shadow {
  id: number;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

let nextId = 1;

function createShadow(): Shadow {
  return { id: ++nextId, x: 4, y: 4, blur: 10, spread: 0, color: "#0000004d", inset: false };
}

export default function BoxShadowGeneratorPage() {
  const [shadows, setShadows] = useState<Shadow[]>([createShadow()]);
  const [activeId, setActiveId] = useState<number>(shadows[0].id);

  const activeShadow = shadows.find((s) => s.id === activeId) || shadows[0];

  const updateShadow = (id: number, updates: Partial<Shadow>) => {
    setShadows((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addShadow = () => {
    const ns = createShadow();
    setShadows((prev) => [...prev, ns]);
    setActiveId(ns.id);
  };

  const removeShadow = (id: number) => {
    if (shadows.length <= 1) return;
    setShadows((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
  };

  const shadowCSS = shadows
    .map((s) => `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`)
    .join(",\n    ");

  const cssCode = `box-shadow: ${shadowCSS};`;

  return (
    <ToolLayout
      title="Box Shadow Generator"
      description="Design CSS box shadows with a live visual editor. Add multiple shadows, adjust offsets, blur, and spread."
      category="Design"
      slug="box-shadow-generator"
      keywords={[
        "css box shadow generator",
        "box shadow css",
        "drop shadow generator",
        "css shadow effects",
        "inset shadow css",
        "multiple box shadows",
        "box shadow designer",
        "css shadow code",
      ]}
      relatedTools={[
        { name: "CSS Gradient Generator", href: "/tools/css-gradient-generator" },
        { name: "Color Palette Generator", href: "/tools/color-palette-generator" },
        { name: "Image Color Picker", href: "/tools/image-color-picker" },
        { name: "Markdown Preview", href: "/tools/markdown-preview" },
      ]}
      faqs={[
        {
          question: "How do I create a CSS box shadow?",
          answer: "Use the sliders to set X offset, Y offset, blur radius, and spread. Choose a shadow color and toggle the inset option if needed. The tool generates the CSS code automatically and shows a live preview.",
        },
        {
          question: "Can I add multiple box shadows to one element?",
          answer: "Yes. Click the '+ Add' button to create additional shadow layers. Each shadow has independent controls for offset, blur, spread, color, and inset. Multiple shadows are combined into a single CSS property.",
        },
        {
          question: "What is an inset box shadow?",
          answer: "An inset box shadow renders inside the element instead of outside. It creates a pressed or recessed appearance, commonly used for input fields, cards, and neumorphic design patterns.",
        },
        {
          question: "What is the difference between blur and spread in box-shadow?",
          answer: "Blur controls how soft or diffused the shadow edges appear. Spread controls the size of the shadow; positive values make it larger than the element, while negative values make it smaller.",
        },
        {
          question: "How do I make a subtle, modern box shadow?",
          answer: "Use a small Y offset (4-8px), moderate blur (10-20px), zero spread, and a semi-transparent black color like rgba(0,0,0,0.1). This produces the soft, elevated look common in modern UI design.",
        },
        {
          question: "Can I copy the generated box-shadow CSS?",
          answer: "Yes. The generated CSS code is displayed below the preview. Click the copy button to copy it to your clipboard and paste it directly into your stylesheet or component.",
        },
      ]}
      guide={
        <>
          <h2>What Is the Box Shadow Generator?</h2>
          <p>
            The Box Shadow Generator is a visual CSS tool that lets you design box shadows without writing code manually. Adjust offsets, blur, spread, and color with intuitive sliders and see the result instantly. The tool supports multiple shadow layers and inset shadows, covering every common shadow pattern in web design.
          </p>

          <h3>How to Use the Box Shadow Generator</h3>
          <p>
            Start with the default shadow and use the sliders to adjust it to your liking. The preview box updates in real time so you can see exactly how the shadow looks.
          </p>
          <ul>
            <li>Drag the X Offset slider to move the shadow left or right.</li>
            <li>Drag the Y Offset slider to move the shadow up or down.</li>
            <li>Adjust the Blur slider to control the softness of the shadow edges.</li>
            <li>Adjust the Spread slider to grow or shrink the shadow size.</li>
            <li>Pick a shadow color using the color picker or enter a hex value.</li>
            <li>Check the Inset toggle to place the shadow inside the element.</li>
          </ul>
          <p>
            To add a second shadow layer, click "+ Add" and configure it separately. You can have as many shadow layers as you need. Click the X icon on a shadow tab to remove it.
          </p>

          <h3>Tips for Effective Box Shadows</h3>
          <p>
            Subtle shadows create depth without overwhelming the design. For card-style elevation, use a small Y offset with moderate blur and low-opacity black. For dramatic effects, increase the blur and offset values. Layering two or three shadows at different sizes often produces more realistic depth than a single heavy shadow.
          </p>
          <p>
            Inset shadows are useful for creating pressed button states, input focus rings, and neumorphic design patterns. Combine an inset shadow with an outer shadow for a polished, three-dimensional appearance.
          </p>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Card and panel elevation in dashboard layouts.</li>
            <li>Button hover and active states with layered shadows.</li>
            <li>Input field focus effects using inset shadows.</li>
            <li>Modal and popup depth effects.</li>
            <li>Neumorphic UI design with combined inset and outer shadows.</li>
          </ul>

          <h3>Why Use a Box Shadow Generator?</h3>
          <p>
            The box-shadow CSS property has five values to coordinate: X offset, Y offset, blur, spread, and color. Getting these right by hand requires constant browser refreshes. This generator lets you experiment visually and copy clean CSS code when you are satisfied, saving time and reducing guesswork.
          </p>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-4">
          {/* Shadow list */}
          <div className="flex flex-wrap items-center gap-2">
            {shadows.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeId === s.id ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Shadow {i + 1}
                {shadows.length > 1 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); removeShadow(s.id); }}
                    className="ml-2 text-zinc-500 hover:text-red-400"
                  >
                    &#x2715;
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={addShadow}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              + Add
            </button>
          </div>

          {/* Sliders */}
          {activeShadow && (
            <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              {([
                { label: "X Offset", key: "x" as const, min: -100, max: 100 },
                { label: "Y Offset", key: "y" as const, min: -100, max: 100 },
                { label: "Blur", key: "blur" as const, min: 0, max: 200 },
                { label: "Spread", key: "spread" as const, min: -100, max: 100 },
              ] as const).map((ctrl) => (
                <div key={ctrl.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm text-zinc-300">{ctrl.label}</label>
                    <span className="text-xs text-zinc-500">{activeShadow[ctrl.key]}px</span>
                  </div>
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    value={activeShadow[ctrl.key]}
                    onChange={(e) => updateShadow(activeShadow.id, { [ctrl.key]: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-sm text-zinc-300">Shadow Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeShadow.color.substring(0, 7)}
                    onChange={(e) => updateShadow(activeShadow.id, { color: e.target.value })}
                    className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeShadow.color}
                    onChange={(e) => updateShadow(activeShadow.id, { color: e.target.value })}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeShadow.inset}
                  onChange={(e) => updateShadow(activeShadow.id, { inset: e.target.checked })}
                  className="accent-blue-500"
                />
                <span className="text-sm text-zinc-300">Inset</span>
              </label>
            </div>
          )}
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
            <div
              className="h-32 w-48 rounded-lg bg-zinc-700"
              style={{ boxShadow: shadowCSS }}
            />
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <pre className="overflow-x-auto text-sm text-zinc-300">{cssCode}</pre>
            <div className="mt-3">
              <CopyButton text={cssCode} />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
