"use client";

import { useState } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

interface ColorStop {
  color: string;
  position: number;
  id: number;
}

type GradientType = "linear" | "radial" | "conic";

const presets: { name: string; type: GradientType; angle: number; stops: Omit<ColorStop, "id">[] }[] = [
  { name: "Sunset", type: "linear", angle: 135, stops: [{ color: "#ff6b6b", position: 0 }, { color: "#feca57", position: 100 }] },
  { name: "Ocean", type: "linear", angle: 180, stops: [{ color: "#0f2027", position: 0 }, { color: "#2c5364", position: 100 }] },
  { name: "Purple Haze", type: "linear", angle: 45, stops: [{ color: "#7b2ff7", position: 0 }, { color: "#c850c0", position: 50 }, { color: "#ff6987", position: 100 }] },
  { name: "Northern Lights", type: "linear", angle: 90, stops: [{ color: "#43e97b", position: 0 }, { color: "#38f9d7", position: 100 }] },
  { name: "Fire", type: "radial", angle: 0, stops: [{ color: "#f83600", position: 0 }, { color: "#f9d423", position: 100 }] },
  { name: "Rainbow", type: "conic", angle: 0, stops: [{ color: "#ff0000", position: 0 }, { color: "#ff8800", position: 17 }, { color: "#ffff00", position: 33 }, { color: "#00ff00", position: 50 }, { color: "#0088ff", position: 67 }, { color: "#8800ff", position: 83 }, { color: "#ff0000", position: 100 }] },
];

let nextId = 100;

export default function CSSGradientGeneratorPage() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: "#3b82f6", position: 0, id: 1 },
    { color: "#8b5cf6", position: 100, id: 2 },
  ]);

  const getGradientCSS = (): string => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(", ");
    switch (type) {
      case "linear":
        return `linear-gradient(${angle}deg, ${stopsStr})`;
      case "radial":
        return `radial-gradient(circle, ${stopsStr})`;
      case "conic":
        return `conic-gradient(from ${angle}deg, ${stopsStr})`;
    }
  };

  const cssCode = `background: ${getGradientCSS()};`;

  const addStop = () => {
    setStops((prev) => [...prev, { color: "#ffffff", position: 50, id: ++nextId }]);
  };

  const removeStop = (id: number) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStop = (id: number, field: "color" | "position", value: string | number) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setType(preset.type);
    setAngle(preset.angle);
    setStops(preset.stops.map((s) => ({ ...s, id: ++nextId })));
  };

  return (
    <ToolLayout
      title="CSS Gradient Generator"
      description="Build linear, radial, and conic CSS gradients with a visual editor."
      category="Design"
      slug="css-gradient-generator"
      keywords={[
        "css gradient generator",
        "linear gradient css",
        "radial gradient generator",
        "conic gradient css",
        "css background gradient",
        "gradient color picker",
        "css gradient code",
        "web gradient maker",
      ]}
      relatedTools={[
        { name: "Box Shadow Generator", href: "/tools/box-shadow-generator" },
        { name: "Color Palette Generator", href: "/tools/color-palette-generator" },
        { name: "Image Color Picker", href: "/tools/image-color-picker" },
        { name: "Markdown Preview", href: "/tools/markdown-preview" },
      ]}
      faqs={[
        {
          question: "How do I create a CSS gradient with multiple colors?",
          answer: "Add color stops using the '+ Add Stop' button. Each stop has a color value and a position percentage. The gradient smoothly transitions between all your color stops in order from 0% to 100%.",
        },
        {
          question: "What is the difference between linear, radial, and conic gradients?",
          answer: "Linear gradients transition colors along a straight line at a given angle. Radial gradients radiate outward from a center point in a circle. Conic gradients sweep color transitions around a center point like a color wheel.",
        },
        {
          question: "Can I copy the generated CSS gradient code?",
          answer: "Yes. The tool generates ready-to-use CSS code displayed below the preview. Click the copy button to copy the full background property to your clipboard and paste it directly into your stylesheet.",
        },
        {
          question: "How do I change the direction of a CSS linear gradient?",
          answer: "Use the angle slider to set the gradient direction in degrees. 0 degrees points upward, 90 degrees points right, 180 degrees points down, and 270 degrees points left. You can set any value from 0 to 360.",
        },
        {
          question: "Are CSS gradients supported in all browsers?",
          answer: "Yes. CSS gradients including linear-gradient, radial-gradient, and conic-gradient are supported in all modern browsers. Conic gradients have slightly less legacy support but work in Chrome, Firefox, Safari, and Edge.",
        },
        {
          question: "How do I use gradient presets?",
          answer: "Click any preset button like Sunset, Ocean, or Rainbow to instantly load a professionally designed gradient. You can then customize the colors, stops, type, and angle to match your design needs.",
        },
      ]}
      guide={
        <>
          <h2>What Is the CSS Gradient Generator?</h2>
          <p>
            The CSS Gradient Generator is a visual tool that helps you build beautiful CSS gradients without writing code by hand. Choose between linear, radial, and conic gradient types, adjust colors and positions, and get production-ready CSS instantly. Whether you are designing a hero background, a button hover effect, or a decorative overlay, this tool speeds up your workflow.
          </p>

          <h3>How to Use the CSS Gradient Generator</h3>
          <p>
            Start by selecting your gradient type: linear, radial, or conic. Each type produces a different visual effect. For linear and conic gradients, adjust the angle slider to control the direction of the color transition.
          </p>
          <ul>
            <li>Pick a gradient type using the toggle buttons at the top.</li>
            <li>Set the angle with the slider (available for linear and conic types).</li>
            <li>Edit existing color stops by changing their color or position values.</li>
            <li>Add more color stops with the "+ Add Stop" button for complex gradients.</li>
            <li>Remove extra stops by clicking the X icon next to any stop.</li>
            <li>Try a preset like Sunset, Ocean, or Rainbow to get started quickly.</li>
          </ul>
          <p>
            The live preview updates in real time as you make changes. When you are happy with the result, copy the generated CSS code and paste it directly into your project.
          </p>

          <h3>Tips for Better Gradients</h3>
          <p>
            Use two or three color stops for clean, modern gradients. Adding too many stops can make gradients look muddy. Position your stops strategically: placing two similar colors close together creates a sharper transition, while spreading them apart produces a smoother blend.
          </p>
          <p>
            Radial gradients work well for spotlight effects and button highlights. Conic gradients are great for pie-chart-style visuals and decorative backgrounds. Experiment with angles to find the direction that best complements your layout.
          </p>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Hero section backgrounds with smooth color transitions.</li>
            <li>Button and card hover effects using subtle gradients.</li>
            <li>Overlay gradients on images for text readability.</li>
            <li>Decorative borders and dividers with conic gradients.</li>
            <li>Dark-mode-friendly backgrounds using muted color stops.</li>
          </ul>

          <h3>Why Use a Gradient Generator?</h3>
          <p>
            Writing CSS gradient syntax by hand is tedious and error-prone, especially with multiple color stops. This generator gives you instant visual feedback so you can fine-tune colors and positions before committing any code. It saves time and produces better results than guessing hex values in a text editor.
          </p>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Type</label>
            <div className="flex gap-2">
              {(["linear", "radial", "conic"] as GradientType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    type === t ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Angle */}
          {(type === "linear" || type === "conic") && (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Angle: {angle}&deg;
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          )}

          {/* Color stops */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Color Stops</label>
              <button
                onClick={addStop}
                className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                + Add Stop
              </button>
            </div>
            <div className="space-y-2">
              {stops.map((stop) => (
                <div key={stop.id} className="flex items-center gap-2 rounded-lg bg-zinc-800 p-2">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                    className="w-24 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 outline-none focus:border-blue-500"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => updateStop(stop.id, "position", Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="w-10 text-right text-xs text-zinc-400">{stop.position}%</span>
                  {stops.length > 2 && (
                    <button
                      onClick={() => removeStop(stop.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors text-sm"
                    >
                      &#x2715;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div
            className="h-64 w-full rounded-lg border border-zinc-800"
            style={{ background: getGradientCSS() }}
          />
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
